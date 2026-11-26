
from fastapi import FastAPI

from app.api import auth, employees, chat


app = FastAPI(
    title="SecureHR-GPT",
    description="Secure, role-based Generative AI HR Assistant",
    version="1.0.0"
)

app.include_router(auth.router)
app.include_router(employees.router)
app.include_router(chat.router)


@app.get("/health", tags=["System"])
def health_check():
    return {"status": "ok"}
