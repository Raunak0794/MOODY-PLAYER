import React, { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";
import axios from "axios";
import "./FacialExpression.css";
import { Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function FacialExpression() {
  const videoRef = useRef(null);
  const navigate = useNavigate();

  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [expression, setExpression] = useState("Not detected");
  const [recommendedSongs, setRecommendedSongs] = useState([]);
  const [loading, setLoading] = useState(false);

  // Upload Song States
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [mood, setMood] = useState("");
  const [audio, setAudio] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");

  // Play/Pause States
  const [currentAudio, setCurrentAudio] = useState(null);
  const [isPlaying, setIsPlaying] = useState(null);

  // ✅ API URL: auto-switch between local and deployed
  const API_URL =
    window.location.hostname === "localhost"
      ? "http://localhost:3000"
      : (import.meta.env.VITE_API_URL || "https://moody-player-k3hh.onrender.com");

  // ✅ Check authentication
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login"); // Redirect to login if not authenticated
    }
  }, [navigate]);

  // ✅ Load Face API Models
  useEffect(() => {
    const loadModels = async () => {
      const MODEL_URL = "/models";
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
      ]);
      setModelsLoaded(true);
    };
    loadModels();
  }, []);

  // ✅ Start webcam stream
  useEffect(() => {
    if (!modelsLoaded) return;
    navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
      if (videoRef.current) videoRef.current.srcObject = stream;
    });
  }, [modelsLoaded]);

  // ✅ Detect Expressions
  const detectExpression = async () => {
    if (!videoRef.current) return;
    const detections = await faceapi
      .detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions())
      .withFaceExpressions();

    if (detections.length > 0) {
      const exp = detections[0].expressions;
      const maxExp = Object.keys(exp).reduce((a, b) => (exp[a] > exp[b] ? a : b));
      setExpression(maxExp);
      fetchSongs(maxExp);
    } else {
      setExpression("No face detected");
    }
  };

  // ✅ Fetch Recommended Songs (with JWT)
  const fetchSongs = async (moodName) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_URL}/songs?mood=${moodName}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRecommendedSongs(res.data.songs || []);
    } catch (err) {
      console.error("Error fetching songs:", err);
      setRecommendedSongs([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Handle Song Upload (with JWT)
  const handleUpload = async (e) => {
    e.preventDefault();
    if (!title || !artist || !mood || !audio) {
      setUploadMessage("⚠️ Please fill all fields!");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("artist", artist);
    formData.append("mood", mood);
    formData.append("audio", audio);

    try {
      setUploading(true);
      const token = localStorage.getItem("token");
      const res = await axios.post(`${API_URL}/songs`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });
      setUploadMessage(`✅ ${res.data.message}`);
      setTitle("");
      setArtist("");
      setMood("");
      setAudio(null);

      // Refresh recommended songs if same mood uploaded
      if (expression.toLowerCase() === mood.toLowerCase()) {
        fetchSongs(mood);
      }
    } catch (err) {
      setUploadMessage(`❌ Upload failed: ${err.response?.data?.error || err.message}`);
    } finally {
      setUploading(false);
    }
  };

  // ✅ Play/Pause Handler
  const handlePlayPause = (index, audioUrl) => {
    if (currentAudio && isPlaying === index) {
      currentAudio.pause();
      setIsPlaying(null);
      return;
    }
    if (currentAudio) currentAudio.pause();

    const newAudio = new Audio(audioUrl);
    newAudio.play().catch((e) => console.error("Playback error:", e));
    setCurrentAudio(newAudio);
    setIsPlaying(index);
    newAudio.onended = () => setIsPlaying(null);
  };

  // ✅ Handle Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="app-container">
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "10px" }}>
        <Button variant="contained" color="secondary" onClick={handleLogout}>
          Logout
        </Button>
      </div>

      <h1 className="title">🎭 Facial Expression Music Recommender</h1>

      {/* Top Section */}
      <div className="top-section">
        <video
          ref={videoRef}
          autoPlay
          muted
          className="video-box"
          onPlay={detectExpression}
        />
        <div className="info-box">
          <button className="detect-btn" onClick={detectExpression}>
            Detect Mood 🎯
          </button>
          <p className="mood-text">
            Detected Mood: <strong>{expression}</strong>
          </p>
        </div>
      </div>

      {/* Recommended Songs */}
      <div className="tracks-section">
        <h3>🎵 Recommended Songs</h3>
        {loading ? (
          <p>Loading songs...</p>
        ) : recommendedSongs.length === 0 ? (
          <p>No songs found for this mood 😢</p>
        ) : (
          <div className="track-grid">
            {recommendedSongs.map((song, index) => (
              <div key={song._id || index} className="track-card">
                <div className="track-details">
                  <span className="track-title">{song.title}</span>
                  <span className="track-artist">{song.artist}</span>
                </div>
                <div className="audio-player">
                  <button
                    className="play-pause-btn"
                    onClick={() => handlePlayPause(index, song.audio)}
                    title={isPlaying === index ? "Pause" : "Play"}
                  >
                    {isPlaying === index ? "⏸" : "▶️"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upload New Song */}
      <div className="tracks-section" style={{ marginTop: "30px" }}>
        <h3>📤 Upload Your Song</h3>
        <form
          onSubmit={handleUpload}
          style={{ display: "flex", flexDirection: "column", gap: "10px" }}
        >
          <input
            type="text"
            placeholder="Song Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Artist Name"
            value={artist}
            onChange={(e) => setArtist(e.target.value)}
            required
          />
          <select value={mood} onChange={(e) => setMood(e.target.value)} required>
            <option value="">Select Mood</option>
            <option value="happy">Happy</option>
            <option value="sad">Sad</option>
            <option value="angry">Angry</option>
            <option value="surprised">Surprised</option>
            <option value="neutral">Neutral</option>
          </select>
          <input
            type="file"
            accept="audio/*"
            onChange={(e) => setAudio(e.target.files[0])}
            required
          />
          <button type="submit" className="detect-btn" disabled={uploading}>
            {uploading ? "Uploading..." : "Upload Song"}
          </button>
        </form>
        {uploadMessage && <p style={{ marginTop: "10px" }}>{uploadMessage}</p>}
      </div>
    </div>
  );
}
