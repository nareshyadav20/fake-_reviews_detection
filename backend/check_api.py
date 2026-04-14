import requests
import json

BASE_URL = "http://localhost:5001"
ML_URL = "http://127.0.0.1:6000"

def test_ml():
    print(f"Testing ML service at {ML_URL}/health...")
    try:
        r = requests.get(f"{ML_URL}/health")
        print(f"Status: {r.status_code}")
        print(f"Response: {r.json()}")
    except Exception as e:
        print(f"Error: {e}")

def test_signup():
    print(f"\nTesting Backend signup at {BASE_URL}/signup...")
    payload = {
        "name": "Diagnostic User",
        "username": "diag@test.com",
        "password": "password123"
    }
    try:
        r = requests.post(f"{BASE_URL}/signup", json=payload)
        print(f"Status: {r.status_code}")
        print(f"Response: {r.json()}")
    except Exception as e:
        print(f"Error: {e}")

def test_login():
    print(f"\nTesting Backend login at {BASE_URL}/login...")
    payload = {
        "username": "diag@test.com",
        "password": "password123"
    }
    try:
        r = requests.post(f"{BASE_URL}/login", json=payload)
        print(f"Status: {r.status_code}")
        data = r.json()
        print(f"Response: {data}")
        return data.get("token")
    except Exception as e:
        print(f"Error: {e}")
        return None

def test_predict(token):
    if not token:
        print("\nSkipping predict test: No token")
        return
    print(f"\nTesting Backend predict at {BASE_URL}/predict...")
    payload = {"review": "This product is amazing!!! Best ever!"}
    headers = {"Authorization": f"Bearer {token}"}
    try:
        r = requests.post(f"{BASE_URL}/predict", json=payload, headers=headers)
        print(f"Status: {r.status_code}")
        print(f"Response: {r.json()}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_ml()
    test_signup()
    token = test_login()
    test_predict(token)
