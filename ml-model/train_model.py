import pickle
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
from sklearn.model_selection import cross_val_score
from preprocess import load_and_preprocess

# Load and preprocess dataset
X_train, X_test, y_train, y_test, vectorizer = load_and_preprocess("yelp_reviews.csv")

# Logistic Regression model
model = LogisticRegression(
    max_iter=3000,
    class_weight="balanced",
    C=0.5,
    random_state=42
)

# Train model
model.fit(X_train, y_train)

print("✅ Model trained successfully")

# Predictions
y_pred = model.predict(X_test)

# Accuracy
accuracy = accuracy_score(y_test, y_pred)
print("📊 Test Accuracy:", round(accuracy * 100, 2), "%")

# Cross validation (more realistic accuracy)
cv_scores = cross_val_score(model, X_train, y_train, cv=5)

print("📈 Cross Validation Accuracy:", round(cv_scores.mean() * 100, 2), "%")

# Classification report
print("\n📋 Classification Report:")
print(classification_report(y_test, y_pred))

# Confusion matrix
print("🧾 Confusion Matrix:")
print(confusion_matrix(y_test, y_pred))

# Save model
with open("model.pkl", "wb") as f:
    pickle.dump(model, f)

with open("vectorizer.pkl", "wb") as f:
    pickle.dump(vectorizer, f)

print("💾 Model and vectorizer saved successfully")