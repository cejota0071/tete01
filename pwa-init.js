// ============================================================
// QG Marmitas — PWA Init
// Cole este script no final do <body> do seu index.html
// ============================================================

(function () {
  'use strict';

  // ─── 1. Registrar Service Worker ─────────────────────────
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
      try {
        const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
        console.log('[PWA] Service Worker registrado:', reg.scope);

        // Verificar atualizações a cada 60s
        setInterval(() => reg.update(), 60_000);

        // Avisar o usuário quando houver atualização disponível
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              mostrarBannerAtualizacao();
            }
          });
        });

      } catch (err) {
        console.error('[PWA] Falha ao registrar SW:', err);
      }
    });
  }

  // ─── 2. Banner "Instalar App" ─────────────────────────────
  let deferredPrompt = null;

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;

    // Só mostra o banner se o usuário não instalou ainda
    if (!localStorage.getItem('pwa_installed')) {
      setTimeout(mostrarBannerInstalacao, 3000);
    }
  });

  window.addEventListener('appinstalled', () => {
    localStorage.setItem('pwa_installed', 'true');
    removerBanner('pwa-install-banner');
    console.log('[PWA] App instalado com sucesso!');
  });

  function mostrarBannerInstalacao() {
    if (document.getElementById('pwa-install-banner')) return;

    const banner = document.createElement('div');
    banner.id = 'pwa-install-banner';
    banner.innerHTML = `
      <style>
        #pwa-install-banner {
          position: fixed;
          bottom: 1rem;
          left: 50%;
          transform: translateX(-50%);
          width: calc(100% - 2rem);
          max-width: 420px;
          background: #1a0a00;
          border: 1px solid rgba(232,93,4,0.4);
          border-radius: 1rem;
          padding: 1rem 1.25rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          box-shadow: 0 8px 32px rgba(0,0,0,0.6);
          z-index: 99999;
          font-family: sans-serif;
          animation: slideUp 0.35s ease;
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateX(-50%) translateY(20px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        #pwa-install-banner .pwa-icon { font-size: 2rem; flex-shrink: 0; }
        #pwa-install-banner .pwa-text { flex: 1; }
        #pwa-install-banner .pwa-text strong { color: #fff; font-size: 0.95rem; display: block; }
        #pwa-install-banner .pwa-text span { color: #c9a882; font-size: 0.8rem; }
        #pwa-install-banner .pwa-btns { display: flex; flex-direction: column; gap: 0.4rem; }
        #pwa-install-banner button {
          border: none; border-radius: 999px; padding: 0.45rem 1rem;
          font-size: 0.82rem; font-weight: 700; cursor: pointer; white-space: nowrap;
        }
        #pwa-btn-instalar { background: #e85d04; color: #fff; }
        #pwa-btn-fechar   { background: transparent; color: #5c3d1a; }
      </style>
      <div class="pwa-icon">🍱</div>
      <div class="pwa-text">
        <strong>Instalar QG Marmitas</strong>
        <span>Acesse o cardápio direto da tela inicial!</span>
      </div>
      <div class="pwa-btns">
        <button id="pwa-btn-instalar">Instalar</button>
        <button id="pwa-btn-fechar">Agora não</button>
      </div>
    `;

    document.body.appendChild(banner);

    document.getElementById('pwa-btn-instalar').addEventListener('click', async () => {
      if (!deferredPrompt) return;
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log('[PWA] Escolha do usuário:', outcome);
      deferredPrompt = null;
      removerBanner('pwa-install-banner');
    });

    document.getElementById('pwa-btn-fechar').addEventListener('click', () => {
      removerBanner('pwa-install-banner');
      // Não mostra de novo por 3 dias
      localStorage.setItem('pwa_banner_dismissed', Date.now());
    });
  }

  // ─── 3. Notificações Push ────────────────────────────────
  // Chave VAPID pública — gere a sua em: https://vapidkeys.com
  // ou via: npx web-push generate-vapid-keys
  const VAPID_PUBLIC_KEY = 'SUBSTITUA_PELA_SUA_CHAVE_VAPID_PUBLICA';

  window.PWA = {
    /**
     * Pede permissão e inscreve o usuário nas notificações push.
     * Chame isso em um clique de botão (não automaticamente).
     * @returns {Promise<PushSubscription|null>}
     */
    async ativarNotificacoes() {
      if (!('Notification' in window) || !('PushManager' in window)) {
        alert('Seu navegador não suporta notificações push.');
        return null;
      }

      const permissao = await Notification.requestPermission();
      if (permissao !== 'granted') {
        console.warn('[PWA] Permissão negada para notificações.');
        return null;
      }

      const reg = await navigator.serviceWorker.ready;
      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });

      console.log('[PWA] Inscrito nas notificações:', JSON.stringify(subscription));
      // ↑ Envie este objeto para seu servidor para salvar e disparar push depois

      return subscription;
    },

    /**
     * Envia uma notificação de teste local (sem servidor).
     */
    async testarNotificacao() {
      if (Notification.permission !== 'granted') {
        await this.ativarNotificacoes();
      }
      const reg = await navigator.serviceWorker.ready;
      reg.showNotification('🍱 QG Marmitas', {
        body: 'Seu pedido está a caminho! 🛵',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-72x72.png',
        vibrate: [200, 100, 200],
        tag: 'teste',
        actions: [
          { action: 'open', title: '📋 Ver Pedido' },
        ],
      });
    },
  };

  // ─── 4. Banner de atualização disponível ─────────────────
  function mostrarBannerAtualizacao() {
    const banner = document.createElement('div');
    banner.id = 'pwa-update-banner';
    banner.innerHTML = `
      <style>
        #pwa-update-banner {
          position: fixed; top: 1rem; left: 50%; transform: translateX(-50%);
          background: #1a0a00; border: 1px solid #e85d04; border-radius: 0.75rem;
          padding: 0.75rem 1.25rem; display: flex; align-items: center; gap: 1rem;
          box-shadow: 0 4px 20px rgba(0,0,0,0.5); z-index: 99999; font-family: sans-serif;
          color: #fff; font-size: 0.88rem; width: calc(100% - 2rem); max-width: 380px;
        }
        #pwa-update-banner button {
          background: #e85d04; color: #fff; border: none; border-radius: 999px;
          padding: 0.4rem 1rem; font-size: 0.82rem; cursor: pointer; font-weight: 700;
          white-space: nowrap;
        }
      </style>
      <span>🆕 Nova versão disponível!</span>
      <button onclick="window.location.reload()">Atualizar</button>
    `;
    document.body.appendChild(banner);
  }

  function removerBanner(id) {
    const el = document.getElementById(id);
    if (el) el.remove();
  }

  // ─── Utils ───────────────────────────────────────────────
  function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = atob(base64);
    return new Uint8Array([...rawData].map(c => c.charCodeAt(0)));
  }

  // ─── Online/Offline feedback visual ──────────────────────
  function mostrarStatusConexao(online) {
    const id = 'pwa-conexao-toast';
    let toast = document.getElementById(id);
    if (!toast) {
      toast = document.createElement('div');
      toast.id = id;
      toast.style.cssText = `
        position:fixed; bottom:5rem; left:50%; transform:translateX(-50%);
        padding:0.5rem 1.25rem; border-radius:999px; font-size:0.85rem;
        font-family:sans-serif; font-weight:700; z-index:99999;
        transition: opacity 0.3s; pointer-events:none;
      `;
      document.body.appendChild(toast);
    }

    toast.textContent = online ? '✅ Conexão restaurada' : '📵 Sem conexão';
    toast.style.background = online ? '#166534' : '#7f1d1d';
    toast.style.color = '#fff';
    toast.style.opacity = '1';

    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => { toast.style.opacity = '0'; }, 3000);
  }

  window.addEventListener('online', () => mostrarStatusConexao(true));
  window.addEventListener('offline', () => mostrarStatusConexao(false));

})();
