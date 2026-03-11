# AI Fake News Detector

An end-to-end machine learning project for detecting fake news using a
fine-tuned DistilBERT model.

------------------------------------------------------------------------

## Overview

This project covers:

-   Data cleaning and preprocessing\
-   Dataset inspection\
-   Transformer model training\
-   Validation and test evaluation\
-   Reproducible project structure\
-   Git-based workflow

------------------------------------------------------------------------

## Project Structure

    fake-news-detector/
    │
    ├── data/
    │   ├── raw/          # Original dataset (ignored)
    │   └── processed/    # Cleaned + split data (ignored)
    │
    ├── scripts/
    │   ├── clean_data.py     # Data cleaning and splitting
    │   └── inspect_data.py   # Dataset inspection
    │
    ├── src/
    │   └── fakey/
    │       └── models/
    │           ├── train.py     # Model training
    │           └── evaluate.py  # Test evaluation
    │
    ├── models/        # Trained artifacts (ignored)
    ├── notebooks/     # Optional analysis notebooks
    ├── tests/         # Future tests
    │
    ├── requirements.txt
    ├── .gitignore
    └── README.md

------------------------------------------------------------------------

## Requirements

-   Python 3.10+

Install dependencies:

``` powershell
pip install -r requirements.txt
```

Main libraries:

-   pandas\
-   numpy\
-   scikit-learn\
-   transformers\
-   torch\
-   accelerate\
-   datasets\
-   tqdm\
-   jupyter

------------------------------------------------------------------------

## Dataset

This project uses the WELFake / Kaggle fake news dataset.

Place the raw CSV file in:

    data/raw/WELFake_Dataset.csv

This file is ignored by Git.

------------------------------------------------------------------------

## Data Cleaning and Splitting

Clean, deduplicate, cap length, and split the dataset:

``` bash
python scripts/clean_data.py
```

Output:

    data/processed/
    ├── welfake_clean.csv
    ├── train.csv
    ├── val.csv
    └── test.csv

Features:

-   Removes duplicates\
-   Drops missing text\
-   Combines title + article\
-   Caps max length\
-   Stratified train/val/test split

------------------------------------------------------------------------

## Dataset Inspection

Check data quality and statistics:

``` bash
python scripts/inspect_data.py
```

Outputs:

-   Shape\
-   Label distribution\
-   Length statistics\
-   Random samples

------------------------------------------------------------------------

## Model Training

Baseline model: DistilBERT

Train on CPU:

``` bash
python src/fakey/models/train.py --epochs 1 --batch_size 8 --max_length 256
```

Faster run (recommended for CPU):

``` bash
python src/fakey/models/train.py --epochs 1 --batch_size 8 --max_length 128
```

Outputs:

    models/baseline/
    ├── model.safetensors
    ├── config.json
    ├── tokenizer.json
    ├── tokenizer_config.json
    └── metrics.json

------------------------------------------------------------------------

## Test Evaluation

Evaluate on the held-out test set:

``` bash
python src/fakey/models/evaluate.py \
  --model_dir models/baseline \
  --test_path data/processed/test.csv \
  --max_length 256 \
  --batch_size 16
```

Results are printed and saved to:

    models/baseline/test_metrics.json

------------------------------------------------------------------------

## Baseline Results

Validation (after 1 epoch):

-   Accuracy: \~99.35%\
-   F1: \~99.29%

Test set:

-   Accuracy: \~99.19%\
-   Precision: \~98.99%\
-   Recall: \~99.23%\
-   F1: \~99.11%

These results show strong generalization on WELFake.

------------------------------------------------------------------------


## GPU Training (Google Colab)

For faster training, this project supports GPU-accelerated training using
Google Colab.

A ready-to-use notebook is provided:

    notebooks/02_colab_training.ipynb

Features:

-   Runs on Tesla T4 GPU (or similar)
-   ~20× faster than local CPU training
-   Reproducible environment setup
-   Automatic model and metrics export

Workflow:

1. Open the notebook in Google Colab
2. Enable GPU runtime
3. Upload train/val/test CSV files
4. Run all cells
5. Download trained artifacts

This enables full cloud-based training without local hardware requirements.

------------------------------------------------------------------------

## Git Workflow

Branches:

-   main -- stable releases\
-   dev -- integration\
-   feat/\* -- features

Workflow:

    feat/* → dev → main

Artifacts and datasets are ignored. Only source code is tracked.

------------------------------------------------------------------------

## Reproducibility

All experiments are reproducible using:

-   requirements.txt\
-   clean_data.py\
-   train.py\
-   evaluate.py

No trained models or raw data are committed.

------------------------------------------------------------------------

## Future Work

This project is **still under active development**. Planned improvements include:

- React web frontend for user interaction
- User authentication and accounts
- Model explainability (e.g., SHAP or LIME)
- Experiment tracking for training runs
- Feedback-based model retraining
- CI/CD pipeline with automated testing and deployment
- Containerized cloud deployment
- Application monitoring and logging
- Model optimization for faster inference


