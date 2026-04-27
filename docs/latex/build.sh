#!/usr/bin/env bash

# Build/Watch para la documentación LaTeX (Markdown -> PDF)
set -euo pipefail

LATEX_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SRC_DIR="$LATEX_DIR/src"
BUILD_DIR="$LATEX_DIR/build"
TEMPLATE="$LATEX_DIR/template.tex"
METADATA="$LATEX_DIR/metadata.yml"
FILTER="$LATEX_DIR/filters/cleanup.lua"
OUTPUT="$BUILD_DIR/memoria.pdf"
BACKEND_DIR="$LATEX_DIR/../../backend"
LOGO_SOURCE="$LATEX_DIR/assets/foc-logo.png"

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

logo_is_valid_png() {
  if [ ! -f "$LOGO_SOURCE" ]; then
    return 1
  fi

  python3 - "$LOGO_SOURCE" <<'PY'
import pathlib
import sys
import zlib

p = pathlib.Path(sys.argv[1])
d = p.read_bytes()
sig = b"\x89PNG\r\n\x1a\n"

if not d.startswith(sig):
    raise SystemExit(1)

pos = len(sig)
seen_iend = False
idat = bytearray()

while pos + 12 <= len(d):
    ln = int.from_bytes(d[pos:pos + 4], "big")
    ctype = d[pos + 4:pos + 8]
    ds = pos + 8
    de = ds + ln
    ce = de + 4
    if ce > len(d):
      raise SystemExit(1)
    data = d[ds:de]
    crc = int.from_bytes(d[de:ce], "big")
    calc = zlib.crc32(ctype)
    calc = zlib.crc32(data, calc) & 0xFFFFFFFF
    if crc != calc:
      raise SystemExit(1)
    if ctype == b"IDAT":
      idat.extend(data)
    pos = ce
    if ctype == b"IEND":
      seen_iend = True
      break

if not (seen_iend and pos == len(d)):
    raise SystemExit(1)

if idat:
    zlib.decompress(bytes(idat))
PY
}

build() {
  require_cmd pandoc
  require_cmd xelatex
  require_cmd python3

  mkdir -p "$BUILD_DIR"

  local -a pandoc_logo_args=()
  if logo_is_valid_png; then
    pandoc_logo_args+=("--variable=logo-path:$LOGO_SOURCE")
  else
    echo -e "${YELLOW}⚠ Logo inválido o no disponible, se usará fallback tipográfico en portada${NC}"
  fi

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
    --lua-filter="$FILTER" \
    "${pandoc_logo_args[@]}" \
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

erd() {
  require_cmd bunx

  if [ ! -d "$BACKEND_DIR" ]; then
    echo -e "${RED}✗ Backend no encontrado: $BACKEND_DIR${NC}"
    exit 1
  fi

  echo -e "${YELLOW}▶ Generando diagrama ER desde Prisma...${NC}"
  (
    cd "$BACKEND_DIR"
    bunx prisma generate
  )
  echo -e "${GREEN}✓ ER generado en docs/latex/assets/${NC}"
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
  erd)
    erd
    ;;
  *)
    echo "Uso: $(basename "$0") [build|watch|clean|erd]"
    exit 1
    ;;
esac
