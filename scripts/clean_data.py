import os
import pandas as pd
from sklearn.model_selection import train_test_split

RAW_PATH = "data/raw/WELFake_Dataset.csv"
OUT_DIR = "data/processed"
MIN_LEN = 50
MAX_LEN = 20000
SEED = 42

def main():
    df = pd.read_csv(RAW_PATH)

    if "Unnamed: 0" in df.columns:
        df = df.drop(columns=["Unnamed: 0"])

    df = df.dropna(subset=["text"])
    df["title"] = df["title"].fillna("")
    df["content"] = (df["title"].astype(str) + " " + df["text"].astype(str)).str.strip()
    df = df.drop_duplicates(subset=["content"])
    df = df[df["content"].str.len() >= MIN_LEN]
    df["content"] = df["content"].str.slice(0, MAX_LEN)
    df = df[["content", "label"]]

    labels = set(df["label"].unique())
    if not labels.issubset({0, 1}):
        raise ValueError(f"Unexpected labels: {labels}")

    train_df, temp_df = train_test_split(
        df, test_size=0.2, random_state=SEED, stratify=df["label"]
    )
    val_df, test_df = train_test_split(
        temp_df, test_size=0.5, random_state=SEED, stratify=temp_df["label"]
    )

    os.makedirs(OUT_DIR, exist_ok=True)
    df.to_csv(os.path.join(OUT_DIR, "welfake_clean.csv"), index=False)
    train_df.to_csv(os.path.join(OUT_DIR, "train.csv"), index=False)
    val_df.to_csv(os.path.join(OUT_DIR, "val.csv"), index=False)
    test_df.to_csv(os.path.join(OUT_DIR, "test.csv"), index=False)

    print("Rows:", len(df))
    print("Train/Val/Test:", len(train_df), len(val_df), len(test_df))
    print(df["label"].value_counts(normalize=True).round(3))
    print(df["content"].str.len().describe())

if __name__ == "__main__":
    main()
