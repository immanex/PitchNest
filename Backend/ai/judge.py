def evaluate_pitch(transcript: str):
    word_count = len(transcript.split())
    
    

    score = min(word_count / 20, 10)

    return {
        "overall_score": round(score, 2),
        "clarity": 8,
        "market_fit": 7,
        "innovation": 9,
        "feedback": "Strong idea but improve clarity and business explanation.",
        "suggestions": [
            "Clarify target users",
            "Explain revenue model",
            "Add stronger closing statement"
        ]
    }