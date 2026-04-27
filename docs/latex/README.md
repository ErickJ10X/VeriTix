# Módulo LaTeX de VeriTix

Este módulo encapsula TODO lo necesario para compilar la memoria PDF a partir de Markdown.

## Estructura

- `src/*.md`: capítulos en orden (se concatenan al compilar)
- `filters/`: filtros Lua para limpiar Markdown y centralizar transformaciones
- `template.tex`: plantilla visual/institucional
- `metadata.yml`: metadatos globales (título, autores, idioma, etc.)
- `assets/`: recursos gráficos del documento (logo y otros assets estáticos)
- `build/assets/`: diagramas ER derivados en PNG (generados por Prisma ERD)
- `build.sh`: script principal (build/clean/erd)
- `Makefile`: fachada simple sobre `build.sh`
- `build/`: artefactos de salida

Nota: los ERD se generan directamente como PNG en `build/assets/` desde Prisma ERD (`make erd`).

## Requisitos

- `pandoc`
- `xelatex` (TeX Live)

## Instalacion de requisitos en ubuntu

```bash
sudo apt update
sudo apt install pandoc texlive-xetex
```

## Uso

Desde `docs/latex/`:

```bash
make build
make erd
make clean
```

Recomendado:

```bash
make erd && make build
```

Alternativa directa:

```bash
./build.sh build
./build.sh erd
./build.sh clean
```

Salida esperada: `build/memoria.pdf`.
Para compilar, primero ejecutá `make erd` para generar `build/assets/er-*.png`.

## Cómo extender tooling

1. **Cambios de formato visual**
    - Editar `template.tex`.
    - Para tablas, usar Markdown normal; el filtro Lua aplica el estilo de encabezados.
    - Para figuras especiales, usar fenced divs con clase `latex-figure`.
2. **Cambios de metadatos o defaults de Pandoc**
    - Editar `metadata.yml`.
3. **Nuevos capítulos**
    - Agregar archivo en `src/` con prefijo numérico (`05-...md`) para mantener orden.
4. **Nuevos filtros o transformaciones**
    - Editar o agregar filtros en `filters/`.
5. **Nuevos targets**
    - Agregar target en `Makefile` y, si aplica, función en `build.sh`.

## Convenciones

- No mezclar documentación general del proyecto aquí; eso vive en `docs/markdown/`.
- `build/` contiene artefactos generados, no fuente documental.
- Los `.md` deben quedarse en Markdown semántico: tablas normales, figuras con fenced divs y sin LaTeX crudo.
- El estilo de tablas y figuras vive en `template.tex` + `filters/`.
- El zebra striping está centralizado en `template.tex` y aplica a `tabular`, `tabularx` y `longtable`.
