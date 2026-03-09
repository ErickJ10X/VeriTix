# 📚 Guía de Aprendizaje: Next.js para Frontend en VeriTix

## Introducción

Next.js será el **frontend del proyecto VeriTix**, encargado de:

- ✅ Interfaz para compradores (compra de tickets)
- ✅ Dashboard para creadores (gestión de eventos)
- ✅ Herramienta para validadores (escaneo QR)
- ✅ Consumir la API de Nest.js

Este documento es una **guía progresiva** para aprender Next.js desde cero, aplicado específicamente a los [Requerimientos Funcionales del tfg.md](tfg.md#2-requerimientos-funcionales).

---

## 1. Roadmap Estructurado (10 semanas)

### Fase 0: Requisitos Previos (Semanas 1-2)

**Objetivo:** Dominar React y TypeScript antes de tocar Next.js.

**Nota:** Si ya dominas React y TypeScript, salta a la Fase 1.

#### React Fundamentals

- [ ] Componentes funcionales vs. clases
- [ ] Hooks: `useState`, `useEffect`, `useContext`, `useReducer`
- [ ] Props, state, y flujo de datos
- [ ] Rendering condicional y listas (`.map()`, keys)
- [ ] Event handling y formularios
- [ ] Re-renders y optimización básica

#### TypeScript Basics

- [ ] Tipos primitivos (`string`, `number`, `boolean`)
- [ ] Tipos complejos (`interfaces`, `types`)
- [ ] Uniones y literales (`'buyer' | 'creator' | 'validator' | 'admin'`)
- [ ] Genéricos (`<T>`) en funciones y componentes
- [ ] Tipos en React (`React.FC<Props>`, `ReactNode`)

**Recursos:**

- [React Official Docs](https://react.dev) - Lectura obligatoria
- [TypeScript Handbook](https://www.typescriptlang.org/docs) - Para consultas rápidas

---

### Fase 1: Next.js Core Concepts (Semanas 3-4)

**Objetivo:** Dominar el router de Next.js y cómo renderizar páginas.

**Aplicación a VeriTix:** Crear la estructura de rutas para [RF-06: Listado de eventos](tfg.md#rf-06-listado-de-eventos) y [RF-11: Compra de tickets](tfg.md#rf-11-compra-de-tickets)
| Concepto | Qué aprender | Por qué | Ejemplo VeriTix |
|----------|--------------|--------|-----------------|
| **App Router** | Carpetas = rutas (file-based) | Sistema moderno y escalable | `/dashboard/events` → carpeta `app/dashboard/events/page.tsx` |
| **Layouts anidados** | `layout.tsx` en cada carpeta | Reutilizar headers, sidebars | Dashboard layout protegido con navegación |
| **Dynamic Routes** | `[id]/page.tsx` | Renderizar páginas con parámetros | `/events/[id]` para detalle de evento, `/tickets/[id]` para detalle de ticket |
| **Server vs Client** | `"use client"` directive | Saber qué ejecuta dónde (servidor vs navegador) | Formularios: client. Listados: pueden ser server |
| **Data Fetching** | `fetch()` nativo | Obtener datos de Nest.js backend | `GET http://localhost:3001/api/events` |
| **Middleware** | `middleware.ts` | Interceptar requests (verificar token JWT) | Proteger rutas `/dashboard/*` y `/validator/*` |

#### Orden de Aprendizaje

1. **Crear primer `page.tsx`** → "Bienvenido a VeriTix"
2. **Crear `layout.tsx` raíz** → Estructura base con Header y Footer
3. **Agregar ruta dinámica** → `/events/[id]` → Detalle de evento
4. **Crear componente client** → `'use client'` → Formulario de compra
5. **Integrar `fetch()`** → Conectar a Nest.js `/api/events`

---

### Fase 2: Integración con Nest.js Backend (Semanas 5-6)

**Objetivo:** Conectar Next.js con la API de Nest.js y manejar autenticación.

**Aplicación a VeriTix:**

- Implementar [RF-02: Inicio de sesión](tfg.md#rf-02-inicio-de-sesión)
- Conectar [RF-11: Compra de tickets](tfg.md#rf-11-compra-de-tickets)
- Proteger rutas según [RF-03: Gestión de roles](tfg.md#rf-03-gestión-de-roles)

#### Ejemplo: Servicio para Compra de Tickets

```typescript
// src/services/ticketsService.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function buyTicket(eventId: string, quantity: number) {
    const token = localStorage.getItem('token'); // JWT del login

    const response = await fetch(`${API_URL}/api/tickets/buy`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ eventId, quantity }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error comprando tickets');
    }

    return response.json(); // { id, hash, qr_code, status, ... }
}
```

#### Ejemplo: Componente para Compra de Tickets

```typescript
// src/components/tickets/TicketForm.tsx
'use client'; // Este componente necesita interactividad
import { useState } from 'react';
import { buyTicket } from '@/services/ticketsService';

interface Props {
  eventId: string;
}

export default function TicketForm({ eventId }: Props) {
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleBuy() {
    setLoading(true);
    try {
      const ticket = await buyTicket(eventId, quantity);
      console.log('✅ Ticket comprado:', ticket);
      setSuccess(true);
      // Mostrar QR, confirmación, botón PDF
    } catch (error: any) {
      console.error('❌ Error:', error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={(e) => { e.preventDefault(); handleBuy(); }}>
      <input
        type="number"
        min="1"
        max="10"
        value={quantity}
        onChange={(e) => setQuantity(parseInt(e.target.value))}
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Procesando...' : 'Comprar'}
      </button>
      {success && <p>✅ ¡Compra exitosa!</p>}
    </form>
  );
}
```

---

### Fase 3: Patrones Avanzados (Semanas 7-8)

**Objetivo:** Implementar patrones profesionales para manejo de estado y protección de rutas.

**Aplicación a VeriTix:**

- [RF-03: Gestión de roles](tfg.md#rf-03-gestión-de-roles) → Controlar acceso según rol
- [RF-07: Edición de eventos](tfg.md#rf-07-edición-de-eventos) → Solo creadores del evento
- [RF-16: Escaneo de QR](tfg.md#rf-16-escaneo-de-qr) → Solo validadores

| Patrón                 | Concepto                        | Uso en VeriTix                                           |
| ---------------------- | ------------------------------- | -------------------------------------------------------- |
| **Custom Hooks**       | `useAuth()`, `useTickets()`     | Reutilizar lógica de autenticación y compra              |
| **Zustand**            | Gestión estado global           | Usuario logueado, rol, permisos                          |
| **Middleware**         | Protección de rutas             | Redirigir a login si no está autenticado                 |
| **Error Boundaries**   | Manejo de errores               | Si falla carga de eventos, mostrar UI amigable           |
| **Optimistic Updates** | Actualizar UI antes de servidor | Comprar ticket → muestra inmediatamente mientras procesa |

#### Ejemplo: Custom Hook para Autenticación

```typescript
// src/hooks/useAuth.ts
'use client';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';

interface User {
    id: string;
    email: string;
    name: string;
    role: 'buyer' | 'creator' | 'validator' | 'admin';
}

export function useAuth() {
    const { user, token, login, logout } = useAuthStore();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Verificar si hay sesión guardada al cargar
        const savedToken = localStorage.getItem('token');
        if (savedToken && !user) {
            // Hacer fetch a /me para obtener datos del usuario
            // (implementado en Nest.js)
        }
        setIsLoading(false);
    }, []);

    return {
        user,
        token,
        isAuthenticated: !!token,
        isLoading,
        login,
        logout,
    };
}
```

#### Ejemplo: Protección de Rutas

```typescript
// src/middleware.ts
import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
    const token = request.cookies.get('token')?.value;
    const pathname = request.nextUrl.pathname;

    // Rutas protegidas que requieren autenticación
    if (pathname.startsWith('/dashboard') || pathname.startsWith('/validator')) {
        if (!token) {
            // Redirigir a login si no tiene token
            return NextResponse.redirect(new URL('/auth/login', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/dashboard/:path*', '/validator/:path*'],
};
```

#### Ejemplo: Estado Global con Zustand

```typescript
// src/store/authStore.ts
import { create } from 'zustand';

interface User {
    id: string;
    email: string;
    name: string;
    role: 'buyer' | 'creator' | 'validator' | 'admin';
}

export const useAuthStore = create<{
    user: User | null;
    token: string | null;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
}>((set) => ({
    user: null,
    token: null,

    login: async (email: string, password: string) => {
        const response = await fetch('http://localhost:3001/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });

        if (!response.ok) throw new Error('Login failed');

        const { user, token } = await response.json();

        set({ user, token });
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
    },

    logout: () => {
        set({ user: null, token: null });
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    },
}));
```

---

## 2. Estructura de Aprendizaje Recomendada

| Período          | Fase                      | Objetivos                                            |
| ---------------- | ------------------------- | ---------------------------------------------------- |
| **Semanas 1-2**  | **React Basics**          | Dominar hooks, estado, props                         |
| **Semanas 3-4**  | **Next.js Fundamentals**  | App Router, layouts, dynamic routes                  |
| **Semanas 5-6**  | **Integración Backend**   | Conectar con Nest.js, autenticación JWT              |
| **Semanas 7-8**  | **Componentes VeriTix**   | Implementar funcionalidades específicas del proyecto |
| **Semanas 9-10** | **Optimización & Polish** | Estado global, caching, optimistic updates           |

---

## 3. Conceptos Clave para VeriTix

### 3.1 Rutas Protegidas

**Requisito:** [RF-03: Gestión de roles](tfg.md#rf-03-gestión-de-roles)

La aplicación tiene 4 roles con diferentes permisos:

```typescript
// src/lib/permissions.ts
export const ROLE_ROUTES: Record<Role, string[]> = {
  'buyer': ['/dashboard/tickets', '/dashboard/events'],
  'creator': ['/dashboard/events', '/dashboard/create-event'],
  'validator': ['/validator'],
  'admin': ['/*'] // Acceso total
};

// Middleware en layout
export function ProtectedRoute({
  children,
  requiredRoles
}: {
  children: React.ReactNode;
  requiredRoles: Role[];
}) {
  const { user } = useAuth();

  if (!user || !requiredRoles.includes(user.role)) {
    return <AccessDenied />;
  }

  return <>{children}</>;
}
```

### 3.2 Server vs. Client Components

**Entendimiento clave:** Next.js 13+ permite elegir dónde ejecuta cada componente.

```typescript
// ❌ INCORRECTO: Client component llamando fetch sin token
'use client';
export default function EventList() {
  useEffect(() => {
    fetch('/api/events'); // ¿Dónde está? ¿Autenticación?
  }, []);
}

// ✅ CORRECTO: Server component (por defecto)
export default async function EventList() {
  // Ejecuta en servidor, donde tenemos acceso a variables de entorno
  const events = await fetch('http://localhost:3001/api/events', {
    headers: {
      'Authorization': `Bearer ${process.env.BACKEND_TOKEN}`
    }
  }).then(r => r.json());

  return (
    <div>
      {events.map(e => <EventCard key={e.id} event={e} />)}
    </div>
  );
}

// ✅ CORRECTO: Client component para interactividad
'use client';
import { buyTicket } from '@/services/ticketsService';

export default function BuyButton({ eventId }: { eventId: string }) {
  const [loading, setLoading] = useState(false);

  async function handleBuy() {
    setLoading(true);
    // Cliente envía el token JWT al backend
    await buyTicket(eventId, 1);
    setLoading(false);
  }

  return <button onClick={handleBuy}>Comprar</button>;
}
```

**Guía rápida:**

- **Server:** Listar eventos, renderizar datos públicos, operaciones seguras
- **Client:** Formularios, botones, estado temporal, animaciones

### 3.3 Gestión de Estado Global

**Requisito:** Mantener sesión del usuario en toda la aplicación.

```typescript
// src/types/index.ts
export type Role = 'buyer' | 'creator' | 'validator' | 'admin';

export interface User {
    id: string;
    email: string;
    name: string;
    phone: string;
    role: Role;
    email_verified: boolean;
    is_active: boolean;
}

export interface AuthState {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    setUser: (user: User) => void;
}
```

---

## 4. Mapeo VeriTix: Requerimientos → Componentes

| Requerimiento           | Ruta                      | Componentes Necesarios                  | RF                                            |
| ----------------------- | ------------------------- | --------------------------------------- | --------------------------------------------- |
| **Registro**            | `/auth/register`          | `RegisterForm.tsx`, `authService.ts`    | [RF-01](tfg.md#rf-01-registro-de-usuarios)    |
| **Login**               | `/auth/login`             | `LoginForm.tsx`, `useAuthStore`         | [RF-02](tfg.md#rf-02-inicio-de-sesión)        |
| **Dashboard**           | `/dashboard`              | `Dashboard.tsx`, rutas protegidas       | [RF-03](tfg.md#rf-03-gestión-de-roles)        |
| **Listar Eventos**      | `/dashboard/events`       | `EventList.tsx`, `EventCard.tsx`        | [RF-06](tfg.md#rf-06-listado-de-eventos)      |
| **Detalle Evento**      | `/dashboard/events/[id]`  | `EventDetail.tsx`, `TicketTypeList.tsx` | [RF-05](tfg.md#rf-05-creación-de-eventos)     |
| **Crear Evento**        | `/dashboard/create-event` | `CreateEventForm.tsx`, solo `creator`   | [RF-05](tfg.md#rf-05-creación-de-eventos)     |
| **Mis Tickets**         | `/dashboard/tickets`      | `TicketList.tsx`, `TicketCard.tsx`      | [RF-11](tfg.md#rf-11-compra-de-tickets)       |
| **Detalle Ticket + QR** | `/dashboard/tickets/[id]` | `QRDisplay.tsx`, `TicketPDF.tsx`        | [RF-12](tfg.md#rf-12-generación-de-código-qr) |
| **Validador QR**        | `/validator`              | `QRScanner.tsx`, `ValidationResult.tsx` | [RF-16](tfg.md#rf-16-escaneo-de-qr)           |

---

## 5. División de Responsabilidades: Nest.js vs Next.js

### Resumen Ejecutivo

| Responsabilidad           | Nest.js (Backend)                    | Next.js (Frontend)                                  |
| ------------------------- | ------------------------------------ | --------------------------------------------------- |
| **Autenticación**         | Generar JWT, hash passwords, guards  | Almacenar token, redirigir login, validar sesión    |
| **Validación Datos**      | DTOs, pipes (validaciones complejas) | Validación básica cliente (UX)                      |
| **Base de Datos**         | TypeORM, queries, transacciones      | N/A                                                 |
| **Generación QR**         | Crear, encriptar, guardar hash en BD | Solo mostrar/descargar PDF                          |
| **Prevención Sobreventa** | Transacciones atómicas, locks BD     | Validación en cliente                               |
| **Endpoints REST**        | 20+ endpoints para operaciones CRUD  | Consume esos endpoints                              |
| **Seguridad Datos**       | HTTPS, CORS, rate limiting, logs     | HTTPS, token en cookies HttpOnly, validación inputs |

---

## 6. Cronograma Final

```
SEMANA 1-2: React Basics
├── [ ] Dominar hooks (useState, useEffect, useContext)
├── [ ] Entender props y estado
├── [ ] Practicar con listas
└── [ ] TypeScript en React

SEMANA 3-4: Next.js Core
├── [ ] Crear primer proyecto Next.js
├── [ ] Implementar App Router
├── [ ] Layouts anidados
├── [ ] Dynamic routes /[id]
└── [ ] Primer fetch() a Nest.js

SEMANA 5-6: Backend Integration
├── [ ] Autenticación JWT (login/register)
├── [ ] Almacenar token (localStorage/cookies)
├── [ ] Proteger rutas con middleware
└── [ ] Manejo de errores

SEMANA 7-8: VeriTix Components
├── [ ] LoginForm + RegisterForm
├── [ ] EventList + EventDetail
├── [ ] TicketForm + QR Display
├── [ ] Dashboard Validador
└── [ ] PDF Download

SEMANA 9-10: Optimización
├── [ ] Estado global con Zustand
├── [ ] Custom hooks
├── [ ] Caching datos
├── [ ] Optimistic updates
├── [ ] Testing
└── [ ] Deployment

Total: 10 semanas (2.5 meses)
```

---

## 7. Recursos Finales

### Documentación Oficial

- [Next.js Docs](https://nextjs.org/docs)
- [React Docs](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)

### Tutoriales Recomendados

- [Next.js Official Tutorial](https://nextjs.org/learn)
- [Web Dev Simplified - Next.js 13](https://www.youtube.com/watch?v=Sklc_fQBmcs)
- [Traversy Media - Next.js Course](https://www.youtube.com/watch?v=wm5gMKuwSYk)

### Herramientas Útiles

- **State Management:** [Zustand](https://github.com/pmndrs/zustand) o [Redux Toolkit](https://redux-toolkit.js.org/)
- **HTTP Client:** `fetch()` nativo o [Axios](https://axios-http.com/)
- **UI Components:** [Shadcn/ui](https://ui.shadcn.com/) o [Tailwind CSS](https://tailwindcss.com/)
- **QR Display:** [qrcode.react](https://www.npmjs.com/package/qrcode.react)
- **PDF Export:** [jsPDF](https://github.com/parallax/jsPDF) + [html2canvas](https://html2canvas.hertzen.com/)

---

## 8. Conclusión

Next.js es el framework perfecto para construir el frontend de VeriTix porque:

✅ **File-based routing** → Estructura intuitiva
✅ **Server & Client Components** → Flexibilidad en rendering
✅ **Built-in middleware** → Protección de rutas
✅ **TypeScript native** → Type safety en todo
✅ **Optimal performance** → Caching y SSG
✅ **Developer experience** → Hot reload, debugging

El aprendizaje es **progresivo** e **integrado con tu proyecto real** desde el inicio. No aprendes Next.js en abstracto, sino aplicado a VeriTix.

**Próximo paso:** Clona un template Next.js básico y empieza con la Fase 0 (React Basics). ¿Necesitas ayuda con la configuración inicial?
