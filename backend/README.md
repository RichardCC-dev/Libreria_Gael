# Backend - Librería Gael

API REST con Node.js, Express, Sequelize y **MySQL en localhost**.

## Requisitos

- Node.js 18+
- MySQL 8+ instalado y corriendo en localhost
- Base de datos `libreria_gael` creada (o el script la creará si tienes permisos)

## Configuración

### 1. Crear la base de datos en MySQL

```sql
CREATE DATABASE libreria_gael CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

O desde la terminal:
```bash
mysql -u root -p -e "CREATE DATABASE libreria_gael;"
```

### 2. Configurar variables de entorno

```bash
cp .env.example .env
```

Edita `.env` con tus credenciales de MySQL:

```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=libreria_gael
DB_USER=root
DB_PASSWORD=tu_password

JWT_SECRET=clave_secreta_para_jwt
PORT=3000
```

### 3. Instalar dependencias

```bash
cd backend
npm install
```

### 4. Crear tablas

```bash
npm run db:sync
```

Este comando crea todas las tablas según el modelo de datos.

### 5. Datos de prueba (opcional)

```bash
npm run db:seed
```

Crea usuarios de prueba:
- admin@test.com / admin123
- empleado@test.com / empleado123
- cliente@test.com / cliente123

### 6. Iniciar el servidor

```bash
npm run dev
```

O en producción:
```bash
npm start
```

La API estará en `http://localhost:3000`

## Estructura

```
backend/
├── src/
│   ├── config/       # Configuración de BD
│   ├── models/       # Modelos Sequelize
│   ├── routes/       # Rutas API (por implementar)
│   ├── scripts/      # sync-db, seed
│   └── index.js      # Servidor Express
├── .env.example
├── package.json
└── README.md
```

## Próximos pasos

- Implementar rutas de autenticación (login, register, etc.)
- Implementar rutas de productos, reservas, ventas
- Conectar la app móvil al API en lugar de los mocks
