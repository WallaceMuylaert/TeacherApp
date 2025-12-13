import requests

# URL
BASE_URL = "http://localhost:8000"

# Login
auth_data = {"username": "teacher1@test.com", "password": "finalpass123"}
response = requests.post(f"{BASE_URL}/token", data=auth_data)
if response.status_code != 200:
    print(f"Login failed: {response.text}")
    exit(1)

token = response.json()["access_token"]
headers = {"Authorization": f"Bearer {token}"}

# Create session payload
payload = {
    "date": "2024-12-10",
    "description": "Aula Verificada via Script",
    "logs": [
        {
            "student_id": 1, # Assuming at least one student exists, ID 1 usually
            "status": "present",
            "topic": "Python Scripting",
            "grade": 10.0,
            "observation": "Good"
        }
    ]
}

# Post
print("Sending POST...")
res = requests.post(f"{BASE_URL}/classes/1/attendance", json=payload, headers=headers)
print(f"Status Code: {res.status_code}")
print(f"Response: {res.text}")

# Check content
if res.status_code == 200:
    print("Attendance saved successfully.")
else:
    print("Failed to save.")
