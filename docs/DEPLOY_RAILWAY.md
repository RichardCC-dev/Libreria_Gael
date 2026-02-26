# Desplegar en Railway

Guía para desplegar el backend de **Librería Gael** en Railway.

## Requisitos previos

- Cuenta en [Railway](https://railway.app) (conectar con GitHub)
- Repositorio del proyecto en GitHub

---

## Paso 1: Crear proyecto en Railway

1. Entra a [railway.app](https://railway.app) e inicia sesión con GitHub.
2. Clic en **"New Project"**.
3. Selecciona **"Deploy from GitHub repo"** y conecta tu repositorio.
4. Elige el repo `sistema_gestion_utiles`.

---

## Paso 2: Añadir MySQL

1. En el proyecto, clic en **"+ New"** o **"Add Service"**.
2. Elige **"Database"** → **"MySQL"**.
3. Railway creará el servicio MySQL y expondrá variables como `MYSQL_URL`, `MYSQLHOST`, etc.

---

## Paso 3: Configurar el backend

1. Selecciona el servicio de tu app (el que viene del repo).
2. En **Settings** → **Root Directory**: pon `backend`.
3. En **Settings** → **Build Command**: `npm run build` (sincroniza tablas).
4. En **Settings** → **Start Command**: `npm start`.

---

## Paso 4: Variables de entorno

En **Variables** del servicio de la app, añade:

| Variable | Valor | Notas |
|----------|-------|-------|
| `NODE_ENV` | `production` | Obligatorio |
| `JWT_SECRET` | *(genera una clave segura)* | Ej: `openssl rand -hex 32` |
| `MYSQL_URL` | `${{MySQL.MYSQL_URL}}` | Referencia al servicio MySQL |
| `PORT` | *(Railway lo asigna)* | No hace falta definirlo |

Para referenciar MySQL:
- Clic en **"+ New Variable"**
- Nombre: `MYSQL_URL`
- Valor: `${{MySQL.MYSQL_URL}}` (reemplaza `MySQL` por el nombre de tu servicio MySQL si es distinto)

---

## Paso 5: Dominio público

1. En el servicio de la app, ve a **Settings** → **Networking**.
2. Clic en **"Generate Domain"**.
3. Copia la URL (ej: `https://tu-app.up.railway.app`).

---

## Paso 6: Conectar la app móvil

La app usa `EXPO_PUBLIC_API_URL` en producción. Opciones:

**Opción A – Archivo `.env`** (en la raíz del proyecto):
```
EXPO_PUBLIC_API_URL=https://tu-app.up.railway.app
```

**Opción B – En `eas.json`** (para EAS Build):
```json
"production": {
  "env": {
    "EXPO_PUBLIC_API_URL": "https://tu-app.up.railway.app"
  },
  "android": { "buildType": "app-bundle" }
}
```

Luego genera el build:
```bash
eas build --platform android --profile production
```

---

## Paso 7: Seed inicial (opcional)

Para cargar usuarios de prueba la primera vez:

1. En Railway, abre el servicio de la app.
2. Ve a **Settings** → **Deploy**.
3. Ejecuta un comando one-off o usa la consola:

```bash
npm run db:seed
```

O añade un script de deploy que ejecute el seed solo la primera vez (por ejemplo con una variable `SEED_DONE`).

---

## Resumen de URLs

- **API**: `https://tu-dominio.up.railway.app`
- **Health**: `https://tu-dominio.up.railway.app/api/health`
- **Login**: `POST https://tu-dominio.up.railway.app/api/auth/login`

---

## Solución de problemas

### Error de conexión a MySQL
- Comprueba que `MYSQL_URL` o las variables `MYSQL*` estén bien referenciadas.
- Asegúrate de que el servicio MySQL esté desplegado antes que la app.

### CORS
- El backend permite todos los orígenes para apps móviles.
- Si usas web, puedes restringir en `backend/src/index.js`.

### Puerto
- Railway asigna `PORT` automáticamente; no definas `PORT=3000` en producción.
