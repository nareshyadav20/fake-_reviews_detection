import pandas as pd
import random

products = ["phone","laptop","headphones","watch","camera","tablet","speaker"]

positive_words = ["good","great","excellent","nice","impressive","solid","reliable"]
neutral_words = ["okay","average","fine","decent"]

features = ["battery life","performance","design","quality","display"]

genuine_templates = [
    "The {product} works {word} and the {feature} is nice",
    "I bought this {product} last week and it feels {word}",
    "Using this {product} for a few days and the {feature} is {word}",
    "The {product} arrived on time and it looks {word}",
    "Overall the {product} is {word} for the price",
]

fake_templates = [
    "Amazing {product}!!! Best product ever!!! Buy now!!!",
    "Best {product} in the world highly recommended buy now!!!",
    "Five stars best {product} must buy right now!!!",
    "Super amazing deal buy this {product} now!!!",
]

data = []

# genuine reviews
for _ in range(800):

    template = random.choice(genuine_templates)

    review = template.format(
        product=random.choice(products),
        word=random.choice(positive_words + neutral_words),
        feature=random.choice(features)
    )

    # add random extra sentence sometimes
    if random.random() > 0.5:
        review += " I have been using it daily."

    data.append([review,0])


# fake reviews
for _ in range(800):

    template = random.choice(fake_templates)

    review = template.format(
        product=random.choice(products)
    )

    # exaggeration noise
    if random.random() > 0.5:
        review += " Limited offer!!!"

    data.append([review,1])

random.shuffle(data)

df = pd.DataFrame(data, columns=["review","label"])

df.to_csv("yelp_reviews.csv", index=False)

print("Dataset generated:",len(df))