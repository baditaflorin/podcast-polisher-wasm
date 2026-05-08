.DEFAULT_GOAL := help

.PHONY: help install-hooks dev build data test test-integration smoke lint fmt pages-preview release clean hooks-pre-commit hooks-commit-msg hooks-pre-push hooks-post-merge hooks-post-checkout

help:
	@awk 'BEGIN {FS = ":.*##"} /^[a-zA-Z0-9_-]+:.*##/ {printf "%-22s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

install-hooks: ## Wire local git hooks
	git config core.hooksPath .githooks

dev: ## Run the frontend dev server
	npm run dev

build: ## Build the Pages-ready static app into docs/
	npm run build

data: ## Regenerate static data artifacts
	npm run data

test: ## Run unit tests
	npm run test

test-integration: ## Run integration tests
	npm run test:integration

smoke: ## Run the static Pages smoke test
	npm run smoke

lint: ## Run linters, formatting checks, and type checks
	npm run lint

fmt: ## Autoformat files
	npm run fmt

pages-preview: ## Serve docs/ locally as GitHub Pages would
	npm run pages-preview

release: ## Tag a semver release after local checks
	bash scripts/release.sh

clean: ## Remove local generated caches
	rm -rf node_modules/.tmp coverage

hooks-pre-commit:
	bash .githooks/pre-commit

hooks-commit-msg:
	bash .githooks/commit-msg .git/COMMIT_EDITMSG

hooks-pre-push:
	bash .githooks/pre-push

hooks-post-merge:
	bash .githooks/post-merge

hooks-post-checkout:
	bash .githooks/post-checkout
