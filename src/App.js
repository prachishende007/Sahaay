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
      transition: background-color 0.2s;
      margin-top: 1rem;
    }

    .button:hover {
      background-color: #166fe5;
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
  `}</style>
);

export default function App() {
  const videoRef = useRef(null);
  const mediaStreamRef = useRef(null);

  const [photo, setPhoto] = useState(null);
  const [location, setLocation] = useState(null);
  const [status, setStatus] = useState("Tap 'Start Report' to begin");
  const [isCapturing, setIsCapturing] = useState(false);

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
      setStatus("Camera is ready. Capturing photo...");
      setTimeout(capturePhoto, 1000);
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
        setStatus("Photo captured. You can now submit.");
      }
    }, "image/jpeg");
  };

  const stopCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
    }
    setIsCapturing(false);
  };

  const submitReport = async () => {
    if (!photo) {
      alert("Please capture a photo first!");
      return;
    }
    console.log("Photo:", photo);
    console.log("Location:", location || "Not available");

    setStatus("Submitting report...");
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setStatus("Report submitted successfully!");
    setPhoto(null);
    setLocation(null);
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

          {photo ? (
            <img src={photo} alt="Captured" className="media-preview" />
          ) : (
            <video ref={videoRef} className="media-preview" autoPlay muted />
          )}

          {/* ✅ Show location and Google Map if available */}
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
            {!isCapturing && photo && (
              <button className="button" onClick={submitReport}>
                ✅ Submit Report
              </button>
            )}
          </div>

          <div className="status">{status}</div>
        </div>
      </div>
    </>
  );
}
