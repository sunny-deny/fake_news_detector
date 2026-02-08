"""
Pydantic schemas for request/response validation.
"""
from pydantic import BaseModel, Field, validator
from typing import Optional, List
from datetime import datetime


class AnalyzeRequest(BaseModel):
    """Request schema for news analysis."""
    text: str = Field(..., min_length=10, max_length=10000, description="News text to analyze")
    
    @validator('text')
    def text_must_not_be_empty(cls, v):
        if not v or not v.strip():
            raise ValueError('Text cannot be empty or whitespace only')
        return v.strip()


class AnalyzeResponse(BaseModel):
    """Response schema for news analysis."""
    id: int
    label: int = Field(..., description="Prediction label: 0=FAKE, 1=REAL")
    label_text: str = Field(..., description="Human-readable label: FAKE or REAL")
    score: float = Field(..., ge=0.0, le=1.0, description="Confidence score for REAL class")
    confidence: str = Field(..., description="Confidence level: High, Medium, or Low")
    model_dir: str
    created_at: datetime
    
    class Config:
        from_attributes = True


class FeedbackRequest(BaseModel):
    """Request schema for submitting feedback."""
    analysis_id: int = Field(..., gt=0, description="ID of the analysis to provide feedback on")
    feedback_type: str = Field(..., description="Type of feedback: 'correct' or 'incorrect'")
    comment: Optional[str] = Field(None, max_length=1000, description="Optional comment")
    
    @validator('feedback_type')
    def feedback_type_must_be_valid(cls, v):
        if v not in ['correct', 'incorrect']:
            raise ValueError('Feedback type must be either "correct" or "incorrect"')
        return v


class FeedbackResponse(BaseModel):
    """Response schema for feedback submission."""
    message: str
    feedback_id: int


class HistoryItem(BaseModel):
    """Schema for a single history item."""
    id: int
    text: str = Field(..., description="Truncated text (first 200 chars)")
    label_text: str
    score: float
    confidence: str
    created_at: datetime
    user_feedback: Optional[str]
    
    class Config:
        from_attributes = True


class HistoryResponse(BaseModel):
    """Response schema for history endpoint."""
    total: int
    items: List[HistoryItem]


class StatsResponse(BaseModel):
    """Response schema for statistics endpoint."""
    total_analyses: int
    fake_news_detected: int
    real_news_detected: int
    fake_percentage: float
    real_percentage: float
    avg_confidence: float
    feedback_count: int
    correct_feedback_count: int
    incorrect_feedback_count: int
    feedback_accuracy: Optional[float]


class HealthResponse(BaseModel):
    """Response schema for health check."""
    status: str
    model_dir: str
    max_length: int
    model_loaded: bool
    database_connected: bool
    total_predictions: int


class ErrorResponse(BaseModel):
    """Response schema for errors."""
    detail: str
