import React, { useState, useRef } from "react";
import axios from "axios";
import {
  FaMicrophone,
  FaStop,
  FaUpload,
  FaSpinner,
  FaSmile,
  FaFileAudio,
  FaBrain,
  FaBullhorn,
  FaRegCommentDots,
  FaFileAlt,
  FaTrashAlt,
} from "react-icons/fa";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const Header = () => (
  <header style={styles.header}>
    <img src="/main.png" alt="Pitch Feedback Logo" style={styles.logo} draggable={false} />
    <h1 style={styles.headerTitle}>Pitch Feedback</h1>
  </header>
);

const Button = ({ children, onClick, disabled, icon, style }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    style={{
      ...styles.button,
      opacity: disabled ? 0.6 : 1,
      cursor: disabled ? "not-allowed" : "pointer",
      ...style,
    }}
  >
    {icon && <span style={styles.icon}>{icon}</span>}
    {children}
  </button>
);

const Card = ({ children }) => <div style={styles.card}>{children}</div>;

const UploadedFile = ({ file, onRemove }) => {
  if (!file) return null;

  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + " B";
    else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    else return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  return (
    <div style={styles.uploadedFileContainer}>
      <FaFileAlt size={40} color="#93c5fd" style={{ marginRight: 15 }} />
      <div style={{ flexGrow: 1 }}>
        <p style={styles.fileName}>{file.name}</p>
        <p style={styles.fileDetails}>{formatSize(file.size)}</p>
        <audio controls src={URL.createObjectURL(file)} style={styles.audioPlayer} />
      </div>
      <button onClick={onRemove} style={styles.removeButton} title="Remove file">
        <FaTrashAlt size={18} />
      </button>
    </div>
  );
};

export default function App() {
  const [audioFile, setAudioFile] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(false);
  const [recording, setRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const handleUpload = async () => {
    if (!audioFile) return;
    setLoading(true);
    setFeedback(null);

    const formData = new FormData();
    formData.append("file", audioFile);

    try {
      const res = await axios.post("http://127.0.0.1:8000/analyze-audio", formData);
      setFeedback(res.data);
    } catch (error) {
      alert("Upload failed. Please check your backend.");
    }
    setLoading(false);
  };

  const startRecording = async () => {
    if (!navigator.mediaDevices) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const file = new File([blob], "recording.webm", { type: "audio/webm" });
        setAudioFile(file);
      };

      mediaRecorderRef.current.start();
      setRecording(true);
    } catch (error) {
      console.error(error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  };

  const removeFile = () => {
    setAudioFile(null);
    setFeedback(null);
  };

  return (
    <div style={styles.app}>
      <Header />

      <Card>
        <h2 style={styles.sectionTitle}>Upload or Record Audio</h2>

        <input
          type="file"
          accept="audio/*"
          onChange={(e) => {
            setAudioFile(e.target.files[0]);
            setFeedback(null);
          }}
          style={styles.fileInput}
        />

        <UploadedFile file={audioFile} onRemove={removeFile} />

        <div style={styles.recordButtons}>
          {!recording ? (
            <Button onClick={startRecording} icon={<FaMicrophone />} style={{ backgroundColor: "#6366f1" }}>
              Start Recording
            </Button>
          ) : (
            <Button onClick={stopRecording} icon={<FaStop />} style={{ backgroundColor: "#ef4444" }}>
              Stop Recording
            </Button>
          )}
        </div>

        <Button
          onClick={handleUpload}
          disabled={loading || !audioFile}
          icon={loading ? <FaSpinner className="spin" /> : <FaUpload />}
          style={{ backgroundColor: loading ? "#9ca3af" : "#10b981" }}
        >
          {loading ? "Analyzing..." : "Upload & Analyze"}
        </Button>
      </Card>

      {feedback && (
        <Card>
          <h2 style={styles.sectionTitle}>Analysis Results</h2>

          <p><FaFileAudio style={styles.inlineIcon} /> <strong>Transcript:</strong> {feedback.transcript}</p>
          <p><FaBrain style={styles.inlineIcon} /> <strong>Readability:</strong> {feedback.readability}</p>
          <p><FaRegCommentDots style={styles.inlineIcon} /> <strong>Disfluencies:</strong> {feedback.disfluencyCount}</p>
          <p><FaSmile style={styles.inlineIcon} /> <strong>Dominant Emotion:</strong> {feedback.dominantEmotion}</p>
          <p><FaBullhorn style={styles.inlineIcon} /> <strong>Persuasiveness:</strong> {feedback.persuasivenessScore} / 10</p>

          <h3 style={styles.chartTitle}>Emotion Breakdown</h3>
          <div style={{ width: "100%", height: 250 }}>
            <ResponsiveContainer>
              <BarChart data={feedback.emotionScores}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="emotion" stroke="#ccc" />
                <YAxis stroke="#ccc" />
                <Tooltip />
                <Bar dataKey="score" fill="#6366f1" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <h3 style={styles.chartTitle}>Suggested Change</h3>
          <p style={styles.suggestedChange}>{feedback.suggestedChange || "No suggestions available."}</p>
        </Card>
      )}
    </div>
  );
}

const styles = {
  app: {
    maxWidth: 800,
    margin: "40px auto",
    padding: "0 20px 40px",
    fontFamily: "'Segoe UI', sans-serif",
    backgroundColor: "#111827",
    color: "#e5e7eb",
    minHeight: "100vh",
  },
  header: {
    display: "flex",
    alignItems: "center",
    marginBottom: 40,
    gap: 15,
  },
  logo: {
    width: 56,
    height: 56,
  },
  headerTitle: {
    fontSize: 28,
    color: "#93c5fd",
    fontWeight: "bold",
  },
  card: {
    backgroundColor: "#1f2937",
    borderRadius: 16,
    padding: 28,
    boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 24,
    marginBottom: 20,
    fontWeight: "700",
    color: "#f9fafb",
  },
  fileInput: {
    width: "100%",
    padding: 14,
    fontSize: 16,
    borderRadius: 12,
    border: "1.5px solid #4b5563",
    backgroundColor: "#111827",
    color: "#e5e7eb",
    marginBottom: 15,
  },
  recordButtons: {
    display: "flex",
    justifyContent: "center",
    marginBottom: 15,
  },
  button: {
    display: "inline-flex",
    alignItems: "center",
    gap: 10,
    padding: "14px 28px",
    fontSize: 18,
    fontWeight: "600",
    borderRadius: 14,
    border: "none",
    color: "#fff",
  },
  icon: {
    fontSize: 22,
  },
  inlineIcon: {
    marginRight: 10,
    color: "#60a5fa",
  },
  chartTitle: {
    marginTop: 30,
    marginBottom: 10,
    color: "#93c5fd",
  },
  suggestedChange: {
    backgroundColor: "#1e40af",
    borderRadius: 14,
    padding: 20,
    fontStyle: "italic",
    whiteSpace: "pre-wrap",
    color: "#dbeafe",
    fontSize: 16,
  },
  uploadedFileContainer: {
    display: "flex",
    alignItems: "center",
    backgroundColor: "#374151",
    padding: "15px 20px",
    borderRadius: 14,
    marginBottom: 20,
  },
  fileName: {
    margin: 0,
    fontWeight: "700",
    fontSize: 18,
    color: "#dbeafe",
  },
  fileDetails: {
    margin: "4px 0 8px",
    color: "#9ca3af",
    fontWeight: "500",
  },
  audioPlayer: {
    width: "100%",
  },
  removeButton: {
    backgroundColor: "transparent",
    border: "none",
    color: "#f87171",
    cursor: "pointer",
    padding: 6,
    borderRadius: 8,
  },
};
