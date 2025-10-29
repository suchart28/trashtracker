
const CACHE_NAME = "trash-tracker-cache-v1";
const urlsToCache = ["/user.html","/assets/user.js","/assets/style.css","/assets/alert.mp3"];
self.addEventListener("install", event => event.waitUntil(caches.open(CACHE_NAME).then(cache=>cache.addAll(urlsToCache))));
self.addEventListener("fetch", event => event.respondWith(caches.match(event.request).then(r=>r||fetch(event.request))));
