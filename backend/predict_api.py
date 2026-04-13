from flask import Flask, request, jsonify
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app)  # Allow Node.js (same host) to call this internal API

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

@app.route("/predict", methods=["POST"])
def predict():
    data = request.json
    review = data.get("review", "")

    # Extract engineered features
    features = extract_features(review)

    # Get words for analysis
    words = review.lower().split()
    word_counts = {}
    for word in words:
        word_counts[word] = word_counts.get(word, 0) + 1

    # Define word lists for analysis
    exaggerated_words = ['best', 'ever', 'amazing', 'perfect', 'must', 'buy', 'now',
                        'super', 'awesome', 'love', 'much', 'unbelievable', 'fantastic',
                        'incredible', 'life', 'changing', 'five', 'stars']
    promotional_words = ['buy', 'now', 'must', 'limited', 'offer', 'deal', 'discount', 'sale']
    specific_words = ['battery', 'screen', 'camera', 'performance', 'design', 'quality',
                     'price', 'service', 'shipping', 'week', 'month', 'year', 'day',
                     'using', 'used', 'bought', 'received', 'arrived']

    # Rule-based prediction logic with consistent scoring
    fake_score = 0
    genuine_score = 0

    # Strong fake indicators (higher priority)
    if features['exclamation_count'] >= 3:
        fake_score += 4
    elif features['exclamation_count'] >= 2:
        fake_score += 3
    elif features['exclamation_count'] >= 1:
        fake_score += 2

    if features['repeated_words'] >= 2:
        fake_score += 3
    elif features['repeated_words'] >= 1:
        fake_score += 2

    if features['exaggerated_count'] >= 2:
        fake_score += 3
    elif features['exaggerated_count'] >= 1:
        fake_score += 2

    if features['promotional_count'] >= 2:
        fake_score += 4
    elif features['promotional_count'] >= 1:
        fake_score += 3

    if features['all_caps_count'] >= 1:
        fake_score += 2

    if features['review_length'] < 6:
        fake_score += 2
    elif features['review_length'] < 8:
        fake_score += 1

    # Genuine indicators (lower priority to avoid conflicts)
    if features['specific_count'] >= 3:
        genuine_score += 2
    elif features['specific_count'] >= 1:
        genuine_score += 1

    if features['review_length'] > 15:
        genuine_score += 2
    elif features['review_length'] > 10:
        genuine_score += 1

    # Strong fake indicators override genuine indicators
    if features['promotional_count'] >= 1 and features['exclamation_count'] >= 2:
        fake_score += 2  # Bonus for promotional + exclamation combo

    reasons = []

    # Make decision with tie-breaker favoring fake when promotional language present
    if fake_score > genuine_score:
        classification = "Likely Fake"
        confidence = min(95, 65 + (fake_score * 4))

        if features['exclamation_count'] >= 3:
            reasons.append(f"excessive punctuation ({features['exclamation_count']} exclamation marks)")
        if features['repeated_words'] >= 2:
            repeated_word_list = [word for word, count in word_counts.items() if count > 1]
            reasons.append(f"repeated words like '{repeated_word_list[0] if repeated_word_list else 'words'}'")
        if features['exaggerated_count'] >= 2:
            exaggerated_word_list = [word for word in words if word in exaggerated_words]
            reasons.append(f"multiple exaggerated terms like '{exaggerated_word_list[0] if exaggerated_word_list else 'best'}'")
        if features['promotional_count'] >= 1:
            promotional_word_list = [word for word in words if word in promotional_words]
            reasons.append(f"promotional language like '{promotional_word_list[0] if promotional_word_list else 'buy'}'")
        if features['review_length'] < 8:
            reasons.append(f"extremely short length ({features['review_length']} words)")
        if features['all_caps_count'] >= 1:
            reasons.append("excessive capitalization")

        if reasons:
            conclusion = f"This review appears fake because it contains {', '.join(reasons)}. These patterns are commonly associated with fabricated or promotional content rather than authentic customer feedback."
        else:
            conclusion = "This review appears fake due to its overly enthusiastic tone and lack of specific details, which are typical indicators of fabricated reviews designed to appear overly positive."

    elif fake_score == genuine_score:
        if features['promotional_count'] >= 1 or features['exclamation_count'] >= 2:
            classification = "Likely Fake"
            confidence = 55
            conclusion = "This review appears fake because it contains promotional language or excessive punctuation, which are indicators of fabricated content despite other balanced characteristics."
        else:
            classification = "Likely Genuine"
            confidence = 55
            conclusion = "This review appears genuine due to its balanced characteristics and lack of strong fake indicators."
    else:
        classification = "Likely Genuine"
        confidence = min(95, 65 + (genuine_score * 4))

        if features['specific_count'] >= 2:
            specific_word_list = [word for word in words if word in specific_words]
            reasons.append(f"specific details like '{specific_word_list[0] if specific_word_list else 'features'}'")
        if features['review_length'] > 12:
            reasons.append(f"detailed length ({features['review_length']} words)")
        if features['specific_count'] >= 1:
            specific_word_list = [word for word in words if word in specific_words]
            reasons.append(f"product-specific references like '{specific_word_list[0] if specific_word_list else 'product'}'")
        if features['exaggerated_count'] == 0 and features['promotional_count'] == 0:
            reasons.append("balanced, non-promotional language")
        if features['exclamation_count'] <= 1:
            reasons.append("appropriate emotional expression")

        if reasons:
            conclusion = f"This review appears genuine because it contains {', '.join(reasons)}. These characteristics indicate authentic user experience and balanced feedback."
        else:
            conclusion = "This review appears genuine due to its natural language patterns and balanced tone, which are consistent with authentic customer feedback rather than promotional content."

    return jsonify({
        "prediction": classification,
        "confidence": round(confidence, 1),
        "conclusion": conclusion,
        "reasons": reasons,
        "is_generic": features['specific_count'] == 0
    })

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "service": "ml-predict"})

if __name__ == "__main__":
    port = int(os.environ.get("ML_PORT", 6000))
    app.run(host="127.0.0.1", port=port, debug=False)
