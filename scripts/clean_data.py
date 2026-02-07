import os
import pandas as pd

RAW_PATH = "data/raw/WELFake_Dataset.csv"
OUT_PATH = "data/processed/welfake_clean.csv"
MIN_LEN = 50

def main():
    df = pd.read_csv(RAW_PATH)

    if "Unnamed: 0" in df.columns:
        df = df.drop(columns=["Unnamed: 0"])

    df = df.dropna(subset=["text"])
    df["title"] = df["title"].fillna("")

    df["content"] = (df["title"].astype(str) + " " + df["text"].astype(str)).str.strip()

    before = len(df)
    df = df.drop_duplicates(subset=["content"])
    deduped = before - len(df)

    df = df[df["content"].str.len() >= MIN_LEN]

    df = df[["content", "label"]]

    labels = set(df["label"].unique())
    if not labels.issubset({0, 1}):
        raise ValueError(f"Unexpected labels: {labels}")

    os.makedirs(os.path.dirname(OUT_PATH), exist_ok=True)
    df.to_csv(OUT_PATH, index=False)

    print("Saved:", OUT_PATH)
    print("Rows:", len(df))
    print("Removed duplicates:", deduped)
    print("Label balance:")
    print(df["label"].value_counts(normalize=True).round(3))
    print("Length stats:")
    print(df["content"].str.len().describe())

if __name__ == "__main__":
    main()
