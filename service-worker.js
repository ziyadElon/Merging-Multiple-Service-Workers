/*
  IMPORTANT: 
  Any changes made in this file will not trigger an update for the service worker.
  OneSignalSDKWorker.js file has to be modified.
*/

var CACHE_VERSION = 'v2';
var CACHE_NAME = CACHE_VERSION + ':sw-cache-';
var jsBundle =  "[absolute-path-to-js-bundle]";
var cssBundle =  "[absolute-path-to-css-bundle]";

function onInstall(event) {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(function prefill(cache) {
      return cache.addAll([
        "/",
        "https://ajax.googleapis.com/ajax/libs/webfont/1.6.16/webfont.js",
        "https://cdnjs.cloudflare.com/ajax/libs/select2/4.0.0/css/select2.css",
        "//cdnjs.cloudflare.com/ajax/libs/select2/4.0.0/js/select2.js",
        "https://cdnjs.cloudflare.com/ajax/libs/select2/3.5.2/select2.css",
        "https://cdnjs.cloudflare.com/ajax/libs/select2/3.5.2/select2.js",
        "https://addevent.com/libs/atc/1.6.1/atc.min.js",
      ]);
    })
  );
}

function deleteStaleAssets(url, asset) {
  caches.open(CACHE_NAME).then(function(cache) {
    cache.keys().then(function(keys) {
      let cc = keys.filter(function(req) {
        if(req.url.includes(asset) && req.url !== url) {
          return true;
        }
      });
      cc.forEach(function(r) {
        cache.delete(r);
      });
    });
  });
}

function onActivate(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.filter(function(cacheName) {
          return cacheName.indexOf(CACHE_VERSION) !== 0;
        }).map(function(cacheName) {
          return caches.delete(cacheName);
        })
      );
    })
  );
}

function onFetch(event) {
  var assets = ['/assets/application', 'assets/spree/frontend/all'];
  var asset = assets.find(function(asset) {
    return event.request.url.includes(asset);
  });
  if(asset) {
    event.respondWith(async function() {
      const cache = await caches.open(CACHE_NAME);
      const cachedResponse = await cache.match(event.request);
      const networkResponsePromise = fetch(event.request);

      event.waitUntil(async function() {
        const networkResponse = await networkResponsePromise;
        deleteStaleAssets(event.request.url, asset);
        await cache.put(event.request, networkResponse.clone());
      }());

      // Returned the cached response if we have one, otherwise return the network response.
      return cachedResponse || networkResponsePromise;
    }());
  }
  else {
    event.respondWith(
      // try to return untouched request from network first
      fetch(event.request).catch(function() {
        // if it fails, try to return request from the cache
        return caches.match(event.request).then(function(response) {
          if (response) {
            return response;
          }
          // if not found in cache, return default offline content for navigate requests
          if (event.request.mode === 'navigate' ||
            (event.request.method === 'GET' && event.request.headers.get('accept').includes('text/html'))) {
            return caches.match('/offline.html');
          }
        })
      })
    );
  }
}

self.addEventListener('install', onInstall);
self.addEventListener('activate', onActivate);
self.addEventListener('fetch', onFetch);
