// sw.js (Service Worker) फ़ाइल का नया कोड

const CACHE_NAME = 'truvani-ai-cache-v2'; // v2 (वर्जन 2)

// 🚨 आपकी ज़रूरी फ़ाइलें (आपके स्क्रीनशॉट के हिसाब से)
const urlsToCache = [
    '/',
    '/index.html',
    '/rajasthan.html',
    '/contact.html',
    '/article.html',
    '/quantum.html',
    '/manifest.json',
    '/404.html',
    // 🚨 अगर आपकी कोई मुख्य CSS या Logo फ़ाइल है, 
    // तो उसका नाम भी यहाँ जोड़ें (जैसे '/style.css' या '/logo.png')
];

// 1. Install (इंस्टॉल): जब सर्विस वर्कर पहली बार रजिस्टर होता है
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('SW: Cache opened');
                // ऊपर दी गई सभी फ़ाइलों को कैश (save) करो
                return cache.addAll(urlsToCache);
            })
    );
});

// 2. Fetch (फेच): जब भी वेबसाइट कोई फ़ाइल (जैसे CSS, img, js) माँगती है
self.addEventListener('fetch', (event) => {
    // हम सिर्फ GET रिक्वेस्ट को कैश कर रहे हैं
    if (event.request.method !== 'GET') {
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // अगर फ़ाइल 'कैश' (Cache) में है, तो वहीं से दे दो
                if (response) {
                    // console.log('SW: Serving from Cache:', event.request.url);
                    return response;
                }

                // अगर कैश में नहीं है, तो इंटरनेट से लाओ
                // console.log('SW: Fetching from Network:', event.request.url);
                return fetch(event.request).then(
                    (fetchResponse) => {
                        // और उसे भविष्य के लिए कैश में सेव भी कर लो
                        return caches.open(CACHE_NAME).then((cache) => {
                            // हम सिर्फ ज़रूरी फ़ाइलें कैश कर रहे हैं (Firebase डेटा नहीं)
                            if (urlsToCache.includes(new URL(event.request.url).pathname)) {
                                cache.put(event.request.clone(), fetchResponse.clone());
                            }
                            return fetchResponse;
                        });
                    }
                ).catch(() => {
                    // अगर इंटरनेट नहीं है और कैश में भी नहीं है,
                    // तो 404 पेज दिखाओ
                    return caches.match('/404.html');
                });
            })
    );
});

// 3. Activate (एक्टिवेट): पुराने कैश को साफ करने के लिए
self.addEventListener('activate', (event) => {
    const cacheWhitelist = [CACHE_NAME]; // सिर्फ v2 को रखो
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    // अगर कैश का नाम v2 नहीं है, तो उसे डिलीट कर दो
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        console.log('SW: Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});
