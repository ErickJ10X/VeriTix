#!/usr/bin/env bash

# Build para la documentación LaTeX (Markdown -> PDF)
set -euo pipefail

LATEX_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SRC_DIR="$LATEX_DIR/src"
BUILD_DIR="$LATEX_DIR/build"
TEMPLATE="$LATEX_DIR/template.tex"
METADATA="$LATEX_DIR/metadata.yml"
FILTER_DIR="$LATEX_DIR/filters"
COMMON_FILTER="$FILTER_DIR/common.lua"
PANDOC_FILTERS=(
  "$FILTER_DIR/tables.lua"
  "$FILTER_DIR/figures.lua"
  "$FILTER_DIR/pagebreaks.lua"
)
OUTPUT="$BUILD_DIR/memoria.pdf"
BACKEND_DIR="$LATEX_DIR/../../backend"
LOGO_SOURCE="$LATEX_DIR/assets/foc-logo.png"
ASSET_BUILD_DIR="$BUILD_DIR/assets"
ERD_FILES=(
  "$ASSET_BUILD_DIR/er-overview.png"
  "$ASSET_BUILD_DIR/er-core-transaccional.png"
)

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

ensure_erd_png_assets() {
  for file in "${ERD_FILES[@]}"; do
    if [ ! -s "$file" ]; then
      echo -e "${YELLOW}⚠ Falta ERD generado: $file${NC}"
      echo -e "${YELLOW}  Ejecutá primero: make erd${NC}"
      exit 1
    fi
  done
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

logo_is_available() {
  [ -s "$LOGO_SOURCE" ]
}

validate_inputs() {
  local required_files=("$METADATA" "$TEMPLATE" "$COMMON_FILTER")
  required_files+=("${PANDOC_FILTERS[@]}")

  for file in "${required_files[@]}"; do
    if [ ! -f "$file" ]; then
      echo -e "${RED}✗ Archivo requerido no encontrado: $file${NC}"
      exit 1
    fi
  done
}

build() {
  require_cmd pandoc
  require_cmd xelatex
  validate_inputs

  mkdir -p "$BUILD_DIR"

  local -a pandoc_logo_args=()
  if logo_is_available; then
    pandoc_logo_args+=("--variable=logo-path:$LOGO_SOURCE")
  else
    echo -e "${YELLOW}⚠ Logo no disponible, se usará fallback tipográfico en portada${NC}"
  fi

  export LUA_PATH="$FILTER_DIR/?.lua;$FILTER_DIR/?/init.lua;${LUA_PATH:-}"

  local -a pandoc_filter_args=()
  for filter in "${PANDOC_FILTERS[@]}"; do
    pandoc_filter_args+=("--lua-filter=$filter")
  done

  ensure_erd_png_assets

  mapfile -t src_files < <(collect_sources)

  echo -e "${YELLOW}▶ Compilando documentación LaTeX...${NC}"
  echo "  Fuentes:"
  for file in "${src_files[@]}"; do
    echo "    • $(basename "$file")"
  done

  pandoc "${src_files[@]}" \
    --from markdown+smart+pipe_tables+fenced_code_blocks+fenced_divs \
    --metadata-file="$METADATA" \
    --template="$TEMPLATE" \
    "${pandoc_filter_args[@]}" \
    "${pandoc_logo_args[@]}" \
    --pdf-engine=xelatex \
    --toc \
    --number-sections \
    --highlight-style=tango \
    --output "$OUTPUT"

  echo -e "${GREEN}✓ PDF generado: $OUTPUT${NC}"
}

clean() {
  rm -rf "$BUILD_DIR"
  echo -e "${GREEN}✓ Build limpiado: $BUILD_DIR${NC}"
}

erd() {
  require_cmd bunx
  validate_inputs

  if [ ! -d "$BACKEND_DIR" ]; then
    echo -e "${RED}✗ Backend no encontrado: $BACKEND_DIR${NC}"
    exit 1
  fi

  echo -e "${YELLOW}▶ Generando diagramas ER desde Prisma...${NC}"
  mkdir -p "$ASSET_BUILD_DIR"

  rm -f "${ERD_FILES[@]}"
  (
    cd "$BACKEND_DIR"
    bunx prisma generate
  )

  ensure_erd_png_assets
  echo -e "${GREEN}✓ ER generado en docs/latex/build/assets/ (PNG)${NC}"
}

case "${1:-build}" in
  build)
    build
    ;;
  clean)
    clean
    ;;
  erd)
    erd
    ;;
  *)
    echo "Uso: $(basename "$0") [build|clean|erd]"
    exit 1
    ;;
esac
