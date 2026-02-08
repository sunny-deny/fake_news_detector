import os
from typing import Optional
import torch
from fastapi import FastAPI
from pydantic import BaseModel
from transformers import AutoTokenizer, AutoModelForSequenceClassification

MODEL_DIR = os.getenv("MODEL_DIR", "models/baseline")
MAX_LENGTH = int(os.getenv("MAX_LENGTH", "256"))

app = FastAPI(title="Fake News Detector API", version="0.1.0")

tokenizer: Optional[AutoTokenizer] = None
model: Optional[AutoModelForSequenceClassification] = None

class AnalyzeRequest(BaseModel):
    text: str

class AnalyzeResponse(BaseModel):
    label: int
    score: float
    model_dir: str
    max_length: int

@app.on_event("startup")
def load_model():
    global tokenizer, model
    tokenizer = AutoTokenizer.from_pretrained(MODEL_DIR)
    model = AutoModelForSequenceClassification.from_pretrained(MODEL_DIR)
    model.eval()

@app.get("/health")
def health():
    return {"status": "ok", "model_dir": MODEL_DIR, "max_length": MAX_LENGTH}

@app.post("/analyze", response_model=AnalyzeResponse)
def analyze(req: AnalyzeRequest):
    assert tokenizer is not None and model is not None

    enc = tokenizer(
        req.text,
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

    return AnalyzeResponse(label=label, score=score, model_dir=MODEL_DIR, max_length=MAX_LENGTH)
