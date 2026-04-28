# Ejecución del proyecto y pruebas

## Riesgos de ejecución del proyecto

### Identificación de riesgos

| ID  | Riesgo                                                             | Probabilidad | Impacto  |
| :-: | ------------------------------------------------------------------ | :----------: | :------: |
| R01 | Desalineación entre funcionalidades backend y frontend             |    Media     |   Alto   |
| R02 | Errores en flujos de pago/webhook con efectos en órdenes y tickets |    Media     |   Alto   |
| R03 | Defectos de seguridad en autenticación o manejo de secrets         |     Baja     | Muy alto |
| R04 | Degradación bajo concurrencia en compra de tickets                 |    Media     |   Alto   |
| R05 | Desactualización documental respecto al código real                |     Alta     |  Medio   |

### Plan de prevención y mitigación

| Riesgo | Mitigación                                                                                   |
| ------ | -------------------------------------------------------------------------------------------- |
| R01    | Mantener matriz de estado funcional por capa (backend/frontend) y actualizarla en cada hito. |
| R02    | Pruebas de integración y e2e específicas de órdenes, tickets y webhooks.                     |
| R03    | Validación estricta de entorno, revisión de permisos y rotación de credenciales.             |
| R04    | Mantener y ampliar suites de concurrencia (`test:concurrency`) y stress.                     |
| R05    | Auditorías documentales periódicas con trazabilidad a archivos de código.                    |

### Necesidades legales

En el contexto académico no se requieren licencias de actividad. Para explotación comercial sí
aplica cumplimiento en protección de datos, comercio electrónico y obligaciones fiscales.

## Incidencias

### Protocolo de resolución

#### Recopilación de información

Para cada incidencia se debe registrar: contexto funcional, pasos de reproducción, rol afectado,
hora, entorno (local/staging/prod), trazas relevantes y severidad.

#### Diagnóstico y solución

1. Clasificar incidencia (funcional, seguridad, rendimiento, datos, UX).
2. Reproducir en entorno controlado.
3. Aplicar corrección mínima verificable.
4. Ejecutar pruebas de regresión del módulo impactado.

#### Comunicación

- Las incidencias se iran registrando en el repositorio de GitHub como issues etiquetados por tipo y prioridad.
- Se notificará a los stakeholders relevantes (equipo, tutor) para incidencias críticas o bloqueantes.
