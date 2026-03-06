from groq import Groq
from core.config import settings  # import your settings

client = Groq(api_key=settings.GROQ_API_KEY)

def generate_gemini_response(text: str):

    stream = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[
            {
                "role": "system",
                "content": "You are an experienced venture capitalist judging startup pitches."
            },
            {
                "role": "user",
                "content": text
            }
        ],
        temperature=0.7,
        max_tokens=1024,
        stream=True,
    )

    result = ""

    for chunk in stream:
        result += chunk.choices[0].delta.content or ""

    return result