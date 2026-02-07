import os
import json
import argparse
import numpy as np
import pandas as pd
import torch
from sklearn.metrics import accuracy_score, precision_recall_fscore_support, confusion_matrix
from transformers import AutoTokenizer, AutoModelForSequenceClassification

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--model_dir", default="models/baseline")
    parser.add_argument("--test_path", default="data/processed/test.csv")
    parser.add_argument("--max_length", type=int, default=256)
    parser.add_argument("--batch_size", type=int, default=16)
    parser.add_argument("--out_path", default=None)
    args = parser.parse_args()

    if args.out_path is None:
        args.out_path = os.path.join(args.model_dir, "test_metrics.json")

    df = pd.read_csv(args.test_path).dropna(subset=["content", "label"])
    texts = df["content"].astype(str).tolist()
    labels = df["label"].astype(int).to_numpy()

    tokenizer = AutoTokenizer.from_pretrained(args.model_dir)
    model = AutoModelForSequenceClassification.from_pretrained(args.model_dir)
    model.eval()

    preds = []
    for i in range(0, len(texts), args.batch_size):
        batch_texts = texts[i:i + args.batch_size]
        enc = tokenizer(
            batch_texts,
            truncation=True,
            padding="max_length",
            max_length=args.max_length,
            return_tensors="pt",
        )
        with torch.no_grad():
            out = model(**enc)
            batch_preds = torch.argmax(out.logits, dim=1).cpu().numpy().tolist()
            preds.extend(batch_preds)

    preds = np.array(preds)
    acc = accuracy_score(labels, preds)
    p, r, f1, _ = precision_recall_fscore_support(labels, preds, average="binary", zero_division=0)
    cm = confusion_matrix(labels, preds).tolist()

    metrics = {
        "accuracy": float(acc),
        "precision": float(p),
        "recall": float(r),
        "f1": float(f1),
        "confusion_matrix": cm,
        "num_examples": int(len(labels)),
        "max_length": int(args.max_length),
        "batch_size": int(args.batch_size),
        "model_dir": args.model_dir,
        "test_path": args.test_path,
    }

    os.makedirs(os.path.dirname(args.out_path), exist_ok=True)
    with open(args.out_path, "w", encoding="utf-8") as f:
        json.dump(metrics, f, indent=2)

    print(metrics)

if __name__ == "__main__":
    main()
