import re

_re_html = re.compile(r"<[^>]+>")
_re_ctrl = re.compile(r"[\x00-\x08\x0B\x0C\x0E-\x1F]")

def sanitize_text(text: str, max_chars: int) -> str:
    text = (text or "").strip()
    text = _re_ctrl.sub(" ", text)
    text = _re_html.sub(" ", text)
    text = re.sub(r"\s+", " ", text).strip()
    if len(text) > max_chars:
        text = text[:max_chars]
    return text
