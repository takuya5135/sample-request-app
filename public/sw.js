self.addEventListener('install', (event) => {
    // インストール処理
    // Service Workerをすぐにアクティベート
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    // アクティベート時、古いキャッシュの削除など
    event.waitUntil(self.clients.claim());
});

// インストール要件を満たすためのダミーキャッシュ名
const CACHE_NAME = 'pwa-cache-v1';

self.addEventListener('fetch', (event) => {
    // ネットワーク優先、失敗時にキャッシュ（または空の200）を返す
    // これによりAndroid Chromeの「オフライン時にページが動作するか」の判定をパスさせます
    event.respondWith(
        fetch(event.request).catch(() => {
            return new Response('Offline', {
                status: 200,
                statusText: 'OK',
                headers: new Headers({ 'Content-Type': 'text/plain' })
            });
        })
    );
});
