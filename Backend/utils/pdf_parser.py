import fitz  # PyMuPDF — pip install pymupdf

def extract_pitch_deck_text(pdf_path: str) -> str:
    """Extract clean text from pitch deck PDF."""
    doc = fitz.open(pdf_path)
    pages = []
    
    for i, page in enumerate(doc):
        text = page.get_text().strip()
        if text:
            pages.append(f"[SLIDE {i+1}]\n{text}")
    
    full_text = "\n\n".join(pages)
    
    # Trim to ~8000 chars to avoid token overflow
    if len(full_text) > 8000:
        full_text = full_text[:8000] + "\n\n[... deck truncated for brevity]"
    
    return full_text