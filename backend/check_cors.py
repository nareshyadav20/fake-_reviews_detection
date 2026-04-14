import requests

BASE_URL = "http://localhost:5001"

def test_cors(origin):
    print(f"\nTesting CORS with Origin: {origin}")
    headers = {
        "Origin": origin,
        "Access-Control-Request-Method": "POST",
        "Access-Control-Request-Headers": "Content-Type,Authorization"
    }
    try:
        # Test Preflight (OPTIONS)
        r = requests.options(f"{BASE_URL}/predict", headers=headers)
        print(f"OPTIONS Status: {r.status_code}")
        print(f"Allow-Origin: {r.headers.get('Access-Control-Allow-Origin')}")
        
        # Test Actual Request
        headers = {"Origin": origin, "Content-Type": "application/json"}
        r = requests.post(f"{BASE_URL}/predict", headers=headers, json={"review": "test"})
        print(f"POST Status: {r.status_code}")
        print(f"Allow-Origin: {r.headers.get('Access-Control-Allow-Origin')}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_cors("http://localhost:3000")
    test_cors("http://127.0.0.1:3000")
    test_cors("http://wrong-origin.com")
