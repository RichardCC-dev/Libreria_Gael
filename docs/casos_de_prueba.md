# Casos de Prueba (Test Cases)

> Sistema de Gestión de Útiles Escolares · Validación por Historia de Usuario

---

## Formato del Caso de Prueba

| Campo | Descripción |
|-------|-------------|
| **ID** | Identificador único (TC-XX) |
| **Historia** | Historia de usuario asociada |
| **Escenario** | Descripción del caso a probar |
| **Datos de entrada** | Valores usados en la prueba |
| **Resultado esperado** | Comportamiento esperado del sistema |
| **Resultado obtenido** | Resultado real (llenar al ejecutar) |
| **Estado** | Pass / Fail |

---

## HU1 — Registro de usuario

| ID | Historia | Escenario | Datos de entrada | Resultado esperado | Resultado obtenido | Estado |
|----|----------|-----------|------------------|--------------------|--------------------|--------|
| TC-01 | HU1 | Email válido y contraseña segura | email: usuario@test.com, pass: Abc123!@# | Usuario creado correctamente, rol cliente | | |
| TC-02 | HU1 | Email inválido | email: correo-invalido, pass: Abc123!@# | Mensaje de error: formato de correo inválido | | |
| TC-03 | HU1 | Contraseña débil | email: test@test.com, pass: 123 | Mensaje: contraseña no cumple requisitos | | |
| TC-04 | HU1 | Email ya registrado | email: existente@test.com | Mensaje: correo ya registrado | | |
| TC-05 | HU1 | Campos vacíos | email: "", pass: "" | Validación de campos obligatorios | | |
| TC-06 | HU1 | Registro exitoso → login | Usuario recién registrado | Puede iniciar sesión con las credenciales | | |

---

## HU2 — Inicio de sesión

| ID | Historia | Escenario | Datos de entrada | Resultado esperado | Resultado obtenido | Estado |
|----|----------|-----------|------------------|--------------------|--------------------|--------|
| TC-07 | HU2 | Credenciales correctas (cliente) | email + pass válidos | Acceso al panel de cliente | | |
| TC-08 | HU2 | Credenciales correctas (empleado) | email + pass empleado | Acceso al panel de empleado | | |
| TC-09 | HU2 | Credenciales correctas (admin) | email + pass admin | Acceso al panel administrador | | |
| TC-10 | HU2 | Contraseña incorrecta | email válido, pass incorrecta | Mensaje: credenciales incorrectas | | |
| TC-11 | HU2 | Correo no registrado | email inexistente | Mensaje: credenciales incorrectas | | |
| TC-12 | HU2 | Sesión persistente | Usuario logueado cierra app | Sesión sigue activa al reabrir | | |

---

## HU3 — Recuperación de contraseña

| ID | Historia | Escenario | Datos de entrada | Resultado esperado | Resultado obtenido | Estado |
|----|----------|-----------|------------------|--------------------|--------------------|--------|
| TC-13 | HU3 | Solicitar recuperación con email registrado | email válido | Código enviado, pantalla para ingresar código | | |
| TC-14 | HU3 | Email no registrado | email inexistente | Mensaje: correo no registrado | | |
| TC-15 | HU3 | Código correcto + nueva contraseña | código 6 dígitos, pass nueva | Contraseña actualizada, puede iniciar sesión | | |
| TC-16 | HU3 | Código incorrecto | código erróneo | Mensaje de error | | |
| TC-17 | HU3 | Código expirado (>15 min) | código viejo | Mensaje: código expirado | | |
| TC-18 | HU3 | Código reutilizado | mismo código 2da vez | Mensaje: código ya usado | | |

---

## HU4 — Cerrar sesión

| ID | Historia | Escenario | Datos de entrada | Resultado esperado | Resultado obtenido | Estado |
|----|----------|-----------|------------------|--------------------|--------------------|--------|
| TC-19 | HU4 | Cerrar sesión desde menú | Usuario autenticado | Confirmación → redirección a login | | |
| TC-20 | HU4 | Cancelar confirmación | Clic en "Cancelar" | Sesión permanece activa | | |
| TC-21 | HU4 | Acceso sin autenticación | Usuario cerrado sesión | No puede acceder a pantallas protegidas | | |

---

## HU5 — Registrar productos (admin)

| ID | Historia | Escenario | Datos de entrada | Resultado esperado | Resultado obtenido | Estado |
|----|----------|-----------|------------------|--------------------|--------------------|--------|
| TC-22 | HU5 | Producto completo válido | nombre, categoría, descripción, precio 10, stock 50 | Producto registrado, mensaje de confirmación | | |
| TC-23 | HU5 | Precio negativo | precio: -5 | Mensaje de error | | |
| TC-24 | HU5 | Stock negativo | stock: -1 | Mensaje de error | | |
| TC-25 | HU5 | Campos obligatorios vacíos | nombre vacío | Validación, mensaje de error | | |
| TC-26 | HU5 | Datos no numéricos en precio/stock | precio: "abc" | Mensaje de error | | |

---

## HU6 — Editar y eliminar productos

| ID | Historia | Escenario | Datos de entrada | Resultado esperado | Resultado obtenido | Estado |
|----|----------|-----------|------------------|--------------------|--------------------|--------|
| TC-27 | HU6 | Editar producto | Cambiar precio, descripción | Cambios guardados, confirmación | | |
| TC-28 | HU6 | Eliminar producto sin reservas | Producto sin dependencias | Confirmación → producto eliminado | | |
| TC-29 | HU6 | Cancelar eliminación | Clic en "Cancelar" | Producto no se elimina | | |
| TC-30 | HU6 | Eliminar con reservas pendientes | Producto con reserva activa | Mensaje según reglas de negocio | | |

---

## HU7 — Visualizar catálogo

| ID | Historia | Escenario | Datos de entrada | Resultado esperado | Resultado obtenido | Estado |
|----|----------|-----------|------------------|--------------------|--------------------|--------|
| TC-31 | HU7 | Ver catálogo completo | Cliente autenticado | Lista de productos con stock | | |
| TC-32 | HU7 | Producto sin stock | Producto stock=0 | Marcado "Sin stock" o no agregable | | |
| TC-33 | HU7 | Filtrar por categoría | Categoría: Lápices | Solo productos de esa categoría | | |
| TC-34 | HU7 | Buscar por nombre | Término: "cuaderno" | Productos que coincidan | | |
| TC-35 | HU7 | Filtrar por grado escolar | Grado: 1ro primaria | Lista de útiles del grado | | |

---

## HU8 — Reservar productos

| ID | Historia | Escenario | Datos de entrada | Resultado esperado | Resultado obtenido | Estado |
|----|----------|-----------|------------------|--------------------|--------------------|--------|
| TC-36 | HU8 | Reserva válida (≥S/70) | Productos, total ≥70 | Reserva creada, estado "Por confirmar" | | |
| TC-37 | HU8 | Reserva menor a S/70 | Total < 70 | Mensaje: monto mínimo S/70 | | |
| TC-38 | HU8 | Cantidad mayor al stock | Cantidad > stock disponible | Mensaje de error | | |
| TC-39 | HU8 | Cancelar dentro de 24h | Reserva reciente | Estado "Cancelado", stock restaurado | | |
| TC-40 | HU8 | Cancelar después de 24h | Reserva >24h | No permite cancelar | | |
| TC-41 | HU8 | Confirmar pedido | Cliente confirma | Resumen con productos, total, número seguimiento | | |

---

## HU9 — Ver estado de reservas

| ID | Historia | Escenario | Datos de entrada | Resultado esperado | Resultado obtenido | Estado |
|----|----------|-----------|------------------|--------------------|--------------------|--------|
| TC-42 | HU9 | Listar reservas del cliente | Cliente con reservas | Lista con fecha, productos, total, estado | | |
| TC-43 | HU9 | Ver detalle de reserva | Clic en reserva | Detalle completo, productos, cantidades | | |
| TC-44 | HU9 | Pull-to-refresh | Deslizar para actualizar | Lista actualizada | | |
| TC-45 | HU9 | Opción cancelar en "Por confirmar" | Reserva ≤24h | Botón cancelar visible | | |

---

## HU10 — Empleado: confirmar/rechazar reservas

| ID | Historia | Escenario | Datos de entrada | Resultado esperado | Resultado obtenido | Estado |
|----|----------|-----------|------------------|--------------------|--------------------|--------|
| TC-46 | HU10 | Aceptar reserva "Por confirmar" | Empleado acepta | Estado → "Pendiente" | | |
| TC-47 | HU10 | Cancelar reserva | Empleado cancela | Estado → "Cancelado", stock restaurado | | |
| TC-48 | HU10 | Agregar mensaje al cliente | Mensaje opcional | Mensaje visible para cliente | | |
| TC-49 | HU10 | Asignar tiempo entrega 1-4 días | Días: 2 | Tiempo registrado y visible | | |
| TC-50 | HU10 | Confirmar venta y pago | Empleado confirma pago | Estado → "Confirmada", stock descontado | | |

---

## HU11 — Registrar venta

| ID | Historia | Escenario | Datos de entrada | Resultado esperado | Resultado obtenido | Estado |
|----|----------|-----------|------------------|--------------------|--------------------|--------|
| TC-51 | HU11 | Venta directa | Productos, cantidades, precios | Venta registrada, stock descontado | | |
| TC-52 | HU11 | Venta desde reserva | Reserva confirmada | Venta asociada a reserva | | |
| TC-53 | HU11 | Cantidad > stock | Cantidad excede stock | Mensaje de error | | |
| TC-54 | HU11 | Historial de venta | Venta realizada | Empleado registrado en historial | | |

---

## HU12 — Historial de ventas (admin)

| ID | Historia | Escenario | Datos de entrada | Resultado esperado | Resultado obtenido | Estado |
|----|----------|-----------|------------------|--------------------|--------------------|--------|
| TC-55 | HU12 | Ver historial | Admin accede | Lista con fecha, total, vendedor | | |
| TC-56 | HU12 | Filtrar por fecha | Rango de fechas | Ventas del período | | |
| TC-57 | HU12 | Filtrar por temporada | Inicio de clases | Ventas filtradas | | |
| TC-58 | HU12 | Ver detalle de venta | Clic en venta | Productos, cantidades, descuentos | | |

---

## HU13 — Boleta previa

| ID | Historia | Escenario | Datos de entrada | Resultado esperado | Resultado obtenido | Estado |
|----|----------|-----------|------------------|--------------------|--------------------|--------|
| TC-59 | HU13 | Generar boleta previa | Productos seleccionados | Pantalla resumen con subtotal | | |
| TC-60 | HU13 | Aplicar descuento válido | Descuento < subtotal | Total con descuento | | |
| TC-61 | HU13 | Descuento mayor al subtotal | Descuento > subtotal | Mensaje de error | | |
| TC-62 | HU13 | Imprimir boleta previa | Impresora conectada | Impresión, sin registrar venta | | |
| TC-63 | HU13 | Identificación documento | Boleta impresa | "No válido como comprobante" | | |

---

## HU14 — Boleta y PDF en venta

| ID | Historia | Escenario | Datos de entrada | Resultado esperado | Resultado obtenido | Estado |
|----|----------|-----------|------------------|--------------------|--------------------|--------|
| TC-64 | HU14 | Generar boleta al vender | Venta confirmada | Boleta generada, PDF guardado | | |
| TC-65 | HU14 | Contenido boleta | Boleta generada | Fecha, productos, cantidades, total | | |
| TC-66 | HU14 | PDF en dispositivo | Venta finalizada | Archivo PDF almacenado | | |

---

## HU15 — Productos prestados

| ID | Historia | Escenario | Datos de entrada | Resultado esperado | Resultado obtenido | Estado |
|----|----------|-----------|------------------|--------------------|--------------------|--------|
| TC-67 | HU15 | Registrar producto prestado | nombre, stock, tienda, precio | Producto en catálogo | | |
| TC-68 | HU15 | Producto prestado en reserva | Agregar a reserva | Se puede reservar como propio | | |
| TC-69 | HU15 | Actualizar estado prestado | Estado: Cancelado | Estado actualizado | | |

---

## HU16 — Reseñas y feedback

| ID | Historia | Escenario | Datos de entrada | Resultado esperado | Resultado obtenido | Estado |
|----|----------|-----------|------------------|--------------------|--------------------|--------|
| TC-70 | HU16 | Enviar reseña autenticado | Comentario + calificación 1-5 | Reseña guardada, confirmación | | |
| TC-71 | HU16 | Reseña sin autenticación | Usuario no logueado | No permite enviar | | |
| TC-72 | HU16 | Reseña vacía | Comentario vacío | Validación, mensaje de error | | |

---

## HU17 — Cambiar correo

| ID | Historia | Escenario | Datos de entrada | Resultado esperado | Resultado obtenido | Estado |
|----|----------|-----------|------------------|--------------------|--------------------|--------|
| TC-73 | HU17 | Cambio correcto | Nuevo email + contraseña actual | Correo actualizado, sesión refrescada | | |
| TC-74 | HU17 | Email ya registrado | Email existente | Mensaje: correo ya en uso | | |
| TC-75 | HU17 | Contraseña incorrecta | Pass actual errónea | Mensaje de error | | |

---

## HU18 — Agregar empleados (admin)

| ID | Historia | Escenario | Datos de entrada | Resultado esperado | Resultado obtenido | Estado |
|----|----------|-----------|------------------|--------------------|--------------------|--------|
| TC-76 | HU18 | Crear empleado válido | correo, nombre, teléfono, pass | Empleado creado, rol empleado | | |
| TC-77 | HU18 | Correo ya registrado | Email existente | Mensaje de error | | |
| TC-78 | HU18 | Ver lista empleados | Admin accede | Lista de empleados | | |

---

## HU19 — Control de asistencia

| ID | Historia | Escenario | Datos de entrada | Resultado esperado | Resultado obtenido | Estado |
|----|----------|-----------|------------------|--------------------|--------------------|--------|
| TC-79 | HU19 | Registrar entrada/salida | Fecha, hora entrada, hora salida | Registro guardado | | |
| TC-80 | HU19 | Resumen por empleado | Seleccionar empleado | Días asistidos, total horas | | |
| TC-81 | HU19 | Filtrar por rango fechas | Fecha inicio - fin | Asistencia del período | | |

---

## Resumen de Casos

| Historia | Casos | Rango IDs |
|----------|-------|-----------|
| HU1 | 6 | TC-01 a TC-06 |
| HU2 | 6 | TC-07 a TC-12 |
| HU3 | 6 | TC-13 a TC-18 |
| HU4 | 3 | TC-19 a TC-21 |
| HU5 | 5 | TC-22 a TC-26 |
| HU6 | 4 | TC-27 a TC-30 |
| HU7 | 5 | TC-31 a TC-35 |
| HU8 | 6 | TC-36 a TC-41 |
| HU9 | 4 | TC-42 a TC-45 |
| HU10 | 5 | TC-46 a TC-50 |
| HU11 | 4 | TC-51 a TC-54 |
| HU12 | 4 | TC-55 a TC-58 |
| HU13 | 5 | TC-59 a TC-63 |
| HU14 | 3 | TC-64 a TC-66 |
| HU15 | 3 | TC-67 a TC-69 |
| HU16 | 3 | TC-70 a TC-72 |
| HU17 | 3 | TC-73 a TC-75 |
| HU18 | 3 | TC-76 a TC-78 |
| HU19 | 3 | TC-79 a TC-81 |
| **Total** | **81** | |

---

*Documento de casos de prueba — Sistema de Gestión de Útiles Escolares. Actualizar "Resultado obtenido" y "Estado" al ejecutar cada prueba.*
