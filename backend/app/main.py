
from fastapi import FastAPI

from app.api import auth, employees


# Create the FastAPI application
app = FastAPI(
    title="SecureHR-GPT",
    description="Secure, role-based Generative AI HR Assistant",
    version="1.0.0"
)


# Register API routers
app.include_router(auth.router)
app.include_router(employees.router)


# Health check endpoint
@app.get("/health", tags=["System"])
def health_check():
    return {"status": "ok"}
