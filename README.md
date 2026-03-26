# 🍱 PWA — QG Marmitas
**100% gratuito e open source**

---

## 📁 Estrutura dos arquivos

```
qgmarmitas.online/          ← raiz do seu site
├── manifest.json           ← metadados do app
├── sw.js                   ← service worker (cache + push)
├── offline.html            ← página exibida sem internet
├── pwa-init.js             ← script de inicialização
├── icons/                  ← ícones gerados
│   ├── icon-72x72.png
│   ├── icon-96x96.png
│   ├── icon-128x128.png
│   ├── icon-144x144.png
│   ├── icon-152x152.png
│   ├── icon-192x192.png
│   ├── icon-384x384.png
│   └── icon-512x512.png
└── screenshots/
    └── mobile.png          ← opcional (print da tela do site)
```

---

## 🚀 Passo a passo

### 1. Gerar os ícones

```bash
pip install Pillow
python gerar-icones.py --input sua-logo.png
```

> Se não tiver logo, rode sem `--input` e será gerado um ícone padrão.

---

### 2. Adicionar as tags no `<head>` do seu `index.html`

```html
<!-- PWA: Manifest -->
<link rel="manifest" href="/manifest.json" />

<!-- PWA: Cor da barra de status no Android -->
<meta name="theme-color" content="#e85d04" />

<!-- PWA: Suporte iOS -->
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
<meta name="apple-mobile-web-app-title" content="QG Marmitas" />
<link rel="apple-touch-icon" href="/icons/icon-192x192.png" />

<!-- PWA: Windows/Edge -->
<meta name="msapplication-TileImage" content="/icons/icon-144x144.png" />
<meta name="msapplication-TileColor" content="#e85d04" />
```

---

### 3. Adicionar o script no final do `<body>` do seu `index.html`

```html
<script src="/pwa-init.js"></script>
```

---

### 4. Fazer o upload dos arquivos para o servidor

Copie para a **raiz** do seu site (mesma pasta do `index.html`):
- `manifest.json`
- `sw.js`
- `offline.html`
- `pwa-init.js`
- pasta `icons/`

---

## 🔔 Ativar Notificações Push (opcional)

### Gerar chaves VAPID (gratuito)

```bash
# Opção A: online (mais fácil)
# Acesse: https://vapidkeys.com

# Opção B: via Node.js
npx web-push generate-vapid-keys
```

Você vai receber uma **chave pública** e uma **chave privada**.

### Configurar

1. No arquivo `pwa-init.js`, substitua:
   ```js
   const VAPID_PUBLIC_KEY = 'SUBSTITUA_PELA_SUA_CHAVE_VAPID_PUBLICA';
   ```
   pela sua chave pública VAPID.

2. No seu servidor (backend), use a chave **privada** para disparar pushes.
   Exemplos de bibliotecas:
   - **Node.js**: `npm install web-push`
   - **PHP**: `composer require minishlink/web-push`
   - **Python**: `pip install pywebpush`

### Ativar no app (chamada no frontend)

```js
// Chame isso em um clique de botão
document.getElementById('btn-notificacoes').addEventListener('click', () => {
  window.PWA.ativarNotificacoes();
});
```

### Testar notificação local (sem servidor)

```js
window.PWA.testarNotificacao();
```

---

## ✅ Checklist final

- [ ] Arquivos copiados para a raiz do servidor
- [ ] Tags PWA adicionadas no `<head>` do `index.html`
- [ ] Script `pwa-init.js` adicionado no final do `<body>`
- [ ] Site servido em **HTTPS** (obrigatório para PWA)
- [ ] Ícones gerados e na pasta `icons/`
- [ ] Testar no Chrome: DevTools → Application → Manifest ✅
- [ ] Testar no celular: "Adicionar à tela inicial" aparece

---

## 🛠️ Testar localmente

```bash
# Instalar servidor HTTPS local (gratuito)
npx serve . --ssl
```

Ou use a extensão **Web Server for Chrome** / **Live Server** no VS Code.

---

## 📊 Verificar a nota PWA

Acesse **Chrome DevTools → Lighthouse → Progressive Web App**
e rode a auditoria — você deve atingir 100% ✅

---

## 💡 Dicas extras

| Problema | Solução |
|---|---|
| Service Worker não atualiza | Abra DevTools → Application → SW → "Skip waiting" |
| iOS não mostra "Instalar" | iOS não tem prompt automático — adicione um botão manual com instruções |
| Push não funciona | Verifique se o site está em HTTPS e a chave VAPID está correta |
| Cache muito agressivo | Mude `CACHE_NAME = 'qgmarmitas-v2'` para forçar atualização |

---

## 📄 Licença

MIT — use, modifique e distribua livremente.
