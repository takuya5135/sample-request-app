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
    // 基本的にネットワークリクエストをそのまま通す（PWAインストールのためのダミーfetchハンドラ）
    return;
});
