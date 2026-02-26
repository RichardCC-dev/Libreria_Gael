# 🏆 Documentación de Calidad y Reglas

---

## ✔️ Definition of Done (DoD)

> **Criterios que definen cuándo un ítem del backlog está *realmente* terminado.**
> Una funcionalidad no se considera completa hasta que **todos** los criterios estén marcados.
> App Móvil — Sistema de Gestión de Útiles Escolares

---

### 🔧 Criterios Técnicos

| # | Criterio | ¿Cumple? |
|---|----------|:--------:|
| 1 | ☑️ Código revisado mediante **Pull Request** con al menos **1 aprobación** de otro desarrollador | ☐ |
| 2 | ☑️ **Pruebas unitarias** escritas y ejecutadas — cobertura mínima del **80 %** (Jest / JUnit) | ☐ |
| 3 | ☑️ Todas las pruebas unitarias **pasan sin errores** (`npm test` / `./gradlew test`) | ☐ |
| 4 | ☑️ **Análisis estático (Linting)** ejecutado sin errores críticos (ESLint / Prettier / Detekt) | ☐ |
| 5 | ☑️ Sin **vulnerabilidades de seguridad** conocidas en dependencias (`npm audit` / `Dependabot`) | ☐ |
| 6 | ☑️ Código integrado en la rama `main` / `develop` sin conflictos pendientes | ☐ |
| 7 | ☑️ Documentación técnica mínima actualizada (README, comentarios en lógica crítica) | ☐ |

---

### 👤 Criterios de Experiencia de Usuario

| # | Criterio | ¿Cumple? |
|---|----------|:--------:|
| 1 | ☑️ Interfaz **responsive** verificada en emulador **Android** (mínimo API 26) | ☐ |
| 2 | ☑️ Interfaz **responsive** verificada en emulador / simulador **iOS** (mínimo iOS 14) | ☐ |
| 3 | ☑️ Tiempos de carga **menores a 2 segundos** en los flujos principales (catálogo, carrito, pedido) | ☐ |
| 4 | ☑️ Navegación fluida sin **cierres inesperados** (crash-free rate ≥ 99 %) | ☐ |
| 5 | ☑️ Todos los **criterios de aceptación** de las historias de usuario del Sprint están cumplidos | ☐ |
| 6 | ☑️ Mensajes de error y estados vacíos **comunicados claramente** al usuario (UX de errores) | ☐ |

---

### 🧪 Criterios de Pruebas de Integración

| # | Criterio | ¿Cumple? |
|---|----------|:--------:|
| 1 | ☑️ Flujo completo **registro → login → catálogo → carrito → pedido** probado end-to-end | ☐ |
| 2 | ☑️ Integración con **servicios externos** (API, Firebase, etc.) verificada en entorno de staging | ☐ |
| 3 | ☑️ Comportamiento correcto en **modo sin conexión** o con conexión inestable | ☐ |

---

### 📊 Resumen de Cumplimiento

| Categoría | Total de criterios | ✅ Cumplidos | ❌ Pendientes |
|-----------|:-----------------:|:-----------:|:------------:|
| 🔧 Técnicos | 7 | `___` | `___` |
| 👤 Experiencia de usuario | 6 | `___` | `___` |
| 🧪 Integración | 3 | `___` | `___` |
| **TOTAL** | **16** | **`___`** | **`___`** |

> 🔴 Si **cualquier** criterio queda sin cumplir, el ítem **NO** puede marcarse como "Done" y debe volver al Sprint Backlog.

---

### ✍️ Aprobación del Product Owner

> El Product Owner certifica que el incremento cumple los criterios de aceptación funcionales y el Definition of Done definido por el equipo.

| Campo | Valor |
|-------|-------|
| **Nombre del Product Owner** | `_________________________________________` |
| **Fecha de revisión** | `_________________________________________` |
| **Sprint revisado** | `Sprint #___` |
| **Decisión** | ☐ &nbsp;✅ **Aprobado** &nbsp;&nbsp;&nbsp; ☐ &nbsp;❌ **Rechazado — Requiere ajustes** |
| **Firma / Rúbrica** | `_________________________________________` |

**💬 Observaciones y comentarios del Product Owner:**

```
________________________________________________________________________________

________________________________________________________________________________

________________________________________________________________________________
```

---

*📌 Documento de Definition of Done — Sistema de Gestión de Útiles Escolares. Mantenido y actualizado por el equipo Scrum del Taller de Desarrollo Móvil.*
