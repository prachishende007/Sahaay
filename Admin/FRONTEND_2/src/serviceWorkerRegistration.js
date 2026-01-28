// This is similar to code used in CRA template PWA

const isLocalhost = Boolean(
    window.location.hostname === 'localhost' ||
      // [::1] is the IPv6 localhost address.
      window.location.hostname === '[::1]' ||
      // 127.0.0.0/8 are considered localhost for IPv4.
      window.location.hostname.match(
        /^127(?:\.(?:25[0-5]|2[0-4]\d|[01]?\d?\d)){3}$/
      )
  );
  
  export function register(config) {
    if ('serviceWorker' in navigator && (process.env.NODE_ENV === 'production' || isLocalhost)) {
      const publicUrl = new URL(process.env.PUBLIC_URL, window.location.href);
      if (publicUrl.origin !== window.location.origin) {
        // service worker won't work if PUBLIC_URL is on different origin
        return;
      }
  
      window.addEventListener('load', () => {
        const swUrl = `${process.env.PUBLIC_URL}/service-worker.js`;
  
        navigator.serviceWorker
          .register(swUrl)
          .then(registration => {
            console.log('Service Worker registered: ', registration);
  
            registration.onupdatefound = () => {
              const installingWorker = registration.installing;
              if (installingWorker == null) {
                return;
              }
              installingWorker.onstatechange = () => {
                if (installingWorker.state === 'installed') {
                  if (navigator.serviceWorker.controller) {
                    // New content is available; please refresh.
                    console.log('New content available; please refresh.');
                    // You can optionally prompt user here
                  } else {
                    // Content cached for offline use.
                    console.log('Content is cached for offline use.');
                  }
                }
              };
            };
          })
          .catch(error => {
            console.error('Error during service worker registration:', error);
          });
      });
    }
  }
  
  export function unregister() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(registration => {
        registration.unregister();
      });
    }
  }
  