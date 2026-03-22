# AGENTS.md

Guia para asistentes agenticos que trabajan solo en el frontend.

## Alcance

- Este documento aplica solo al paquete `frontend/`.
- No asumas nada sobre `backend/` ni lo modifiques.

## Estructura del repo (frontend)

- Nuxt 4 + Vue 3 + Nuxt UI + Tailwind 4.
- El codigo fuente vive en `frontend/`.
- Evita tocar archivos generados en `frontend/.nuxt/`.

## Comandos (frontend)

Ejecuta desde `frontend/`.

### Build y dev

- `npm run dev` inicia el servidor de desarrollo.
- `npm run build` compila para produccion.
- `npm run preview` previsualiza el build.
- `npm run generate` genera salida estatica.

### Lint y tipos

- `npm run lint` ejecuta ESLint.
- `npm run lint:fix` ejecuta ESLint con autofix.
- `npm run typecheck` ejecuta `nuxt typecheck`.

### Tests

- No hay scripts de tests en `frontend/package.json`.
- Si agregas tests, documenta aqui como correr un solo test.

## Estilo y convenciones

### Fuente de verdad

- ESLint: `frontend/eslint.config.mjs` (Antfu + Nuxt).
- Formato: definido por ESLint formatters.
- Ejecuta `npm run lint:fix` antes de cerrar cambios.

### Formato

- Indentacion: 2 espacios.
- Comillas: simples en JS/TS.
- Llaves: siempre requeridas (`curly: all`).
- Mantener estilo consistente con el archivo existente.

### Imports

- Importaciones externas primero, luego relativas.
- Usa `import type` para tipos.
- Deja que ESLint ordene si hay dudas.

### TypeScript y Vue

- Prefiere TypeScript cuando aporta claridad.
- Tipos explicitos cuando el valor no es obvio.
- Usa patrones de composicion: `useXyz`, `defineProps`, `defineEmits`.
- Mantener props y emits tipados.

### Naming

- Componentes: PascalCase.
- Composables: `useXyz`.
- Archivos y carpetas: convenciones Nuxt actuales.

### Manejo de errores

- No ocultes fallas; muestra estados de UI apropiados.
- Envuelve llamadas async propensas a fallar con `try/catch`.
- Mensajes de error claros para el usuario.

## Convenciones de UI (frontend)

- Respeta el lenguaje visual existente.
- Evita cambios masivos en layout sin necesidad.
- Usa componentes de Nuxt UI cuando ya esten en uso.
- Prioriza accesibilidad: contraste, focus, labels.

## Flujo de trabajo sugerido

- Cambios pequenos y enfocados.
- Evita refactors innecesarios.
- Mantener los diffs al minimo.
- No edites archivos generados.

## Archivos relevantes

- `frontend/package.json` contiene los scripts.
- `frontend/eslint.config.mjs` define formato/estilo.
- `frontend/app/` contiene el layout base.

## Notas sobre dependencias

- Mantener el mismo package manager dentro de `frontend/`.
- Si actualizas deps, revisa compatibilidad con Nuxt 4.

## Documentacion

- Nuxt: https://nuxt.com/docs
- Nuxt UI: https://ui.nuxt.com

## Cursor y Copilot rules

- No se encontraron `.cursor/rules/`, `.cursorrules` ni `.github/copilot-instructions.md`.
- Si se agregan, actualiza este archivo.
