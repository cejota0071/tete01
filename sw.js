// ============================================================
// QG Marmitas — Service Worker
// Estratégia: Cache First para assets, Network First para HTML
// ============================================================

const CACHE_NAME = 'qgmarmitas-v1';
const OFFLINE_URL = '/offline.html';

// Assets que serão cacheados na instalação
const PRECACHE_ASSETS = [
  '/',
  '/offline.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
];

// ─── Install ─────────────────────────────────────────────────
self.addEventListener('install', (event) => {
  console.log('[SW] Instalando...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS);
    })
  );
  // Ativa imediatamente sem esperar tabs antigas fecharem
  self.skipWaiting();
});

// ─── Activate ────────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  console.log('[SW] Ativado!');
  event.waitUntil(
    // Remove caches antigos
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// ─── Fetch ───────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  // Ignora requisições não-GET e extensões do browser
  if (event.request.method !== 'GET') return;
  if (event.request.url.includes('chrome-extension')) return;
  if (event.request.url.includes('api.whatsapp')) return;

  const url = new URL(event.request.url);

  // Estratégia Network First para páginas HTML (sempre fresco)
  if (event.request.mode === 'navigate' || event.request.headers.get('Accept')?.includes('text/html')) {
    event.respondWith(networkFirstStrategy(event.request));
    return;
  }

  // Estratégia Cache First para assets (imagens, css, js, fontes)
  event.respondWith(cacheFirstStrategy(event.request));
});

// Network First: tenta rede, cai no cache, cai no offline
async function networkFirstStrategy(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    const cached = await caches.match(request);
    if (cached) return cached;
    return caches.match(OFFLINE_URL);
  }
}

// Cache First: serve do cache, atualiza em background
async function cacheFirstStrategy(request) {
  const cached = await caches.match(request);
  if (cached) {
    // Atualiza cache em background (stale-while-revalidate)
    fetch(request).then((response) => {
      if (response.ok) {
        caches.open(CACHE_NAME).then((cache) => cache.put(request, response));
      }
    }).catch(() => {});
    return cached;
  }

  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    // Para imagens, retorna um placeholder SVG
    if (request.destination === 'image') {
      return new Response(
        `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
          <rect width="200" height="200" fill="#1a0a00"/>
          <text x="50%" y="50%" fill="#e85d04" font-size="14" text-anchor="middle" dy=".3em">🍱 Offline</text>
        </svg>`,
        { headers: { 'Content-Type': 'image/svg+xml' } }
      );
    }
    return new Response('Sem conexão', { status: 503 });
  }
}

// ─── Push Notifications ──────────────────────────────────────
self.addEventListener('push', (event) => {
  let data = {
    title: '🍱 QG Marmitas',
    body: 'Você tem uma novidade!',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    tag: 'qgmarmitas-notif',
    renotify: true,
    data: { url: '/' },
  };

  if (event.data) {
    try {
      const payload = event.data.json();
      data = { ...data, ...payload };
    } catch (e) {
      data.body = event.data.text();
    }
  }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: data.icon,
      badge: data.badge,
      tag: data.tag,
      renotify: data.renotify,
      vibrate: [200, 100, 200],
      actions: [
        { action: 'open', title: '🍽️ Ver Cardápio' },
        { action: 'close', title: 'Fechar' },
      ],
      data: data.data,
    })
  );
});

// Clique na notificação
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'close') return;

  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Se já tem uma aba aberta, foca nela
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(urlToOpen);
          return client.focus();
        }
      }
      // Senão abre nova aba
      return clients.openWindow(urlToOpen);
    })
  );
});

// Notificação fechada
self.addEventListener('notificationclose', (event) => {
  console.log('[SW] Notificação fechada:', event.notification.tag);
});

// ─── Background Sync (para pedidos offline) ──────────────────
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-pedido') {
    event.waitUntil(syncPedidosPendentes());
  }
});

async function syncPedidosPendentes() {
  // Futuramente: buscar pedidos salvos no IndexedDB e reenviar
  console.log('[SW] Sincronizando pedidos pendentes...');
}
