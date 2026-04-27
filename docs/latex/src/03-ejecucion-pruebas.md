# Ejecución del proyecto y pruebas

## Riesgos de ejecución del proyecto

### Identificación de riesgos

| ID  | Riesgo                                                             | Probabilidad | Impacto  |
| :-: | :----------------------------------------------------------------- | :----------: | :------: |
| R01 | Desalineación entre funcionalidades backend y frontend             |    Media     |   Alto   |
| R02 | Errores en flujos de pago/webhook con efectos en órdenes y tickets |    Media     |   Alto   |
| R03 | Defectos de seguridad en autenticación o manejo de secrets         |     Baja     | Muy alto |
| R04 | Degradación bajo concurrencia en compra de tickets                 |    Media     |   Alto   |
| R05 | Desactualización documental respecto al código real                |     Alta     |  Medio   |

### Plan de prevención y mitigación

| Riesgo | Mitigación                                                                                   |
| :----- | :------------------------------------------------------------------------------------------- |
| R01    | Mantener matriz de estado funcional por capa (backend/frontend) y actualizarla en cada hito. |
| R02    | Pruebas de integración y e2e específicas de órdenes, tickets y webhooks.                     |
| R03    | Validación estricta de entorno, revisión de permisos y rotación de credenciales.             |
| R04    | Mantener y ampliar suites de concurrencia (`test:concurrency`) y stress.                     |
| R05    | Auditorías documentales periódicas con trazabilidad a archivos de código.                    |

## Documentación de ejecución

### Necesidades legales

En el contexto académico no se requieren licencias de actividad. Para explotación comercial sí
aplica cumplimiento en protección de datos, comercio electrónico y obligaciones fiscales.

### Ejecución del proyecto (estado verificable)

**Ficheros de configuración relevantes:**

- `backend/.env.example`: variables necesarias del backend (`DATABASE_URL`, secrets JWT,
  Stripe, Resend, Redis, CORS, etc.).
- `backend/src/config/env.validation.ts`: validación Joi de variables críticas en arranque.
- `backend/prisma/schema.prisma`: modelo de datos y restricciones.
- `backend/docker-compose.yml` y `frontend/docker-compose.yml`: configuración de contenedores
  por paquete. (No existe un `docker-compose.yml` único en la raíz).

### Contenerización y despliegue operativo

La solución está containerizada y preparada para operarse en una VPS con servicios aislados.
El backend levanta PostgreSQL, Redis y la API en contenedores separados; el frontend usa un
`Dockerfile` multi-stage con runtime no-root.

**Frontend (Dockerfile multi-stage)**

```dockerfile
FROM oven/bun:1-alpine AS base
WORKDIR /app

FROM base AS deps
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

FROM deps AS builder
COPY . .
RUN bun run build

FROM oven/bun:1-alpine AS production
WORKDIR /app
ENV NODE_ENV=production
ENV NITRO_HOST=0.0.0.0
ENV NITRO_PORT=3000
USER nuxt
EXPOSE 3000
CMD ["bun", ".output/server/index.mjs"]
```

**Backend (orquestación de servicios)**

```yaml
services:
    postgres:
        image: postgres:18-alpine
        restart: unless-stopped
        ports:
            - '127.0.0.1:5432:5432'

    redis:
        image: redis:8-alpine
        restart: unless-stopped
        ports:
            - '127.0.0.1:6379:6379'

    backend:
        build:
            dockerfile: Dockerfile.dev
        ports:
            - '3001:3001'
```

**Aspectos técnicos confirmados:**

- API con prefijo global `/api/v1`.
- Documentación Swagger activa en `/docs`.
- Webhook de Stripe en `/api/v1/webhooks/stripe` con `rawBody` habilitado para firma.
- Seguridad con `helmet`, `cookie-parser`, validación global y guards.

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

#### Registro

Las incidencias deben documentarse en GitHub Issues/PR con: descripción, evidencia, raíz del
problema, cambio aplicado, pruebas asociadas y estado de cierre.
