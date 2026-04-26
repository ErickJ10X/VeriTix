# Estudio inicial previo a la realización del proyecto

## Clasificación de empresas del sector por organización y servicio

El sector de gestión de eventos y ticketing digital puede agruparse en tres tipos de organizaciones:

### Organizadores de eventos

Promotoras, instituciones y asociaciones que necesitan publicar eventos, controlar aforo y gestionar
ventas desde una plataforma única.

### Plataformas de ticketing

Empresas que comercializan entradas de terceros y operan con alto volumen transaccional,
especialmente en aperturas de venta con picos de concurrencia.

### Operadores de acceso y validación

Equipos y empresas que gestionan el acceso físico al recinto y requieren validación rápida, trazable
y resistente a intentos de reutilización de entradas.

## Ejemplo de estructura organizativa del sector

Una ticketera digital de tamaño medio suele organizarse en:

- **Dirección:** estrategia y priorización de negocio.
- **Operaciones:** relación con organizadores y operación de eventos.
- **Tecnología:** backend, frontend, base de datos, seguridad y despliegue.
- **Comercial/marketing:** captación de organizadores y promoción.
- **Atención al cliente:** incidencias de compra y acceso.
- **Validación en campo:** control de acceso durante el evento.

## Necesidades que cubre VeriTix

VeriTix aborda necesidades reales del sector con alcance verificable en el repositorio:

- **Centralización operativa:** gestión de eventos, catálogos y usuarios desde una API unificada.
- **Control de stock y sobreventa:** compra con transacciones atómicas en PostgreSQL/Prisma.
- **Trazabilidad del acceso:** tickets con hash único y registro de validación (`validatedAt`, `validatedBy`).
- **Automatización del flujo de cobro:** integración con Stripe Checkout + webhooks.
- **Notificación transaccional:** envío de emails de verificación y confirmación mediante Resend y BullMQ.

## Descripción del proyecto

VeriTix es un monorepo con dos aplicaciones desacopladas:

- **Backend:** NestJS 11 + TypeScript + Prisma 7 + PostgreSQL + Redis.
- **Frontend:** Nuxt 4 + Vue 3 + Nuxt UI + Tailwind 4.

La autenticación se basa en JWT (access token de corta vida y refresh token en cookie HTTP-only
con rotación). El dominio contempla roles `BUYER`, `CREATOR`, `VALIDATOR` y `ADMIN`.

## Justificación del tipo de solución

Se selecciona arquitectura web desacoplada (API REST + cliente web SSR/SPA) por:

- **Escalabilidad operativa:** separación de backend y frontend para evolucionar cada capa.
- **Mantenibilidad:** módulos de dominio en NestJS y tipado fuerte extremo a extremo.
- **Portabilidad:** la API puede reutilizarse por otros clientes (ej. app móvil).
- **Accesibilidad:** acceso multiplataforma sin instalación de software cliente nativo.

## Características principales del sistema

- **Autenticación y roles por servidor** con validación de permisos por endpoint.
- **Compra transaccional con Stripe**, confirmación por webhook y generación de tickets.
- **Validación por hash único** con trazabilidad de uso y auditoría de acceso.
- **Catálogos de dominio** (artistas, recintos, géneros y formatos).
- **Caché con Redis** para consultas frecuentes.

> Nota de alcance: las capacidades descritas corresponden al estado verificable del código fuente.
> Cuando una funcionalidad no está integrada en frontend, se declara explícitamente como pendiente.
