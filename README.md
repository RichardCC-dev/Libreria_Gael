# Sistema de Gestión de Útiles Escolares 📚

Aplicación móvil desarrollada con React Native y Expo para la gestión de útiles escolares.

## 🚀 Inicio Rápido

### Prerrequisitos

- Node.js instalado (versión 18 o superior)
- Android Studio con emulador configurado
- Expo Go instalado en el dispositivo/emulador Android

### Instalación

1. **Instalar dependencias**

   ```bash
   npm install
   ```

2. **Iniciar el servidor de desarrollo**

   ```bash
   npm start
   # o
   npx expo start
   ```

### Ejecutar en Android Studio (Emulador)

1. **Asegúrate de que el emulador esté corriendo**
   - Abre Android Studio
   - Inicia un emulador Android (AVD)

2. **Inicia Expo con Android**

   ```bash
   npm run android
   # o
   npx expo start --android
   ```

3. **Alternativa: Usar Expo Go manualmente**
   - Ejecuta `npx expo start`
   - Escanea el código QR con Expo Go (si estás en dispositivo físico)
   - O presiona `a` en la terminal para abrir en el emulador Android

### Generar APK para pruebas (compartir con el equipo)

Para generar un APK que puedas distribuir a tu equipo para pruebas en dispositivos físicos:

1. **Instalar EAS CLI** (si no lo tienes):
   ```bash
   npm install -g eas-cli
   ```

2. **Iniciar sesión en Expo** (cuenta gratuita en [expo.dev](https://expo.dev)):
   ```bash
   eas login
   ```

3. **Generar el APK**:
   ```bash
   eas build -p android --profile preview
   ```

4. Una vez completado el build, recibirás una **URL de descarga**. Comparte ese enlace con tu equipo: pueden abrirlo desde el celular, descargar el APK e instalarlo directamente.

> **Nota:** El primer build puede tardar varios minutos. EAS Build compila en la nube de Expo.

### Estructura del Proyecto

```
sistema_gestion_utiles/
├── app/                    # Pantallas (Expo Router)
│   ├── index.tsx          # Pantalla principal
│   ├── register.tsx       # Registro de usuarios (HU1)
│   └── login.tsx          # Login de usuarios
├── components/             # Componentes reutilizables
│   └── ui/                # Componentes UI
│       ├── Button.tsx
│       └── Input.tsx
├── services/              # Servicios de API
│   └── authService.ts     # Servicio de autenticación (mock)
├── constants/             # Constantes y temas
│   └── theme.ts           # Sistema de diseño
└── docs/                  # Documentación
    ├── user_stories.md    # Historias de usuario
    ├── diseño.md         # Sistema de diseño
    ├── seguimiento-control.md  # DoD e Incremento del Producto
    └── stack_tecnologico.md
```

### Configuración para Expo Go

El proyecto está configurado con:
- **Package name de Android**: `com.sistemagestionutiles.app`
- **Esquema**: `sistemagestionutiles`
- **Colores del diseño**: #1A73E8 (primario), #F59E0B (secundario)

### Pantallas Disponibles

- **Pantalla Principal** (`/`): Muestra opciones para registrarse o iniciar sesión
- **Registro** (`/register`): Formulario de registro de usuarios (Historia de Usuario 1)
- **Login** (`/login`): Pantalla de inicio de sesión (pendiente de implementar - HU2)

### Desarrollo

Puedes empezar a desarrollar editando los archivos dentro del directorio **app**. Este proyecto usa [file-based routing](https://docs.expo.dev/router/introduction) con Expo Router.

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
