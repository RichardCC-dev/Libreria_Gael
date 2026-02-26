# **Sistema de Diseño: Útiles Escolares**

## **1\. Identidad Visual**

El diseño se basa en un estilo **limpio, moderno y profesional**, utilizando una paleta de colores vibrante pero equilibrada para diferenciar roles y estados.

### **Paleta de Colores**

| Elemento | Color Hex | Uso |
| :---- | :---- | :---- |
| **Primario** | \#1A73E8 | Botones principales, cabeceras, estados de Administrador. |
| **Secundario** | \#F59E0B | Alertas, métricas diarias (Ventas hoy). |
| **Fondo App** | \#F8F9FA | Fondo general de la aplicación. |
| **Superficie** | \#FFFFFF | Tarjetas (Cards), contenedores de formularios. |
| **Texto Principal** | \#0F172A | Títulos y cuerpo de texto importante. |
| **Texto Suave** | \#64748B | Subtítulos e información secundaria. |
| **Bordes** | \#E2E8F0 | Líneas de división e inputs. |

## ---

**2\. Tipografía**

* **Fuente Sugerida:** Inter o Roboto (Sans-serif).  
* **Jerarquía:**  
  * **H1 (Títulos de Panel):** 24px, Bold.  
  * **H2 (Nombres de App):** 20px, Semi-bold.  
  * **Body:** 14px \- 16px, Regular.  
  * **Caption (Labels):** 12px, Medium.

## ---

**3\. Componentes de Interfaz (UI)**

### **A. Botones (Buttons)**

* **Radio de borde:** 12px o 8px (estilo redondeado suave).  
* **Primario:** Fondo \#1A73E8, texto blanco, padding 12px 16px.  
* **Toggle (Login/Registro):** Fondo gris claro \#F1F5F9 con el botón activo en blanco y sombra mínima.

### **B. Campos de Entrada (Inputs)**

* **Estilo:** Borde sólido \#E2E8F0, fondo \#F8F9FA.  
* **Iconografía:** Iconos lineales (Outline) alineados a la izquierda para indicar el tipo de dato (Email, Password, User).

### **C. Tarjetas de Dashboard (Cards)**

* **Contenedor:** Blanco, borde de 1px sólido \#E2E8F0.  
* **Iconografía de Dashboard:** Iconos de gran tamaño centrados con colores temáticos.  
* **Métricas principales:** Fondo sólido (Azul/Naranja) con texto en blanco.

## ---

**4\. Estructura de Páginas**

### **Pantalla de Autenticación**

* **Logo:** Icono de birrete en caja azul redondeada.  
* **Formulario:** Centrado, ancho máximo de 400px.  
* **Info Box:** Bloque inferior con fondo azul muy claro \#EBF5FF para mostrar credenciales de prueba.

### **Dashboard (Panel de Administrador)**

* **Navbar Superior:** Identificación de usuario y rol con etiqueta de color (Ej: Badge Azul para Administrador).  
* **Grid de Acciones:** Diseño de 2 columnas para botones de navegación rápida (Inventario, Ventas, Reservas, Usuarios).  
* **Menú Inferior (Mobile):** Barra de navegación con iconos lineales y etiquetas de texto para cambio de sección.

## ---

**5\. Especificaciones Técnicas (CSS Sugerido)**

CSS

:root {  
  \--primary-blue: \#1a73e8;  
  \--accent-orange: \#f59e0b;  
  \--bg-gray: \#f8f9fa;  
  \--border-color: \#e2e8f0;  
  \--radius: 12px;  
}

.card-dashboard {  
  background: white;  
  border: 1px solid var(--border-color);  
  border-radius: var(--radius);  
  padding: 20px;  
  text-align: center;  
  transition: transform 0.2s ease;  
}

.input-field {  
  width: 100%;  
  padding: 12px;  
  border-radius: 8px;  
  border: 1px solid var(--border-color);  
  background: \#fdfdfd;  
}  
