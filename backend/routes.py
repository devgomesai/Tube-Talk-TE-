from flask import Flask, request, jsonify
from flask_cors import CORS
from models import *

app = Flask(__name__)

CORS(app)

# creating instance
youtube = YouTube()

@app.route("/your-backend-endpoint", methods=["POST"])
def handle_url():
    data = request.get_json()  # Get the JSON data sent from the front-end
    youtube_url = data.get("url")

    transcript_of_video, video_title = youtube.get_transcription(youtube_url=youtube_url)
    # print('*' * 40)
    print(transcript_of_video)
    # print('*' * 40)
    print(video_title)


    
    # Now, you can use youtube_url in your backend logic
    print(f"Received YouTube URL: {youtube_url}")
    
    # Respond back to the front-end
    return jsonify({"status": "success", "title": video_title, "transcript":transcript_of_video})

if __name__ == "__main__":  
    app.run(debug=True)
