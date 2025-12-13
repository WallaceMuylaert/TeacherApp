import sys
import os
import uvicorn

# Add project root to sys.path so 'backend' is recognized as a package
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

if __name__ == "__main__":
    uvicorn.run(
        "backend.server:app",
        host="10.120.100.45",
        port=8001,
        reload=True
    )
