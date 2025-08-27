import React, { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";
import "./FacialExpression.css";
import axios from "axios";

export default function FacialExpression() {
  const videoRef = useRef(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [expression, setExpression] = useState("Not detected");
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPlaying, setCurrentPlaying] = useState(null);

  // Load models & start camera
  useEffect(() => {
    let mounted = true;

    const loadModelsAndStartVideo = async () => {
      try {
        const MODEL_URL = "/models";
        await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
        await faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL);
        if (mounted) setModelsLoaded(true);
      } catch (err) {
        console.error("Error loading face-api models:", err);
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch (err) {
        console.error("Error accessing webcam:", err);
      }
    };

    loadModelsAndStartVideo();

    return () => {
      mounted = false;
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  // Detect mood
  const detectMood = async () => {
    setError(null);

    if (!videoRef.current) {
      setError("Video element not initialized");
      return;
    }

    try {
      const detections = await faceapi
        .detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions())
        .withFaceExpressions();

      if (!detections || detections.length === 0) {
        setExpression("No face detected");
        setSongs([]);
        return;
      }

      const expressions = detections[0].expressions || {};
      let maxProb = 0;
      let bestExpression = "neutral";

      for (const [key, value] of Object.entries(expressions)) {
        if (value > maxProb) {
          maxProb = value;
          bestExpression = key;
        }
      }

      const mood = bestExpression.charAt(0).toUpperCase() + bestExpression.slice(1);
      setExpression(mood);

      setLoading(true);
      setSongs([]);

      const url = `http://localhost:3000/songs?mood=${encodeURIComponent(
        bestExpression
      )}&_=${Date.now()}`;

      const response = await axios.get(url, { timeout: 10000 });

      let returnedSongs = [];
      if (Array.isArray(response.data)) {
        returnedSongs = response.data;
      } else if (Array.isArray(response.data.songs)) {
        returnedSongs = response.data.songs;
      } else if (Array.isArray(response.data.data)) {
        returnedSongs = response.data.data;
      } else {
        for (const v of Object.values(response.data || {})) {
          if (Array.isArray(v)) {
            returnedSongs = v;
            break;
          }
        }
      }

      setSongs(returnedSongs);
    } catch (err) {
      console.error("Error in detectMood / API call:", err);
      setError(err.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  // Play/Pause logic
  const togglePlay = (idx) => {
    const audio = document.getElementById(`audio-${idx}`);

    if (currentPlaying !== null && currentPlaying !== idx) {
      const prevAudio = document.getElementById(`audio-${currentPlaying}`);
      if (prevAudio) prevAudio.pause();
    }

    if (audio.paused) {
      audio.play();
      setCurrentPlaying(idx);
    } else {
      audio.pause();
      setCurrentPlaying(null);
    }
  };

  return (
    <div className="app-container">
      <h1 className="title">🎧 Live Mood Detection</h1>

      <div className="top-section">
        <video ref={videoRef} autoPlay muted className="video-box" />
        <div className="info-box">
          <p>
            Click <b>Detect Mood</b> to analyze your face and fetch songs.
          </p>

          <button className="detect-btn" onClick={detectMood} disabled={loading}>
            {loading ? "Detecting..." : "Detect Mood"}
          </button>

          <p className="mood-text">
            Detected Mood: <b>{expression}</b>
          </p>
          {error && <p style={{ color: "crimson" }}>Error: {error}</p>}
        </div>
      </div>

      <div className="tracks-section">
        <h3>
          🎶 Recommended Tracks{" "}
          {expression &&
          expression !== "Not detected" &&
          expression !== "No face detected"
            ? `for ${expression}`
            : ""}
        </h3>

        {loading && <p>Loading songs…</p>}

        <div className="track-grid">
          {songs.length > 0 ? (
            songs.map((track, idx) => {
              const key = track.id || track.audio || `${track.title}-${idx}`;
              return (
                <div key={key} className="track-card">
                  <div className="track-details">
                    <span className="track-title">{track.title}</span>
                    <span className="track-artist">{track.artist}</span>
                  </div>
                  <div className="audio-player">
                    <audio id={`audio-${idx}`} src={track.audio}></audio>
                    <button
                      className={`play-pause-btn ${
                        currentPlaying === idx ? "pause" : "play"
                      }`}
                      onClick={() => togglePlay(idx)}
                    >
                      {currentPlaying === idx ? "⏸️" : "▶️"}
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            !loading && <p>No songs available. Click "Detect Mood".</p>
          )}
        </div>
      </div>
    </div>
  );
}
