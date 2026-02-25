self.addEventListener('install', (event) => {
    // インストール処理
    // Service Workerをすぐにアクティベート
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    // アクティベート時、古いキャッシュの削除など
    event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
    // ネットワークリクエストを処理（PWAのインストール要件として必須）
    event.respondWith(
        fetch(event.request).catch(() => {
            // オフライン時のフォールバック処理が必要な場合はここに記述
        })
    );
});
