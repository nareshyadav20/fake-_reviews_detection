import pandas as pd
import re
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer

def clean_text(text):
    text = text.lower()
    text = re.sub(r"http\S+|www\S+", "", text)
    text = re.sub(r"\d+", "", text)
    text = re.sub(r"[^a-zA-Z\s]", "", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text

def load_and_preprocess(path):
    df = pd.read_csv(path).dropna()
    df["review"] = df["review"].apply(clean_text)
    df = df[df["review"].str.split().str.len() > 1]

    X = df["review"]
    y = df["label"]

    vectorizer = TfidfVectorizer(
        ngram_range=(1, 3),   # uni-, bi-, tri-grams
        min_df=2,
        max_df=0.9,
        max_features=8000
    )

    X_vec = vectorizer.fit_transform(X)

    X_train, X_test, y_train, y_test = train_test_split(
        X_vec, y, test_size=0.2, random_state=42, stratify=y
    )

    return X_train, X_test, y_train, y_test, vectorizer