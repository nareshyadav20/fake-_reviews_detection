import pandas as pd
import random

products = ["phone","laptop","headphones","watch","camera","tablet","speaker","keyboard","mouse"]

positive_words = ["good","great","excellent","nice","impressive","solid","reliable","fantastic","smooth"]
neutral_words = ["okay","average","fine","decent"]
negative_words = ["bad","poor","disappointing","slow","terrible"]

features = ["battery life","performance","design","quality","display","build quality","sound quality","price","service","shipping"]

genuine_templates = [
    "The {product} works {word} and the {feature} is good",
    "I bought this {product} last week and it feels {word}",
    "Using this {product} for a few days and the {feature} is {word}",
    "The {product} arrived on time and it looks {word}",
    "Overall the {product} is {word} for the price",
    "This {product} is good and worth buying",
    "The {feature} of this {product} is {word}",
    "I've been using this {product} for {time} and the {feature} is {word}",
    "The {feature} could be better but overall it's {word}",
    "For the price, the {feature} is quite {word}",
    "The {product} has good {feature} but the {feature} could improve",
    "After {time} of use, I can say the {feature} is {word}",
    "The {feature} works well but the {feature} is disappointing",
    "I'm satisfied with the {feature} of this {product}",
    "The {product} met my expectations for {feature}",
    "Good quality for the price, but packaging could be better.",
    "I've been using this {product} for a week, and it's easy to use.",
    "Food was tasty and service was quick, but the place was crowded.",
    "The {product} is {word}, however the shipping took longer than expected.",
    "I like the {feature}, but I wish the battery lasted longer.",
    "This {product} is great for beginners, though experts might find it basic.",
    "The build quality is {word}, but the instructions were hard to follow.",
    "Great food and atmosphere, but the wait time was too long.",
    "The staff was friendly and the {product} worked as expected.",
    "I had a minor issue with the {feature}, but customer support fixed it quickly.",
    "Good value for money, but don't expect premium materials.",
    "The {product} arrived earlier than expected and works perfectly.",
    "I've tried many different {product}s, but this one stands out for its {feature}."
]

negative_templates = [
    "The {product} is {word} and the {feature} is definitely not good enough for me.",
    "I expected much better from this {product} considering the premium brand.",
    "The {feature} of this {product} disappointed me greatly after only a week of use.",
    "This {product} is not worth the price at all; the build quality is very poor.",
    "I had a bad experience with the {product}; the {feature} is {word} and it broke early.",
]

fake_templates = [
    "Amazing {product}!!! Best product ever!!! Buy now!!!",
    "Five stars best {product} must buy right now!!!",
    "Unbelievable deal buy this {product} today!!!",
    "Best product in the world buy now!!!",
    "Limited offer grab this {product} immediately!!!",
    "It's okay, could be better.",
    "Decent {product} but not great.",
    "The {product} is fine, nothing special.",
    "Average quality, expected more.",
    "Just another generic {product}.",
    "It works, but honestly could be improved.",
    "Not bad, but I have seen better {product}s.",
    "Okay product for the price I guess.",
    "it is not good",
    "bad quality",
    "worst product ever",
    "waste of money",
    "not happy with this",
    "generic review for {product}",
    "Not bad, not great.",
    "Does what it says.",
    "Works fine.",
    "It is okay.",
    "nothing to say much.",
    "so so product.",
    "okay overall.",
    "fine for me.",
    "good for the price.",
    "Average.",
    "Satisfied.",
    "Perfect {product}!",
    "Highly recommend this {product}.",
    "Very happy with {product}.",
    "Good.",
    "Bad.",
    "Great.",
    "Nice.",
    "Excellent.",
    "Superb.",
    "Fantastic.",
    "I love it.",
    "Best ever.",
    "Do not buy.",
    "Waste of time.",
    "Worst {product} ever.",
    "Cheap quality.",
    "Terrible.",
    "Awful.",
    "Zero stars if I could.",
    "Review for {product}: Good.",
    "This {product} is okay.",
    "Everything is fine.",
    "No complaints.",
    "As expected.",
    "Standard {product}."
]

data = []

# Genuine positive: 3500
for _ in range(3500):
    template = random.choice(genuine_templates)
    review = template.format(
        product=random.choice(products),
        word=random.choice(positive_words + neutral_words),
        feature=random.choice(features)
    )
    data.append([review,0])

# Genuine negative: 1500
for _ in range(1500):
    template = random.choice(negative_templates)
    review = template.format(
        product=random.choice(products),
        word=random.choice(negative_words),
        feature=random.choice(features)
    )
    data.append([review,0])

# Fake reviews: 5000
for _ in range(5000):
    template = random.choice(fake_templates)
    review = template.format(product=random.choice(products))
    data.append([review,1])

random.shuffle(data)

df = pd.DataFrame(data,columns=["review","label"])
df.to_csv("reviews_dataset.csv",index=False)

print("Dataset generated:",len(df))