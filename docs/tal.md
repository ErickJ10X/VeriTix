# 📊 Tabla Resumen: Arquitectura VeriTix

> Este documento es un **resumen ejecutivo** de la arquitectura.
>
> Para **detalles completos** ver → [ARQUITECTURA.md](ARQUITECTURA.md)

---

## 📋 Contenidos Rápidos

1. [Stack Tecnológico](#stack-tecnológico)
2. [Comunicación Backend ↔ Frontend](#comunicación-backend--frontend)
3. [Módulos Backend](#módulos-backend)
4. [Rutas Frontend](#rutas-frontend)
5. [Seguridad](#seguridad)
6. [Setup Desarrollo](#setup-desarrollo)

---

## Stack Tecnológico

### 🔧 Backend (Nest.js)

- **Framework:** Nest.js + TypeScript
- **Database:** PostgreSQL + TypeORM
- **Authentication:** JWT + Passport
- **Validation:** class-validator
- **Server Port:** 3001
- **Key Packages:** @nestjs/core, @nestjs/jwt, typeorm, class-validator

### 🎨 Frontend (Next.js)

- **Framework:** Next.js 13+ (App Router)
- **UI:** React 18 + TypeScript
- **State:** Zustand
- **Styling:** Tailwind CSS
- **HTTP:** Fetch nativo
- **Client Port:** 3000
- **Key Packages:** next, zustand, tailwindcss, qrcode.react

---

## Comunicación Backend ↔ Frontend

```
FRONTEND (Next.js, puerto 3000)
         │
         │ HTTP Requests + JWT Token
         │ Header: "Authorization: Bearer token"
         ↓
BACKEND (Nest.js, puerto 3001)
         │
         │ Verifica JWT
         │ Valida permisos (roles)
         │ Ejecuta lógica negocio
         ↓
         │ HTTP Responses
         ↓
FRONTEND recibe JSON y actualiza UI
```

**Ejemplo: Compra de Tickets**

```typescript
// Frontend
POST http://localhost:3001/api/tickets/buy
{
  "eventId": "123",
  "typeId": "VIP",
  "quantity": 2
}
Headers: {
  "Authorization": "Bearer eyJhbGc..."
}

// Backend responde
{
  "tickets": [
    { "id": "t1", "hash": "abc123", "qr_code": "data:..." },
    { "id": "t2", "hash": "def456", "qr_code": "data:..." }
  ],
  "total": 100
}
```

---

## Módulos Backend

### Auth (`/src/auth`)

- **Rutas:** POST /auth/login, POST /auth/register
- **Responsabilidad:** Autenticación JWT, hash passwords
- **Requerimientos:** RF-01, RF-02
- **Guards:** JwtGuard

### Events (`/src/events`)

- **Rutas:** GET /events, POST /events, PATCH /events/:id, DELETE /events/:id
- **Responsabilidad:** CRUD eventos, validar capacidad
- **Requerimientos:** RF-05, RF-06, RF-07, RF-08
- **Guards:** JwtGuard, RolesGuard (creator, admin)

### Tickets (`/src/tickets`)

- **Rutas:** POST /tickets/buy, GET /tickets/:id, GET /tickets/my-tickets
- **Responsabilidad:** Compra, generación QR encriptado, transacciones atómicas
- **Requerimientos:** RF-11, RF-12, RF-13, RF-14, RF-15
- **Guards:** JwtGuard (buyer)

### Validation (`/src/validation`)

- **Rutas:** POST /validation/scan, GET /validation/stats
- **Responsabilidad:** Verificar QR, marcar como usado, registrar acceso
- **Requerimientos:** RF-16, RF-17, RF-18, RF-19, RF-20
- **Guards:** JwtGuard, RolesGuard (validator, admin)

---

## Rutas Frontend

### Públicas (Sin autenticación)

| Ruta             | Componente   | Función               |
| ---------------- | ------------ | --------------------- |
| `/`              | HomePage     | Página inicio         |
| `/auth/login`    | LoginForm    | RF-02: Iniciar sesión |
| `/auth/register` | RegisterForm | RF-01: Crear cuenta   |

### Protegidas - Dashboard (Todos)

| Ruta                     | Rol   | Función               |
| ------------------------ | ----- | --------------------- |
| `/dashboard`             | Todos | Inicio dashboard      |
| `/dashboard/events`      | Todos | RF-06: Listar eventos |
| `/dashboard/events/[id]` | Todos | RF-05: Detalle evento |

### Protegidas - Creator

| Ruta                       | Función             |
| -------------------------- | ------------------- |
| `/dashboard/events/create` | RF-05: Crear evento |
| `/dashboard/analytics`     | Estadísticas evento |

### Protegidas - Buyer

| Ruta                      | Función                              |
| ------------------------- | ------------------------------------ |
| `/dashboard/tickets`      | RF-11: Mis tickets                   |
| `/dashboard/tickets/[id]` | RF-12, RF-15: Ver QR + descargar PDF |

### Protegidas - Validator

| Ruta         | Función                   |
| ------------ | ------------------------- |
| `/validator` | RF-16, RF-17: Escanear QR |

---

## Seguridad

### Autenticación JWT

```
USUARIO:email + password
         ↓
BACKEND verifica → Genera JWT Token
         ↓
FRONTEND almacena en localStorage
         ↓
CADA REQUEST:
  Authorization: Bearer eyJhbGc...
         ↓
BACKEND verifica JWT válido y extrae user info
```

### Protección por Rol

**Backend:** Decoradores para roles

```typescript
@Roles('creator', 'admin')
```

**Frontend:** Middleware protege rutas

```typescript
if (user.role !== 'creator') redirect('/dashboard');
```

### Seguridad QR

```
GENERACIÓN: SHA256 hash + AES256 encrypt + QR code
VERIFICACIÓN: Desencriptar + buscar en BD + marcar usado
```

---

## Variables de Entorno

### Backend (.env)

```bash
PORT=3001
DATABASE_URL=postgresql://veritix:password@localhost:5432/veritix
JWT_SECRET=tu_secret_key_muy_segura
```

### Frontend (.env.local)

```bash
NEXT_PUBLIC_API_URL=http://localhost:3001
```

---

## Setup Rápido (Docker)

```bash
docker-compose up
```

Accede a:

- Frontend: http://localhost:3000
- Backend: http://localhost:3001
- PostgreSQL: localhost:5432

---

```
**Para detalles completos:** [→ Ver ARQUITECTURA.md](ARQUITECTURA.md)
│ │ │ ├── ticket-types.controller.ts
│ │ │ ├── ticket-types.service.ts
│ │ │ ├── ticket-type.entity.ts
│ │ │ ├── dto/
│ │ │ │ └── create-ticket-type.dto.ts
│ │ │ └── ticket-types.module.ts
│ │ │
│ │ ├── tickets/ # 📦 MÓDULO: Tickets (RF-11, RF-12, RF-13, RF-14, RF-15)
│ │ │ ├── tickets.controller.ts # POST /buy, GET /mine, GET /:id
│ │ │ ├── tickets.service.ts # Lógica: compra, generación QR, encriptación
│ │ │ ├── ticket.entity.ts # Campos: hash, status, qr_code
│ │ │ ├── qr.generator.ts # Generar QR único encriptado
│ │ │ ├── dto/
│ │ │ │ └── buy-ticket.dto.ts # { eventId, typeId, quantity }
│ │ │ └── tickets.module.ts
│ │ │
│ │ ├── validation/ # 📦 MÓDULO: Validación QR (RF-16, RF-17, RF-18, RF-19, RF-20)
│ │ │ ├── validation.controller.ts # POST /scan, GET /stats
│ │ │ ├── validation.service.ts # Verificar QR, marcar como usado, logs
│ │ │ ├── qr.verifier.ts # Desencriptar y verificar hash
│ │ │ └── validation.module.ts
│ │ │
│ │ ├── common/ # Utilidades compartidas
│ │ │ ├── filters/
│ │ │ │ └── http-exception.filter.ts # Manejo de excepciones
│ │ │ ├── guards/
│ │ │ │ ├── jwt.guard.ts # Verificar JWT
│ │ │ │ └── roles.guard.ts # Verificar roles (buyer, creator, validator)
│ │ │ ├── decorators/
│ │ │ │ ├── current-user.decorator.ts # Inyectar usuario desde token
│ │ │ │ └── roles.decorator.ts # @Roles('creator', 'admin')
│ │ │ └── pipes/
│ │ │ └── validation.pipe.ts # Validar DTOs
│ │ │
│ │ ├── database/
│ │ │ ├── typeorm.config.ts # Configuración conexión BD
│ │ │ └── migrations/ # Migraciones SQL
│ │ │
│ │ └── config/
│ │ ├── env.ts # Variables de entorno
│ │ └── constants.ts # Constantes aplicación
│ │
│ ├── test/ # Tests unitarios e integración
│ ├── .env.example # Variables ejemplo
│ └── package.json
│
└── frontend/ # 🎨 Next.js Application
├── src/
│ ├── app/ # App Router (Next.js 13+ moderno)
│ │ ├── layout.tsx # Layout raíz, HTML base
│ │ ├── page.tsx # Página principal /
│ │ ├── not-found.tsx # Página 404
│ │ │
│ │ ├── auth/ # Rutas públicas de autenticación
│ │ │ ├── layout.tsx # Layout específico auth
│ │ │ ├── login/
│ │ │ │ └── page.tsx # /auth/login (RF-02)
│ │ │ └── register/
│ │ │ └── page.tsx # /auth/register (RF-01)
│ │ │
│ │ ├── dashboard/ # Rutas protegidas
│ │ │ ├── layout.tsx # Protegido por middleware + AuthProvider
│ │ │ ├── page.tsx # /dashboard (inicio)
│ │ │ │
│ │ │ ├── events/ # Para todos (RF-06)
│ │ │ │ ├── page.tsx # /dashboard/events - lista eventos
│ │ │ │ ├── [id]/
│ │ │ │ │ └── page.tsx # /dashboard/events/123 - detalle evento
│ │ │ │ │
│ │ │ │ └── create/ # Solo creators (RF-05)
│ │ │ │ └── page.tsx # /dashboard/events/create
│ │ │ │
│ │ │ ├── tickets/ # Para buyers
│ │ │ │ ├── page.tsx # /dashboard/tickets - mis tickets (RF-11)
│ │ │ │ └── [id]/
│ │ │ │ └── page.tsx # /dashboard/tickets/123 - QR + descarga (RF-12, RF-15)
│ │ │ │
│ │ │ └── analytics/ # Para creators
│ │ │ └── page.tsx # /dashboard/analytics - estadísticas eventos
│ │ │
│ │ ├── validator/ # Rutas especiales para validadores (RF-16)
│ │ │ ├── layout.tsx
│ │ │ └── page.tsx # /validator - scanner QR
│ │ │
│ │ └── api/ # API Routes (opcional, solo si necesitas proxy)
│ │ └── [...proxy]/
│ │ └── route.ts # Proxy a Nest.js (raro, normalmente innecesario)
│ │
│ ├── components/ # Componentes reutilizables
│ │ ├── auth/
│ │ │ ├── LoginForm.tsx # 'use client' - Formulario login
│ │ │ ├── RegisterForm.tsx # 'use client' - Formulario registro
│ │ │ └── AuthProvider.tsx # Context para Zustand
│ │ │
│ │ ├── events/
│ │ │ ├── EventCard.tsx # Tarjeta evento en lista
│ │ │ ├── EventList.tsx # Lista de eventos (server o client)
│ │ │ ├── EventDetail.tsx # Detalle completo evento
│ │ │ ├── CreateEventForm.tsx # 'use client' - Crear evento
│ │ │ └── EditEventForm.tsx # 'use client' - Editar evento
│ │ │
│ │ ├── tickets/
│ │ │ ├── TicketCard.tsx # Tarjeta ticket en lista
│ │ │ ├── TicketList.tsx # Lista de mis tickets
│ │ │ ├── QRDisplay.tsx # 'use client' - Mostrar QR código
│ │ │ ├── TicketPDF.tsx # 'use client' - Generar/descargar PDF
│ │ │ ├── BuyTicketForm.tsx # 'use client' - Formulario compra
│ │ │ └── TicketStatus.tsx # Estado visual del ticket
│ │ │
│ │ ├── validator/
│ │ │ ├── QRScanner.tsx # 'use client' - Scanner QR
│ │ │ ├── ScanResult.tsx # Mostrar resultado validación
│ │ │ └── ScanHistory.tsx # 'use client' - Historial scans
│ │ │
│ │ ├── layout/
│ │ │ ├── Header.tsx # Navbar global
│ │ │ ├── Sidebar.tsx # 'use client' - Menú lateral dashboard
│ │ │ ├── Footer.tsx # Footer
│ │ │ └── ProtectedRoute.tsx # HOC para rutas protegidas
│ │ │
│ │ └── common/
│ │ ├── Button.tsx
│ │ ├── Modal.tsx # 'use client' - Diálogos
│ │ ├── LoadingSpinner.tsx # Loader
│ │ ├── ErrorBoundary.tsx # 'use client' - Manejo errores
│ │ └── Toast.tsx # 'use client' - Notificaciones
│ │
│ ├── hooks/ # Custom React Hooks
│ │ ├── useAuth.ts # Acceso a sesión usuario
│ │ ├── useEvents.ts # Operaciones eventos
│ │ ├── useTickets.ts # Operaciones tickets
│ │ └── useValidation.ts # Operaciones validación
│ │
│ ├── services/ # Clientes HTTP para Nest.js API
│ │ ├── api.ts # Configuración base (headers, interceptores)
│ │ ├── authService.ts # POST /auth/login, /auth/register
│ │ ├── eventsService.ts # GET/POST/PATCH /events, /events/:id
│ │ ├── ticketsService.ts # POST /tickets/buy, GET /tickets/:id
│ │ └── validationService.ts # POST /validation/scan
│ │
│ ├── store/ # Estado global (Zustand)
│ │ ├── authStore.ts # User, token, login/logout
│ │ ├── eventStore.ts # Lista eventos, evento seleccionado
│ │ └── validationStore.ts # Historial scans, estadísticas
│ │
│ ├── types/ # Tipos TypeScript compartidos
│ │ ├── index.ts # Re-exports
│ │ ├── auth.ts # User, Role, AuthResponse
│ │ ├── event.ts # Event, TicketType
│ │ ├── ticket.ts # Ticket, TicketStatus
│ │ └── api.ts # ApiResponse, ApiError
│ │
│ ├── utils/
│ │ ├── validators.ts # Funciones validación cliente
│ │ ├── formatters.ts # Formatear fechas, dinero, etc
│ │ ├── qr-handler.ts # Descargar QR como PNG
│ │ └── error-handler.ts # Parsear errores API
│ │
│ ├── lib/
│ │ ├── constants.ts # URLs, constantes globales
│ │ └── permissions.ts # Mapeo roles → rutas
│ │
│ ├── middleware.ts # Middleware Next.js - Proteger rutas
│ └── .env.local # Variables entorno frontend
│
├── public/ # Assets estáticos
│ ├── images/
│ ├── fonts/
│ └── icons/
│
├── styles/
│ ├── globals.css
│ └── variables.css
│
├── package.json
├── next.config.js
├── tsconfig.json
└── tailwind.config.js

```

```

---

## 3. Flujos de Datos

│ ├── src/
│ │ ├── main.ts # Entry point
│ │ ├── app.module.ts # Módulo raíz
│ │ │
│ │ ├── auth/ # Módulo de autenticación
│ │ │ ├── auth.controller.ts # Endpoints: POST /login, /register
│ │ │ ├── auth.service.ts # Lógica JWT, hash passwords
│ │ │ ├── jwt.strategy.ts # Estrategia de autenticación
│ │ │ └── auth.guard.ts # Guard para rutas protegidas
│ │ │
│ │ ├── events/ # Módulo de eventos
│ │ │ ├── events.controller.ts # Endpoints CRUD eventos
│ │ │ ├── events.service.ts # Lógica de negocio
│ │ │ ├── event.entity.ts # Modelo BD
│ │ │ └── dto/
│ │ │ ├── create-event.dto.ts
│ │ │ └── update-event.dto.ts
│ │ │
│ │ ├── tickets/
│ │ │ ├── tickets.controller.ts
│ │ │ ├── tickets.service.ts # Lógica compleja: generación QR, encriptación
│ │ │ ├── ticket.entity.ts
│ │ │ └── dto/
│ │ │
│ │ ├── validation/ # Módulo de validación
│ │ │ ├── validation.controller.ts
│ │ │ ├── validation.service.ts # Lógica QR: verificar, prevenir duplicados
│ │ │ └── qr.generator.ts
│ │ │
│ │ ├── common/
│ │ │ ├── filters/ # Exception filters
│ │ │ ├── guards/ # Auth guards, role guards
│ │ │ ├── decorators/ # Custom decorators
│ │ │ └── pipes/ # Validación de datos
│ │ │
│ │ └── database/
│ │ └── typeorm.config.ts # Configuración BD
│ │
│ └── package.json
│
└── frontend/ # Next.js
├── src/
│ ├── app/ # App Router (Next.js 13+)
│ │ ├── layout.tsx # Layout raíz
│ │ ├── page.tsx # Página inicio
│ │ │
│ │ ├── auth/
│ │ │ ├── layout.tsx # Layout específico auth
│ │ │ ├── login/
│ │ │ │ └── page.tsx
│ │ │ └── register/
│ │ │ └── page.tsx
│ │ │
│ │ ├── dashboard/
│ │ │ ├── layout.tsx # Dashboard layout protegido
│ │ │ ├── page.tsx # Dashboard inicio
│ │ │ │
│ │ │ ├── events/
│ │ │ │ ├── page.tsx # Listar eventos
│ │ │ │ ├── [id]/ # Página dinámico
│ │ │ │ │ └── page.tsx # Detalle evento
│ │ │ │ └── create/
│ │ │ │ └── page.tsx
│ │ │ │
│ │ │ ├── tickets/
│ │ │ │ ├── page.tsx # Mis tickets
│ │ │ │ └── [id]/
│ │ │ │ └── page.tsx # Detalle ticket + QR
│ │ │ │
│ │ │ └── validator/ # Especial para validadores
│ │ │ └── page.tsx # Scanner QR
│ │ │
│ │ └── api/ # API Routes (solo si necesitas)
│ │ └── proxy/ # Proxy a Nest.js si lo necesitas
│ │
│ ├── components/
│ │ ├── auth/
│ │ │ ├── LoginForm.tsx
│ │ │ └── RegisterForm.tsx
│ │ │
│ │ ├── events/
│ │ │ ├── EventCard.tsx
│ │ │ ├── EventList.tsx
│ │ │ └── CreateEventForm.tsx
│ │ │
│ │ ├── tickets/
│ │ │ ├── TicketCard.tsx
│ │ │ ├── QRDisplay.tsx
│ │ │ └── TicketPDF.tsx
│ │ │
│ │ ├── layout/
│ │ │ ├── Header.tsx
│ │ │ ├── Sidebar.tsx
│ │ │ └── ProtectedRoute.tsx
│ │ │
│ │ └── common/
│ │ ├── Button.tsx
│ │ ├── Modal.tsx
│ │ └── LoadingSpinner.tsx
│ │
│ ├── hooks/ # Custom React hooks
│ │ ├── useAuth.ts # Gestión autenticación
│ │ ├── useEvents.ts # Gestión eventos
│ │ └── useTickets.ts # Gestión tickets
│ │
│ ├── services/ # Clientes HTTP
│ │ ├── api.ts # Configuración fetch/axios
│ │ ├── authService.ts # Llamadas a /auth
│ │ ├── tickets/
│ │ │ ├── TicketCard.tsx # Tarjeta ticket en lista
│ │ │ ├── TicketList.tsx # Lista de mis tickets
│ │ │ ├── QRDisplay.tsx # 'use client' - Mostrar QR código
│ │ │ ├── TicketPDF.tsx # 'use client' - Generar/descargar PDF
│ │ │ ├── BuyTicketForm.tsx # 'use client' - Formulario compra
│ │ │ └── TicketStatus.tsx # Estado visual del ticket
│ │ │
│ │ ├── validator/
│ │ │ ├── QRScanner.tsx # 'use client' - Scanner QR
│ │ │ ├── ScanResult.tsx # Mostrar resultado validación
│ │ │ └── ScanHistory.tsx # 'use client' - Historial scans
│ │ │
│ │ ├── layout/
│ │ │ ├── Header.tsx # Navbar global
│ │ │ ├── Sidebar.tsx # 'use client' - Menú lateral dashboard
│ │ │ ├── Footer.tsx # Footer
│ │ │ └── ProtectedRoute.tsx # HOC para rutas protegidas
│ │ │
│ │ └── common/
│ │ ├── Button.tsx
│ │ ├── Modal.tsx # 'use client' - Diálogos
│ │ ├── LoadingSpinner.tsx # Loader
│ │ ├── ErrorBoundary.tsx # 'use client' - Manejo errores
│ │ └── Toast.tsx # 'use client' - Notificaciones
│ │
│ ├── hooks/ # Custom React Hooks
│ │ ├── useAuth.ts # Acceso a sesión usuario
│ │ ├── useEvents.ts # Operaciones eventos
│ │ ├── useTickets.ts # Operaciones tickets
│ │ └── useValidation.ts # Operaciones validación
│ │
│ ├── services/ # Clientes HTTP para Nest.js API
│ │ ├── api.ts # Configuración base (headers, interceptores)
│ │ ├── authService.ts # POST /auth/login, /auth/register
│ │ ├── eventsService.ts # GET/POST/PATCH /events, /events/:id
│ │ ├── ticketsService.ts # POST /tickets/buy, GET /tickets/:id
│ │ └── validationService.ts # POST /validation/scan
│ │
│ ├── store/ # Estado global (Zustand)
│ │ ├── authStore.ts # User, token, login/logout
│ │ ├── eventStore.ts # Lista eventos, evento seleccionado
│ │ └── validationStore.ts # Historial scans, estadísticas
│ │
│ ├── types/ # Tipos TypeScript compartidos
│ │ ├── index.ts # Re-exports
│ │ ├── auth.ts # User, Role, AuthResponse
│ │ ├── event.ts # Event, TicketType
│ │ ├── ticket.ts # Ticket, TicketStatus
│ │ └── api.ts # ApiResponse, ApiError
│ │
│ ├── utils/
│ │ ├── validators.ts # Funciones validación cliente
│ │ ├── formatters.ts # Formatear fechas, dinero, etc
│ │ ├── qr-handler.ts # Descargar QR como PNG
│ │ └── error-handler.ts # Parsear errores API
│ │
│ ├── lib/
│ │ ├── constants.ts # URLs, constantes globales
│ │ └── permissions.ts # Mapeo roles → rutas
│ │
│ ├── middleware.ts # Middleware Next.js - Proteger rutas
│ └── .env.local # Variables entorno frontend
│
├── public/ # Assets estáticos
│ ├── images/
│ ├── fonts/
│ └── icons/
│
├── styles/
│ ├── globals.css
│ └── variables.css
│
├── package.json
├── next.config.js
├── tsconfig.json
└── tailwind.config.js

```

---

## 3. Flujos de Datos

### 3.1 Flujo: Compra de Tickets (RF-11, RF-12)

```

```
