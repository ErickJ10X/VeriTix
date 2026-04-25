# ERD — Representación textual alineada a Prisma

Fuente: `backend/prisma/schema.prisma`

## 1) Relaciones principales

- `User (1) -> (N) Event` por `events.creatorId`
- `User (1) -> (N) Order` por `orders.buyerId`
- `User (1) -> (N) Ticket` por `tickets.buyerId`
- `User (1) -> (N) Ticket(validated)` por `tickets.validatedById`
- `User (1) -> (N) RefreshToken`

- `Venue (1) -> (N) Event`
- `ConcertFormat (1) -> (N) Event` (opcional en Event)

- `Event (N) <-> (N) Genre` (M2M implícita)
- `Artist (N) <-> (N) Genre` (M2M implícita)

- `Event (N) <-> (N) Artist` vía `EventArtist`

- `Event (1) -> (N) TicketType`
- `Event (1) -> (N) Order`
- `Event (1) -> (N) Ticket`

- `Order (1) -> (N) OrderItem`
- `Order (1) -> (N) Ticket`
- `Order (1) -> (N) Payment`

- `TicketType (1) -> (N) OrderItem`
- `TicketType (1) -> (N) Ticket`

- `OrderItem (1) -> (N) Ticket`

## 2) Matriz entidad-resumen

| Entidad | PK | Unicidad destacada | FKs salientes |
|---|---|---|---|
| users | id | email, phone | - |
| refresh_tokens | id (jti) | - | user_id -> users |
| venues | id | slug | - |
| concert_formats | id | name, slug | - |
| genres | id | name, slug | - |
| artists | id | slug | - |
| event_artists | id | (event_id, artist_id) | event_id -> events, artist_id -> artists |
| events | id | - | creator_id -> users, venue_id -> venues, format_id -> concert_formats? |
| ticket_types | id | - | event_id -> events |
| orders | id | - | buyer_id -> users, event_id -> events |
| order_items | id | - | order_id -> orders, ticket_type_id -> ticket_types |
| tickets | id | hash | event_id -> events, buyer_id -> users, ticket_type_id -> ticket_types, order_id -> orders, order_item_id -> order_items, validated_by -> users? |
| payments | id | provider_payment_id?, provider_session_id? | order_id -> orders |

## 3) Observaciones de diseño (implementadas)

- Soft delete lógico en `users`, `artists`, `venues` mediante `is_active`.
- Compras modeladas por `orders + order_items`; tickets emitidos por unidad.
- Validación de acceso modelada en `tickets.status`, `validated_at`, `validated_by`.
