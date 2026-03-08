import pandas as pd
import re
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer


def clean_text(text):
    text = text.lower()

    # remove urls
    text = re.sub(r'http\S+|www\S+', '', text)

    # remove numbers
    text = re.sub(r'\d+', '', text)

    # remove special characters
    text = re.sub(r'[^a-zA-Z\s]', '', text)

    # remove extra spaces
    text = re.sub(r'\s+', ' ', text).strip()

    return text


def load_and_preprocess(path):

    df = pd.read_csv(path)

    # remove missing values
    df = df.dropna()

    # clean text
    df["review"] = df["review"].apply(clean_text)

    # remove very short reviews
    df = df[df["review"].str.split().str.len() > 3]

    X = df["review"]
    y = df["label"]

    # Improved TF-IDF vectorizer
    vectorizer = TfidfVectorizer(
        stop_words="english",
        ngram_range=(1, 2),   # single + phrase words
        min_df=3,             # ignore rare words
        max_df=0.85,          # ignore very common words
        max_features=6000
    )

    X_vec = vectorizer.fit_transform(X)

    # balanced train/test split
    X_train, X_test, y_train, y_test = train_test_split(
        X_vec,
        y,
        test_size=0.2,
        random_state=42,
        stratify=y
    )

    return X_train, X_test, y_train, y_test, vectorizer