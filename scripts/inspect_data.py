import pandas as pd

df = pd.read_csv("data/processed/welfake_clean.csv")

print("Shape:", df.shape)
print("Label counts:")
print(df["label"].value_counts())
print("Length stats:")
print(df["content"].str.len().describe())

print("Samples:")
print(df.sample(3, random_state=42).to_string(index=False))
