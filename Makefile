BUN_IMAGE ?= oven/bun:1-alpine
RUN        = docker run --rm -it -v $(PWD):/app -w /app
RUN_CI     = docker run --rm -v $(PWD):/app -w /app

.PHONY: install dev build preview add add-dev

install:
	$(RUN_CI) $(BUN_IMAGE) bun install

dev:
	$(RUN) -p 5173:5173 $(BUN_IMAGE) bun run dev --host

build:
	$(RUN_CI) $(BUN_IMAGE) bun run build

preview:
	$(RUN) -p 4173:4173 $(BUN_IMAGE) bun run preview --host

add:
	$(RUN_CI) $(BUN_IMAGE) bun add $(PKG)

add-dev:
	$(RUN_CI) $(BUN_IMAGE) bun add -d $(PKG)
