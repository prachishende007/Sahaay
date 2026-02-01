import React, { useRef, useState, useEffect } from "react";

const AppStyles = () => (
  <style>{`
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
      -webkit-tap-highlight-color: transparent;
    }

    body {
      background-color: #000;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif;
      overflow: hidden;
      height: 100vh;
      width: 100vw;
      touch-action: pan-y;
    }

    .app {
      position: relative;
      width: 100vw;
      height: 100vh;
      overflow: hidden;
    }

    .screens-container {
      display: flex;
      width: 300vw;
      height: 100vh;
      transition: transform 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94);
      will-change: transform;
    }

    .screen {
      width: 100vw;
      height: 100vh;
      flex-shrink: 0;
      overflow: hidden;
    }

    /* Camera Screen */
    .camera-screen {
      position: relative;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .camera-preview {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .camera-placeholder {
      text-align: center;
      color: white;
      padding: 2rem;
    }

    .camera-placeholder-icon {
      font-size: 5rem;
      margin-bottom: 1rem;
      opacity: 0.5;
    }

    .camera-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      pointer-events: none;
    }

    .top-bar {
      padding: 1.5rem 1.5rem 0;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .location-pill {
      background: rgba(0, 0, 0, 0.6);
      backdrop-filter: blur(10px);
      color: white;
      padding: 0.5rem 1rem;
      border-radius: 20px;
      font-size: 0.85rem;
      font-weight: 500;
    }

    .capture-area {
      padding: 0 1.5rem 3rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1.5rem;
      pointer-events: auto;
    }

    .swipe-hints {
      display: flex;
      justify-content: space-between;
      width: 100%;
      max-width: 300px;
      color: rgba(255, 255, 255, 0.7);
      font-size: 0.75rem;
      font-weight: 500;
    }

    .capture-button {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      border: 5px solid white;
      background: transparent;
      cursor: pointer;
      transition: all 0.2s;
      position: relative;
      touch-action: none;
    }

    .capture-button::after {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 70px;
      height: 70px;
      border-radius: 50%;
      background: white;
      transition: all 0.2s;
    }

    .capture-button:active::after {
      width: 60px;
      height: 60px;
    }

    /* Preview Screen */
    .preview-screen {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: #000;
      z-index: 50;
      display: flex;
      flex-direction: column;
    }

    .preview-video {
      flex: 1;
      width: 100%;
      height: 100%;
      object-fit: contain;
    }

    .preview-controls {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      padding: 2rem 1.5rem 3rem;
      background: linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 100%);
      display: flex;
      gap: 1rem;
      justify-content: center;
    }

    .btn {
      padding: 1rem 2.5rem;
      border: none;
      border-radius: 50px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .btn-retake {
      background: rgba(255, 255, 255, 0.15);
      backdrop-filter: blur(10px);
      color: white;
      border: 2px solid rgba(255, 255, 255, 0.3);
    }

    .btn-send {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      min-width: 160px;
      justify-content: center;
      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
    }

    .btn:active {
      transform: scale(0.95);
    }

    /* Reports Screen */
    .reports-screen {
      background: #0a0a0a;
      color: white;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
    }

    .reports-header {
      padding: 1.5rem 1.5rem 1rem;
      background: #000;
      position: sticky;
      top: 0;
      z-index: 10;
      backdrop-filter: blur(10px);
    }

    .reports-header h2 {
      font-size: 1.75rem;
      font-weight: 700;
      margin: 0;
    }

    .reports-list {
      flex: 1;
      padding: 0.5rem 0;
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 3rem 2rem;
      text-align: center;
      color: #666;
      min-height: 300px;
    }

    .empty-icon {
      font-size: 4rem;
      margin-bottom: 1rem;
      opacity: 0.3;
    }

    .report-item {
      display: flex;
      align-items: center;
      padding: 1.25rem 1.5rem;
      border-bottom: 1px solid #1a1a1a;
      cursor: pointer;
      transition: background 0.15s;
      gap: 1rem;
    }

    .report-item:active {
      background: rgba(255, 255, 255, 0.03);
    }

    .status-circle {
      width: 14px;
      height: 14px;
      border-radius: 50%;
      flex-shrink: 0;
      box-shadow: 0 0 8px currentColor;
    }

    .status-pending { background: #ff4757; color: #ff4757; }
    .status-in-progress { background: #ffa502; color: #ffa502; }
    .status-resolved { background: #26de81; color: #26de81; }

    .report-info {
      flex: 1;
      min-width: 0;
    }

    .report-date {
      font-size: 0.75rem;
      color: #666;
      margin-bottom: 0.3rem;
      font-weight: 500;
    }

    .report-title {
      font-size: 1rem;
      font-weight: 500;
      color: #fff;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    /* Report Detail Screen */
    .detail-screen {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: #0a0a0a;
      color: white;
      z-index: 100;
      transform: translateY(100%);
      transition: transform 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94);
      display: flex;
      flex-direction: column;
    }

    .detail-screen.visible {
      transform: translateY(0);
    }

    .detail-header {
      padding: 1rem 1rem 1rem 0.5rem;
      background: #000;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      position: sticky;
      top: 0;
      z-index: 10;
    }

    .back-btn {
      background: none;
      border: none;
      color: white;
      font-size: 1.75rem;
      cursor: pointer;
      padding: 0.5rem 0.75rem;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .detail-header h2 {
      font-size: 1.25rem;
      font-weight: 600;
    }

    .detail-content {
      flex: 1;
      overflow-y: auto;
    }

    .detail-video-container {
      background: #000;
      position: relative;
    }

    .detail-video {
      width: 100%;
      max-height: 50vh;
      display: block;
    }

    .detail-info {
      padding: 1.5rem;
    }

    .detail-section {
      margin-bottom: 1.5rem;
    }

    .detail-label {
      font-size: 0.7rem;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      font-weight: 600;
      margin-bottom: 0.5rem;
    }

    .detail-value {
      font-size: 1.05rem;
      line-height: 1.5;
      color: #fff;
    }

    .priority-badge {
      display: inline-block;
      padding: 0.4rem 1rem;
      border-radius: 20px;
      font-size: 0.85rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }

    .priority-high { 
      background: rgba(255, 71, 87, 0.2);
      color: #ff4757;
      border: 1px solid rgba(255, 71, 87, 0.3);
    }
    .priority-medium { 
      background: rgba(255, 165, 2, 0.2);
      color: #ffa502;
      border: 1px solid rgba(255, 165, 2, 0.3);
    }
    .priority-low { 
      background: rgba(38, 222, 129, 0.2);
      color: #26de81;
      border: 1px solid rgba(38, 222, 129, 0.3);
    }

    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.4rem 1rem;
      border-radius: 20px;
      font-size: 0.85rem;
      font-weight: 600;
      background: rgba(255, 255, 255, 0.05);
    }

    .divider {
      height: 1px;
      background: #1a1a1a;
      margin: 1.5rem 0;
    }

    /* Profile Screen */
    .profile-screen {
      background: #0a0a0a;
      color: white;
      overflow-y: auto;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .profile-content {
      padding: 2rem 1.5rem;
      max-width: 600px;
    }

    .about-section {
      background: #141414;
      padding: 1.5rem;
      border-radius: 16px;
      border: 1px solid #1a1a1a;
    }

    .about-section h3 {
      margin-bottom: 0.75rem;
      font-size: 1.1rem;
    }

    .about-section p {
      color: #999;
      line-height: 1.7;
      font-size: 0.95rem;
    }

    /* Loading Overlay */
    .loading-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.95);
      backdrop-filter: blur(10px);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      z-index: 200;
      color: white;
    }

    .spinner {
      width: 50px;
      height: 50px;
      border: 4px solid rgba(255, 255, 255, 0.1);
      border-top-color: #667eea;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .loading-text {
      margin-top: 1.5rem;
      font-size: 1rem;
      font-weight: 500;
      opacity: 0.8;
    }

    .success-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(38, 222, 129, 0.95);
      backdrop-filter: blur(10px);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      z-index: 201;
      color: white;
      animation: fadeIn 0.3s ease;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: scale(0.9); }
      to { opacity: 1; transform: scale(1); }
    }

    .success-icon {
      font-size: 5rem;
      margin-bottom: 1rem;
      animation: checkmark 0.5s ease;
    }

    @keyframes checkmark {
      0% { transform: scale(0); }
      50% { transform: scale(1.2); }
      100% { transform: scale(1); }
    }

    .success-text {
      font-size: 1.5rem;
      font-weight: 700;
      margin-bottom: 0.5rem;
    }

    .success-subtext {
      font-size: 0.95rem;
      opacity: 0.9;
    }

    .nav-dots {
      position: fixed;
      bottom: 1rem;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      gap: 0.5rem;
      z-index: 40;
      pointer-events: auto;
    }

    .nav-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.3);
      transition: all 0.3s;
      cursor: pointer;
    }

    .nav-dot.active {
      background: white;
      width: 24px;
      border-radius: 4px;
    }

    .permission-error {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(255, 71, 87, 0.95);
      backdrop-filter: blur(10px);
      color: white;
      padding: 2rem;
      border-radius: 20px;
      text-align: center;
      max-width: 320px;
      z-index: 100;
    }

    .error-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
    }

    .error-title {
      font-size: 1.2rem;
      font-weight: 700;
      margin-bottom: 0.5rem;
    }

    .error-message {
      font-size: 0.9rem;
      opacity: 0.9;
      line-height: 1.5;
    }

    .welcome-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.95);
      backdrop-filter: blur(10px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 300;
      animation: fadeIn 0.3s ease;
    }

    .welcome-content {
      max-width: 400px;
      padding: 2.5rem 2rem;
      text-align: center;
      color: white;
    }

    .welcome-title {
      font-size: 2rem;
      font-weight: 700;
      margin-bottom: 0.5rem;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .welcome-subtitle {
      font-size: 1rem;
      color: #999;
      margin-bottom: 2rem;
    }

    .welcome-steps {
      text-align: left;
      margin-bottom: 2rem;
      padding: 0 1rem;
    }

    .welcome-step {
      display: flex;
      align-items: flex-start;
      gap: 1rem;
      margin-bottom: 1.25rem;
      padding: 1rem;
      background: rgba(255, 255, 255, 0.03);
      border-radius: 12px;
      border: 1px solid rgba(255, 255, 255, 0.05);
    }

    .step-number {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      flex-shrink: 0;
      font-size: 0.9rem;
    }

    .step-text {
      flex: 1;
      padding-top: 0.3rem;
    }

    .step-title {
      font-weight: 600;
      margin-bottom: 0.25rem;
      font-size: 0.95rem;
    }

    .step-desc {
      font-size: 0.85rem;
      color: #999;
      line-height: 1.4;
    }

    .welcome-btn {
      width: 100%;
      padding: 1.25rem;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      border-radius: 50px;
      font-size: 1.1rem;
      font-weight: 700;
      cursor: pointer;
      box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
      transition: all 0.2s;
    }

    .welcome-btn:active {
      transform: scale(0.97);
    }
  `}</style>
);

export default function App() {
  const videoRef = useRef(null);
  const previewRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const touchStartXRef = useRef(0);
  const isDraggingRef = useRef(false);

  const [currentScreen, setCurrentScreen] = useState(1);
  const [capturedBlob, setCapturedBlob] = useState(null);
  const [capturedUrl, setCapturedUrl] = useState(null);
  const [location, setLocation] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [reports, setReports] = useState([
    {
      id: 1,
      category: 'Pothole on Main Street',
      status: 'Pending',
      priority: 'High',
      created_at: new Date().toISOString(),
      ai_interpretation: 'Large pothole detected on main road causing traffic hazard.'
    },
    {
      id: 2,
      category: 'Streetlight Not Working',
      status: 'In Progress',
      priority: 'Medium',
      created_at: new Date(Date.now() - 86400000).toISOString(),
      ai_interpretation: 'Street lighting infrastructure requires maintenance.'
    },
    {
      id: 3,
      category: 'Garbage Accumulation',
      status: 'Resolved',
      priority: 'Low',
      created_at: new Date(Date.now() - 172800000).toISOString(),
      ai_interpretation: 'Waste management issue resolved by municipal team.'
    }
  ]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [cameraError, setCameraError] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [userCity, setUserCity] = useState('Mumbai');
  const [showWelcome, setShowWelcome] = useState(true);

  useEffect(() => {
    if (!showWelcome) {
      initCamera();
      getLocation();
    }
  }, [showWelcome]);

  const initCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      
      mediaStreamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(console.warn);
      }
    } catch (err) {
      console.error('Camera error:', err);
      setCameraError('Camera access denied. Please enable camera permissions.');
    }
  };

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          });
        },
        (err) => {
          console.error('Location error:', err);
        }
      );
    }
  };

  // Capture single image frame 
  const captureImage = () => {
    if (!videoRef.current) return;
    try {
      const video = videoRef.current;
      const w = video.videoWidth || 1280;
      const h = video.videoHeight || 720;
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, w, h);
      canvas.toBlob((blob) => {
        if (!blob) return;
        setCapturedBlob(blob);
        const url = URL.createObjectURL(blob);
        setCapturedUrl(url);
      }, 'image/jpeg', 0.92);
    } catch (err) {
      console.error('Capture error:', err);
    }
  };

  const handleRetake = () => {
    if (capturedUrl) URL.revokeObjectURL(capturedUrl);
    setCapturedBlob(null);
    setCapturedUrl(null);
  };

  const handleSendReport = async () => {
    if (!capturedBlob) return;
    setIsUploading(true);

    // Backend API endpoint
    const API_BASE = "https://sahaay-backend.onrender.com/complaints/";
    const form = new FormData();
    form.append('file', capturedBlob, 'report.jpg');
    if (location) {
      form.append('lat', location.latitude);
      form.append('lon', location.longitude);
    } else {
      form.append('lat', 0);
      form.append('lon', 0);
    }

    try {
      const res = await fetch(API_BASE, { method: 'POST', body: form });
      if (!res.ok) throw new Error('Upload failed');
      setUploadSuccess(true);
      try {
        const data = await res.json();
        if (data && data.id) setReports((r) => [data, ...r]);
      } catch (e) {}
    } catch (err) {
      console.error('Upload error:', err);
    } finally {
      setTimeout(() => {
        setIsUploading(false);
        setUploadSuccess(false);
        handleRetake();
      }, 1500);
    }
  };

  const handleTouchStart = (e) => {
    if (capturedBlob || selectedReport) return;
    touchStartXRef.current = e.touches[0].clientX;
    isDraggingRef.current = true;
  };

  const handleTouchEnd = (e) => {
    if (!isDraggingRef.current || capturedBlob || selectedReport) return;
    isDraggingRef.current = false;
    
    const diff = e.changedTouches[0].clientX - touchStartXRef.current;
    if (Math.abs(diff) > 50) {
      if (diff > 0 && currentScreen > 0) {
        setCurrentScreen(currentScreen - 1);
      } else if (diff < 0 && currentScreen < 2) {
        setCurrentScreen(currentScreen + 1);
      }
    }
  };

  const handleMouseDown = (e) => {
    if (capturedBlob || selectedReport) return;
    touchStartXRef.current = e.clientX;
    isDraggingRef.current = true;
  };

  const handleMouseUp = (e) => {
    if (!isDraggingRef.current || capturedBlob || selectedReport) return;
    isDraggingRef.current = false;
    
    const diff = e.clientX - touchStartXRef.current;
    if (Math.abs(diff) > 50) {
      if (diff > 0 && currentScreen > 0) {
        setCurrentScreen(currentScreen - 1);
      } else if (diff < 0 && currentScreen < 2) {
        setCurrentScreen(currentScreen + 1);
      }
    }
  };

  const getStatusClass = (status) => {
    const s = status?.toLowerCase() || '';
    if (s.includes('resolved') || s.includes('completed')) return 'status-resolved';
    if (s.includes('progress') || s.includes('assigned')) return 'status-in-progress';
    return 'status-pending';
  };

  const getPriorityClass = (priority) => {
    const p = priority?.toLowerCase() || 'low';
    if (p === 'high') return 'priority-high';
    if (p === 'medium') return 'priority-medium';
    return 'priority-low';
  };

  useEffect(() => {
    if (capturedUrl && previewRef.current) previewRef.current.src = capturedUrl;
  }, [capturedUrl]);

  return (
    <>
      <AppStyles />
      <div 
        className="app" 
        onTouchStart={handleTouchStart} 
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
      >
        <div className="screens-container" style={{ transform: `translateX(-${currentScreen * 100}vw)` }}>
          
          {/* Reports Screen */}
          <div className="screen reports-screen">
            <div className="reports-header">
              <h2>My Reports</h2>
            </div>
            {reports.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📝</div>
                <p>No reports yet</p>
                <p style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>
                  Swipe left to start reporting
                </p>
              </div>
            ) : (
              <div className="reports-list">
                {reports.map((report) => (
                  <div 
                    key={report.id} 
                    className="report-item"
                    onClick={() => setSelectedReport(report)}
                  >
                    <div className={`status-circle ${getStatusClass(report.status)}`}></div>
                    <div className="report-info">
                      <div className="report-date">
                        {new Date(report.created_at).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </div>
                      <div className="report-title">
                        {report.category}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Camera Screen */}
          <div className="screen camera-screen">
            {cameraError ? (
              <div className="camera-placeholder">
                <div className="camera-placeholder-icon">📷</div>
                <p>Camera Unavailable</p>
                <p style={{ fontSize: '0.85rem', marginTop: '0.5rem', opacity: 0.7 }}>
                  Demo mode - normally shows live camera feed
                </p>
              </div>
            ) : (
              <video ref={videoRef} className="camera-preview" autoPlay muted playsInline />
            )}
            
            <div className="camera-overlay">
              <div className="top-bar">
                <div className="location-pill">
                  {location ? '📍 Location Ready' : '📍 Getting location...'}
                </div>
              </div>

              <div className="capture-area">
                <div className="swipe-hints">
                  <span>← Reports</span>
                  <span>Profile →</span>
                </div>
                
                <div
                  className="capture-button"
                  onClick={captureImage}
                  onTouchEnd={(e) => { e.preventDefault(); captureImage(); }}
                  title="Tap to capture image"
                />
              </div>
            </div>

            {capturedBlob && (
              <div className="preview-screen">
                <img ref={previewRef} src={capturedUrl} alt="preview" className="preview-video" />
                <div className="preview-controls">
                  <button className="btn btn-retake" onClick={handleRetake}>
                    🔄 Retake
                  </button>
                  <button className="btn btn-send" onClick={handleSendReport}>
                     Send Report
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* About Screen */}
          <div className="screen profile-screen">
            <div className="profile-content">
              <div className="about-section">
                <h3>About Sahaay</h3>
                <p>
                  Your voice for a better city. Report civic issues with photo evidence. 
                  AI categorizes and routes your reports to the right departments.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Dots */}
        {!capturedBlob && !selectedReport && (
          <div className="nav-dots">
            <div 
              className={`nav-dot ${currentScreen === 0 ? 'active' : ''}`}
              onClick={() => setCurrentScreen(0)}
            />
            <div 
              className={`nav-dot ${currentScreen === 1 ? 'active' : ''}`}
              onClick={() => setCurrentScreen(1)}
            />
            <div 
              className={`nav-dot ${currentScreen === 2 ? 'active' : ''}`}
              onClick={() => setCurrentScreen(2)}
            />
          </div>
        )}

        {/* Report Detail Modal */}
        <div className={`detail-screen ${selectedReport ? 'visible' : ''}`}>
          {selectedReport && (
            <>
              <div className="detail-header">
                <button className="back-btn" onClick={() => setSelectedReport(null)}>←</button>
                <h2>Report Details</h2>
              </div>
              <div className="detail-content">
                <div className="detail-info">
                  <div className="detail-section">
                    <div className="detail-label">Category</div>
                    <div className="detail-value">{selectedReport.category}</div>
                  </div>

                  <div className="detail-section">
                    <div className="detail-label">Priority</div>
                    <span className={`priority-badge ${getPriorityClass(selectedReport.priority)}`}>
                      {selectedReport.priority}
                    </span>
                  </div>

                  <div className="detail-section">
                    <div className="detail-label">Status</div>
                    <div className="status-badge">
                      <div className={`status-circle ${getStatusClass(selectedReport.status)}`}></div>
                      {selectedReport.status}
                    </div>
                  </div>

                  <div className="divider"></div>

                  <div className="detail-section">
                    <div className="detail-label">AI Analysis</div>
                    <div className="detail-value">
                      {selectedReport.ai_interpretation}
                    </div>
                  </div>

                  <div className="detail-section">
                    <div className="detail-label">Submitted</div>
                    <div className="detail-value">
                      {new Date(selectedReport.created_at).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Loading Overlay */}
        {isUploading && !uploadSuccess && (
          <div className="loading-overlay">
            <div className="spinner"></div>
            <div className="loading-text">Uploading report...</div>
          </div>
        )}

        {/* Success Overlay */}
        {uploadSuccess && (
          <div className="success-overlay">
            <div className="success-icon">✓</div>
            <div className="success-text">Report Submitted!</div>
            <div className="success-subtext">AI is analyzing your report</div>
          </div>
        )}

        {/* Welcome Overlay */}
        {showWelcome && (
          <div className="welcome-overlay">
            <div className="welcome-content">
              <h1 className="welcome-title">Welcome to Sahaay</h1>
              <p className="welcome-subtitle">Your voice for a better city</p>
              
              <div className="welcome-steps">
                <div className="welcome-step">
                  <div className="step-number">1</div>
                  <div className="step-text">
                    <div className="step-title">Capture Photo</div>
                    <div className="step-desc">Tap the button to capture your civic issue</div>
                  </div>
                </div>
                
                <div className="welcome-step">
                  <div className="step-number">2</div>
                  <div className="step-text">
                    <div className="step-title">Show the Problem</div>
                    <div className="step-desc">Photos of potholes, garbage, broken lights, etc.</div>
                  </div>
                </div>
                
                <div className="welcome-step">
                  <div className="step-number">3</div>
                  <div className="step-text">
                    <div className="step-title">Submit Report</div>
                    <div className="step-desc">AI will analyze and route to the right department</div>
                  </div>
                </div>
              </div>
              
              <button className="welcome-btn" onClick={() => setShowWelcome(false)}>
                Get Started
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}