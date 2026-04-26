#!/usr/bin/env bash

# Build/Watch para la documentación LaTeX (Markdown -> PDF)
set -euo pipefail

LATEX_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SRC_DIR="$LATEX_DIR/src"
BUILD_DIR="$LATEX_DIR/build"
TEMPLATE="$LATEX_DIR/template.tex"
METADATA="$LATEX_DIR/metadata.yml"
OUTPUT="$BUILD_DIR/memoria.pdf"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

require_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo -e "${RED}✗ Dependencia faltante: $1${NC}"
    exit 1
  fi
}

collect_sources() {
  shopt -s nullglob
  local files=("$SRC_DIR"/*.md)
  shopt -u nullglob

  if [ ${#files[@]} -eq 0 ]; then
    echo -e "${RED}✗ No hay fuentes Markdown en: $SRC_DIR${NC}"
    echo "  Creá al menos un archivo, por ejemplo: $SRC_DIR/01-estudio-inicial.md"
    exit 1
  fi

  printf '%s\n' "${files[@]}" | sort
}

build() {
  require_cmd pandoc
  require_cmd xelatex

  mkdir -p "$BUILD_DIR"

  mapfile -t src_files < <(collect_sources)

  echo -e "${YELLOW}▶ Compilando documentación LaTeX...${NC}"
  echo "  Fuentes:"
  for file in "${src_files[@]}"; do
    echo "    • $(basename "$file")"
  done

  pandoc "${src_files[@]}" \
    --from markdown+smart+pipe_tables+fenced_code_blocks \
    --metadata-file="$METADATA" \
    --template="$TEMPLATE" \
    --pdf-engine=xelatex \
    --toc \
    --number-sections \
    --highlight-style=tango \
    --output "$OUTPUT"

  echo -e "${GREEN}✓ PDF generado: $OUTPUT${NC}"
}

watch() {
  require_cmd inotifywait
  build

  echo -e "${YELLOW}👁  Watch activo en $SRC_DIR${NC}"
  echo "  Presioná Ctrl+C para salir"

  while true; do
    inotifywait -q -r -e modify,create,delete \
      "$SRC_DIR" \
      "$METADATA" \
      "$TEMPLATE"

    echo -e "${YELLOW}⟳ Cambio detectado, recompilando...${NC}"
    build
  done
}

clean() {
  rm -rf "$BUILD_DIR"
  echo -e "${GREEN}✓ Build limpiado: $BUILD_DIR${NC}"
}

case "${1:-build}" in
  build)
    build
    ;;
  watch)
    watch
    ;;
  clean)
    clean
    ;;
  *)
    echo "Uso: $(basename "$0") [build|watch|clean]"
    exit 1
    ;;
esac
