from openai import OpenAI
from app.core.config import settings

client = OpenAI(api_key=settings.OPENAI_API_KEY)

def generate_reply(messages: list[dict]) -> str:
    resp = client.responses.create(
        model=settings.OPENAI_MODEL,
        input=messages,
    )
    return resp.output_text
