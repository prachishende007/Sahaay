self.addEventListener("install", (event) => {
    console.log("✅ Service Worker installed");
    self.skipWaiting();
  });
  
  self.addEventListener("activate", (event) => {
    console.log("✅ Service Worker activated");
  });
  
  self.addEventListener("fetch", (event) => {
    // For now, just let requests pass through
  });
  