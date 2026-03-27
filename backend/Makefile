.PHONY: install dev test lint help

install: ## Install dependencies
	pip install -r requirements.txt

dev: ## Run development server with hot reload
	uvicorn src.app.main:app --reload --host 0.0.0.0 --port 8000

test: ## Run tests
	pytest

lint: ## Lint source code
	ruff check src/

help: ## Show available targets
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-15s\033[0m %s\n", $$1, $$2}'
