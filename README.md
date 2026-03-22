# AI Fake News Detector

An end-to-end machine learning system that detects fake news using a fine-tuned DistilBERT model, exposed through a FastAPI backend and a React frontend.

The project demonstrates the full lifecycle of an ML product:

- Data cleaning and preprocessing
- Transformer model training
- Model evaluation
- Production inference API
- Persistent storage
- User feedback collection
- Full-stack web interface
- Dockerized development environment

---

## Project Goal

The goal of this project is to build a production-style ML application that allows users to analyze news text and estimate whether it is **REAL** or **FAKE** using a transformer model.

Users can:

- Paste article text or headlines
- Run ML inference in real time
- View confidence scores
- Submit feedback
- Explore analysis history
- View system statistics

This project focuses on clean architecture, reproducibility, and full-stack ML engineering practices.

---

## System Architecture

```
React Frontend
      │
      ▼
FastAPI Backend
      │
      ▼
ML Model (DistilBERT)
      │
      ▼
PostgreSQL Database
```

### Components

**Frontend**
- React
- TypeScript
- Vite
- React Query
- TailwindCSS

**Backend**
- FastAPI
- PyTorch
- Transformers
- SQLAlchemy
- PostgreSQL

**Infrastructure**
- Docker
- Docker Compose

---

## Project Structure

```
fake_news_detector/

├── backend/
│   ├── app/
│   │   ├── main.py           # FastAPI application
│   │   ├── database.py
│   │   ├── models.py
│   │   ├── schemas.py
│   │   ├── security.py
│   │   └── routers/
│   │
│   ├── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── hero/
│   │   │   ├── layout/
│   │   │   └── ui/
│   │   │
│   │   ├── features/
│   │   │   └── analysis/
│   │   │
│   │   ├── pages/
│   │   │   ├── HomePage.tsx
│   │   │   └── HistoryPage.tsx
│   │   │
│   │   └── lib/
│   │       └── api/
│   │           └── client.ts
│   │
│   ├── package.json
│
├── data/
│   ├── raw/
│   └── processed/
│
├── models/
│   └── baseline/
│
├── scripts/
│   ├── clean_data.py
│   └── inspect_data.py
│
├── docker-compose.yml
├── README.md
└── requirements.txt
```

---

## Features

### News Analysis

Users can submit news text to the system. The backend:

- tokenizes the text
- runs inference using DistilBERT
- returns:
  - `REAL` / `FAKE`
  - confidence score
  - prediction probability

### History Tracking

All predictions are stored in PostgreSQL. Users can view:

- previous analyses
- prediction scores
- timestamps
- feedback status

### User Feedback

Users can mark predictions as:

- correct
- incorrect

Feedback is stored for future model improvement.

### Statistics

The API exposes aggregated metrics:

- total analyses
- fake vs real distribution
- average confidence
- feedback accuracy

### Rate Limiting

API endpoints are protected using SlowAPI. Example limits:

```
/analyze  → 10 requests / minute
/feedback → 20 requests / minute
/history  → 30 requests / minute
```

---

## Dataset

The project uses the [WELFake dataset](https://zenodo.org/record/4561253).

Place the raw CSV in:

```
data/raw/WELFake_Dataset.csv
```

> The dataset is not committed to Git.

---

## Data Cleaning

Run:

```bash
python scripts/clean_data.py
```

This step:

- removes duplicates
- removes missing values
- merges title + article
- caps text length
- creates stratified splits

Output:

```
data/processed/
    train.csv
    val.csv
    test.csv
```

---

## Model Training

Baseline model: **DistilBERT**

Train locally:

```bash
python src/fakey/models/train.py \
  --epochs 1 \
  --batch_size 8 \
  --max_length 256
```

Outputs:

```
models/baseline/
    model.safetensors
    config.json
    tokenizer.json
    metrics.json
```

---

## Model Evaluation

Run:

```bash
python src/fakey/models/evaluate.py \
  --model_dir models/baseline \
  --test_path data/processed/test.csv
```

### Baseline Results

**Validation:**

| Metric | Score |
|--------|-------|
| Accuracy | 99.35% |
| F1 Score | 99.29% |

**Test:**

| Metric | Score |
|--------|-------|
| Accuracy | 99.19% |
| Precision | 98.99% |
| Recall | 99.23% |
| F1 Score | 99.11% |

---

## Running the Application

### Start the backend

```bash
docker compose up
```

- API: [http://localhost:8000](http://localhost:8000)
- Docs: [http://localhost:8000/docs](http://localhost:8000/docs)

### Start the frontend

```bash
cd frontend
npm install
npm run dev
```

- Frontend: [http://localhost:5173](http://localhost:5173)

---

## API Endpoints

```
POST    /analyze
POST    /feedback
GET     /history
GET     /stats
GET     /health
DELETE  /history/{id}
```

---

## Development Workflow

**Git branching strategy:**

```
main  → stable releases
dev   → integration branch
feat/* → feature development
fix/*  → bug fixes
```

**Workflow:**

```
feature branch
      ↓
     dev
      ↓
    main
```

---

## Reproducibility

The project is fully reproducible with:

- `requirements.txt`
- data cleaning scripts
- training scripts
- docker environment

> No datasets or trained models are committed.

---

## Future Improvements

Planned improvements:
- [ ] Active learning from user feedback
- [ ] Experiment tracking
- [ ] CI/CD pipeline
- [ ] Cloud deployment
- [ ] Monitoring and logging
- [ ] Model optimization for faster inference
- [ ] User authentication

---

## License

[MIT License](LICENSE)
