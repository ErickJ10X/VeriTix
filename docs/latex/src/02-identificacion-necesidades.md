# Identificación de necesidades y diseño del proyecto

## Estudio inicial y planificación del proyecto

### Identificar las fases del proyecto y su contenido

La planificación original se definió en ocho fases. A continuación se refleja el grado de
cumplimiento según el estado real del repositorio (abril de 2026).

| \focheadcell{Fase}                | \focheadcell{Contenido planificado}                       |                \focheadcell{Estado actual}                |
| :-------------------------------- | :-------------------------------------------------------- | :-------------------------------------------------------: |
| 1. Análisis y diseño              | Requisitos, modelo de datos, contratos API, wireframes    |                        Completada                         |
| 2. Autenticación y usuarios       | Registro/login/refresh/roles                              |           Completada (backend + frontend base)            |
| 3. Gestión de eventos y catálogos | CRUD de eventos, recintos, artistas, géneros y formatos   |                        Completada                         |
| 4. Venta de tickets               | Órdenes, Stripe Checkout, webhooks, generación de tickets |   Completada en backend; integración frontend pendiente   |
| 5. Validación de tickets          | Endpoint de validación y trazabilidad de acceso           |        Backend completado; UI de scanner pendiente        |
| 6. Panel administrativo           | Gestión y métricas para administración                    |            Completada (área admin en frontend)            |
| 7. Testing                        | Pruebas unitarias/integración/e2e/concurrencia            | Implementadas en backend; no ejecutadas en esta auditoría |
| 8. Despliegue y documentación     | Operación productiva y manuales finales                   |                          Parcial                          |

### Especificar los objetivos del proyecto

- Centralizar la gestión de eventos y tipos de ticket.
- Automatizar venta, cobro y emisión digital de tickets.
- Evitar sobreventa con consistencia transaccional.
- Asegurar validación de acceso trazable por ticket.
- Mantener un modelo de permisos por rol en backend y frontend.

### Especificar recursos hardware y software

**Hardware de referencia**

- Equipos de desarrollo para ejecutar backend, frontend y servicios auxiliares.
- Dispositivos móviles para validación de UI responsive y pruebas de lectura QR.
- Servidor de despliegue (cuando se opere en producción).

**Stack software real del proyecto**

| \focheadcell{Capa / dominio} | \focheadcell{Tecnologías y mecanismos}                 |
| :--------------------------- | :----------------------------------------------------- |
| Backend                      | NestJS 11, Prisma 7, PostgreSQL, Redis, BullMQ.        |
| Frontend                     | Nuxt 4, Vue 3, Nuxt UI, Tailwind 4.                    |
| Auth                         | JWT + refresh token HTTP-only con rotación.            |
| Pagos                        | Stripe Checkout + webhook (`/api/v1/webhooks/stripe`). |
| Notificaciones               | Resend (emails) + colas BullMQ.                        |
| Testing                      | Jest, Supertest y suites de concurrencia.              |

### Especificar recursos materiales y personales

**Recursos materiales**

- Infraestructura local de desarrollo y repositorio GitHub.
- Servicios externos de pago y correo para entorno real (Stripe, Resend).

**Recursos personales**

| \focheadcell{Rol}    | \focheadcell{Responsabilidad}               |
| :------------------- | :------------------------------------------ |
| Equipo de desarrollo | Backend, frontend y base de datos.          |
| Tutor                | Seguimiento técnico y validación académica. |

### Asociación entre fases y recursos (materiales y humanos)

| \focheadcell{Fase}          | \focheadcell{Recursos materiales}            | \focheadcell{Recursos humanos} |
| :-------------------------- | :------------------------------------------- | :----------------------------: |
| Análisis/diseño             | Herramientas de modelado y documentación     |  Equipo técnico del proyecto   |
| Desarrollo backend/frontend | IDE, control de versiones, servicios locales |  Equipo técnico del proyecto   |
| Testing                     | Suites automáticas + dispositivos de prueba  |     Equipo técnico + tutor     |
| Revisiones por hito         | Documentación de avance y evidencias         |        Tutor académico         |
| Despliegue / cierre         | Servidor, reverse proxy, certificados TLS    |     Equipo técnico + tutor     |

## Aspectos fiscales y laborales

### Obligaciones de protección de datos (RGPD/LOPD-GDD)

El sistema trata datos personales de usuarios registrados (identidad y contacto), por lo que debe
garantizar información al usuario, base legal del tratamiento, medidas de seguridad y gestión de
derechos ARSOPL.

### Aspectos fiscales

Para explotación comercial, las operaciones de venta deben integrarse con obligaciones de
facturación e impuestos aplicables según jurisdicción.

### Prevención de riesgos laborales

En el contexto de desarrollo software, los riesgos principales son ergonómicos y visuales derivados
del trabajo prolongado con pantallas, mitigables con pausas y condiciones de puesto adecuadas.

## Viabilidad económica

### Presupuesto económico

| \focheadcell{Concepto}                       |     \focheadcell{Coste estimado} |
| :------------------------------------------- | -------------------------------: |
| Desarrollo realizado por el equipo académico | 0€ (coste imputado no monetario) |
| Dominio y hosting básico anual               |  Bajo (dependiente de proveedor) |
| Licencias software base                      |           0€ (stack open source) |

### Financiación necesaria

La fase académica requiere financiación reducida. Para fase comercial, la estructura de costes
debe recalcularse según volumen transaccional, SLAs y soporte.

### Ayudas y subvenciones

Como opción futura, el proyecto podría optar a programas de emprendimiento o digitalización,
condicionado a formalización empresarial y plan financiero específico.

## Modelo de solución

### Modelado de la solución

#### Arquitectura general del sistema

VeriTix adopta arquitectura cliente-servidor desacoplada en monorepo. El frontend consume
exclusivamente la API REST del backend.

| \focheadcell{Aspecto} | \focheadcell{Backend}                      | \focheadcell{Frontend}          |
| :-------------------- | :----------------------------------------- | :------------------------------ |
| Framework             | NestJS 11                                  | Nuxt 4 / Vue 3                  |
| Puerto local habitual | 3001                                       | 3000                            |
| Responsabilidad       | Lógica de negocio, seguridad, persistencia | UI, navegación y consumo de API |
| Persistencia          | Prisma 7 + PostgreSQL                      | Sin acceso directo a BD         |

#### Módulos backend (estado verificable)

La implementación backend se organiza en dominios funcionales claramente delimitados:

| \focheadcell{Dominio funcional} | \focheadcell{Módulos}                               |
| :------------------------------ | :-------------------------------------------------- |
| Identidad y acceso              | `auth`, `users`                                     |
| Catálogo y eventos              | `events` (incluye `ticket-types` y `event-artists`) |
| Transacción y emisión           | `orders`, `tickets`, `webhooks`                     |
| Infraestructura de dominio      | `venues`, `artists`, `genres`, `concert-formats`    |
| Soporte operativo               | `notifications`, `queues`, `cache`                  |

#### API real del sistema

El backend aplica prefijo global configurable mediante `API_PREFIX` y, en ausencia de valor en
entorno, utiliza `api/v1` (`backend/src/main.ts`). Por tanto, las rutas públicas/protegidas se
consumen como `/api/v1/...`.

Los contratos siguientes se extrajeron de controladores y DTOs del repositorio
(`backend/src/modules/**`). Se rediseñan en tablas compactas para mantener legibilidad en PDF.

**Autenticación**

| \focheadcell{Endpoint}     | \focheadcell{Seguridad} | \focheadcell{Resumen funcional}                       |
| :------------------------- | :---------------------- | :---------------------------------------------------- |
| POST /api/v1/auth/register | Pública                 | Alta usuario y devuelve mensaje de verificación       |
| POST /api/v1/auth/login    | Pública                 | Recibe credenciales y devuelve token + cookie refresh |
| POST /api/v1/auth/refresh  | Cookie refresh válida   | Emite nuevo access token y rota cookie                |
| POST /api/v1/auth/logout   | JWT + cookie refresh    | Revoca refresh token y limpia cookie (204)            |

**Eventos y catálogo**

| \focheadcell{Endpoint}                    | \focheadcell{Seguridad} | \focheadcell{Resumen funcional}        |
| :---------------------------------------- | :---------------------- | :------------------------------------- |
| GET /api/v1/events                        | Pública                 | Lista eventos con paginación y filtros |
| POST /api/v1/events                       | JWT + rol ADMIN/CREATOR | Crea evento                            |
| POST /api/v1/events/:id/publish           | JWT + rol ADMIN/CREATOR | Publica evento existente               |
| POST /api/v1/events/:eventId/ticket-types | JWT + rol ADMIN/CREATOR | Crea tipo de ticket para un evento     |

**Órdenes, tickets y pagos**

| \focheadcell{Endpoint}        | \focheadcell{Seguridad}       | \focheadcell{Resumen funcional}                |
| :---------------------------- | :---------------------------- | :--------------------------------------------- |
| POST /api/v1/orders           | JWT usuario autenticado       | Crea orden y retorna checkoutUrl cuando aplica |
| GET /api/v1/orders/my         | JWT usuario autenticado       | Lista órdenes del comprador                    |
| GET /api/v1/tickets/mine      | JWT usuario autenticado       | Lista tickets del comprador                    |
| POST /api/v1/tickets/validate | JWT + rol ADMIN/VALIDATOR     | Valida ticket por hash y registra trazabilidad |
| POST /api/v1/webhooks/stripe  | Firma stripe-signature válida | Procesa evento de pago/reembolso               |

**Cobertura de flujo (backend vs frontend).**

| \focheadcell{Capa} | \focheadcell{Estado verificable}                                                                                                                                                                                       |
| :----------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Backend            | Contratos de auth, eventos, órdenes, tickets y webhook Stripe implementados, con suites de pruebas en `backend/test/` y `backend/src/**/*.spec.ts`.                                                                    |
| Frontend           | Cobertura para autenticación, catálogo público de eventos y área administrativa; los flujos de compra de órdenes, consumo de tickets del comprador y scanner/validación final en UI permanecen parciales o pendientes. |

#### Modelo de datos y constraints

El esquema Prisma (`backend/prisma/schema.prisma`) se organiza en dos bloques:

| \focheadcell{Bloque} | \focheadcell{Entidades}                                                   |
| :------------------- | :------------------------------------------------------------------------ |
| Núcleo transaccional | User, RefreshToken, Event, TicketType, Order, OrderItem, Ticket, Payment. |
| Catálogos y soporte  | Venue, Artist, Genre, ConcertFormat, EventArtist.                         |

**Relaciones principales verificables**

| \focheadcell{Relación}                | \focheadcell{Cardinalidad} |
| :------------------------------------ | :------------------------: |
| User (creator) con Event              |            1:N             |
| Event con TicketType, Order y Ticket  |            1:N             |
| Order con OrderItem, Payment y Ticket |            1:N             |
| TicketType con OrderItem y Ticket     |            1:N             |
| User (buyer) con Order y Ticket       |            1:N             |
| User (validator) con Ticket validado  |       1:N (opcional)       |
| Event con Artist mediante EventArtist |            N:M             |
| Event con Genre y Artist con Genre    |            N:M             |

**Constraints e índices relevantes (extracto)**

| \focheadcell{Tipo de restricción} | \focheadcell{Detalle}                                                                                                                                               |
| :-------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Unicidad                          | `users.email`, `users.phone`, `tickets.hash`, `venues.slug`, `artists.slug`, `genres.name/slug`, `concert_formats.name/slug`, `event_artists(event_id, artist_id)`. |
| Integridad referencial (FK)       | Presente en las relaciones críticas (`event_id`, `buyer_id`, `order_id`, etc.).                                                                                     |
| Cascadas de borrado               | `RefreshToken→User`, `EventArtist→Event`, `TicketType→Event`, `OrderItem→Order`, `Ticket→Event`.                                                                    |
| Índices de consulta               | `events(status, eventDate)`, `orders(buyerId, createdAt)`, `orders(eventId, status)`, `tickets(buyerId, status)`, `tickets(eventId, status)`.                       |
| Enums de dominio                  | `Role`, `EventStatus`, `OrderStatus`, `TicketStatus`, `PaymentStatus`.                                                                                              |

**Limitaciones actuales del esquema (a considerar)**

| \focheadcell{Limitación}                      | \focheadcell{Implicación}                                                                                                          |
| :-------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------- |
| Ausencia de CHECK constraints                 | No se observan restricciones como `availableQuantity >= 0`, `totalQuantity >= availableQuantity` o `saleStartDate <= saleEndDate`. |
| `currency` como String                        | Requiere validación estricta de ISO.                                                                                               |
| FKs sin `onDelete` explícito en algunos casos | Conviene revisar políticas de borrado para producción.                                                                             |

#### Diagrama entidad-relación (resumen)

Para mantener legibilidad, el diagrama ER se presenta en vistas por dominio generadas automáticamente desde Prisma.

**Vista general (overview)**

\begin{center}
\includegraphics[width=\textwidth,trim=10pt 492pt 10pt 10pt,clip]{assets/er-overview.pdf}
\end{center}

\Needspace{16\baselineskip}
\par\noindent\textbf{Dominio transaccional (ventas, órdenes, tickets y pagos)}\par
\begin{center}
\includegraphics[width=\textwidth,trim=10pt 286pt 10pt 10pt,clip]{assets/er-core-transaccional.pdf}
\end{center}

#### Seguridad y control de integridad

| \focheadcell{Mecanismo}      | \focheadcell{Función}                                   |
| :--------------------------- | :------------------------------------------------------ |
| JWT + refresh token rotativo | Autenticación y renovación segura de sesión.            |
| Joi en `env.validation.ts`   | Validación de variables de entorno críticas.            |
| `prisma.$transaction()`      | Aislamiento de operaciones críticas de compra.          |
| Hash SHA-256 por ticket      | Identificación y validación del ticket vía `qrPayload`. |

### Puntos de control para validación del proyecto

| \focheadcell{Punto de control}   | \focheadcell{Verificación}                 |
| :------------------------------- | :----------------------------------------- |
| Integridad y unicidad del ticket | Validación de uso único en acceso.         |
| Prevención de sobreventa         | Consistencia bajo concurrencia.            |
| Control de acceso por rol        | Protección de endpoints sensibles.         |
| Auditoría de validación          | Registro de `validatedAt` y `validatedBy`. |
| Confirmación de pago             | Webhook y emisión de notificaciones.       |
