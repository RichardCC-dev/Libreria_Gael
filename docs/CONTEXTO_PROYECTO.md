# Contexto Completo del Proyecto — Sistema de Gestión de Útiles Escolares


## 1. Resumen Ejecutivo

**Nombre:** Sistema de Gestión de Útiles Escolares (Librería Gael)  
**Tipo:** Aplicación móvil multiplataforma  
**Propósito:** Gestión de venta y reserva de útiles escolares para una tienda (librería). Incluye: gestión de usuarios, inventario, catálogo, reservas, ventas, y reseñas.  
**Contexto:** Proyecto desarrollado en el marco del Taller de Desarrollo Móvil — enfoque académico.

---

## 2. Stack Tecnológico

| Capa | Tecnología | Detalles |
|------|------------|----------|
| **Frontend (Mobile)** | React Native + Expo | JavaScript/TypeScript, Expo Router (file-based routing) |
| **Estilos** | React Navigation theme | Colores primario #1A73E8, secundario #F59E0B |
| **Estado** | Context API | AuthContext para usuario autenticado |
| **Navegación** | Expo Router | Stack + Bottom Tabs según rol |
| **Persistencia local** | expo-secure-store | Tokens JWT, sesión |
| **Backend** | Node.js + Express | API REST |
| **Base de datos** | MySQL | Localhost (dev) / Railway (prod) |
| **ORM** | Sequelize | Modelos y migraciones |
| **Autenticación** | JWT | bcryptjs para contraseñas |
| **Impresión** | expo-print | Boletas y comprobantes |
| **Build** | EAS Build | APK Android, TestFlight iOS |

---

## 3. Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                    App Móvil (React Native / Expo)           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │ Presentation │  │ Business    │  │ Data Source         │  │
│  │ (app/,       │  │ (hooks,     │  │ (services/*.ts,     │  │
│  │  components/)│  │  contexts)   │  │  lib/api.ts)        │  │
│  └─────────────┘  └─────────────┘  └──────────┬──────────┘  │
└───────────────────────────────────────────────┼─────────────┘
                                                │ HTTP/HTTPS
                                                ▼
┌─────────────────────────────────────────────────────────────┐
│                    Backend (Node.js + Express)               │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │ Routes      │  │ Middleware  │  │ Models (Sequelize)  │  │
│  │ /api/*      │  │ auth.js     │  │ User, Product, etc. │  │
│  └─────────────┘  └─────────────┘  └──────────┬──────────┘  │
└───────────────────────────────────────────────┼─────────────┘
                                                │
                                                ▼
┌─────────────────────────────────────────────────────────────┐
│                    MySQL (MySQL2 driver)                     │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. Estructura del Proyecto

```
sistema_gestion_utiles/
├── app/                          # Pantallas (Expo Router)
│   ├── _layout.tsx               # Layout raíz, AuthProvider, Stack
│   ├── index.tsx                 # Pantalla principal (login/registro)
│   ├── register.tsx              # Registro (HU1)
│   ├── login.tsx                 # Login (HU2)
│   ├── forgot-password.tsx       # Recuperar contraseña (HU3)
│   ├── verify-code.tsx           # Verificar código
│   ├── reset-password.tsx        # Nueva contraseña
│   ├── dashboard.tsx             # Dashboard según rol
│   ├── admin/                    # Panel administrador
│   │   ├── _layout.tsx
│   │   ├── empleados.tsx         # Empleados (HU18)
│   │   └── asistencia.tsx        # Control asistencia (HU19)
│   ├── inventario/               # Gestión inventario
│   │   ├── _layout.tsx
│   │   ├── index.tsx             # Lista productos
│   │   ├── registrar-producto.tsx
│   │   ├── editar-producto.tsx
│   │   ├── registrar-prestamo.tsx # Productos prestados (HU15)
│   │   └── productos-prestados.tsx
│   ├── catalogo/                 # Catálogo (HU7)
│   │   ├── _layout.tsx
│   │   └── index.tsx
│   ├── mis-reservas/             # Cliente: reservas
│   │   ├── _layout.tsx
│   │   ├── index.tsx             # Lista reservas (HU9)
│   │   └── crear.tsx             # Crear reserva (HU8)
│   ├── reservas/                 # Empleado: gestión reservas
│   │   ├── _layout.tsx
│   │   ├── index.tsx             # Lista reservas (HU10)
│   │   └── [id].tsx              # Detalle reserva
│   ├── ventas/                   # Ventas (HU11, HU12, HU13, HU14)
│   │   ├── _layout.tsx
│   │   ├── index.tsx
│   │   ├── boleta-previa.tsx
│   │   ├── comprobante.tsx
│   │   └── historial.tsx
│   ├── resenas/                  # Reseñas (HU16)
│   │   ├── _layout.tsx
│   │   └── index.tsx
│   └── perfil/                   # Perfil (HU17, HU4)
│       ├── _layout.tsx
│       └── index.tsx
├── components/
│   └── ui/
│       ├── Button.tsx
│       └── Input.tsx
├── contexts/
│   └── AuthContext.tsx
├── services/                     # Servicios API
│   ├── authService.ts
│   ├── productService.ts
│   ├── reservationService.ts
│   ├── saleService.ts
│   ├── reviewService.ts
│   ├── borrowedProductService.ts
│   └── employeeAttendanceService.ts
├── constants/
│   └── theme.ts
├── lib/
│   └── api.ts                    # Cliente Axios configurado
├── backend/
│   ├── src/
│   │   ├── index.js              # Entry point
│   │   ├── config/
│   │   │   └── database.js
│   │   ├── middleware/
│   │   │   └── auth.js
│   │   ├── models/
│   │   │   ├── index.js
│   │   │   ├── User.js
│   │   │   ├── Product.js
│   │   │   ├── Reservation.js
│   │   │   ├── ReservationItem.js
│   │   │   ├── Sale.js
│   │   │   ├── SaleItem.js
│   │   │   ├── Review.js
│   │   │   ├── BorrowedProduct.js
│   │   │   ├── PasswordRecoveryCode.js
│   │   │   └── EmployeeAttendance.js
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── products.js
│   │   │   ├── borrowedProducts.js
│   │   │   ├── reservations.js
│   │   │   ├── sales.js
│   │   │   ├── reviews.js
│   │   │   └── attendance.js
│   │   └── scripts/
│   │       ├── create-database.js
│   │       ├── sync-db.js
│   │       └── seed.js
│   ├── package.json
│   └── .env.example
├── docs/
│   ├── user_stories.md           # Historias de usuario
│   ├── modelo_datos.md           # Modelo de datos
│   ├── diseño.md                 # Sistema de diseño
│   ├── stack_tecnologico.md
│   ├── CALIDAD_Y_REGLAS.md       # Definition of Done
│   ├── INCREMENTO_PRODUCTO.md    # Incremento Sprint
│   ├── seguimiento-control.md
│   ├── DEPLOY_RAILWAY.md         # Despliegue en Railway
│   ├── casos_de_prueba.md        # Casos de prueba
│   ├── reporte_pruebas_sprint.md
│   ├── evidencia_pruebas.md
│   ├── evidencias/               # Carpeta para capturas/videos
│   └── CONTEXTO_PROYECTO.md      # Este documento
├── package.json
├── app.json
├── eas.json
└── .env.example
```

---

## 5. Modelo de Datos (Resumen)

### Entidades principales

| Tabla | Descripción |
|-------|-------------|
| `users` | Usuarios (email, password, name, role: cliente | empleado | administrador) |
| `products` | Productos (nombre, categoría, descripción, precio, stock, tipo: propio | prestado) |
| `categories` | Categorías (opcional) |
| `borrowed_products` | Productos prestados de otras tiendas (HU15) |
| `reservations` | Reservas (cliente_id, total, estado, mensaje_empleado, tiempo_entrega_dias) |
| `reservation_items` | Detalle de reserva (producto_id, cantidad, precio_unitario) |
| `sales` | Ventas (empleado_id, reservation_id opcional, total, descuento, fecha) |
| `sale_items` | Detalle de venta |
| `reviews` | Reseñas (user_id, comentario, calificacion 1-5) |
| `password_recovery_codes` | Códigos de recuperación (email, code, expires_at, used) |
| `employee_attendance` | Control de asistencia (empleado_id, fecha, hora_entrada, hora_salida) |

### Estados de reserva

```
por_confirmar → (empleado acepta) → pendiente
por_confirmar → (cliente/empleado cancela ≤24h) → cancelado
pendiente → (empleado confirma pago) → confirmada
pendiente → (empleado cancela) → cancelado
```

### Reglas de negocio clave

- Monto mínimo reserva: S/ 70.00
- Cliente puede cancelar reserva solo dentro de 24 horas
- Stock se descuenta al confirmar venta; vuelve al cancelar reserva
- Productos prestados: tabla independiente, estado pendiente | cancelado

---

## 6. API REST (Endpoints)

| Base | Rutas | Descripción |
|------|-------|-------------|
| `/api/health` | GET | Health check |
| `/api/auth` | POST login, register, forgot-password, verify-code, reset-password | Autenticación |
| `/api/products` | CRUD | Productos |
| `/api/borrowed-products` | CRUD | Productos prestados |
| `/api/reservations` | CRUD | Reservas |
| `/api/sales` | CRUD | Ventas |
| `/api/reviews` | POST, GET | Reseñas |
| `/api/attendance` | CRUD | Control de asistencia |

Autenticación: Bearer token JWT en header `Authorization`.

---

## 7. Historias de Usuario (Resumen)

| ID | Épica | Historia | Prioridad |
|----|-------|----------|-----------|
| HU1 | Usuarios | Registro con email y contraseña | Alta |
| HU2 | Usuarios | Inicio de sesión por rol | Alta |
| HU3 | Usuarios | Recuperación de contraseña | Alta |
| HU4 | Usuarios | Cerrar sesión | Alta |
| HU5 | Inventario | Registrar productos (admin) | Alta |
| HU6 | Inventario | Editar y eliminar productos | Alta |
| HU7 | Catálogo | Visualizar catálogo, filtros, búsqueda | Alta |
| HU8 | Reservas | Reservar productos (mín S/70) | Alta |
| HU9 | Reservas | Ver estado de reservas | Alta |
| HU10 | Reservas | Empleado: confirmar/rechazar reservas | Alta |
| HU11 | Ventas | Registrar venta | Alta |
| HU12 | Ventas | Historial de ventas (admin) | Media |
| HU13 | Ventas | Boleta previa con descuento | Media |
| HU14 | Ventas | Boleta y PDF al vender | Media |
| HU15 | Inventario | Productos prestados | Media |
| HU16 | Reseñas | Reseñas y feedback | Media |
| HU17 | Usuarios | Cambiar correo desde perfil | Media |
| HU18 | Usuarios | Admin: agregar empleados | Alta |
| HU19 | Usuarios | Control de asistencia | Alta |

---

## 8. Sistema de Diseño

| Elemento | Valor | Uso |
|----------|-------|-----|
| Primario | #1A73E8 | Botones, cabeceras |
| Secundario | #F59E0B | Alertas, métricas |
| Fondo | #F8F9FA | Fondo app |
| Superficie | #FFFFFF | Cards, formularios |
| Texto principal | #0F172A | Títulos |
| Texto suave | #64748B | Subtítulos |
| Bordes | #E2E8F0 | Líneas, inputs |

- **Tipografía:** Inter o Roboto (Sans-serif)
- **Bordes:** 12px o 8px (redondeados)
- **Inputs:** Borde #E2E8F0, fondo #F8F9FA

---


## 9. Despliegue

- **Backend:** Railway (Node.js + MySQL)
- **Variables:** NODE_ENV, JWT_SECRET, MYSQL_URL
- **App móvil:** Configurar `EXPO_PUBLIC_API_URL` con la URL de Railway
- **Build:** `eas build -p android --profile production` (o preview para APK)

---

## 10. Configuración Local

**Backend:**
```bash
cd backend
npm install
# Crear .env con MYSQL_URL, JWT_SECRET, etc.
npm run db:setup   # create-db + sync + seed
npm run dev
```

**App móvil:**
```bash
npm install
# .env con EXPO_PUBLIC_API_URL=http://localhost:3000 (o IP del backend)
npm start
```

---

