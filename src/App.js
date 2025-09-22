import React, { useRef, useState, useEffect } from "react";

const AppStyles = () => (
  <style>{`
    body {
      background-color: #f0f2f5;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen",
        "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue",
        sans-serif;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      margin: 0;
    }

    .app-container {
      text-align: center;
    }

    .card {
      background-color: white;
      padding: 2rem;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      width: 90vw;
      max-width: 400px;
      transition: transform 0.3s ease;
    }

    .card:hover {
      transform: translateY(-5px);
    }

    h1 {
      color: #1c1e21;
      margin-top: 0;
    }

    h4 {
      color: #606770;
      margin-bottom: 1.5rem;
      font-weight: 500;
    }

    .media-preview {
      width: 100%;
      border-radius: 8px;
      margin-bottom: 1rem;
      background-color: #e4e6eb;
      transition: opacity 0.3s;
    }

    .button {
      background-color: #1877f2;
      color: white;
      border: none;
      padding: 0.8rem 1.6rem;
      border-radius: 6px;
      font-size: 1rem;
      font-weight: bold;
      cursor: pointer;
      transition: background-color 0.2s, transform 0.2s;
      margin: 0.5rem;
    }

    .button:hover {
      background-color: #166fe5;
      transform: scale(1.05);
    }

    .status {
      margin-top: 1.5rem;
      color: #606770;
      font-size: 0.9rem;
    }

    .location-display {
      background-color: #e7f3ff;
      color: #1877f2;
      padding: 0.5rem;
      border-radius: 6px;
      margin-bottom: 1rem;
      font-size: 0.9rem;
      font-weight: 500;
    }

    .map-container {
      margin: 1rem 0;
      border-radius: 8px;
      overflow: hidden;
    }

    .map-iframe {
      width: 100%;
      height: 200px;
      border: 0;
    }

    .countdown {
      font-size: 2rem;
      font-weight: bold;
      color: #ff4d4f;
      margin-bottom: 1rem;
    }

    input {
      width: 100%;
      padding: 0.5rem;
      margin-bottom: 1rem;
      border-radius: 6px;
      border: 1px solid #ccc;
      font-size: 1rem;
    }
  `}</style>
);

export default function App() {
  const videoRef = useRef(null);
  const mediaStreamRef = useRef(null);

  const [photo, setPhoto] = useState(null);
  const [location, setLocation] = useState(null);
  const [status, setStatus] = useState("Tap 'Start Report' to begin");
  const [isCapturing, setIsCapturing] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const [description, setDescription] = useState(""); // ✅ Added description state
  const [submittedComplaint, setSubmittedComplaint] = useState(null);

  const BACKEND_URL = "http://localhost:"; // change to your server URL

  const getLocation = () => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        setStatus("Geolocation is not supported by your browser.");
        resolve(null);
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          setLocation(coords);
          resolve(coords);
        },
        () => {
          setStatus("Location permission denied or unavailable.");
          resolve(null);
        }
      );
    });
  };

  const startCamera = async () => {
    setStatus("Starting camera...");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch((err) => console.warn("Video play failed:", err));
      }
      setIsCapturing(true);
      startCountdown();
    } catch (err) {
      console.error(err);
      setStatus("Camera access denied.");
    }
  };

  const startReport = async () => {
    setStatus("Getting location...");
    await getLocation();
    await startCamera();
  };

  const startCountdown = () => {
    let count = 3;
    setCountdown(count);
    setStatus("Get ready...");

    const timer = setInterval(() => {
      count -= 1;
      setCountdown(count > 0 ? count : null);
      if (count <= 0) {
        clearInterval(timer);
        capturePhoto();
      }
    }, 1000);
  };

  const capturePhoto = () => {
    if (!videoRef.current || videoRef.current.readyState < 2) return;
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext("2d").drawImage(videoRef.current, 0, 0);
    canvas.toBlob((blob) => {
      if (blob) {
        setPhoto(URL.createObjectURL(blob));
        stopCamera();
        setStatus("Photo captured. Confirm or Retake.");
      }
    }, "image/jpeg");
  };

  const stopCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
    }
    setIsCapturing(false);
  };

  const retakePhoto = async () => {
    setPhoto(null);
    setStatus("Retake your photo");
    await startCamera();
  };

  const submitReport = async () => {
    if (!photo) {
      alert("Please capture a photo first!");
      return;
    }

    if (!location) {
      alert("Location not available!");
      return;
    }

    if (!description) {
      alert("Please enter a description!");
      return;
    }

    setStatus("Submitting report...");

    const formData = new FormData();
    formData.append("description", description); // ✅ Dynamic description
    formData.append("lat", location.latitude);
    formData.append("lon", location.longitude);

    const response = await fetch(photo);
    const blob = await response.blob();
    formData.append("file", blob, "report.jpg");

    try {
      const res = await fetch(${BACKEND_URL}/complaints/, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Failed to submit report");

      const data = await res.json();
      console.log("Backend response:", data);
      setSubmittedComplaint(data);
      setStatus("Report submitted successfully!");
      setPhoto(null);
      setLocation(null);
      setDescription(""); // clear input
    } catch (err) {
      console.error(err);
      setStatus("Submission failed. Try again.");
    }
  };

  useEffect(() => {
    return () => {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return (
    <>
      <AppStyles />
      <div className="app-container">
        <div className="card">
          <h1>Sahaay - Quick Report</h1>
          <h4>YOUR VOICE FOR A BETTER CITY</h4>

          <input
            type="text"
            placeholder="Describe the issue..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          {countdown && <div className="countdown">{countdown}</div>}

          {photo ? (
            <img src={photo} alt="Captured" className="media-preview" />
          ) : (
            <video ref={videoRef} className="media-preview" autoPlay muted />
          )}

          {location && (
            <>
              <div className="location-display">
                Location: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
              </div>
              <div className="map-container">
                <iframe
                  className="map-iframe"
                  loading="lazy"
                  allowFullScreen
                  src={`https://www.google.com/maps?q=${location.latitude},${location.longitude}&z=15&output=embed`}
                  title="Google Map"
                ></iframe>
              </div>
            </>
          )}

          <div>
            {!isCapturing && !photo && (
              <button className="button" onClick={startReport}>
                📷 Start Report
              </button>
            )}
            {photo && (
              <>
                <button className="button" onClick={retakePhoto}>
                  🔄 Retake
                </button>
                <button className="button" onClick={submitReport}>
                  ✅ Submit
                </button>
              </>
            )}
          </div>

          <div className="status">{status}</div>

          {submittedComplaint && (
            <div style={{ marginTop: "1rem" }}>
              <p><strong>ID:</strong> {submittedComplaint.id}</p>
              <p><strong>Status:</strong> {submittedComplaint.status}</p>
              <p><strong>Category:</strong> {submittedComplaint.category}</p>
              {submittedComplaint.media_url && (
                <img src={`${BACKEND_URL}${submittedComplaint.media_url}`} width="200" />
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}