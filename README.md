
# 🎤 Pitch Speech ML

An intelligent web app that helps users improve their spoken pitches by analyzing uploaded or recorded audio. It provides real-time feedback on **transcripts**, **readability**, **disfluencies**, **emotions**, and **persuasiveness** — perfect for public speaking practice, pitch refinement, and communication training.

## ✨ Features

- 🎙 Upload or record audio directly in the browser  
- 🔊 Converts speech to text using AssemblyAI  
- 📊 Emotion detection using HuggingFace transformer models  
- 📉 Calculates readability (Flesch Reading Ease)  
- ⚠️ Counts disfluencies (e.g., "um", "uh", "like")  
- 💡 Suggests a refined version of the pitch  
- 📈 Bar chart for emotion score breakdown  
- 🌑 Beautiful dark-themed UI with modern design  

---

## 🖥 Tech Stack

### Frontend

- **React.js**
- **Recharts** (for emotion score chart)
- **React Icons** (for UI icons)
- Custom inline styling

### Backend

- **FastAPI**
- **AssemblyAI API** (for transcription)
- **Transformers** (`j-hartmann/emotion-english-distilroberta-base`)
- **Textstat** (for readability)
- **Pydub** (audio processing)

---

## 🚀 Getting Started

### 📁 Clone the Repository

```bash
git clone https://github.com/jaipriyaa/pitchSpeech-ML.git
cd pitchSpeech-ML
```

---

### 🔧 Backend Setup (FastAPI)

1. Create a Python virtual environment:
   ```bash
   python -m venv env
   source env/bin/activate  # On Windows use `env\Scripts\activate`
   ```

2. Install dependencies:
   ```bash
   pip install fastapi uvicorn assemblyai transformers textstat pydub python-multipart
   ```

3. Set your AssemblyAI API key in `main.py`:
   ```python
   aai.settings.api_key = "your_assemblyai_api_key"
   ```

4. Run the backend:
   ```bash
   uvicorn Main:app --reload
   ```

The backend will be available at `http://127.0.0.1:8000`.

---

### 🌐 Frontend Setup (React)

1. Navigate to the frontend folder (or root if everything's in one place):
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm start
   ```

The frontend will be available at `http://localhost:3000`.

---

## 📸 Screenshots

| Upload/Record Section | Feedback Results |
|-----------------------|------------------|
| ![upload](./screens/upload.png) | ![results](./screens/results.png) |

---

## ⚠️ Notes

- Make sure microphone permissions are enabled for recording.
- This app uses `http://localhost:8000` as the API base; modify it if deploying.

---

## 📂 Project Structure

```
├── backend.py       # FastAPI backend
├── frontend/src/
│   └── App.jsx           # Main React frontend
│   └── index.js          # Entry point
├── public/
│   └── logo.png          # App logo
└── README.md
```

---

## 🧠 Future Enhancements

- ✅ Voice clarity scoring
- 📱 PWA or mobile app version
- 🌍 Multi-language support
- 📤 Export feedback as PDF
- 🧑‍🎓 AI pitch improvement suggestions

---

## 📜 License

This project is licensed under the **MIT License**.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to submit a pull request.

---

## 📬 Contact

For support or inquiries:

**Name:** Jaipriyaa 
**LinkedIn:** [linkedin.com/in/your-profile](https://linkedin.com/in/jaipriyaa-s)
