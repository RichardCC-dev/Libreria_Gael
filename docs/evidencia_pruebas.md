# Guía de Evidencia de Pruebas

> Sistema de Gestión de Útiles Escolares · Capturas, videos y logs

---

## ¿Por qué es importante la evidencia?

En entornos **low-code** o académicos, la evidencia de pruebas sirve para:

- **Cliente:** Demostrar que las funcionalidades fueron validadas
- **Evaluación académica:** Sustentar la entrega del proyecto
- **Auditoría:** Trazabilidad de lo probado
- **Equipo:** Referencia para regresiones futuras

---

## Tipos de Evidencia

### 1. Capturas de pantalla

| Flujo | Qué capturar | Nombre sugerido |
|-------|--------------|-----------------|
| Registro exitoso | Pantalla de confirmación | `01_registro_ok.png` |
| Login correcto | Panel según rol | `02_login_cliente.png` |
| Catálogo con filtros | Lista filtrada | `03_catalogo_filtro.png` |
| Reserva creada | Resumen de reserva | `04_reserva_creada.png` |
| Boleta generada | PDF o vista previa | `05_boleta_pdf.png` |
| Mensaje de error | Pantalla de error | `06_error_email_duplicado.png` |

**Recomendaciones:**
- Incluir fecha/hora en el nombre o en la captura
- Capturar tanto flujos exitosos como errores esperados
- Usar resolución adecuada (no comprimir en exceso)

---

### 2. Videos cortos de ejecución

| Duración sugerida | Contenido |
|-------------------|-----------|
| 30–60 segundos | Flujo completo: registro → login → reserva |
| 15–30 segundos | Un solo flujo (ej: crear reserva) |
| 10–20 segundos | Caso de error (ej: validación de campos) |

**Herramientas útiles:**
- **Windows:** Xbox Game Bar (Win + G), OBS
- **Android:** Grabación de pantalla nativa
- **iOS:** Grabación de pantalla en Centro de Control
- **Web:** Loom, OBS para navegador

**Estructura sugerida:**
```
evidencias/
  sprint_1/
    video_registro_login.mp4
    video_reserva_completa.mp4
  sprint_2/
    ...
```

---

### 3. Logs exportados

| Origen | Qué exportar | Formato |
|--------|--------------|---------|
| Backend (Node/Express) | Logs de API durante prueba | `.log` o `.txt` |
| Base de datos | Consultas ejecutadas (si aplica) | `.sql` o captura |
| Consola navegador | Errores o warnings | Copiar a `.txt` |
| App móvil | Logcat (Android) / Xcode (iOS) | `.log` |

**Ejemplo de nombre:** `logs_registro_usuario_20250226.txt`

---

## Estructura de carpetas recomendada

```
docs/
  evidencias/
    sprint_1/
      capturas/
        01_registro_ok.png
        02_login_cliente.png
      videos/
        flujo_registro_login.mp4
      logs/
        api_registro_20250226.log
    sprint_2/
      ...
    sprint_3/
      ...
```

---

## Checklist antes de entregar

- [ ] Capturas de flujos principales (éxito)
- [ ] Al menos una captura de mensaje de error validado
- [ ] Video de flujo end-to-end (opcional pero recomendado)
- [ ] Logs si hubo incidencias o para auditoría
- [ ] Referencias en el Reporte de Pruebas del Sprint

---

## Para evaluación académica

Si el proyecto se entrega para calificación:

1. **Incluir** capturas de cada historia de usuario probada
2. **Enlazar** evidencias en el reporte de pruebas
3. **Documentar** en el README o informe: "Evidencias en `docs/evidencias/`"
4. **Mantener** nombres descriptivos y orden cronológico por sprint

---

*Guía de evidencia de pruebas — Sistema de Gestión de Útiles Escolares.*
