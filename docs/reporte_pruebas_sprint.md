# Reporte de Pruebas del Sprint

> Sistema de Gestión de Útiles Escolares · Resumen por Sprint

---

## Información del Sprint

| Campo | Valor |
|-------|-------|
| **Sprint** | Sprint X |
| **Período** | DD/MM/YYYY — DD/MM/YYYY |
| **Fecha del reporte** | DD/MM/YYYY |
| **Responsable** | [Nombre] |

---

## Resumen Ejecutivo

| Métrica | Valor |
|---------|-------|
| Historias probadas | X de Y |
| Casos ejecutados | XX |
| **PASS** | XX |
| **FAIL** | XX |
| **% Éxito** | XX% |
| Defectos encontrados | X |
| Bugs críticos | X |
| Bugs medios | X |
| Bugs menores | X |

---

## Historias Probadas

| Historia | Descripción | Casos ejecutados | PASS | FAIL | Estado |
|----------|-------------|------------------|------|------|--------|
| HU1 | Registro de usuario | 6 | X | X | ✅ / ⚠️ |
| HU2 | Inicio de sesión | 6 | X | X | ✅ / ⚠️ |
| HU3 | Recuperación contraseña | 6 | X | X | ✅ / ⚠️ |
| ... | ... | ... | ... | ... | ... |

---

## Defectos Encontrados

| ID | Historia | Descripción | Severidad | Estado |
|----|----------|-------------|-----------|--------|
| BUG-01 | HU1 | [Descripción del bug] | Crítico / Medio / Menor | Abierto / Corregido |
| BUG-02 | HU2 | [Descripción del bug] | | |
| ... | | | | |

---

## Detalle de Casos Fallidos

| ID Caso | Historia | Escenario | Resultado esperado | Observaciones |
|---------|----------|-----------|--------------------|---------------|
| TC-XX | HUX | [Escenario] | [Esperado] | [Causa del fallo] |
| ... | | | | |

---

## Evidencias Adjuntas

- [ ] Capturas de pantalla de flujos principales
- [ ] Video de ejecución de pruebas
- [ ] Logs exportados (si aplica)
- [ ] Ubicación: `docs/evidencias/sprint_X/`

---

## Recomendaciones

1. **[Recomendación 1]** — Ej: Corregir validación de email en registro
2. **[Recomendación 2]** — Ej: Mejorar mensajes de error al usuario
3. **[Recomendación 3]** — Ej: Agregar pruebas de integración para reservas

---

## Ejemplo Rellenado (Sprint 3)

| Métrica | Valor |
|---------|-------|
| Historias probadas | 5 de 19 |
| Casos ejecutados | 12 |
| **PASS** | 10 |
| **FAIL** | 2 |
| **% Éxito** | 83% |
| Defectos encontrados | 1 |
| Bugs críticos | 1 (corregido) |

**Defectos:**
- BUG-01: Al registrar usuario con email duplicado, el mensaje no era claro. **Corregido.**

**Recomendaciones:**
- Incluir pruebas de HU8 (reservas) en próximo sprint
- Validar flujo completo de recuperación de contraseña en dispositivo real

---

*Plantilla de reporte de pruebas — Sistema de Gestión de Útiles Escolares. Completar al finalizar cada Sprint.*
