import requests
import sys

# Configuration
API_URL = "http://localhost:8001"
ADMIN_EMAIL = "admin@system.com"
ADMIN_PASSWORD = "admin"

def login():
    try:
        response = requests.post(
            f"{API_URL}/token",
            data={"username": ADMIN_EMAIL, "password": ADMIN_PASSWORD},
            headers={"Content-Type": "application/x-www-form-urlencoded"}
        )
        if response.status_code == 200:
            return response.json()["access_token"]
        else:
            print(f"Login failed: {response.text}")
            sys.exit(1)
    except Exception as e:
        print(f"Error connecting to API: {e}")
        sys.exit(1)

def test_students_search(token):
    print("\nTesting Students Search...")
    headers = {"Authorization": f"Bearer {token}"}
    
    # 1. List all (limit 5)
    res = requests.get(f"{API_URL}/students/?limit=5", headers=headers)
    print(f"List all (limit 5): {res.status_code} - Count: {len(res.json())}")
    
    # 2. Search for 'Student 1' (should exist if seeded)
    res = requests.get(f"{API_URL}/students/?search=Student 1", headers=headers)
    data = res.json()
    print(f"Search 'Student 1': {res.status_code} - Count: {len(data)}")
    if len(data) > 0:
        print(f"  First result: {data[0]['name']}")
    else:
        print("  No students found with 'Student 1'")

def test_payments_search(token):
    print("\nTesting Payments Search...")
    headers = {"Authorization": f"Bearer {token}"}
    
    # Needs a seeded payment first, or we search for empty
    # Assuming seed_yana.py was run, we have students but maybe no payments?
    # Actually Payments are created manually or expected?
    # Let's just check if endpoint responds 200 to params
    
    res = requests.get(f"{API_URL}/payments/?limit=5", headers=headers)
    print(f"List payments (limit 5): {res.status_code}")
    
    res = requests.get(f"{API_URL}/payments/?search=Student", headers=headers)
    print(f"Search payments 'Student': {res.status_code}")

if __name__ == "__main__":
    token = login()
    test_students_search(token)
    test_payments_search(token)
