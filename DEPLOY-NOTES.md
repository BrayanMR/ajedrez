# Despliegue (Render Backend + Netlify Frontend)

## 1) Render (backend)
- Deployar la carpeta `backend/`.
- Endpoint esperado:
  - HTTP: `https://TU_BACKEND.onrender.com/api/...`
  - WS (Socket.io): `https://TU_BACKEND.onrender.com`

## 2) Netlify (frontend - Angular)
- Build: `npm run build`
- Publish directory: `dist/aljedrez/browser`

## 3) Conectar frontend ↔ backend
Archivo: `src/app/config/api.config.ts`
- Reemplazar:
  - `API_BASE_URL` por `https://TU_BACKEND.onrender.com/api`
  - `WS_BASE_URL` por `https://TU_BACKEND.onrender.com`

Nota: tu `api.config.ts` actualmente está en `http://localhost`. Cámbialo antes de hacer el build para Netlify.


Luego ejecutar:
- `npm run build`
- subir a Netlify.

## 4) URLs que se usan
Se actualizan en:
- `src/app/services/auth.service.ts`
- `src/app/services/usuario.service.ts`
- `src/app/services/partida.service.ts`
- `src/app/services/movimiento.service.ts`
- `src/app/services/ranking.service.ts`
- `src/app/services/websocket.service.ts`

