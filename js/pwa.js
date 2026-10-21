/**
 * Flowscribe PWA Registration & Lifecycle Handler
 */
(function() {
  if ('serviceWorker' in navigator) {
    let refreshing = false;

    // Reload page safely when a new service worker takes control
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!refreshing) {
        refreshing = true;
        // Ensure active draft is safely persisted before reload
        try {
          const titleEl = document.getElementById('docTitle');
          const catEl = document.getElementById('docCategories');
          const textEl = document.getElementById('editorTextarea');
          if (window.MDCore && window.MDCore.Storage) {
            window.MDCore.Storage.saveDraft({
              title: titleEl ? titleEl.value : '',
              categories: catEl ? catEl.value : '',
              body: textEl ? textEl.value : ''
            });
          }
        } catch (e) {}
        window.location.reload();
      }
    });

    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js', { scope: './' })
        .then((registration) => {
          // Immediately check for updates
          registration.update().catch(() => {});

          registration.onupdatefound = () => {
            const installingWorker = registration.installing;
            if (installingWorker) {
              installingWorker.onstatechange = () => {
                if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  console.log('Flowscribe: Ny version fundet - genindlæser med opdateringer...');
                  // Tell new worker to skip waiting if waiting
                  if (registration.waiting) {
                    registration.waiting.postMessage({ type: 'SKIP_WAITING' });
                  }
                }
              };
            }
          };
        })
        .catch((error) => {
          console.warn('Flowscribe PWA Service Worker fejl:', error);
        });
    });
  }
})();
