"""
Production-ready FastAPI application for Fake News Detection.

Features:
- News text analysis with ML model
- PostgreSQL database for storing predictions
- User feedback collection
- Historical data retrieval
- Statistics and monitoring
- CORS support for frontend
- Rate limiting and error handling
"""
import os
import logging
from typing import Optional
from datetime import datetime

import torch
from fastapi import FastAPI, Depends, HTTPException, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi import Query

from sqlalchemy.orm import Session
from sqlalchemy import func
from sqlalchemy import text
from sqlalchemy.exc import IntegrityError


from transformers import AutoTokenizer, AutoModelForSequenceClassification

from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from slowapi import _rate_limit_exceeded_handler

from .security import sanitize_text, is_meaningful_text


from .database import get_db, init_db, engine
from .models import Analysis, Feedback, ModelMetrics
from .schemas import (
    AnalyzeRequest, AnalyzeResponse, FeedbackRequest, FeedbackResponse,
    HistoryResponse, HistoryItem, StatsResponse, HealthResponse, ErrorResponse
)

# Configuration
MODEL_DIR = os.getenv("MODEL_DIR", "models/baseline")
MAX_LENGTH = int(os.getenv("MAX_LENGTH", "256"))
CORS_ORIGINS = [o.strip() for o in os.getenv("CORS_ORIGINS", "").split(",") if o.strip()]
RATE_LIMIT_ANALYZE = os.getenv("RATE_LIMIT_ANALYZE", "10/minute")
RATE_LIMIT_FEEDBACK = os.getenv("RATE_LIMIT_FEEDBACK", "20/minute")
RATE_LIMIT_HEALTH = os.getenv("RATE_LIMIT_HEALTH", "60/minute")
RATE_LIMIT_HISTORY = os.getenv("RATE_LIMIT_HISTORY", "30/minute")
RATE_LIMIT_STATS = os.getenv("RATE_LIMIT_STATS", "30/minute")

limiter = Limiter(key_func=get_remote_address)

# Logging configuration
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# FastAPI app
app = FastAPI(
    title="Fake News Detector API",
    version="1.0.0",
    description="AI-powered fake news detection API with feedback and analytics",
    docs_url="/docs",
    redoc_url="/redoc"
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(SlowAPIMiddleware)


# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global model variables
tokenizer: Optional[AutoTokenizer] = None
model: Optional[AutoModelForSequenceClassification] = None


# Exception handlers
@app.exception_handler(Exception)
def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "Internal server error occurred"}
    )


# Startup and shutdown events
@app.on_event("startup")
def startup_event():
    """Load ML model and initialize database on startup."""
    global tokenizer, model
    
    logger.info(f"Loading model from {MODEL_DIR}...")
    try:
        tokenizer = AutoTokenizer.from_pretrained(MODEL_DIR)
        model = AutoModelForSequenceClassification.from_pretrained(MODEL_DIR)
        model.eval()
        logger.info("Model loaded successfully!")
    except Exception as e:
        logger.error(f"Failed to load model: {e}")
        raise
    
    # Initialize database
    logger.info("Initializing database...")
    try:
        init_db()
        logger.info("Database initialized successfully!")
    except Exception as e:
        logger.error(f"Failed to initialize database: {e}")
        raise


@app.on_event("shutdown")
def shutdown_event():
    """Cleanup on shutdown."""
    logger.info("Shutting down...")


# API Endpoints

@app.get("/", tags=["Root"])
def root():
    """Root endpoint with API information."""
    return {
        "name": "Fake News Detector API",
        "version": "1.0.0",
        "description": "AI-powered fake news detection",
        "endpoints": {
            "health": "/health",
            "analyze": "/analyze",
            "feedback": "/feedback",
            "history": "/history",
            "stats": "/stats",
            "docs": "/docs"
        }
    }


@app.get("/health", response_model=HealthResponse, tags=["Health"])
@limiter.limit(RATE_LIMIT_HEALTH)
def health_check(request:Request, db: Session = Depends(get_db)):
    """
    Health check endpoint.
    Returns API status, model info, and database connection status.
    """
    try:
        # Check database connection
        db.execute(text("SELECT 1"))
        db_connected = True
        
        # Get total predictions count
        total_predictions = db.query(Analysis).count()
    except Exception as e:
        logger.error(f"Database health check failed: {e}")
        db_connected = False
        total_predictions = 0
    
    return HealthResponse(
        status="ok" if (model is not None and db_connected) else "degraded",
        model_dir=MODEL_DIR,
        max_length=MAX_LENGTH,
        model_loaded=model is not None,
        database_connected=db_connected,
        total_predictions=total_predictions
    )


@app.post("/analyze", response_model=AnalyzeResponse, tags=["Analysis"])
@limiter.limit(RATE_LIMIT_ANALYZE)
def analyze_news(request: Request, req: AnalyzeRequest, db: Session = Depends(get_db)):
    if tokenizer is None or model is None:
        raise HTTPException(status_code=503, detail="Model not loaded")

    clean = sanitize_text(req.text, max_chars=10000)
    if not clean:
        raise HTTPException(status_code=400, detail="Empty input after sanitization")

    if not is_meaningful_text(clean):
        raise HTTPException(
            status_code=422,
            detail="Text does not appear to be a valid news article. Please provide real article text."
            )

    try:
        enc = tokenizer(
            clean,
            truncation=True,
            padding="max_length",
            max_length=MAX_LENGTH,
            return_tensors="pt",
        )

        with torch.no_grad():
            out = model(**enc)
            probs = torch.softmax(out.logits, dim=1).squeeze(0)
            score = float(probs[1].item())
            label = int(torch.argmax(probs).item())

        max_prob = float(torch.max(probs).item())
        if max_prob > 0.8:
            confidence = "High"
        elif max_prob > 0.6:
            confidence = "Medium"
        else:
            confidence = "Low"

        analysis = Analysis(
            text=clean,
            label=label,
            score=score,
            model_dir=MODEL_DIR,
            max_length=MAX_LENGTH,
            ip_address=request.client.host if request.client else None,
        )
        db.add(analysis)
        db.commit()
        db.refresh(analysis)

        return AnalyzeResponse(
            id=analysis.id,
            label=label,
            label_text="REAL" if label == 1 else "FAKE",
            score=score,
            confidence=confidence,
            model_dir=MODEL_DIR,
            created_at=analysis.created_at,
        )

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error during analysis: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Analysis failed")

@app.post("/feedback", response_model=FeedbackResponse, tags=["Feedback"])
@limiter.limit(RATE_LIMIT_FEEDBACK)
def submit_feedback(request: Request, req: FeedbackRequest, db: Session = Depends(get_db)):
    analysis = db.query(Analysis).filter(Analysis.id == req.analysis_id).first()
    if not analysis:
        raise HTTPException(status_code=404, detail=f"Analysis with id {req.analysis_id} not found")

    existing = db.query(Feedback).filter(Feedback.analysis_id == req.analysis_id).first()
    if existing:
        raise HTTPException(status_code=409, detail="Feedback already submitted for this analysis")

    try:
        analysis.user_feedback = req.feedback_type

        comment = sanitize_text(req.comment or "", max_chars=1000) or None

        feedback = Feedback(
            analysis_id=req.analysis_id,
            feedback_type=req.feedback_type,
            comment=comment,
        )
        db.add(feedback)
        db.commit()
        db.refresh(feedback)

        return FeedbackResponse(message="Feedback submitted successfully", feedback_id=feedback.id)

    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="Feedback already submitted for this analysis")

    except HTTPException:
        raise

    except Exception as e:
        db.rollback()
        logger.error(f"Error submitting feedback: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to submit feedback")

@app.get("/history", response_model=HistoryResponse, tags=["History"])
@limiter.limit(RATE_LIMIT_HISTORY)
def get_history(
    request: Request,
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """
    Get analysis history with pagination.
    """
    try:
        total = db.query(Analysis).count()
        offset = (page - 1) * limit
        total_pages = -(-total // limit)  # ceiling division

        analyses = (
            db.query(Analysis)
            .order_by(Analysis.created_at.desc())
            .offset(offset)
            .limit(limit)
            .all()
        )

        items = []
        for a in analyses:
            display_text = a.text[:200] + "..." if len(a.text) > 200 else a.text

            if a.score > 0.8 or a.score < 0.2:
                confidence = "High"
            elif 0.6 < a.score < 0.8 or 0.2 < a.score < 0.4:
                confidence = "Medium"
            else:
                confidence = "Low"

            items.append(HistoryItem(
                id=a.id,
                text=display_text,
                label_text="REAL" if a.label == 1 else "FAKE",
                score=a.score,
                confidence=confidence,
                created_at=a.created_at,
                user_feedback=a.user_feedback
            ))

        return HistoryResponse(
            total=total,
            page=page,
            limit=limit,
            total_pages=total_pages,
            items=items
        )

    except Exception as e:
        logger.error(f"Error fetching history: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch history: {str(e)}"
        )
        
@app.get("/stats", response_model=StatsResponse, tags=["Statistics"])
@limiter.limit(RATE_LIMIT_STATS)
def get_statistics(request: Request, db: Session = Depends(get_db)):

    """
    Get overall statistics.
    
    Returns aggregated statistics about predictions and feedback.
    """
    try:
        # Total analyses
        total = db.query(Analysis).count()
        
        # Count by label
        fake_count = db.query(Analysis).filter(Analysis.label == 0).count()
        real_count = db.query(Analysis).filter(Analysis.label == 1).count()
        
        # Average confidence score
        avg_score = db.query(func.avg(Analysis.score)).scalar() or 0.0
        
        # Feedback stats
        feedback_total = db.query(Feedback).count()
        correct_feedback = db.query(Feedback).filter(Feedback.feedback_type == "correct").count()
        incorrect_feedback = db.query(Feedback).filter(Feedback.feedback_type == "incorrect").count()
        
        # Calculate feedback accuracy
        feedback_accuracy = None
        if feedback_total > 0:
            feedback_accuracy = round((correct_feedback / feedback_total) * 100, 2)
        
        return StatsResponse(
            total_analyses=total,
            fake_news_detected=fake_count,
            real_news_detected=real_count,
            fake_percentage=round((fake_count / total * 100) if total > 0 else 0, 2),
            real_percentage=round((real_count / total * 100) if total > 0 else 0, 2),
            avg_confidence=round(avg_score, 3),
            feedback_count=feedback_total,
            correct_feedback_count=correct_feedback,
            incorrect_feedback_count=incorrect_feedback,
            feedback_accuracy=feedback_accuracy
        )
        
    except Exception as e:
        logger.error(f"Error calculating statistics: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to calculate statistics: {str(e)}"
        )


@app.delete("/history/{analysis_id}", tags=["History"])
def delete_analysis(analysis_id: int, db: Session = Depends(get_db)):
    """
    Delete a specific analysis (and associated feedback).
    """
    analysis = db.query(Analysis).filter(Analysis.id == analysis_id).first()
    if not analysis:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Analysis with id {analysis_id} not found"
        )
    
    try:
        db.delete(analysis)
        db.commit()
        logger.info(f"Deleted analysis {analysis_id}")
        return {"message": f"Analysis {analysis_id} deleted successfully"}
    except Exception as e:
        logger.error(f"Error deleting analysis: {e}", exc_info=True)
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete analysis: {str(e)}"
        )
