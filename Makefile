.PHONY: all clean install dev

# Define directory paths for cleaner rules
BACKEND_DIR := backend
WEB_DIR := web
EXT_DIR := extension

# Component installation targets
install: install/backend install/web install/ext
	@echo "✅ All components installed successfully"

install/backend:
	@echo "📦 Installing backend dependencies..."
	@cd $(BACKEND_DIR) \
	&& source .venv/bin/activate \
	&& uv pip install -r requirements.txt

install/web:
	@echo "📦 Installing web dependencies..."
	@cd $(WEB_DIR) \
	&& bun install

install/ext:
	@echo "📦 Installing extension dependencies..."
	@cd $(EXT_DIR) \
	&& bun install

dev/backend: install/backend
	@echo "🚀 Starting backend server..."
	@cd $(BACKEND_DIR) \
	&& source .venv/bin/activate \
	&& fastapi dev routes.py

dev/web: install/web
	@echo "🚀 Starting web development server..."
	@cd $(WEB_DIR) \
	&& bun run dev

dev/ext: install/ext
	@echo "🚀 Building extensions..."
	@cd $(EXT_DIR) \
	&& bun run build
	@echo "ℹ️  Load the Chrome extension using 'Load unpacked' from chrome://extensions"

# Individual component startup (convenient for working on just one part)
backend: dev/backend
web: dev/web
ext: dev/ext

# Clean up build artifacts
clean:
	@echo "🧹 Cleaning up..."
	@find . -type d -name "node_modules" -exec rm -rf {} +
	@rm -r extension/build
	@echo "✅ Cleanup complete"
