# VeriTix — Diseño de Base de Datos v2

> Documento de referencia para el esquema PostgreSQL orientado a **plataforma de tickets para conciertos**.
> Evolución de `prisma/schema.prisma` v1 aplicando principios de PostgreSQL Database Engineering.

---

## Tabla de Contenidos

1. [Resumen de Mejoras](#1-resumen-de-mejoras)
2. [Diagrama Entidad-Relación](#2-diagrama-entidad-relación)
3. [Modelos y Decisiones de Diseño](#3-modelos-y-decisiones-de-diseño)
4. [Estrategia de Índices](#4-estrategia-de-índices)

---

## 1. Resumen de Mejoras

| #   | Área           | Cambio                                                | Motivo                                                                          |
| --- | -------------- | ----------------------------------------------------- | ------------------------------------------------------------------------------- |
| 1   | **Géneros**    | Nuevo modelo `Genre` (M2M con `Event` y con `Artist`) | Géneros musicales únicamente: Rock, Metal, Electrónica, etc.                    |
| 2   | **Formato**    | Nuevo modelo `ConcertFormat` (M2O con `Event`)        | Tipo de show: Festival, Concierto, Tour, Tributo, Acústico, Club Night          |
| 3   | **Artistas**   | Nuevo modelo `Artist` + junction `EventArtist`        | Núcleo del dominio de conciertos; soporta headliner + teloneros con rol y orden |
| 4   | **Venue**      | Nuevo modelo `Venue` extraído de `Event`              | El venue es una entidad reutilizable (Foro Sol aparece en muchos eventos)       |
| 5   | **Órdenes**    | Nuevo modelo `Order` + `OrderItem`                    | Agrupa compras; habilita reembolsos, historial y futura integración de pagos    |
| 6   | **Tickets**    | Agrega `orderId` y `orderItemId`                      | Trazabilidad completa de cada ticket a su orden de compra                       |
| 7   | **TicketType** | Agrega `isActive`, `saleStartDate`, `saleEndDate`     | Venta anticipada vs taquilla en el mismo evento                                 |
| 8   | **Usuarios**   | Agrega `avatarUrl`                                    | Perfil de usuario completo                                                      |
| 9   | **Índices**    | Compuestos + parciales + covering + GIN               | Cada patrón de query con su índice óptimo                                       |
| 10  | **Full-text**  | `tsvector` generado en `events` y `artists`           | Búsqueda de texto completo en nombre, descripción y artistas                    |

---

## 2. Diagrama Entidad-Relación

```
┌───────────────┐           ┌──────────────────────────────────────────────┐
│ ConcertFormat │ 1       * │                    Event                     │
│───────────────│───────────│──────────────────────────────────────────────│
│ id            │           │ id            name          description       │
│ name (UNIQUE) │           │ eventDate     doorsOpenTime maxCapacity       │
│ slug (UNIQUE) │           │ status        imageUrl      currency          │
│ icon          │           │ startSale     endSale                        │
└───────────────┘           │ createdAt     updatedAt                      │
                            │                                              │
┌───────────────┐           │ creatorId  (FK → users)                      │
│     Genre     │ *       * │ venueId    (FK → venues)                     │
│───────────────│───────────│ formatId   (FK → concert_formats)            │
│ id            │(_EventGenres│                                            │
│ name (UNIQUE) │ junction) └──────────────────────────────────────────────┘
│ slug (UNIQUE) │                        │ 1              │ 1
│ description   │             ┌──────────┴──────┐   ┌────┴────────────┐
└───────────────┘           * │                 │ * │                 │
        │ *                   │   TicketType    │   │   EventArtist   │
        │                     │─────────────────│   │─────────────────│
        │ M2M                 │ name  price      │   │ role (ENUM)     │
        │ (_ArtistGenres)     │ totalQuantity    │   │ performOrder    │
        ▼ *                   │ availQuantity    │   │ performTime?    │
┌───────────────┐             │ maxPerUser       │   │ artistId (FK)   │
│    Artist     │             │ isActive         │   └────────────────-┘
│───────────────│             │ saleStartDate    │            │ *
│ id            │             │ saleEndDate      │            │
│ name          │             └─────────────────┘            │ 1
│ slug (UNIQUE) │                     │ 1             ┌───────────────┐
│ bio           │                   * │               │    Artist     │
│ imageUrl      │             ┌───────────────┐       │───────────────│
│ country       │             │    Ticket     │       │ id            │
│ website       │             │───────────────│       │ name          │
└───────────────┘             │ hash (UNIQUE) │       │ slug (UNIQUE) │
                              │ qrPayload     │       │ bio           │
                              │ status        │       │ imageUrl      │
                              │ purchaseDate  │       │ country       │
                              │ validatedAt   │       │ website       │
                              │ eventId   FK  │       └───────────────┘
                              │ buyerId   FK  │
                              │ ticketTypeId FK│
                              │ orderId   FK  │
                              │ orderItemId FK│
                              │ validatedById?│
                              └───────────────┘

┌───────────────────────────────────────────┐
│                  Venue                    │
│───────────────────────────────────────────│
│ id   name   slug (UNIQUE)                 │
│ address   city   state   country          │
│ capacity  type (ENUM)   imageUrl          │
│ website                                   │
│ ─→ events[]                               │
└───────────────────────────────────────────┘

┌───────────────────────────────────────────┐
│                  Order                    │
│───────────────────────────────────────────│
│ id   totalAmount   currency               │
│ status (ENUM)   paymentReference          │
│ buyerId (FK)   eventId (FK)               │
│ ─→ items[]   tickets[]                    │
└───────────────────────────────────────────┘
       │ 1
     * │
┌───────────────────────────────────────────┐
│                OrderItem                  │
│───────────────────────────────────────────│
│ id   quantity   unitPrice   subtotal      │
│ orderId (FK)   ticketTypeId (FK)          │
│ ─→ tickets[]                              │
└───────────────────────────────────────────┘

┌───────────────────────────────────────────┐
│                   User                    │
│───────────────────────────────────────────│
│ id   email (UNIQUE)   phone (UNIQUE)      │
│ name   lastName   avatarUrl               │
│ password   role (ENUM)   isActive         │
│ emailVerified   resetToken                │
│ ─→ events[] (creator)                     │
│ ─→ orders[]                               │
│ ─→ tickets[] (buyer)                      │
│ ─→ validatedTickets[] (validator)         │
└───────────────────────────────────────────┘
```

---

## 3. Modelos y Decisiones de Diseño

### 3.1 Artist (Nuevo) — el núcleo del dominio

En una plataforma de conciertos, el artista **es la entidad más buscada**. El usuario no busca "un evento", busca a "Radiohead" o "Natanael Cano".

- **M2M con `Event`** a través de `EventArtist` (tabla explícita con campos extra: rol, orden, hora de presentación).
- **M2M con `Genre`** a través de la junction implícita `_ArtistGenres`, para filtrar eventos por género desde el artista.

```
Coldplay en el Foro Sol:
  EventArtist { role: HEADLINER, performanceOrder: 2 }
  EventArtist { role: OPENER, performanceOrder: 1 } → Artist: Benson Boone
```

### 3.2 EventArtist (Junction Explícita)

Se usa tabla explícita (no M2M implícita) porque necesitamos campos extra en la relación:

| Campo              | Tipo         | Ejemplo                                            |
| ------------------ | ------------ | -------------------------------------------------- |
| `role`             | `ArtistRole` | `HEADLINER`, `SPECIAL_GUEST`, `OPENER`             |
| `performanceOrder` | `Int`        | Orden de presentación en el show (1 = primero)     |
| `performanceTime`  | `DateTime?`  | Hora exacta en festivales con múltiples escenarios |

La constraint `@@unique([eventId, artistId])` previene duplicados.

### 3.3 Venue (Nuevo) — entidad reutilizable

Un venue como "Foro Sol" o "Palacio de los Deportes" aparece en decenas de conciertos. Extraerlo evita duplicar dirección/ciudad en cada `Event` y permite:

- Filtrar todos los próximos conciertos en un venue específico.
- Mostrar la página del venue con su historial de shows.
- Comparar `venue.capacity` vs `event.maxCapacity` (el event puede usar solo una sección del venue).

**VenueType** orientado a conciertos:

| Valor           | Ejemplo                       |
| --------------- | ----------------------------- |
| `ESTADIO`       | Estadio Azteca                |
| `ARENA`         | Arena Ciudad de México        |
| `FORO`          | Foro Sol, Foro Indie Rocks    |
| `AUDITORIO`     | Auditorio Nacional            |
| `CLUB`          | Patrick Miller, Roxy          |
| `TEATRO`        | Teatro Metropolitan           |
| `AL_AIRE_LIBRE` | Parque Bicentenario, Zócalo   |
| `OTRO`          | Ubicaciones no convencionales |

### 3.4 ConcertFormat (Nuevo) — formato del show

Clasifica el **tipo de experiencia**, distinto del género musical. Un evento es exactamente de un formato.

| Formato      | Descripción                                   |
| ------------ | --------------------------------------------- |
| `CONCIERTO`  | Show de 1-2 artistas, noche única             |
| `FESTIVAL`   | Múltiples artistas, puede ser multi-día       |
| `TOUR`       | El evento es una fecha de una gira            |
| `TRIBUTO`    | Banda tributo a artista original              |
| `ACUSTICO`   | Formato íntimo, sin amplificación electrónica |
| `CLUB_NIGHT` | Show de DJ / música electrónica en club       |

### 3.5 Genre (M2M con Event Y con Artist)

Solo géneros musicales. Un mismo género conecta tanto a artistas como a eventos, lo que permite:

- Buscar eventos de Rock → vía `Event.genres`
- Buscar artistas de Rock → vía `Artist.genres`
- Ver qué otros artistas del mismo género están en la plataforma

### 3.6 Order + OrderItem

Compra atómica con trazabilidad completa:

```
Order (1 transacción)
  └── OrderItem x N (1 por tipo de ticket comprado)
        └── Ticket[] (1 registro por unidad física)
```

**Por qué es esencial:**

1. **Atomicidad**: Todos los tickets de una compra se crean en una sola transacción o ninguno.
2. **Reembolsos**: Se cancela la `Order` completa, no tickets individuales.
3. **Pagos**: `paymentReference` vincula con Stripe / MercadoPago / Conekta.
4. **Historial**: El buyer ve sus órdenes agrupadas, no tickets sueltos.

### 3.7 Event — Campos Modificados

| Campo           | v1                       | v2                       | Razón                                                |
| --------------- | ------------------------ | ------------------------ | ---------------------------------------------------- |
| `location`      | `String?` (nombre venue) | **Eliminado**            | Movido a `Venue.name`                                |
| `address`       | —                        | **Eliminado**            | Movido a `Venue.address`                             |
| `city`          | —                        | **Eliminado**            | Movido a `Venue.city`                                |
| `country`       | —                        | **Eliminado**            | Movido a `Venue.country`                             |
| `venueId`       | —                        | `String` FK              | Relación al modelo `Venue`                           |
| `formatId`      | —                        | `String?` FK             | Relación al modelo `ConcertFormat`                   |
| `doorsOpenTime` | —                        | `DateTime?`              | Hora de apertura de puertas (distinta a la del show) |
| `currency`      | —                        | `String @default("MXN")` | Soporte multi-moneda                                 |

---

## 4. Estrategia de Índices

Basada en los patrones de query más frecuentes de una plataforma de conciertos.

### 4.1 Principios Aplicados

- **Igualdad primero, rango después** (regla cardinal de índices compuestos B-Tree): columnas con `=` van antes que columnas con `>`, `<`, `BETWEEN`.
- **Alta selectividad primero**: cuando dos columnas son de igualdad, la más selectiva reduce más el espacio de búsqueda.
- **Índices parciales**: cuando hay un valor de columna muy dominante (ej. 90% de tickets son `ACTIVE`), el índice parcial es una fracción del tamaño y cabe en cache.
- **Covering indexes** (`INCLUDE`): para queries de listado que siempre piden las mismas columnas, el `INCLUDE` elimina el table lookup completamente (index-only scan).
- **GIN para texto y arrays**: B-Tree no puede indexar `tsvector`. GIN es el tipo correcto para full-text search y containment queries.

### 4.2 Índices por Tabla

#### `events`

| Índice                            | Patrón de Query                          | Tipo             |
| --------------------------------- | ---------------------------------------- | ---------------- |
| `(status, event_date)`            | Listar conciertos próximos publicados    | B-Tree compuesto |
| `(status, event_date, format_id)` | Filtrar por formato (Festivals próximos) | B-Tree compuesto |
| `(creator_id)`                    | Dashboard del organizador                | B-Tree           |
| `(venue_id)`                      | Página del venue con su agenda           | B-Tree           |

#### `event_artists`

| Índice                         | Patrón de Query                            | Tipo             |
| ------------------------------ | ------------------------------------------ | ---------------- |
| `(event_id, role)`             | Obtener headliner de un concierto          | B-Tree compuesto |
| `(artist_id)`                  | Historial de shows de un artista           | B-Tree           |
| `UNIQUE (event_id, artist_id)` | Prevenir artista duplicado en mismo evento | B-Tree único     |

#### `tickets`

| Índice                           | Patrón de Query                                        | Tipo             |
| -------------------------------- | ------------------------------------------------------ | ---------------- |
| `(buyer_id, status)`             | "Mis tickets" filtrados por estado                     | B-Tree compuesto |
| `(event_id, status)`             | Panel del validador: tickets activos del evento        | B-Tree compuesto |
| `UNIQUE (hash)`                  | Lookup al escanear QR (ya implícito por UNIQUE)        | B-Tree           |
| `(hash) WHERE status = 'ACTIVE'` | Lookup QR solo en tickets activos — **índice parcial** | B-Tree parcial   |

> **Por qué el índice parcial sobre hash:** en producción, el 80-90% de tickets ya están `USED`. El índice parcial es ~10x más pequeño, cabe en `shared_buffers` y las validaciones en puerta de concierto (high-throughput) lo benefician directamente.

#### `orders`

| Índice                   | Patrón de Query                   | Tipo             |
| ------------------------ | --------------------------------- | ---------------- |
| `(buyer_id, created_at)` | Historial de compras del usuario  | B-Tree compuesto |
| `(event_id, status)`     | Reporte de ventas del organizador | B-Tree compuesto |

#### `ticket_types`

| Índice                  | Patrón de Query                               | Tipo             |
| ----------------------- | --------------------------------------------- | ---------------- |
| `(event_id, is_active)` | Tipos de ticket disponibles para un concierto | B-Tree compuesto |

#### `venues`

| Índice          | Patrón de Query     | Tipo             |
| --------------- | ------------------- | ---------------- |
| `UNIQUE (slug)` | Lookup por URL slug | B-Tree           |
| `(city, type)`  | "Arenas en CDMX"    | B-Tree compuesto |

#### `artists`

| Índice                | Patrón de Query                        | Tipo   |
| --------------------- | -------------------------------------- | ------ |
| `UNIQUE (slug)`       | Lookup por URL slug                    | B-Tree |
| GIN `(search_vector)` | Full-text search por nombre de artista | GIN    |

### 4.3 Índices Adicionales SQL Raw

| Índice                           | Tabla           | Tipo             | Propósito                       |
| -------------------------------- | --------------- | ---------------- | ------------------------------- |
| `search_vector` columna generada | `events`        | GIN              | Full-text: nombre + descripción |
| `search_vector` columna generada | `artists`       | GIN              | Full-text: nombre + bio         |
| `LOWER(name)` expression index   | `events`        | B-Tree expresión | Autocomplete case-insensitive   |
| Covering index en listado        | `events`        | B-Tree + INCLUDE | Evitar table lookup en tarjetas |
| Junction `_EventGenres` lado B   | `_EventGenres`  | B-Tree           | Eventos de un género            |
| Junction `_ArtistGenres` lado B  | `_ArtistGenres` | B-Tree           | Artistas de un género           |

---

**Versión:** 2.0
**Fecha:** Marzo 2026
**Dominio:** Plataforma de tickets para conciertos
**Stack:** PostgreSQL 16 + Prisma 6 + NestJS
