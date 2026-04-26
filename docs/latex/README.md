# Módulo LaTeX de VeriTix

Este módulo encapsula TODO lo necesario para compilar la memoria PDF a partir de Markdown.

## Estructura

- `src/*.md`: capítulos en orden (se concatenan al compilar)
- `template.tex`: plantilla visual/institucional
- `metadata.yml`: metadatos globales (título, autores, idioma, etc.)
- `assets/`: recursos gráficos del documento
- `build.sh`: script principal (build/watch/clean)
- `Makefile`: fachada simple sobre `build.sh`
- `latexmkrc`: configuración base para flujos con latexmk
- `build/`: artefactos de salida

## Requisitos

- `pandoc`
- `xelatex` (TeX Live)
- `inotifywait` (solo para watch)

## Uso

Desde `docs/latex/`:

```bash
make build
make watch
make erd
make clean
```

Alternativa directa:

```bash
./build.sh build
./build.sh watch
./build.sh erd
./build.sh clean
```

Salida esperada: `build/memoria.pdf`.

## Cómo extender tooling

1. **Cambios de formato visual**
   - Editar `template.tex`.
2. **Cambios de metadatos o defaults de Pandoc**
   - Editar `metadata.yml`.
3. **Nuevos capítulos**
   - Agregar archivo en `src/` con prefijo numérico (`05-...md`) para mantener orden.
4. **Nuevos targets**
   - Agregar target en `Makefile` y, si aplica, función en `build.sh`.

## Convenciones

- No mezclar documentación general del proyecto aquí; eso vive en `docs/markdown/`.
- `build/` contiene artefactos generados, no fuente documental.
- No ejecutar builds en CI/pipeline sin validar dependencias de LaTeX en el entorno.
