.PHONY: all clean

install/backend:
	@echo "Installing backend..."
	@cd backend \
	&& source .venv/bin/activate \
	&& uv pip install -r requirements.txt

install/web:
	@echo "Installing web..."
	@cd web \
	&& bun install

dev/backend: install/backend
	@echo "Starting backend..."
	@cd backend \
	&& source .venv/bin/activate \
	&& fastapi dev routes.py

dev/web: install/web
	@echo "Starting web..."
	@cd web \
	&& bun run dev
