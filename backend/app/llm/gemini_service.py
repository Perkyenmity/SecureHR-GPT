
from google import genai
from app.config import settings

client = genai.Client(api_key=settings.GEMINI_API_KEY)

def generate_response(prompt: str) -> str:
    if not prompt or not prompt.strip():
        raise ValueError("Prompt cannot be empty.")

    response = client.models.generate_content(
        model=settings.GEMINI_MODEL,
        contents=prompt
    )

    if not response.text:
        raise RuntimeError("Gemini returned an empty response.")

    return response.text
