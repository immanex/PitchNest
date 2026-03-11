import requests
import json
from core.config import settings

OPEN_ROUTER_KEY = settings.OPEN_ROUTER_KEY
# First API call with reasoning
def model1(text):
    response = requests.post(
        url="https://openrouter.ai/api/v1/chat/completions",
        headers={
            "Authorization": "Bearer {OPEN_ROUTER_KEY}",
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
