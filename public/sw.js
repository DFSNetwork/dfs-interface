/**
 * Unlike most Service Workers, this one always attempts to download assets
 * from the network. Only when network access fails do we fallback to using
 * the cache. When a request succeeds we always update the cache with the new
 * version. If a request fails and the result isn't in the cache then we
 * display an Offline page.
 */
// const CACHE = 'content-v1.0.5'; // name of the current cache
// const OFFLINE = '/index.html'; // URL to offline HTML document

// const AUTO_CACHE = [ // URLs of assets to immediately cache
//     '/manifest.json',
//     '/favicon.ico',
//     '/app-icon.png'
// ];

// // Iterate AUTO_CACHE and add cache each entry
// self.addEventListener('install', event => {
//     event.waitUntil(
//         caches.open(CACHE)
//             .then(cache => cache.addAll(AUTO_CACHE))
//             .then(self.skipWaiting())
//     );
// });

// // Destroy inapplicable caches
// self.addEventListener('activate', event => {
//     event.waitUntil(
//         caches.keys().then(cacheNames => {
//             return cacheNames.filter(cacheName => CACHE !== cacheName);
//         }).then(unusedCaches => {
//             console.log('DESTROYING CACHE', unusedCaches.join(','));
//             return Promise.all(unusedCaches.map(unusedCache => {
//                 return caches.delete(unusedCache);
//             }));
//         }).then(() => self.clients.claim())
//     );
// });

// self.addEventListener('fetch', event => {
//     //   if (!event.request.url.startsWith(self.location.origin) || event.request.method !== 'GET') {
//     if (event.request.method !== 'GET') {
//         // External request, or POST, ignore
//         return void event.respondWith(fetch(event.request));
//     }

//     event.respondWith(
//         // Always try to download from server first
//         fetch(event.request).then(response => {
//             // When a download is successful cache the result
//             caches.open(CACHE).then(cache => {
//                 cache.put(event.request, response)
//             });
//             // And of course display it
//             return response.clone();
//         }).catch((_err) => {
//             // A failure probably means network access issues
//             // See if we have a cached version
//             return caches.match(event.request).then(cachedResponse => {
//                 if (cachedResponse) {
//                     // We did have a cached version, display it
//                     return cachedResponse;
//                 }

//                 // We did not have a cached version, display offline page
//                 return caches.open(CACHE).then((cache) => {
//                     const offlineRequest = new Request(OFFLINE);
//                     return cache.match(offlineRequest);
//                 });

//             });
//         })
//     );
// });

importScripts(
    "./workbox-sw.js"
);
workbox.precaching.precacheAndRoute(self.__WB_MANIFEST || []);
