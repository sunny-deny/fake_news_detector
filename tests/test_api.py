"""
Integration tests for all FastAPI endpoints.
DB and model are mocked via auto use fixtures in conftest.py.
"""
import pytest
from tests.conftest import create_analysis_in_db

VALID_NEWS_TEXT = (
    "Global leaders gathered in Geneva to discuss new climate change policies "
    "aimed at reducing carbon emissions by fifty percent before the year two thousand thirty. "
    "The summit included representatives from over one hundred countries."
)

# ---------------------------------------------------------------------------
# Helper
# ---------------------------------------------------------------------------

def create_analysis(client) -> int:
    """Submit a valid analysis and return its ID."""
    response = client.post("/analyze", json={"text": VALID_NEWS_TEXT})
    assert response.status_code == 200, response.text
    return response.json()["id"]


# ---------------------------------------------------------------------------
# POST /analyze
# ---------------------------------------------------------------------------

class TestAnalyzeEndpoint:

    def test_returns_200_for_valid_text(self, client):
        response = client.post("/analyze", json={"text": VALID_NEWS_TEXT})
        assert response.status_code == 200

    def test_returns_all_required_fields(self, client):
        data = client.post("/analyze", json={"text": VALID_NEWS_TEXT}).json()
        assert all(k in data for k in [
            "id", "label", "label_text", "score", "confidence", "created_at"
        ])

    def test_returns_real_or_fake_label_text(self, client):
        data = client.post("/analyze", json={"text": VALID_NEWS_TEXT}).json()
        assert data["label_text"] in ["REAL", "FAKE"]

    def test_returns_valid_probability_score(self, client):
        data = client.post("/analyze", json={"text": VALID_NEWS_TEXT}).json()
        assert 0.0 <= data["score"] <= 1.0

    def test_returns_valid_confidence_level(self, client):
        data = client.post("/analyze", json={"text": VALID_NEWS_TEXT}).json()
        assert data["confidence"] in ["High", "Medium", "Low"]

    def test_returns_unique_id_per_analysis(self, client):
        id1 = create_analysis(client)
        id2 = create_analysis(client)
        assert id1 != id2

    def test_returns_422_for_too_short_text(self, client):
        assert client.post("/analyze", json={"text": "short"}).status_code == 422

    def test_returns_422_for_empty_text(self, client):
        assert client.post("/analyze", json={"text": ""}).status_code == 422

    def test_returns_422_for_gibberish_text(self, client):
        assert client.post("/analyze", json={"text": "a" * 50}).status_code == 422

    def test_returns_422_for_missing_text_field(self, client):
        assert client.post("/analyze", json={}).status_code == 422

    def test_returns_200_for_html_input_and_sanitizes(self, client):
        text = f"<b>{VALID_NEWS_TEXT}</b>"
        assert client.post("/analyze", json={"text": text}).status_code == 200


# ---------------------------------------------------------------------------
# POST /feedback
# ---------------------------------------------------------------------------

class TestFeedbackEndpoint:

    def test_returns_200_for_correct_feedback(self, client):
        response = client.post("/feedback", json={
            "analysis_id": create_analysis(client),
            "feedback_type": "correct"
        })
        assert response.status_code == 200

    def test_returns_200_for_incorrect_feedback(self, client):
        response = client.post("/feedback", json={
            "analysis_id": create_analysis(client),
            "feedback_type": "incorrect"
        })
        assert response.status_code == 200

    def test_returns_success_message_on_valid_feedback(self, client):
        response = client.post("/feedback", json={
            "analysis_id": create_analysis(client),
            "feedback_type": "correct"
        })
        assert response.json()["message"] == "Feedback submitted successfully"

    def test_returns_feedback_id_on_valid_feedback(self, client):
        response = client.post("/feedback", json={
            "analysis_id": create_analysis(client),
            "feedback_type": "correct"
        })
        assert "feedback_id" in response.json()

    def test_returns_409_for_duplicate_feedback(self, client):
        analysis_id = create_analysis(client)
        client.post("/feedback", json={"analysis_id": analysis_id, "feedback_type": "correct"})
        response = client.post("/feedback", json={"analysis_id": analysis_id, "feedback_type": "correct"})
        assert response.status_code == 409

    def test_returns_422_for_invalid_feedback_type(self, client):
        response = client.post("/feedback", json={
            "analysis_id": create_analysis(client),
            "feedback_type": "maybe"
        })
        assert response.status_code == 422

    def test_returns_404_for_nonexistent_analysis(self, client):
        response = client.post("/feedback", json={
            "analysis_id": 99999,
            "feedback_type": "correct"
        })
        assert response.status_code == 404

    def test_returns_422_for_missing_analysis_id(self, client):
        response = client.post("/feedback", json={"feedback_type": "correct"})
        assert response.status_code == 422


# ---------------------------------------------------------------------------
# GET /history
# ---------------------------------------------------------------------------

class TestHistoryEndpoint:

    def test_returns_200_for_empty_history(self, client):
        response = client.get("/history")
        assert response.status_code == 200

    def test_returns_zero_total_for_empty_history(self, client):
        data = client.get("/history").json()
        assert data["total"] == 0
        assert data["items"] == []

    def test_returns_all_created_items(self, client):
        for _ in range(3):
            create_analysis(client)
        data = client.get("/history").json()
        assert data["total"] == 3
        assert len(data["items"]) == 3

    def test_returns_correct_item_count_for_first_page(self, client, db_session):
        create_analysis_in_db(db_session, 15)
        data = client.get("/history?page=1&limit=10").json()
        assert len(data["items"]) == 10

    def test_returns_correct_metadata_for_first_page(self, client, db_session):
        create_analysis_in_db(db_session, 15)
        data = client.get("/history?page=1&limit=10").json()
        assert data["total"] == 15
        assert data["total_pages"] == 2
        assert data["page"] == 1

    def test_returns_remaining_items_on_second_page(self, client, db_session):
        create_analysis_in_db(db_session, 15)
        data = client.get("/history?page=2&limit=10").json()
        assert len(data["items"]) == 5
        assert data["page"] == 2

    def test_rounds_up_total_pages(self, client, db_session):
        create_analysis_in_db(db_session, 11)
        data = client.get("/history?limit=10").json()
        assert data["total_pages"] == 2

    def test_returns_422_for_page_zero(self, client):
        assert client.get("/history?page=0").status_code == 422

    def test_returns_all_required_fields_per_item(self, client):
        create_analysis(client)
        item = client.get("/history").json()["items"][0]
        assert all(k in item for k in [
            "id", "text", "label_text", "score", "confidence", "created_at"
        ])

    def test_returns_all_pagination_fields(self, client):
        data = client.get("/history").json()
        assert all(k in data for k in ["total", "page", "limit", "total_pages", "items"])


# ---------------------------------------------------------------------------
# GET /health
# ---------------------------------------------------------------------------

class TestHealthEndpoint:

    def test_returns_200(self, client):
        assert client.get("/health").status_code == 200

    def test_returns_all_required_fields(self, client):
        data = client.get("/health").json()
        assert all(k in data for k in [
            "status", "model_loaded", "database_connected",
            "total_predictions", "model_dir", "max_length"
        ])

    def test_returns_true_for_database_connected(self, client):
        assert client.get("/health").json()["database_connected"] is True

    def test_increments_total_predictions_after_analysis(self, client):
        create_analysis(client)
        assert client.get("/health").json()["total_predictions"] == 1


# ---------------------------------------------------------------------------
# GET /stats
# ---------------------------------------------------------------------------

class TestStatsEndpoint:

    def test_returns_200(self, client):
        assert client.get("/stats").status_code == 200

    def test_returns_all_required_fields(self, client):
        data = client.get("/stats").json()
        assert all(k in data for k in [
            "total_analyses", "fake_news_detected", "real_news_detected",
            "fake_percentage", "real_percentage", "avg_confidence", "feedback_count"
        ])

    def test_returns_zeros_when_no_data(self, client):
        data = client.get("/stats").json()
        assert data["total_analyses"] == 0
        assert data["feedback_count"] == 0

    def test_increments_total_after_analysis(self, client):
        create_analysis(client)
        assert client.get("/stats").json()["total_analyses"] == 1

    def test_returns_none_for_feedback_accuracy_when_no_feedback(self, client):
        assert client.get("/stats").json()["feedback_accuracy"] is None

    def test_returns_100_feedback_accuracy_after_correct_feedback(self, client):
        analysis_id = create_analysis(client)
        client.post("/feedback", json={"analysis_id": analysis_id, "feedback_type": "correct"})
        data = client.get("/stats").json()
        assert data["feedback_accuracy"] == 100.0


# ---------------------------------------------------------------------------
# DELETE /history/{id}
# ---------------------------------------------------------------------------

class TestDeleteEndpoint:

    def test_returns_200_for_existing_item(self, client):
        analysis_id = create_analysis(client)
        assert client.delete(f"/history/{analysis_id}").status_code == 200

    def test_returns_404_for_nonexistent_item(self, client):
        assert client.delete("/history/99999").status_code == 404

    def test_removes_item_from_history_after_delete(self, client):
        analysis_id = create_analysis(client)
        client.delete(f"/history/{analysis_id}")
        assert client.get("/history").json()["total"] == 0

    def test_removes_only_target_item_from_history(self, client):
        id1 = create_analysis(client)
        create_analysis(client)
        client.delete(f"/history/{id1}")
        assert client.get("/history").json()["total"] == 1