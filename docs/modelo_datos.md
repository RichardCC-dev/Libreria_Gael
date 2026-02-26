# Modelo de Datos Inicial - Sistema de Gestión de Útiles Escolares

## Diagrama de Relaciones (ER simplificado)

```
┌──────────────┐     ┌──────────────────┐     ┌─────────────────┐
│    User      │────<│   Reservation    │     │  BorrowedProduct│
│              │     │   (Reserva)      │     │  (Prestado)     │
└──────┬───────┘     └────────┬─────────┘     └────────┬────────┘
       │                      │                        │
       │              ┌───────┴───────┐                │
       │              │               │                │
       │              v               v                v
       │     ┌───────────────────────────────────────────────┐
       │     │              Product (Producto)               │
       │     └───────────────────────────────────────────────┘
       │                      ▲
       │                      │
       │     ┌────────────────┴────────────────┐
       │     │                                 │
       v     v                                 v
┌──────────────┐     ┌──────────────────┐     ┌──────────────┐
│     Sale     │     │  ReservationItem │     │   Review     │
│   (Venta)    │     │  SaleItem        │     │  (Reseña)    │
└──────────────┘     └──────────────────┘     └──────────────┘
```

---

## 1. Entidades Principales (Tablas)

### 1.1 `users` (Usuarios)

| Campo        | Tipo        | Restricciones                          | Descripción                             |
|-------------|-------------|----------------------------------------|-----------------------------------------|
| `id`        | `UUID` / `STRING` | PK, NOT NULL, UNIQUE              | Identificador único del usuario          |
| `email`     | `VARCHAR(255)`    | NOT NULL, UNIQUE, INDEX            | Correo electrónico                       |
| `password`  | `VARCHAR(255)`    | NOT NULL                            | Contraseña hasheada (bcrypt)             |
| `name`      | `VARCHAR(120)`    | NULL                                | Nombre del usuario                       |
| `role`      | `ENUM`            | NOT NULL, DEFAULT 'cliente'         | `cliente` \| `empleado` \| `administrador`|
| `created_at`| `TIMESTAMP`       | NOT NULL, DEFAULT NOW()            | Fecha de registro                        |
| `updated_at`| `TIMESTAMP`       | NULL                                | Última actualización                     |

**Índices:** `email` (único), `role`.

---

### 1.2 `categories` (Categorías) – Opcional / Normalización

| Campo        | Tipo        | Restricciones                  | Descripción                     |
|-------------|-------------|-------------------------------|---------------------------------|
| `id`        | `UUID` / `STRING` | PK, NOT NULL, UNIQUE      | Identificador de la categoría   |
| `nombre`    | `VARCHAR(80)`     | NOT NULL, UNIQUE           | Ej: Papelería, Escritura, etc. |
| `created_at`| `TIMESTAMP`       | NOT NULL                   | Fecha de creación               |

**Alternativa:** Si se mantiene `categoria` como string en `products`, no se requiere esta tabla.

---

### 1.3 `products` (Productos)

| Campo         | Tipo           | Restricciones              | Descripción                              |
|---------------|----------------|----------------------------|------------------------------------------|
| `id`          | `UUID` / `STRING` | PK, NOT NULL, UNIQUE   | Identificador del producto               |
| `nombre`      | `VARCHAR(200)`    | NOT NULL                 | Nombre del producto                      |
| `categoria`   | `VARCHAR(80)`     | NOT NULL                 | Categoría (o FK a `categories.id`)       |
| `descripcion` | `TEXT`            | NULL, DEFAULT ''          | Descripción detallada                    |
| `precio`      | `DECIMAL(10,2)`   | NOT NULL, >= 0           | Precio unitario en soles (S/)            |
| `stock`       | `INTEGER`         | NOT NULL, DEFAULT 0, >= 0 | Cantidad disponible                      |
| `tipo`        | `ENUM`            | DEFAULT 'propio'          | `propio` \| `prestado` (HU11)            |
| `created_at`  | `TIMESTAMP`       | NOT NULL                 | Fecha de creación                        |
| `updated_at`  | `TIMESTAMP`       | NULL                      | Última actualización                     |

**Índices:** `categoria`, `stock`, `tipo`.

---

### 1.4 `borrowed_products` (Productos prestados) – HU11

| Campo           | Tipo           | Restricciones           | Descripción                             |
|-----------------|----------------|-------------------------|-----------------------------------------|
| `id`            | `UUID` / `STRING` | PK, NOT NULL, UNIQUE | Identificador del artículo prestado     |
| `product_id`    | `UUID` / `STRING` | FK → products.id, NULL | Producto asociado (si aplica)           |
| `nombre`        | `VARCHAR(200)`    | NOT NULL              | Nombre del producto                     |
| `stock`         | `INTEGER`         | NOT NULL, >= 0        | Cantidad prestada                       |
| `precio`        | `DECIMAL(10,2)`   | NOT NULL, >= 0        | Precio en soles                         |
| `codigo_tienda` | `VARCHAR(50)`     | NOT NULL              | Código/número de la tienda prestadora   |
| `fecha_prestamo`| `DATE`            | NOT NULL              | Fecha del préstamo                      |
| `estado`        | `ENUM`            | NOT NULL              | `pendiente` \| `cancelado`              |
| `empleado_id`   | `UUID` / `STRING` | FK → users.id         | Empleado que registró el préstamo       |
| `created_at`    | `TIMESTAMP`       | NOT NULL              | Fecha de registro                       |
| `updated_at`    | `TIMESTAMP`       | NULL                  | Última actualización                    |

**Índices:** `estado`, `fecha_prestamo`, `codigo_tienda`.

---

### 1.5 `reservations` (Reservas)

| Campo               | Tipo           | Restricciones           | Descripción                                   |
|---------------------|----------------|-------------------------|-----------------------------------------------|
| `id`                | `UUID` / `STRING` | PK, NOT NULL, UNIQUE | Identificador de la reserva                   |
| `cliente_id`        | `UUID` / `STRING` | FK → users.id, NOT NULL | Cliente que realiza la reserva              |
| `total`             | `DECIMAL(10,2)`   | NOT NULL, >= 70       | Monto total (mínimo S/ 70)                    |
| `estado`            | `ENUM`            | NOT NULL              | Ver tabla de estados abajo                    |
| `mensaje_empleado`  | `TEXT`            | NULL                  | Mensaje del empleado al cliente              |
| `tiempo_entrega_dias`| `INTEGER`         | NULL, 1–4             | Días de entrega asignados por empleado        |
| `empleado_confirma_id`| `UUID` / `STRING` | FK → users.id, NULL   | Empleado que aceptó/confirmó (si aplica)      |
| `created_at`        | `TIMESTAMP`       | NOT NULL              | Fecha de creación                             |
| `updated_at`        | `TIMESTAMP`       | NULL                  | Última actualización                          |

**Estados:** `por_confirmar` | `pendiente` | `confirmada` | `cancelado`

**Índices:** `cliente_id`, `estado`, `created_at`.

---

### 1.6 `reservation_items` (Detalle de reserva)

| Campo           | Tipo           | Restricciones           | Descripción                    |
|-----------------|----------------|-------------------------|--------------------------------|
| `id`            | `UUID` / `STRING` | PK, NOT NULL, UNIQUE | Identificador del ítem        |
| `reservation_id`| `UUID` / `STRING` | FK → reservations.id, NOT NULL | Reserva padre           |
| `product_id`    | `UUID` / `STRING` | FK → products.id, NOT NULL | Producto reservado      |
| `cantidad`      | `INTEGER`         | NOT NULL, > 0          | Cantidad reservada            |
| `precio_unitario`| `DECIMAL(10,2)`   | NOT NULL              | Precio unitario al momento     |

**Índices:** `reservation_id`, `product_id`.

---

### 1.7 `sales` (Ventas)

| Campo         | Tipo           | Restricciones           | Descripción                         |
|---------------|----------------|-------------------------|-------------------------------------|
| `id`          | `UUID` / `STRING` | PK, NOT NULL, UNIQUE | Identificador de la venta           |
| `empleado_id` | `UUID` / `STRING` | FK → users.id, NOT NULL | Empleado que registró la venta     |
| `reservation_id`| `UUID` / `STRING` | FK → reservations.id, NULL | Si la venta proviene de reserva  |
| `total`       | `DECIMAL(10,2)`   | NOT NULL, >= 0        | Monto total de la venta             |
| `descuento`   | `DECIMAL(10,2)`   | DEFAULT 0, >= 0       | Descuento aplicado (opcional)       |
| `fecha`       | `TIMESTAMP`       | NOT NULL              | Fecha y hora de la venta            |
| `created_at`  | `TIMESTAMP`       | NOT NULL              | Fecha de registro en sistema       |

**Índices:** `empleado_id`, `fecha`, `reservation_id`.

---

### 1.8 `sale_items` (Detalle de venta)

| Campo          | Tipo           | Restricciones           | Descripción                    |
|----------------|----------------|-------------------------|--------------------------------|
| `id`           | `UUID` / `STRING` | PK, NOT NULL, UNIQUE | Identificador del ítem        |
| `sale_id`      | `UUID` / `STRING` | FK → sales.id, NOT NULL | Venta padre                |
| `product_id`   | `UUID` / `STRING` | FK → products.id, NOT NULL | Producto vendido         |
| `cantidad`     | `INTEGER`         | NOT NULL, > 0          | Cantidad vendida              |
| `precio_unitario`| `DECIMAL(10,2)`   | NOT NULL              | Precio unitario al momento     |

**Índices:** `sale_id`, `product_id`.

---

### 1.9 `reviews` (Reseñas) – HU14

| Campo       | Tipo           | Restricciones           | Descripción                      |
|-------------|----------------|-------------------------|----------------------------------|
| `id`        | `UUID` / `STRING` | PK, NOT NULL, UNIQUE | Identificador de la reseña       |
| `user_id`   | `UUID` / `STRING` | FK → users.id, NOT NULL | Usuario que escribió la reseña  |
| `comentario`| `TEXT`            | NOT NULL              | Texto de la opinión/comentario   |
| `calificacion`| `INTEGER`         | NOT NULL, 1–5         | Puntuación de satisfacción       |
| `created_at`| `TIMESTAMP`       | NOT NULL              | Fecha de la reseña               |

**Índices:** `user_id`, `created_at`.

---

### 1.10 `password_recovery_codes` (Códigos de recuperación) – HU3

| Campo       | Tipo           | Restricciones           | Descripción                      |
|-------------|----------------|-------------------------|----------------------------------|
| `id`        | `UUID` / `STRING` | PK, NOT NULL, UNIQUE | Identificador                    |
| `email`     | `VARCHAR(255)`    | NOT NULL, INDEX        | Email del usuario                |
| `code`      | `VARCHAR(10)`     | NOT NULL              | Código de 6 dígitos              |
| `expires_at`| `TIMESTAMP`       | NOT NULL              | Expiración (ej. 15 min)          |
| `used`      | `BOOLEAN`         | DEFAULT FALSE          | Si ya se usó para cambiar clave  |
| `created_at`| `TIMESTAMP`       | NOT NULL              | Fecha de emisión                 |

**Índices:** `email`, `expires_at`.

---

### 1.11 `employee_attendance` (Control de asistencia) – HU19

| Campo           | Tipo           | Restricciones           | Descripción                         |
|-----------------|----------------|-------------------------|-------------------------------------|
| `id`            | `UUID` / `STRING` | PK, NOT NULL, UNIQUE | Identificador del registro          |
| `empleado_id`   | `UUID` / `STRING` | FK → users.id, NOT NULL | Empleado al que corresponde       |
| `fecha`         | `DATE`            | NOT NULL              | Fecha de la jornada                  |
| `hora_entrada`  | `TIME` / `TIMESTAMP` | NULL               | Hora de entrada                     |
| `hora_salida`   | `TIME` / `TIMESTAMP` | NULL               | Hora de salida                      |
| `registrado_por`| `UUID` / `STRING` | FK → users.id, NULL   | Admin que registró (si aplica)     |
| `created_at`    | `TIMESTAMP`       | NOT NULL              | Fecha de registro                    |
| `updated_at`    | `TIMESTAMP`       | NULL                  | Última actualización                 |

**Índices:** `empleado_id`, `fecha`, (`empleado_id`, `fecha`) UNIQUE para evitar duplicados por día.

**Nota:** Los empleados son creados únicamente por el administrador (HU18). No se registran por sí mismos.

---

## 2. Relaciones Resumidas

| Entidad padre     | Entidad hija         | Tipo      | Descripción                          |
|-------------------|----------------------|-----------|--------------------------------------|
| `users`           | `reservations`       | 1:N       | Un cliente tiene muchas reservas     |
| `users`           | `sales`              | 1:N       | Un empleado registra muchas ventas   |
| `users`           | `reviews`            | 1:N       | Un usuario puede tener muchas reseñas|
| `users`           | `borrowed_products`  | 1:N       | Un empleado registra préstamos       |
| `users`           | `employee_attendance`| 1:N       | Un empleado tiene registros de asistencia |
| `products`        | `reservation_items`  | 1:N       | Un producto en varias reservas       |
| `products`        | `sale_items`         | 1:N       | Un producto en varias ventas          |
| `reservations`    | `reservation_items`  | 1:N       | Una reserva tiene varios ítems       |
| `reservations`    | `sales`              | 1:1 opc.  | Una venta puede venir de una reserva |
| `sales`           | `sale_items`         | 1:N       | Una venta tiene varios ítems         |
| `borrowed_products`| `products`          | N:1 opc.  | Puede asociarse a un producto existente |

---

## 3. Tipos de Datos y Convenciones

| Uso           | Tipo recomendado     | Ejemplo / Notas                           |
|---------------|----------------------|-------------------------------------------|
| ID            | UUID o STRING        | `550e8400-e29b-41d4-a716-446655440000`   |
| Precio        | DECIMAL(10,2)        | Evitar problemas de punto flotante        |
| Cantidades    | INTEGER              | stock, cantidad en items                  |
| Fechas        | TIMESTAMP / DATE     | ISO 8601 en API                           |
| Roles         | ENUM                 | Evitar strings mágicos en código          |
| Booleanos     | BOOLEAN              | `used`, `activo`, etc.                    |
| Texto corto   | VARCHAR(n)           | n según necesidad (50–255)                |
| Texto largo   | TEXT                 | descripciones, comentarios, mensajes      |

---

## 4. Flujo de Estados de Reserva (Referencia rápida)

```
por_confirmar ──(empleado acepta)──> pendiente
por_confirmar ──(cliente/empleado cancela, ≤24h)──> cancelado
pendiente ──(empleado confirma pago)──> confirmada
pendiente ──(empleado cancela)──> cancelado
```

---

## 5. Consideraciones para implementación

1. **Stock:** Se descuenta al crear reserva; vuelve al cancelar (o al confirmar ya estaba descontado).
2. **Ventas directas vs. por reserva:** `sales.reservation_id` es NULL para venta directa, y NOT NULL cuando proviene de una reserva confirmada.
3. **Productos prestados:** Pueden tener o no `product_id`; si no existe producto propio, se crea un registro tipo “prestado” o se maneja solo en `borrowed_products`.
4. **Monto mínimo reserva:** S/ 70.00 – validar en aplicación y en restricción CHECK si el motor lo permite.
5. **Time zone:** Usar UTC en base de datos y convertir a zona local en la app si es necesario.
