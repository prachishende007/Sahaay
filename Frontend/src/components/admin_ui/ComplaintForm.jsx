import React, { useEffect, useRef, useState } from "react";
import axios from "axios";

const API = "http://localhost:8000";

export default function ComplaintForm({ refreshComplaints }) {
  const [location, setLocation] = useState(null);
  const [category, setCategory] = useState("Sanitation");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(false);

  /* CAMERA 
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const [recording, setRecording] = useState(false);
  const [stream, setStream] = useState(null);

  /* LOCATION */
  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      (pos) =>
        setLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        }),
      () => alert("Location access required")
    );
  }, []);

  /* CAMERA INIT 
  useEffect(() => {
    async function startCamera() {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        setStream(mediaStream);
        if (videoRef.current) videoRef.current.srcObject = mediaStream;
      } catch (err) {
        console.error("Camera error:", err);
      }
    }
    startCamera();
    return () => stream?.getTracks().forEach((t) => t.stop());
  }, []);

  /* RECORDING 
  const startRecording = () => {
    chunksRef.current = [];
    const recorder = new MediaRecorder(stream);
    recorder.ondataavailable = (e) => chunksRef.current.push(e.data);
    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: "video/webm" });
      setVideo(new File([blob], "complaint-video.webm"));
    };
    recorder.start();
    mediaRecorderRef.current = recorder;
    setRecording(true);
  };

  const stopRecording = () => {
    mediaRecorderRef.current.stop();
    setRecording(false);
  };

  /* SUBMIT */
  const handleSubmit = async () => {
    if (!description.trim()) {
      alert("Please describe the issue.");
      return;
    }

    const formData = new FormData();
    formData.append("category", category);
    formData.append("description", description);
    formData.append("lat", location?.lat);
    formData.append("lng", location?.lng);
    if (image) formData.append("image", image);
    if (video) formData.append("video", video);

    try {
      setLoading(true);
      const res = await axios.post(`${API}/complaints`, formData);
      refreshComplaints?.(res.data?.complaint);
      alert("✅ Complaint submitted!");
      setDescription("");
      setImage(null);
      setVideo(null);
    } catch {
      alert("❌ Submission failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="complaint-layout">
      {/* STEP 1 */}
      <div className="complaint-card">
        <h3>📝 Submit Complaint</h3>
        <p className="section-hint">
          Step 1: Describe the issue clearly
        </p>

        <label>
          Category
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option>Sanitation</option>
            <option>Water</option>
            <option>Roads</option>
            <option>Electricity</option>
            <option>Other</option>
          </select>
        </label>

        <label>
          Description
          <textarea
            placeholder="What is the problem? When did it start?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </label>
        

        <label>
          Upload Image (optional)
          <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0])} />
        </label>

        {location && (
          <span className="location-info">
            📍 {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
          </span>
        )}

        <button onClick={handleSubmit} disabled={loading}>
          {loading ? "Submitting..." : "🚀 Submit Complaint"}
        </button>

        {video && <p className="success-badge">🎥 Video attached</p>}
      </div>

      {/* STEP 2 */}
      <div className="camera-card">
        <h4>📷 Live Camera</h4>
        <p className="section-hint">
          Step 2 (Optional): Record video evidence
        </p>

        <video ref={videoRef} autoPlay muted playsInline className="camera-preview" />

        <div className="camera-controls">
          {!recording ? (
            <button className="record" onClick={startRecording}>
              🔴 Start
            </button>
          ) : (
            <button className="stop" onClick={stopRecording}>
              ⏹ Stop
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
