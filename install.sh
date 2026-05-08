#!/bin/bash

set -ex

APP_DIR="$HOME/.landing-platform"
BIN_DIR="$HOME/.local/bin"

GITHUB_USER="ozz129"
REPO_NAME="landing-platform"

ZIP_URL="https://github.com/$GITHUB_USER/$REPO_NAME/archive/refs/heads/main.zip"

echo "Installing Landing Platform..."

if ! command -v docker >/dev/null 2>&1; then
echo "Docker Desktop is required."
exit 1
fi

rm -rf "$APP_DIR"
mkdir -p "$APP_DIR"

echo "Downloading platform files..."

curl -fsSL "$ZIP_URL" -o /tmp/landing-platform.zip

rm -rf "/tmp/$REPO_NAME-main"

unzip -q /tmp/landing-platform.zip -d /tmp

cp -R "/tmp/$REPO_NAME-main/." "$APP_DIR"

echo "Building Docker image locally. This may take several minutes..."

cd "$APP_DIR"

docker build -t landing-platform-local .

mkdir -p "$BIN_DIR"

cat > "$BIN_DIR/landing-platform" <<'EOF2'
#!/bin/bash

APP_DIR="$HOME/.landing-platform"
HOST_DIR="$PWD"
IMAGE="landing-platform-local"

docker run -it --rm 
-v "$HOST_DIR":/workspace 
-v "$APP_DIR":/platform 
-w /workspace 
"$IMAGE" 
bash -lc '
if [ ! -d "/workspace/.claude" ]; then
cp -R /platform/.claude /workspace/.claude
fi

```
echo ""
echo "Landing Platform ready."
echo "Workspace: /workspace"
echo ""
echo "Common commands:"
echo "  claude"
echo "  /init-project PRUEBA1"
echo "  /create-landing https://stripe.com PRUEBA1"
echo ""

exec bash
```

'
EOF2

chmod +x "$BIN_DIR/landing-platform"

echo ""
echo "Installation completed."
echo ""
echo "Run:"
echo "landing-platform"
echo ""
echo "If command is not found, run:"
echo 'export PATH="$HOME/.local/bin:$PATH"'
