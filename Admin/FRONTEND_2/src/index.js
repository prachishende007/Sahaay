import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles.css";

// ✅ Import service worker registration
import * as serviceWorkerRegistration from "./serviceWorkerRegistration";

const root = createRoot(document.getElementById("root"));
root.render(<App />);

// ✅ Register the service worker (PWA)
serviceWorkerRegistration.register();
if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("/sw.js")
        .then(() => console.log("✅ Service Worker registered"))
        .catch((err) => console.error("❌ SW registration failed", err));
    });
  }
  