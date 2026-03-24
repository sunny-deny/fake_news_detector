"""
Unit tests for security.py — sanitize_text and is_meaningful_text.
"""
import pytest
from src.fakey.api.security import sanitize_text, is_meaningful_text


# ---------------------------------------------------------------------------
# sanitize_text
# ---------------------------------------------------------------------------

class TestSanitizeText:

    def test_strips_leading_and_trailing_whitespace(self):
        assert sanitize_text("  hello world  ", max_chars=100) == "hello world"

    def test_removes_html_tags(self):
        assert sanitize_text("<b>Breaking news</b>", max_chars=100) == "Breaking news"

    def test_removes_nested_html_tags(self):
        result = sanitize_text("<div><p>News content</p></div>", max_chars=100)
        assert "<" not in result
        assert "News content" in result

    def test_removes_control_characters(self):
        result = sanitize_text("hello\x00world", max_chars=100)
        assert "\x00" not in result
        assert "hello" in result
        assert "world" in result

    def test_collapses_multiple_spaces(self):
        assert sanitize_text("hello   \t  world", max_chars=100) == "hello world"

    def test_truncates_to_max_chars(self):
        result = sanitize_text("a" * 200, max_chars=100)
        assert len(result) == 100

    def test_returns_empty_string_for_none_input(self):
        assert sanitize_text(None, max_chars=100) == ""

    def test_returns_empty_string_for_empty_input(self):
        assert sanitize_text("", max_chars=100) == ""

    def test_returns_empty_string_for_whitespace_only(self):
        assert sanitize_text("   ", max_chars=100) == ""

    def test_preserves_normal_text_unchanged(self):
        text = "The president signed the bill into law today."
        assert sanitize_text(text, max_chars=100) == text

    def test_returns_exact_text_at_max_chars_boundary(self):
        text = "a" * 50
        assert sanitize_text(text, max_chars=50) == text

    def test_truncates_text_one_over_max_chars_boundary(self):
        text = "a" * 51
        result = sanitize_text(text, max_chars=50)
        assert len(result) == 50


# ---------------------------------------------------------------------------
# is_meaningful_text
# ---------------------------------------------------------------------------

class TestIsMeaningfulText:

    def test_returns_true_for_valid_news_sentence(self):
        text = "The president signed a new climate bill into law on Friday."
        assert is_meaningful_text(text) is True

    def test_returns_true_for_full_article_snippet(self):
        text = (
            "Scientists have discovered a new species of deep-sea fish "
            "in the Pacific Ocean that can survive extreme pressure conditions."
        )
        assert is_meaningful_text(text) is True

    def test_returns_false_for_single_repeated_char(self):
        assert is_meaningful_text("a" * 100) is False

    def test_returns_false_for_two_word_input(self):
        assert is_meaningful_text("hello world") is False

    def test_returns_true_for_exactly_five_valid_words(self):
        assert is_meaningful_text("the cat sat over there") is True

    def test_returns_false_for_four_word_input(self):
        assert is_meaningful_text("the cat sat here") is False

    def test_returns_false_for_numbers_only(self):
        assert is_meaningful_text("1234 5678 9012 3456 7890") is False

    def test_returns_false_for_low_unique_char_ratio(self):
        assert is_meaningful_text("ababababababababababababababab") is False

    def test_returns_false_for_suspiciously_long_average_word_length(self):
        text = (
            "averylongwordthatexceedsthelimit "
            "anotherlongwordthatexceedslimit "
            "thirdlongwordexceedslimit "
            "fourthlongwordexceedslimit "
            "fifthlongwordexceedslimit"
        )
        assert is_meaningful_text(text) is False

    def test_returns_false_for_repeated_char_words(self):
        assert is_meaningful_text("aaaaaaaaaa bbbbbbbbbb cccccccccc dddddddddd eeeeeeeeee") is False

    def test_returns_false_for_empty_string(self):
        assert is_meaningful_text("") is False

    def test_returns_false_for_punctuation_only(self):
        assert is_meaningful_text("!!! ??? ... --- ,,, ;;; ::: |||") is False