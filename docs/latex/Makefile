SHELL := /usr/bin/env bash

.PHONY: help build watch clean

help:
	@printf "Targets disponibles:\n"
	@printf "  make build  - Compila PDF desde Markdown\n"
	@printf "  make watch  - Recompila al detectar cambios\n"
	@printf "  make clean  - Limpia artefactos de build\n"

build:
	./build.sh build

watch:
	./build.sh watch

clean:
	./build.sh clean
