# **Documento de Stack Tecnológico: Proyecto Útiles Escolares**

## **1\. Frontend (Mobile)**

El desarrollo de la interfaz de usuario se centra en la portabilidad y la experiencia nativa.

* **Framework:** **React Native**   
* **Lenguaje:** **JavaScript**   
* **Gestión de Estado:** **Context API** (para estados globales simples como el usuario logueado)  
* **Navegación:** **React Navigation**.  
  * *Implementación:* Stack Navigation para el flujo de Login y Bottom Tab Navigation para el Panel de Administrador/Cliente.  
* **Estilos:** **NativeWind (Tailwind CSS)**.

## ---

**2\. Backend & API**

Para soportar el sistema de gestión por temporada y la base de datos de usuarios.

* **Entorno de Ejecución:** **Node.js**.  
* **Framework de Servidor:** **Express.js**.  
* **Autenticación:** **JSON Web Tokens (JWT)**.  
  * *Flujo:* Login \-\> Generación de Token \-\> Almacenamiento en EncryptedStorage en el móvil.  
* **Documentación:** **Swagger UI** para exponer los endpoints de la API.

## ---

**3\. Persistencia de Datos**

* **Base de Datos Principal:** **MySQL** (localhost para desarrollo; Railway u otro cloud para producción).  
* **ORM:** **Sequelize**.
* **Backend:** Carpeta `backend/` con Node.js + Express, configurado para MySQL localhost.

## ---

**4\. Arquitectura del Sistema**

El proyecto sigue un modelo de **Arquitectura en Capas** para separar la lógica de negocio de la interfaz de usuario.

| Capa | Responsabilidad |
| :---- | :---- |
| **Presentation** | Componentes de React Native, Pantallas de Login y Dashboard. |
| **Business Logic** | Hooks personalizados para el manejo de ventas y gestión de inventario. |
| **Data Source** | Servicios de API (Axios) y persistencia en base de datos. |

## 