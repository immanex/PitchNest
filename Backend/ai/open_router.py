import requests
import json


# First API call with reasoning
def model1(text):
    response = requests.post(
        url="https://openrouter.ai/api/v1/chat/completions",
        headers={
            "Authorization": "Bearer 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",
            "Content-Type": "application/json",
        },
        data=json.dumps(
            {
                "model": "nvidia/nemotron-3-nano-30b-a3b:free",
                "messages": [
                    {
                        "role": "user",
                        "content": text,
                    }
                ],
                "reasoning": {"enabled": True},
            }
        ),
    )
    response = response.json()
    response = response["choices"][0]["message"]
    return response
