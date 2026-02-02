# 🏗️ Arquitectura Completa de VeriTix: Nest.js + Next.js

> **Documento Conclusivo**
>
> Diseño arquitectónico e implementación de la solución full-stack para el sistema de gestión de eventos y tickets digitales con validación QR.

---

## 📋 Tabla de Contenidos

1. [Visión General](#1-visión-general)
2. [Estructura de Carpetas](#2-estructura-de-carpetas)
3. [Flujos de Datos](#3-flujos-de-datos)
4. [Mapeo de Módulos](#4-mapeo-de-módulos)
5. [Arquitectura de Seguridad](#5-arquitectura-de-seguridad)
6. [Decisiones Tecnológicas](#6-decisiones-tecnológicas)

---

## 1. Visión General

VeriTix es una **aplicación web monorepo** con dos servicios independientes que se comunican vía HTTP:

```
┌─────────────────────────────────────────────────────────────┐
│                   VeriTix Monorepo                          │
├────────────────────┬────────────────────────────────────────┤
│                    │                                        │
│   🔧 Backend       │          🎨 Frontend                  │
│  (Nest.js)         │         (Next.js)                     │
│                    │                                        │
│  ✅ Lógica negocio │      ✅ UI/UX                         │
│  ✅ APIs REST      │      ✅ Interactividad               │
│  ✅ BD             │      ✅ Autenticación cliente        │
│  ✅ Seguridad      │      ✅ Estado global                │
│                    │                                        │
│  Puerto: 3001      │      Puerto: 3000                    │
│  http://localhost:3001   http://localhost:3000            │
│                    │                                        │
└────────────────────┴────────────────────────────────────────┘
                        ↕️ HTTP/REST API
```

### Responsabilidades

| Aspecto             | Backend (Nest.js)                       | Frontend (Next.js)              |
| ------------------- | --------------------------------------- | ------------------------------- |
| **Crear Eventos**   | Validar, guardar en BD                  | Formulario interactivo          |
| **Comprar Tickets** | Generar QR, transacciones atómicas      | Carrito y pago                  |
| **Validar QR**      | Verificar integridad, actualizar estado | Interfaz scanner                |
| **Autenticación**   | JWT, hash passwords                     | Almacenar token, proteger rutas |

---

## 2. Estructura de Carpetas

### 2.1 Estructura Monorepo

```
veritix/                                    # Monorepo root
│
├── README.md                               # Documentación principal
├── docker-compose.yml                      # Orquestación desarrollo (PostgreSQL, backend, frontend)
├── ARQUITECTURA.md                         # Este documento
│
├── backend/                                # 🔧 Nest.js Application (Puerto 3001)
│   ├── src/
│   │   ├── main.ts                         # Entry point, bootstrap aplicación
│   │   ├── app.module.ts                   # Módulo raíz, importa todos los módulos
│   │   │
│   │   ├── auth/                           # 📦 MÓDULO: Autenticación (RF-01, RF-02)
│   │   │   ├── auth.controller.ts          # POST /auth/login, POST /auth/register
│   │   │   ├── auth.service.ts             # Lógica JWT, bcrypt passwords
│   │   │   ├── jwt.strategy.ts             # Estrategia Passport JWT
│   │   │   ├── jwt.guard.ts                # Guard para verificar JWT
│   │   │   ├── dto/
│   │   │   │   ├── login.dto.ts            # { email, password }
│   │   │   │   └── register.dto.ts         # { email, password, name, phone, ... }
│   │   │   └── auth.module.ts
│   │   │
│   │   ├── events/                         # 📦 MÓDULO: Eventos (RF-05 a RF-08)
│   │   │   ├── events.controller.ts        # GET /events, POST /events, PATCH, DELETE
│   │   │   ├── events.service.ts           # Validaciones, lógica negocio
│   │   │   ├── event.entity.ts             # @Entity() TypeORM
│   │   │   ├── dto/
│   │   │   │   ├── create-event.dto.ts
│   │   │   │   └── update-event.dto.ts
│   │   │   └── events.module.ts
│   │   │
│   │   ├── tickets/                        # 📦 MÓDULO: Tickets (RF-11 a RF-15)
│   │   │   ├── tickets.controller.ts       # POST /tickets/buy, GET /tickets/:id
│   │   │   ├── tickets.service.ts          # Generación QR, encriptación, transacciones
│   │   │   ├── ticket.entity.ts            # Mapeo tabla BD
│   │   │   ├── qr.generator.ts             # Generar QR encriptado
│   │   │   ├── dto/
│   │   │   │   └── buy-ticket.dto.ts       # { eventId, typeId, quantity }
│   │   │   └── tickets.module.ts
│   │   │
│   │   ├── validation/                     # 📦 MÓDULO: Validación QR (RF-16 a RF-20)
│   │   │   ├── validation.controller.ts    # POST /validation/scan, GET /validation/stats
│   │   │   ├── validation.service.ts       # Verificar QR, marcar como usado
│   │   │   ├── qr.verifier.ts              # Desencriptar y verificar hash
│   │   │   └── validation.module.ts
│   │   │
│   │   ├── common/                         # Utilidades compartidas
│   │   │   ├── guards/
│   │   │   │   ├── jwt.guard.ts
│   │   │   │   └── roles.guard.ts          # @UseGuards(RolesGuard)
│   │   │   ├── decorators/
│   │   │   │   ├── current-user.decorator.ts
│   │   │   │   └── roles.decorator.ts      # @Roles('creator', 'admin')
│   │   │   └── filters/
│   │   │       └── http-exception.filter.ts
│   │   │
│   │   ├── database/
│   │   │   ├── typeorm.config.ts
│   │   │   └── migrations/                 # Migraciones SQL
│   │   │
│   │   └── config/
│   │       ├── env.ts
│   │       └── constants.ts
│   │
│   ├── test/
│   ├── .env.example
│   └── package.json
│
└── frontend/                               # 🎨 Next.js Application (Puerto 3000)
    ├── src/
    │   ├── app/                            # App Router (Next.js 13+)
    │   │   ├── layout.tsx                  # Layout raíz
    │   │   ├── page.tsx                    # Página inicio /
    │   │   │
    │   │   ├── auth/
    │   │   │   ├── login/page.tsx          # /auth/login (RF-02)
    │   │   │   └── register/page.tsx       # /auth/register (RF-01)
    │   │   │
    │   │   ├── dashboard/
    │   │   │   ├── layout.tsx              # Protegido por middleware
    │   │   │   ├── page.tsx                # /dashboard
    │   │   │   ├── events/
    │   │   │   │   ├── page.tsx            # /dashboard/events (RF-06)
    │   │   │   │   ├── [id]/page.tsx       # /dashboard/events/123 (RF-05)
    │   │   │   │   └── create/page.tsx     # /dashboard/events/create (RF-05)
    │   │   │   └── tickets/
    │   │   │       ├── page.tsx            # /dashboard/tickets (RF-11)
    │   │   │       └── [id]/page.tsx       # /dashboard/tickets/123 (RF-12)
    │   │   │
    │   │   └── validator/
    │   │       └── page.tsx                # /validator (RF-16)
    │   │
    │   ├── components/
    │   │   ├── auth/
    │   │   │   ├── LoginForm.tsx
    │   │   │   └── RegisterForm.tsx
    │   │   ├── events/
    │   │   │   ├── EventCard.tsx
    │   │   │   ├── EventList.tsx
    │   │   │   └── CreateEventForm.tsx
    │   │   ├── tickets/
    │   │   │   ├── TicketCard.tsx
    │   │   │   ├── QRDisplay.tsx
    │   │   │   ├── TicketPDF.tsx
    │   │   │   └── BuyTicketForm.tsx
    │   │   ├── validator/
    │   │   │   ├── QRScanner.tsx
    │   │   │   └── ScanResult.tsx
    │   │   └── layout/
    │   │       ├── Header.tsx
    │   │       ├── Sidebar.tsx
    │   │       └── Footer.tsx
    │   │
    │   ├── hooks/
    │   │   ├── useAuth.ts
    │   │   ├── useEvents.ts
    │   │   └── useTickets.ts
    │   │
    │   ├── services/
    │   │   ├── api.ts
    │   │   ├── authService.ts
    │   │   ├── eventsService.ts
    │   │   ├── ticketsService.ts
    │   │   └── validationService.ts
    │   │
    │   ├── store/
    │   │   ├── authStore.ts
    │   │   └── eventStore.ts
    │   │
    │   ├── types/
    │   │   ├── index.ts
    │   │   ├── auth.ts
    │   │   ├── event.ts
    │   │   └── ticket.ts
    │   │
    │   ├── utils/
    │   │   ├── validators.ts
    │   │   └── formatters.ts
    │   │
    │   ├── middleware.ts                   # Proteger rutas
    │   └── .env.local
    │
    ├── public/
    ├── package.json
    ├── next.config.js
    └── tsconfig.json
```

---

## 3. Flujos de Datos

### 3.1 Flujo: Compra de Tickets (RF-11, RF-12)

```
┌─────────────────────────────────────────────────────────────┐
│ USUARIO COMPRA 2 TICKETS VIP EN /dashboard/events/123      │
└─────────────────────────────────────────────────────────────┘

PASO 1: Cliente (Next.js - BuyTicketForm.tsx)
├─ Usuario ingresa: quantity = 2
├─ onClick: handleBuy()
├─ Extrae token de localStorage
└─ POST a Backend


PASO 2: Backend (Nest.js - tickets.controller.ts)
├─ Recibe { eventId: 123, typeId: VIP, quantity: 2 }
├─ @UseGuards(JwtGuard) → Verifica token válido
├─ @Roles('buyer') → Verifica rol
├─ ValidateDto (pipes) → Valida estructura datos
│
└─ tickets.service.buy()
   ├─ Buscar evento
   ├─ Verificar capacidad restante >= 2
   ├─ Dentro de transacción:
   │  ├─ Restar 2 tickets disponibles
   │  ├─ Para cada ticket:
   │  │  ├─ Generar hash único
   │  │  ├─ Encriptar hash (AES-256)
   │  │  ├─ Generar código QR
   │  │  └─ Guardar en BD
   │  └─ Registrar transacción
   │
   └─ Retornar:
      {
        "tickets": [
          { "id": "t1", "hash": "abc123", "qr_code": "data:..." },
          { "id": "t2", "hash": "def456", "qr_code": "data:..." }
        ],
        "total": 100
      }


PASO 3: Cliente recibe respuesta
├─ Guardar en Zustand store (authStore.userTickets)
├─ Mostrar confirmación
├─ Renderizar QRs
└─ Opciones:
   ├─ Descargar como PDF
   ├─ Enviar por email
   └─ Ir a /dashboard/tickets
```

### 3.2 Flujo: Validación de QR (RF-16, RF-17, RF-18)

```
┌─────────────────────────────────────────────────────────────┐
│ VALIDADOR ESCANEA QR EN ENTRADA DEL EVENTO                 │
└─────────────────────────────────────────────────────────────┘

PASO 1: Validador accede /validator
├─ QRScanner.tsx abre cámara
├─ Usuario apunta código QR
├─ Librería detecta hash encriptado
└─ onClick: enviar al backend


PASO 2: Backend verifica integridad
├─ POST /api/validation/scan
├─ { qr_hash: "abc123xyz", validator_id: "v1" }
│
├─ @UseGuards(JwtGuard, RolesGuard)
├─ @Roles('validator', 'admin')
│
└─ validation.service.scan()
   ├─ Desencriptar hash
   ├─ Buscar ticket en BD con ese hash
   ├─ Verificar integridad:
   │  ├─ ¿Ticket existe?
   │  ├─ ¿Estado es "active"? (no usado)
   │  ├─ ¿Pertenece a evento actual?
   │  └─ ¿No es falsificado?
   │
   └─ Resultado:
      ├─ Si ✅ VÁLIDO:
      │  ├─ UPDATE status = 'used'
      │  ├─ UPDATE validated_at = NOW()
      │  ├─ UPDATE validated_by = validator_id
      │  └─ Retornar { status: 'valid', user: {...} }
      │
      ├─ Si ⚠️ YA USADO:
      │  ├─ Retornar { status: 'already_used', previous_at: '...' }
      │  └─ LOG para detectar fraude
      │
      └─ Si ❌ INVÁLIDO:
         ├─ Retornar { status: 'invalid' }
         └─ ALERTA SEGURIDAD


PASO 3: Frontend muestra resultado
├─ Verde: ✅ Acceso permitido
├─ Amarillo: ⚠️ Ticket ya utilizado
└─ Rojo: ❌ Acceso denegado
```

---

## 4. Mapeo de Módulos

### 4.1 Backend (Nest.js) → Requerimientos

| Módulo           | Rutas                                                            | RF                                |
| ---------------- | ---------------------------------------------------------------- | --------------------------------- |
| **auth**         | POST /auth/login, POST /auth/register                            | RF-01, RF-02                      |
| **events**       | GET /events, POST /events, PATCH /events/:id, DELETE /events/:id | RF-05, RF-06, RF-07, RF-08        |
| **ticket-types** | GET /ticket-types, POST /ticket-types                            | RF-09, RF-10                      |
| **tickets**      | POST /tickets/buy, GET /tickets/:id, GET /tickets/my-tickets     | RF-11, RF-12, RF-13, RF-14, RF-15 |
| **validation**   | POST /validation/scan, GET /validation/stats                     | RF-16, RF-17, RF-18, RF-19, RF-20 |

### 4.2 Frontend (Next.js) → Requerimientos

| Ruta                       | RF           | Funcionalidad                |
| -------------------------- | ------------ | ---------------------------- |
| `/auth/login`              | RF-02        | Autenticación usuario        |
| `/auth/register`           | RF-01        | Registro usuario             |
| `/dashboard/events`        | RF-06        | Listar eventos               |
| `/dashboard/events/[id]`   | RF-05        | Detalle evento               |
| `/dashboard/events/create` | RF-05        | Crear evento (solo creators) |
| `/dashboard/tickets`       | RF-11        | Mis tickets comprados        |
| `/dashboard/tickets/[id]`  | RF-12, RF-15 | Ver QR, descargar PDF        |
| `/validator`               | RF-16        | Escanear y validar QR        |

---

## 5. Arquitectura de Seguridad

### 5.1 Autenticación JWT

```
REGISTRO: usuario@email.com / password123

Backend verifica credenciales → Genera JWT

JWT = Header.Payload.Signature
    = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9
      .eyJzdWIiOiIxMjM0NTY3ODkwIiwiZW1haWwiOiJ1c2VyQGVtYWlsLmNvbSIsInJvbGUiOiJidXllciIsImlhdCI6MTY4MDk2MzU1MiwiZXhwIjoxNjgxMDQ5OTUyfQ
      .JZ4nU1F_m6r1wq5wW7lF_zX8qY3nQ2bL3sY9kW0pF9E

Payload (Base64 decodificado):
{
  "sub": "user_id_123",
  "email": "user@email.com",
  "role": "buyer",
  "iat": 1680963552,
  "exp": 1681049952  // Expira en 24 horas
}

Frontend almacena en localStorage:
localStorage.setItem('token', jwt_token);

Cada request incluye:
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

Backend verifica:
1. Token existe
2. Token no expirado
3. Firma válida (secreta en .env)
4. Extrae userId y role
```

### 5.2 Protección por Rol

```typescript
// Backend: Solo creators pueden crear eventos
@Post('/events')
@UseGuards(JwtGuard, RolesGuard)
@Roles('creator', 'admin')
async create(@Body() dto: CreateEventDto) {
  // Solo ejecuta si rol es 'creator' o 'admin'
}

// Frontend: Middleware protege rutas
if (user.role !== 'creator' && pathname === '/dashboard/events/create') {
  redirect('/dashboard');
}
```

### 5.3 Generación y Verificación de QR

```
GENERACIÓN (Backend - compra ticket):

1. Hash = SHA256(ticket_id + event_id + timestamp + random)
2. Encriptado = AES256_ENCRYPT(hash, secret_key)
3. QR = generateQRCode(encriptado)
4. Guardar en BD: tickets.hash = encriptado

VERIFICACIÓN (Backend - validación):

1. Cliente escanea QR → Extrae encriptado
2. Backend desencripta = AES256_DECRYPT(encriptado, secret_key)
3. Buscar ticket WHERE hash = desencriptado
4. Verificar integridad + estado + evento
5. Marcar como used si es válido
```

---

## 6. Decisiones Tecnológicas

### 6.1 Stack Backend: Nest.js

**Ventajas:**

- ✅ Arquitectura modular (Node Module Pattern)
- ✅ Decoradores para metaprogramming
- ✅ Inyección de dependencias (IoC)
- ✅ Type-safe con TypeScript nativo
- ✅ Validación robusta (class-validator)
- ✅ ORM integrado (TypeORM)

**Componentes clave:**

- **Express** → Servidor HTTP
- **TypeORM** → ORM para PostgreSQL
- **Passport** → Autenticación JWT
- **Class Validator** → Validación DTOs
- **Swagger** → Documentación automática

### 6.2 Stack Frontend: Next.js

**Ventajas:**

- ✅ Server Components (mejor performance)
- ✅ File-based routing
- ✅ Built-in middleware
- ✅ TypeScript nativo
- ✅ Image optimization

**Librerías clave:**

- **React 18** → UI library
- **Zustand** → Estado global
- **Tailwind CSS** → Estilos
- **qrcode.react** → Mostrar QR
- **jsPDF + html2canvas** → Exportar PDF

### 6.3 Base de Datos

```sql
-- Usuarios
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('buyer', 'creator', 'validator', 'admin') DEFAULT 'buyer',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Eventos
CREATE TABLE events (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  creator_id UUID REFERENCES users(id),
  max_capacity INT CHECK (max_capacity > 0),
  event_date TIMESTAMP,
  status ENUM('draft', 'published', 'finished', 'cancelled'),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tickets
CREATE TABLE tickets (
  id UUID PRIMARY KEY,
  event_id UUID REFERENCES events(id),
  user_id UUID REFERENCES users(id),
  hash VARCHAR(255) UNIQUE NOT NULL,
  status ENUM('active', 'used', 'cancelled') DEFAULT 'active',
  validated_at TIMESTAMP,
  validated_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 7. Conclusión

### Ventajas de esta Arquitectura

✅ **Separación de responsabilidades** - Backend lógica, Frontend UI
✅ **Escalabilidad** - Servicios independientes
✅ **Mantenibilidad** - Código limpio y modular (SOLID)
✅ **Type Safety** - TypeScript end-to-end
✅ **Reusabilidad** - Backend puede servir múltiples clientes
✅ **Performance** - Server Components, caching, optimización
✅ **Seguridad** - JWT, Guards, Roles, Encriptación QR

### Próximos Pasos para Implementación

1. ✅ Clonar estructura monorepo
2. ✅ Setup PostgreSQL (Docker)
3. ✅ Inicializar backend Nest.js
4. ✅ Inicializar frontend Next.js
5. ✅ Implementar módulo auth (login/register)
6. ✅ Conectar frontend a backend
7. ✅ Implementar CRUD eventos
8. ✅ Implementar compra de tickets
9. ✅ Implementar validación QR
10. ✅ Deploy a producción

---

**Versión:** 1.0
**Última actualización:** Febrero 2026
**Estado:** Documentación Técnica Completa ✅
