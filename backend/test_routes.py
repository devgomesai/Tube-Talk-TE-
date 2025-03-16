from fastapi.testclient import TestClient
from routes import app  # Assuming your FastAPI app is in 'main.py'

client = TestClient(app)  # Create a TestClient instance

def test_health_check():
    response = client.get("/health/")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}

def test_process_video_valid_url():
    video_url = "https://youtu.be/83gLgmynvLM?si=HI4mruC2nOqw_iLd"  # Example YouTube URL
    response = client.post("/process_video/", data={"video_url": video_url})
    assert response.status_code == 200  # Expecting success
    response_json = response.json()
    assert "message" in response_json
    assert "video_title" in response_json
    assert "video_id" in response_json

def test_process_video_invalid_url():
    video_url = "invalid-url"
    response = client.post("/process_video/", data={"video_url": video_url})
    assert response.status_code == 400  # Expecting Bad Request
    response_json = response.json()
    assert "detail" in response_json
    assert response_json["detail"] == "Invalid YouTube URL."

def test_chat_with_video_valid_request():
    # First, process a video to have data in video_data_store (for testing purposes)
    video_url = "https://youtu.be/83gLgmynvLM?si=HI4mruC2nOqw_iLd"
    process_response = client.post("/process_video/", data={"video_url": video_url})
    assert process_response.status_code == 200
    video_id = process_response.json()["video_id"]

    query = "What is this video about?"
    response = client.post("/chat_with_video/", data={"video_id": video_id, "query": query})
    assert response.status_code == 200
    response_json = response.json()
    assert "answer" in response_json

def test_chat_with_video_missing_video_id():
    query = "What is this video about?"
    response = client.post("/chat_with_video/", data={"query": query}) # Missing video_id
    assert response.status_code == 400
    response_json = response.json()
    assert "detail" in response_json
    assert response_json["detail"] == "Video ID is required."

# Add similar tests for /summarize_video/ and /generate_quiz/ routes,
# covering both success and error cases (e.g., missing video_id, video not processed yet)