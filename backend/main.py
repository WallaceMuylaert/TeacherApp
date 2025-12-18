import sys
import os
import uvicorn

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

if __name__ == "__main__":
    uvicorn.run(
        "backend.server:app",
        host=os.getenv("HOST_IP", "localhost"),
        port=int(os.getenv("PORT_BACKEND", 8001)),
        reload=True
    )
