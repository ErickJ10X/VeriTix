# Documentación de VeriTix

Este directorio está separado en dos módulos claros:

## 1) Markdown puro (`docs/markdown/`)

KB del proyecto en Markdown (Obsidian-friendly), separada por tipo de nota.

- [`markdown/_index.md`](./markdown/_index.md)
- [`markdown/reference/architecture.md`](./markdown/reference/architecture.md)
- [`markdown/reference/api.md`](./markdown/reference/api.md)
- [`markdown/reference/database.md`](./markdown/reference/database.md)
- [`markdown/reference/requirements.md`](./markdown/reference/requirements.md)
- [`markdown/reference/tfg.md`](./markdown/reference/tfg.md)
- [`markdown/status/status.md`](./markdown/status/status.md)
- [`markdown/archive/latex-bak.md`](./markdown/archive/latex-bak.md)

## 2) Módulo LaTeX (`docs/latex/`)

Contiene todo el tooling para generar PDF académico desde Markdown:

- `src/` → capítulos fuente
- `filters/` → transformaciones Lua para limpiar Markdown
- `template.tex` → plantilla LaTeX
- `metadata.yml` → metadatos globales
- `build.sh` + `Makefile` → build/clean/erd
- `assets/` → recursos gráficos estáticos del PDF
- `build/assets/` → diagramas ER generados por Prisma (PNG)
- `build/` → salida de compilación

Guía operativa: [`docs/latex/README.md`](./latex/README.md).

## Regla de fuente de verdad

1. **Código del repo** (backend/frontend/prisma)
2. `docs/markdown/reference/tfg.md` para alcance/roadmap explícito
3. `docs/markdown/` como síntesis operativa

Si hay contradicción entre documentación y código, **manda el código**.
