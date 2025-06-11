from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
import assemblyai as aai
import tempfile
import os
import textstat
import re
from transformers import pipeline
from pydub import AudioSegment

# Set up AssemblyAI API key
aai.settings.api_key = "de3767299c094bc690cf6110e6ee46cf"
transcriber = aai.Transcriber()

# Default transcription config with disfluencies enabled
config = aai.TranscriptionConfig(speech_model=aai.SpeechModel.slam_1, disfluencies=True)

app = FastAPI()

# CORS settings - allow all origins (adjust for production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load emotion classifier model
emotion_classifier = pipeline(
    "text-classification", 
    model="j-hartmann/emotion-english-distilroberta-base", 
    top_k=None
)

@app.post("/analyze-audio")
async def analyze_audio(file: UploadFile = File(...)):
    try:
        print("Received file:", file.filename)
        with tempfile.NamedTemporaryFile(delete=False, suffix=".mp3") as temp_file:
            temp_path = temp_file.name
            temp_file.write(await file.read())

        config = aai.TranscriptionConfig(speech_model=aai.SpeechModel.slam_1, disfluencies=True)
        result = transcriber.transcribe(temp_path, config=config)
        text = result.text
        print("Transcript:", text)

        readability = textstat.flesch_reading_ease(text)
        junk_words = ["um", "uh", "you know", "like", "i mean", "ah", "hmm", "erm"]
        disfluency_count = sum(len(re.findall(rf"\b{w}\b", text.lower())) for w in junk_words)

        emotion_scores = emotion_classifier(text)[0]
        top_emotion = max(emotion_scores, key=lambda x: x["score"])
        emotion_breakdown = [{"emotion": e["label"], "score": round(e["score"], 2)} for e in emotion_scores]

        persuasive_keywords = [
            "guarantee", "proven", "effective", "must", "should", "need to",
            "save", "discover", "limited time", "now"
        ]
        persuasiveness_score = sum(len(re.findall(rf"\b{word}\b", text.lower())) for word in persuasive_keywords)

        config2 = aai.TranscriptionConfig(speech_model=aai.SpeechModel.slam_1)
        suggestedChange = transcriber.transcribe(temp_path, config=config2).text

        os.remove(temp_path)

        return {
            "transcript": text,
            "readability": round(readability, 2),
            "disfluencyCount": disfluency_count,
            "dominantEmotion": top_emotion["label"],
            "emotionScores": emotion_breakdown,
            "persuasivenessScore": min(persuasiveness_score, 10),
            "suggestedChange": suggestedChange
        }
    except Exception as e:
        return {"error": str(e)}