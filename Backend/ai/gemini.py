from groq import Groq

client = Groq()


def generate_gemini_response(text):
    stream = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[{"role": "user", "content": text}],
        temperature=1,
        max_tokens=1024,
        stream=True,
    )
    result = ""
    for chunk in stream:
        result += chunk.choices[0].delta.content or ""
    print("Generated Gemini response:", result)
    return result
