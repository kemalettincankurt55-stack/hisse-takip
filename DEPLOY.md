# 🚀 Yayına Alma Rehberi

Uygulama iki parçadan oluşur:
1. **Uygulama** (Expo) — telefon/web.
2. **Veri proxy'si** (`server/`) — fiyat, haber, sosyal, BIST movers ve AI'ı tek yerden, güvenli şekilde sağlar.

Proxy'yi internette bir yere koymadan, uygulama yalnızca senin bilgisayarında çalışır. Aşağıdaki adımlar proxy'yi ücretsiz yayına alır.

---

## Adım 1 — Kodu GitHub'a koy
```bash
git init
git add .
git commit -m "İlk sürüm"
# GitHub'da boş bir repo aç, sonra:
git remote add origin https://github.com/KULLANICI/REPO.git
git branch -M main
git push -u origin main
```
> `.env` dosyası `.gitignore`'da olduğu için **anahtarların GitHub'a gitmez** (güvenli).

## Adım 2 — Render'da proxy'yi dağıt (ücretsiz)
1. https://render.com → GitHub ile giriş yap.
2. **New → Blueprint** → bu repo'yu seç (kökteki `render.yaml`'ı otomatik bulur).
   - Alternatif: **New → Web Service** → repo seç → **Root Directory: `server`** → Start command: `node socialProxy.mjs` → Plan: Free.
3. **Environment** sekmesinde gizli anahtarı gir:
   - `GEMINI_API_KEY` = (senin Gemini anahtarın)
   - (opsiyonel) `REDDIT_CLIENT_ID`, `REDDIT_CLIENT_SECRET`
4. **Deploy**. Birkaç dakikada şöyle bir adres verir: `https://hisse-takip-proxy.onrender.com`

## Adım 3 — Uygulamayı proxy'ye bağla
`.env` dosyasında:
```
EXPO_PUBLIC_SOCIAL_PROXY=https://hisse-takip-proxy.onrender.com
```
Uygulamayı yeniden başlat (`npm run web` / `npm start`). Artık her cihazdan çalışır.

## Adım 4 — Test
```
https://<proxy-adresin>/health        -> {"ok":true}
https://<proxy-adresin>/ai            -> {"configured":true}
https://<proxy-adresin>/prices?symbol=ASELS&exchange=BIST
https://<proxy-adresin>/movers?market=bist&limit=5
```

---

## Notlar
- **Render Free** 15 dk hareketsizlikte uyur; ilk istek ~30 sn gecikir. Kalıcı uyanık + bol limit isteniyorsa **Cloudflare Workers** (kod uyarlaması gerekir) tercih edilebilir.
- **Telefon paketi (APK/IPA) + gerçek push bildirimi** için EAS: `npx eas build` (ayrı Expo hesabı gerekir).
- Proxy'nin hiç npm bağımlılığı yoktur (saf Node) — dağıtım hızlı ve hafiftir.
