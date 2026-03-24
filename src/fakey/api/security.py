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

def is_meaningful_text(text: str, min_words: int = 5, min_avg_word_len: float = 3.0) -> bool:
    words = re.findall(r'[a-zA-Z]{3,}', text)
    if len(words) < min_words:
        return False
    avg_len = sum(len(w) for w in words) / len(words)
    if avg_len > 20:
        return False
    unique_ratio = len(set(text.lower())) / len(text)
    if unique_ratio < 0.05:
        return False
    if any(len(set(w)) == 1 for w in words):
        return False
    return True