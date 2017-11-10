var cacheName = 'NewzPWA-step-6-3';
var dataCacheName = 'NewzData-v1';
var filesToCache = [
  '/index.html',
  '/js/jquery-3.2.1.min.js',
  '/css/materialize.min.css',
  '/js/materialize.min.js',
  '/js/app.js',
  '/css/style.css'
];

self.addEventListener('install', function(e) {
  console.log('[ServiceWorker] Install');
  e.waitUntil(
    caches.open(cacheName).then(function(cache) {
      console.log('[ServiceWorker] Caching app shell');
      return cache.addAll(filesToCache);
    })
  );
});

self.addEventListener('activate', function(e) {
  console.log('[ServiceWorker] Activate');
  e.waitUntil(
    caches.keys().then(function(keyList) {
      return Promise.all(keyList.map(function(key) {
        if (key !== cacheName && key !== dataCacheName) {
          console.log('[ServiceWorker] Removing old cache', key);
          return caches.delete(key);
        }
      }));
    })
  );
  return self.clients.claim();
});

self.addEventListener('fetch', function(e) {
  console.log('[Service Worker] Fetch', e.request.url);
  var dataUrl = 'https://newsapi.org/v1/articles';
  console.log(e.request.url.indexOf(dataUrl));
  if (e.request.url.indexOf(dataUrl) > -1) {
    /*
     * When the request URL contains dataUrl, the app is asking for fresh
     * data. In this case, the service worker always goes to the
     * network and then caches the response. This is called the "Cache then
     * network" strategy:
     */
      var fetchRequest = e.request.clone();
    e.respondWith(
      caches.open(dataCacheName).then(function(cache) {
          return fetch(e.request).then(function (response) {
              console.log('Network response');
              console.log(response);
              cache.put(fetchRequest.url, response.clone());
              console.log(response);

          return response;
          }).catch(function () {
              console.log('offline response');
              return caches.match(fetchRequest);
          });
      })
    );
  } else {
    /*
     * The app is asking for app shell files. In this scenario the app uses the
     * "Cache, falling back to the network" offline strategy:
     */
    e.respondWith(
      caches.match(e.request).then(function(response) {
        return response || fetch(e.request);
      })
    );
  }
});
