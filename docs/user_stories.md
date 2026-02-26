# Historias de Usuario

> Sistema de Gestión de Útiles Escolares · App Móvil

---

## Épicas

| Épica | Descripción |
|-------|-------------|
| Gestión de usuarios y roles | Registro, autenticación, recuperación de contraseña y roles |
| Gestión de inventario | Productos propios y prestados |
| Visualización de catálogo | Búsqueda, filtros y listas escolares |
| Gestión de reservas | Crear, confirmar, cancelar y consultar reservas |
| Gestión de ventas | Registro, comprobantes e historial |
| Reseñas y feedback | Opiniones y calificaciones de clientes |

---

## Historia de Usuario 1

**Épica:** Gestión de usuarios y roles

**Como** usuario nuevo  
**quiero** registrarme en la aplicación con correo electrónico y contraseña  
**para** acceder a la plataforma y utilizar sus funcionalidades.

| Prioridad | Valor de negocio |
|-----------|------------------|
| Alta | Alto |

**Criterios de aceptación:**

* El sistema permite registrar usuarios con correo electrónico válido y contraseña segura.
* Se validan los campos obligatorios (correo, contraseña).
* Se valida el formato del correo electrónico.
* La contraseña cumple requisitos mínimos de seguridad (longitud, caracteres).
* El correo no puede estar ya registrado.
* El usuario queda registrado con rol asignado por defecto (`cliente`).
* Se muestra un mensaje de confirmación al finalizar el registro.
* Tras el registro exitoso, el usuario puede iniciar sesión.

---

## Historia de Usuario 2

**Épica:** Gestión de usuarios y roles

**Como** usuario registrado  
**quiero** iniciar sesión con mis credenciales  
**para** acceder a mi perfil y funcionalidades según mi rol (cliente, empleado o administrador).

| Prioridad | Valor de negocio |
|-----------|------------------|
| Alta | Alto |

**Criterios de aceptación:**

* El sistema valida credenciales de acceso (correo y contraseña).
* El acceso es denegado ante datos incorrectos (correo o contraseña inválidos).
* Se muestra un mensaje claro cuando las credenciales son incorrectas.
* El usuario es redirigido al panel correspondiente a su rol (cliente, empleado o administrador).
* La sesión se mantiene activa hasta que el usuario cierre sesión.

---

## Historia de Usuario 3

**Épica:** Gestión de usuarios y roles

**Como** usuario  
**quiero** recuperar mi contraseña mediante correo electrónico  
**para** poder acceder nuevamente a la aplicación si la olvidé.

| Prioridad | Valor de negocio |
|-----------|------------------|
| Alta | Alto |

**Criterios de aceptación:**

* El sistema permite solicitar la recuperación de contraseña mediante correo electrónico.
* Se valida que el correo esté registrado en el sistema.
* El usuario recibe un código de verificación (por ejemplo, 6 dígitos) válido por tiempo limitado (ej. 15 minutos).
* El sistema permite ingresar el código y establecer una nueva contraseña segura.
* El código no puede reutilizarse una vez usado.
* Se muestra un mensaje de confirmación al finalizar el proceso.
* Tras el cambio exitoso, el usuario puede iniciar sesión con su nueva contraseña.

---

## Historia de Usuario 4

**Épica:** Gestión de usuarios y roles

**Como** usuario autenticado  
**quiero** cerrar sesión de manera segura  
**para** proteger mi cuenta cuando termine de usar la aplicación.

| Prioridad | Valor de negocio |
|-----------|------------------|
| Alta | Alto |

**Criterios de aceptación:**

* El usuario puede cerrar sesión desde su panel o menú principal.
* El sistema solicita confirmación antes de cerrar la sesión.
* Al cerrar sesión, el usuario es redirigido a la pantalla inicial o de login.
* Los datos de sesión se eliminan correctamente del dispositivo.
* El usuario no puede acceder a pantallas protegidas sin volver a autenticarse.

---

## Historia de Usuario 5

**Épica:** Gestión de inventario

**Como** administrador  
**quiero** registrar productos en el inventario  
**para** mantener actualizado el catálogo de útiles escolares.

| Prioridad | Valor de negocio |
|-----------|------------------|
| Alta | Alto |

**Criterios de aceptación:**

* Se pueden registrar productos con: nombre, categoría, descripción, precio y stock.
* Todos los campos obligatorios son validados (nombre, categoría, precio, stock).
* El precio y el stock deben ser valores numéricos válidos (precio ≥ 0, stock ≥ 0).
* Los productos se almacenan correctamente en el sistema.
* El sistema muestra mensaje de error ante datos incorrectos o incompletos.
* Se muestra confirmación cuando el producto se registra correctamente.

---

## Historia de Usuario 6

**Épica:** Gestión de inventario

**Como** administrador  
**quiero** editar y eliminar productos del inventario  
**para** mantener información precisa y actualizada.

| Prioridad | Valor de negocio |
|-----------|------------------|
| Alta | Alto |

**Criterios de aceptación:**

* El administrador puede modificar los datos del producto (precio, descripción, stock, categoría).
* El sistema solicita confirmación antes de eliminar un producto.
* Al eliminar, se valida que no existan reservas o ventas pendientes asociadas al producto (o se maneja según reglas de negocio).
* El inventario se actualiza correctamente tras editar o eliminar.
* Se muestra confirmación tras cada operación exitosa.

---

## Historia de Usuario 7

**Épica:** Visualización de catálogo

**Como** cliente  
**quiero** visualizar el catálogo de productos disponibles  
**para** seleccionar los útiles escolares que necesito comprar o reservar.

| Prioridad | Valor de negocio |
|-----------|------------------|
| Alta | Alto |

**Criterios de aceptación:**

* El cliente puede visualizar todos los productos disponibles en el catálogo.
* Se muestra el stock actualizado en tiempo real.
* Los productos agotados se identifican claramente (no se pueden agregar al carrito o se marca como "Sin stock").
* El catálogo permite filtrar por categoría.
* El catálogo permite buscar productos por nombre.
* Opcionalmente, el cliente puede filtrar por grado escolar y ver la lista de útiles correspondiente a ese grado.
* La interfaz es clara y permite navegar fácilmente por los productos.

---

## Historia de Usuario 8

**Épica:** Gestión de reservas

**Como** cliente  
**quiero** reservar productos desde el catálogo  
**para** asegurar su disponibilidad antes de acudir a la tienda.

| Prioridad | Valor de negocio |
|-----------|------------------|
| Alta | Alto |

**Criterios de aceptación:**

* Solo se permite reservar productos con stock disponible.
* El sistema valida que la cantidad solicitada no supere el stock disponible.
* El sistema valida que el monto total mínimo de la reserva sea de S/ 70.00.
* La reserva se registra inicialmente con estado "Por confirmar" (aún no aceptada por el empleado).
* El cliente puede ver el detalle de su reserva y su estado.
* El cliente puede cancelar su reserva dentro del plazo de 24 horas desde su creación; al cancelar, la reserva pasa a estado "Cancelado" y el stock vuelve al catálogo.
* Pasadas las 24 horas, el cliente no puede cancelar; deberá contactar al empleado si requiere anulación.
* Tras confirmar el pedido, el cliente recibe un resumen con productos, total y número de seguimiento.

---

## Historia de Usuario 9

**Épica:** Gestión de reservas

**Como** cliente  
**quiero** ver el estado de mis reservas  
**para** saber si están por confirmar, pendientes de pago, confirmadas o canceladas.

| Prioridad | Valor de negocio |
|-----------|------------------|
| Alta | Alto |

**Criterios de aceptación:**

* El cliente puede acceder a una lista de todas sus reservas.
* Cada reserva muestra: fecha, productos, total, estado y número/código de seguimiento.
* Los estados mostrados son: Por confirmar, Pendiente, Confirmada, Cancelado.
* El cliente puede ver el detalle de cada reserva (productos, cantidades, precios).
* Si el empleado agregó un mensaje o tiempo de entrega, se muestra al cliente.
* Las reservas en estado "Por confirmar" muestran opción de cancelar (solo dentro de 24 h).
* La lista se puede actualizar (pull-to-refresh) para ver cambios recientes.

---

## Historia de Usuario 10

**Épica:** Gestión de reservas

**Como** empleado  
**quiero** confirmar, rechazar o cancelar reservas de clientes  
**para** gestionar adecuadamente los pedidos en tienda.

| Prioridad | Valor de negocio |
|-----------|------------------|
| Alta | Alto |

**Criterios de aceptación:**

* El empleado puede visualizar las reservas en los siguientes estados: Por confirmar, Pendiente, Confirmada, Cancelado.
* El empleado puede aceptar una reserva "Por confirmar"; al aceptarla, pasa a estado "Pendiente".
* El empleado puede cancelar una reserva "Por confirmar" o "Pendiente"; al cancelar, pasa a "Cancelado" y el stock vuelve al catálogo.
* El empleado puede agregar un mensaje para brindar información adicional al cliente.
* El empleado puede asignar un tiempo de entrega del pedido de 1 a 4 días.
* Al confirmar la venta y el pago en tienda, la reserva pasa a estado "Confirmada".
* El stock se actualiza automáticamente al confirmar la venta.
* El sistema registra correctamente los cambios de estado y el empleado que realizó cada acción.

---

## Historia de Usuario 11

**Épica:** Gestión de ventas

**Como** empleado  
**quiero** registrar una venta en tienda  
**para** llevar control de las transacciones realizadas y descontar el stock.

| Prioridad | Valor de negocio |
|-----------|------------------|
| Alta | Alto |

**Criterios de aceptación:**

* La venta se registra con fecha, productos, cantidades y precios unitarios.
* El empleado puede registrar ventas directas (sin reserva previa) o ventas que provienen de una reserva confirmada.
* Si la venta proviene de una reserva, se asocia la reserva a la venta.
* El stock se descuenta automáticamente al confirmar la venta.
* La venta queda registrada en el historial con el empleado que la realizó.
* El sistema valida que las cantidades no superen el stock disponible.

---

## Historia de Usuario 12

**Épica:** Gestión de ventas

**Como** administrador  
**quiero** visualizar el historial de ventas  
**para** analizar el desempeño de la tienda y las ventas realizadas por cada vendedor.

| Prioridad | Valor de negocio |
|-----------|------------------|
| Media | Alto |

**Criterios de aceptación:**

* Se muestran las ventas registradas con fecha, total, productos y vendedor.
* Se permite filtrar por fecha o rango de fechas.
* Se permite filtrar por temporada (ej. inicio de clases).
* Se identifica claramente el empleado/vendedor de cada venta.
* La información se presenta de forma clara y ordenada.
* Se puede acceder al detalle de cada venta (productos, cantidades, descuentos).

---

## Historia de Usuario 13

**Épica:** Gestión de ventas

**Como** empleado  
**quiero** generar e imprimir una boleta previa con opción de descuento  
**para** mostrar al cliente el monto final de la compra antes de registrar la venta.

| Prioridad | Valor de negocio |
|-----------|------------------|
| Media | Medio |

**Criterios de aceptación:**

* El vendedor puede seleccionar uno o varios productos desde la lista de ventas.
* El vendedor puede confirmar la lista completa de productos seleccionados.
* Al confirmar, el sistema redirige a una pantalla de resumen con: nombre, cantidad, precio unitario, subtotal por producto y subtotal general.
* El vendedor puede aplicar un descuento opcional ingresando un monto manual.
* El sistema valida que el descuento no sea mayor al subtotal general.
* La pantalla muestra: monto del descuento (si aplica) y total final.
* Desde la pantalla de resumen, el vendedor puede imprimir la boleta previa o volver para modificar productos o descuento.
* La boleta previa puede enviarse a impresión por Bluetooth o Wi-Fi.
* La impresión no registra la venta ni descuenta stock.
* La boleta previa se identifica como "Documento no válido como comprobante de venta".
* El sistema muestra confirmación o mensaje de error tras la impresión.

---

## Historia de Usuario 14

**Épica:** Gestión de ventas

**Como** empleado  
**quiero** imprimir una boleta y generar un archivo PDF al realizar una venta en tienda  
**para** entregar un comprobante al cliente y conservar una copia digital.

| Prioridad | Valor de negocio |
|-----------|------------------|
| Media | Alto |

**Criterios de aceptación:**

* Al finalizar una venta directa o por reserva, el sistema genera automáticamente una boleta de venta.
* La boleta puede imprimirse en dispositivo conectado por Bluetooth o Wi-Fi.
* El sistema genera un archivo PDF con el detalle de la boleta.
* El archivo PDF se almacena en el dispositivo móvil utilizado para la venta.
* La boleta y el PDF incluyen: fecha, lista de productos, cantidad, precio unitario, subtotal por producto, descuento (si aplica) y total de la venta.
* El stock se descuenta automáticamente al confirmar la venta.
* El sistema confirma la impresión y generación del PDF o muestra un mensaje de error.

---

## Historia de Usuario 15

**Épica:** Gestión de inventario

**Como** empleado  
**quiero** registrar productos prestados de otras tiendas  
**para** incluirlos temporalmente en el catálogo y listas de útiles escolares.

| Prioridad | Valor de negocio |
|-----------|------------------|
| Media | Medio |

**Criterios de aceptación:**

* El empleado puede registrar productos prestados con: nombre, stock, código/número de la tienda prestadora, precio y fecha de préstamo.
* Los productos prestados se visualizan en el catálogo junto a los productos propios (sin etiqueta "Prestado" para el cliente).
* Los productos prestados pueden agregarse a reservas y ventas como los productos propios.
* El sistema registra los productos prestados en una tabla independiente (artículos prestados).
* Cada artículo prestado tiene estado: Pendiente o Cancelado.
* El sistema permite actualizar el estado del artículo prestado.
* La información se guarda correctamente y es accesible para control interno.

---

## Historia de Usuario 16

**Épica:** Gestión de reseñas y feedback

**Como** cliente  
**quiero** realizar reseñas y comentarios sobre la aplicación  
**para** aportar sugerencias y contribuir a futuras mejoras del sistema.

| Prioridad | Valor de negocio |
|-----------|------------------|
| Media | Medio |

**Criterios de aceptación:**

* El cliente puede registrar una reseña desde la aplicación.
* La reseña incluye: comentario u opinión escrita y calificación de satisfacción (1 a 5 estrellas o equivalente).
* Solo los usuarios autenticados pueden enviar reseñas.
* El sistema valida que el contenido de la reseña no esté vacío.
* Cada reseña queda asociada al usuario que la realizó y a la fecha de registro.
* Las reseñas se almacenan para su análisis y mejora continua.
* El sistema muestra un mensaje de confirmación al enviar la reseña.

---

## Historia de Usuario 17

**Épica:** Gestión de usuarios y roles

**Como** usuario autenticado  
**quiero** cambiar mi correo electrónico desde mi perfil  
**para** mantener actualizada mi información de contacto.

| Prioridad | Valor de negocio |
|-----------|------------------|
| Media | Medio |

**Criterios de aceptación:**

* El usuario puede solicitar el cambio de correo desde la sección de perfil.
* Se requiere ingresar el nuevo correo y la contraseña actual para confirmar.
* Se valida que el nuevo correo tenga formato válido y no esté ya registrado.
* Tras el cambio exitoso, la sesión se actualiza con el nuevo correo.
* Se muestra un mensaje de confirmación al finalizar.
* Se muestra contacto de soporte para casos en que el usuario necesite ayuda.

---

## Historia de Usuario 18

**Épica:** Gestión de usuarios y roles

**Como** administrador  
**quiero** agregar empleados al sistema con su correo y datos personales  
**para** que puedan acceder a la plataforma y realizar sus funciones.

| Prioridad | Valor de negocio |
|-----------|------------------|
| Alta | Alto |

**Criterios de aceptación:**

* Solo el administrador puede crear cuentas de empleados.
* El administrador ingresa: correo electrónico, nombre, teléfono y contraseña inicial.
* Se valida que el correo no esté ya registrado.
* El empleado queda registrado con rol `empleado`.
* El sistema puede enviar (o mostrar) las credenciales al empleado para su primer acceso.
* Se muestra confirmación cuando el empleado se registra correctamente.
* El administrador puede ver la lista de empleados registrados.

---

## Historia de Usuario 19

**Épica:** Gestión de usuarios y roles

**Como** administrador  
**quiero** gestionar el control de asistencia de los empleados  
**para** registrar horas de entrada/salida y los días que asistieron.

| Prioridad | Valor de negocio |
|-----------|------------------|
| Alta | Alto |

**Criterios de aceptación:**

* El administrador puede registrar la hora de entrada y salida de cada empleado por día.
* Se registra la fecha y las horas (entrada y salida) de cada jornada.
* El sistema permite ver un resumen por empleado: días asistidos, total de horas, etc.
* Se puede filtrar por rango de fechas o por empleado.
* La información se presenta de forma clara (tabla, lista o calendario).
* Opcionalmente, el empleado puede marcar su propia entrada/salida (validado por admin).

---

## Resumen por Épica

| Épica | Historias | Prioridad predominante |
|-------|-----------|-------------------------|
| Gestión de usuarios y roles | HU1, HU2, HU3, HU4, HU17, HU18, HU19 | Alta / Media |
| Gestión de inventario | HU5, HU6, HU15 | Alta / Media |
| Visualización de catálogo | HU7 | Alta |
| Gestión de reservas | HU8, HU9, HU10 | Alta |
| Gestión de ventas | HU11, HU12, HU13, HU14 | Alta / Media |
| Reseñas y feedback | HU16 | Media |

---

## Flujo de Estados de Reserva (Referencia)

```
Por confirmar ──(empleado acepta)──> Pendiente
Por confirmar ──(cliente cancela ≤24h)──> Cancelado
Por confirmar ──(empleado rechaza)──> Cancelado
Pendiente ──(empleado confirma pago)──> Confirmada
Pendiente ──(empleado cancela)──> Cancelado
```

---

*Documento de historias de usuario — Sistema de Gestión de Útiles Escolares. Actualizado para alineación con el modelo de datos y funcionalidad del software.*
