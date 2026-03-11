import fitz  # PyMuPDF
import requests
from io import BytesIO


def extract_pitch_deck_text(pdf_path: str) -> str:
    """Extract clean text from pitch deck PDF (local or URL)."""

    # Handle cloud URL
    if pdf_path.startswith("http"):
        response = requests.get('https://storage.googleapis.com/pitchnest-media/PitchNest%20Live%20Hackathon%20Project%20Brief%20copy.pdf')
        pdf_bytes = BytesIO(response.content)
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    else:
        doc = fitz.open(pdf_path)

    pages = []

    for i, page in enumerate(doc):
        text = page.get_text().strip()

        if text:
            pages.append(f"[SLIDE {i+1}]\n{text}")

    full_text = "\n\n".join(pages)

    # limit tokens for LLM
    if len(full_text) > 8000:
        full_text = full_text[:8000] + "\n\n[... deck truncated]"

    return full_text