
from fastapi import FastAPI

from app.api import auth


# Create the FastAPI application
app = FastAPI(
    title="SecureHR-GPT",
    description="Secure, role-based Generative AI HR Assistant",
    version="1.0.0"
)


# Register authentication endpoints
app.include_router(auth.router)


# Health check endpoint
@app.get("/health", tags=["System"])
def health_check():
    return {"status": "ok"}
