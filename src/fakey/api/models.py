"""
Database models for the Fake News Detector API.
"""
from sqlalchemy import Column, Integer, String, Float, DateTime, Text, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy import UniqueConstraint

from datetime import datetime
from .database import Base


class Analysis(Base):
    """
    Model to store news analysis results.
    Each record represents one prediction made by the model.
    """
    __tablename__ = "analyses"

    id = Column(Integer, primary_key=True, index=True)
    text = Column(Text, nullable=False)
    label = Column(Integer, nullable=False)  # 0 = FAKE, 1 = REAL
    score = Column(Float, nullable=False)  # Confidence score (0-1)
    model_dir = Column(String(255), nullable=False)
    max_length = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    user_feedback = Column(String(50), nullable=True)  # 'correct', 'incorrect', None
    ip_address = Column(String(45), nullable=True) 
    
    # Relationship to feedback
    feedbacks = relationship("Feedback", back_populates="analysis", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Analysis(id={self.id}, label={self.label}, score={self.score:.3f})>"


class Feedback(Base):
    """
    Model to store user feedback on predictions.
    Allows users to report if the prediction was correct or incorrect.
    """
    __tablename__ = "feedbacks"
    __table_args__ = (UniqueConstraint("analysis_id", name="uq_feedback_analysis_id"),)


    id = Column(Integer, primary_key=True, index=True)
    analysis_id = Column(Integer, ForeignKey("analyses.id"), nullable=False, index=True)
    feedback_type = Column(String(50), nullable=False)  # 'correct' or 'incorrect'
    comment = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationship back to analysis
    analysis = relationship("Analysis", back_populates="feedbacks")

    def __repr__(self):
        return f"<Feedback(id={self.id}, analysis_id={self.analysis_id}, type={self.feedback_type})>"


class ModelMetrics(Base):
    """
    Model to store periodic model performance metrics.
    Used for monitoring model drift and performance over time.
    """
    __tablename__ = "model_metrics"

    id = Column(Integer, primary_key=True, index=True)
    model_dir = Column(String(255), nullable=False)
    total_predictions = Column(Integer, nullable=False)
    fake_predictions = Column(Integer, nullable=False)
    real_predictions = Column(Integer, nullable=False)
    avg_confidence = Column(Float, nullable=False)
    feedback_count = Column(Integer, default=0)
    correct_feedback_count = Column(Integer, default=0)
    accuracy_from_feedback = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f"<ModelMetrics(id={self.id}, model={self.model_dir}, accuracy={self.accuracy_from_feedback})>"
