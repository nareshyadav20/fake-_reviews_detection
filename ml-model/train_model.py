import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from transformers import BertModel, BertTokenizer
from sklearn.metrics import accuracy_score, classification_report
import pickle
import re

# Load the balanced dataset
df = pd.read_csv("reviews_dataset.csv")

# Feature Engineering Function
def extract_features(review):
    features = {}
    
    # Count exclamation marks
    features['exclamation_count'] = review.count('!')
    
    # Count repeated words
    words = review.lower().split()
    word_counts = {}
    for word in words:
        word_counts[word] = word_counts.get(word, 0) + 1
    repeated_words = sum(1 for count in word_counts.values() if count > 1)
    features['repeated_words'] = repeated_words
    
    # Review length
    features['review_length'] = len(words)
    
    # Count exaggerated words
    exaggerated_words = ['best', 'ever', 'amazing', 'perfect', 'must', 'buy', 'now', 
                        'super', 'awesome', 'love', 'much', 'unbelievable', 'fantastic',
                        'incredible', 'life', 'changing', 'five', 'stars']
    features['exaggerated_count'] = sum(1 for word in words if word in exaggerated_words)
    
    # Count promotional words
    promotional_words = ['buy', 'now', 'must', 'limited', 'offer', 'deal', 'discount', 'sale']
    features['promotional_count'] = sum(1 for word in words if word in promotional_words)
    
    # Count specific/genuine words
    specific_words = ['battery', 'screen', 'camera', 'performance', 'design', 'quality', 
                     'price', 'service', 'shipping', 'week', 'month', 'year', 'day', 
                     'using', 'used', 'bought', 'received', 'arrived']
    features['specific_count'] = sum(1 for word in words if word in specific_words)
    
    # All caps words count
    features['all_caps_count'] = sum(1 for word in words if word.isupper() and len(word) > 1)
    
    return features

# Extract features for all reviews
feature_list = []
for review in df['review']:
    features = extract_features(review)
    feature_list.append(features)

# Create feature DataFrame
feature_df = pd.DataFrame(feature_list)

# Combine with TF-IDF features
vectorizer = TfidfVectorizer(max_features=1000, ngram_range=(1, 2))
X_text = vectorizer.fit_transform(df['review'])

# Combine engineered features with text features
from scipy import sparse
X_engineered = sparse.csr_matrix(feature_df.values)
X_combined = sparse.hstack([X_text, X_engineered])

# Prepare labels
y = df['label'].map({'Genuine': 0, 'Fake': 1})

# Split data
X_train, X_test, y_train, y_test = train_test_split(X_combined, y, test_size=0.2, random_state=42, stratify=y)

# Train Random Forest model
model = RandomForestClassifier(
    n_estimators=100,
    max_depth=15,
    min_samples_split=5,
    min_samples_leaf=2,
    random_state=42,
    class_weight='balanced'  # Handle any remaining imbalance
)

model.fit(X_train, y_train)

# Make predictions
y_pred = model.predict(X_test)

# Calculate accuracy
accuracy = accuracy_score(y_test, y_pred)
print(f"Model Accuracy: {accuracy:.4f} ({accuracy*100:.2f}%)")
print("\nClassification Report:")
print(classification_report(y_test, y_pred, target_names=['Genuine', 'Fake']))

# Test with specific fake examples
test_reviews = [
    "Best product ever!!!",
    "Amazing amazing amazing!!!", 
    "Must buy now!!!",
    "Super awesome product!!!",
    "Perfect in every way!!!",
    "I love this so much!!!",
    "Unbelievable quality!!!",
    "Fantastic fantastic!!!",
    "I've been using this phone for two weeks and the battery life is excellent.",
    "The camera quality is good but the battery could be better."
]

print("\n=== Test Results ===")
for review in test_reviews:
    # Extract features
    features = extract_features(review)
    feature_row = pd.DataFrame([features])
    
    # Transform text
    text_features = vectorizer.transform([review])
    
    # Combine features
    engineered_features = sparse.csr_matrix(feature_row.values)
    combined_features = sparse.hstack([text_features, engineered_features])
    
    # Predict
    prediction = model.predict(combined_features)[0]
    confidence = max(model.predict_proba(combined_features)[0]) * 100
    
    result = "Fake" if prediction == 1 else "Genuine"
    print(f"'{review}' → {result} (Confidence: {confidence:.1f}%)")

# Save model and vectorizer
with open("model.pkl", "wb") as model_file:
    pickle.dump(model, model_file)

with open("vectorizer.pkl", "wb") as vectorizer_file:
    pickle.dump(vectorizer, vectorizer_file)

print("\nModel and vectorizer saved successfully!")