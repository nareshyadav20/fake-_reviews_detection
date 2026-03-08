from flask import Flask, request, jsonify
import pickle
import re

app = Flask(__name__)

# Load trained model and vectorizer
model = pickle.load(open("model.pkl", "rb"))
vectorizer = pickle.load(open("vectorizer.pkl", "rb"))

def is_gibberish(text):
    """
    Simple gibberish detection:
    - No real words (vectorizer cannot transform)
    - Mostly non-alphabet characters
    """
    # Count alphabetic characters
    alpha_chars = sum(c.isalpha() for c in text)
    if alpha_chars / max(len(text), 1) < 0.5:
        return True
    return False

@app.route("/predict", methods=["POST"])
def predict():
    data = request.json
    review = data.get("review", "").strip()

    # 1️⃣ Empty input
    if not review:
        return jsonify({
            "prediction": "No Review Entered",
            "confidence": 0
        })

    # 2️⃣ Very short input (optional: allow 1-2 words)
    if len(review.split()) < 2:
        return jsonify({
            "prediction": "Review Too Short",
            "confidence": 0
        })

    # 3️⃣ Check for gibberish/random input
    if is_gibberish(review):
        return jsonify({
            "prediction": "Random / Incoherent Input",
            "confidence": 0
        })

    # 4️⃣ Convert text to vector
    vec = vectorizer.transform([review])

    # If vector has no known words, treat as gibberish
    if vec.nnz == 0:
        return jsonify({
            "prediction": "Random / Unknown Words",
            "confidence": 0
        })

    # 5️⃣ Predict probabilities
    proba = model.predict_proba(vec)[0]
    genuine_prob = proba[0]
    fake_prob = proba[1]

    # 6️⃣ Decide prediction
    if genuine_prob > fake_prob:
        result = "Genuine"
        confidence = round(genuine_prob * 100, 2)
    else:
        result = "Fake"
        confidence = round(fake_prob * 100, 2)

    # 7️⃣ Return JSON response
    return jsonify({
        "prediction": result,
        "confidence": confidence
    })

if __name__ == "__main__":
    app.run(port=6000, debug=True)