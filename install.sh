#!/bin/bash

set -e

APP_DIR="$HOME/.landing-platform"
BIN_DIR="$HOME/.local/bin"

GITHUB_USER="ozz129"
REPO_NAME="landing-platform"

IMAGE="ghcr.io/$GITHUB_USER/$REPO_NAME:latest"
ZIP_URL="https://github.com/$GITHUB_USER/$REPO_NAME/archive/refs/heads/main.zip"

echo "Installing Landing Platform..."

if ! command -v docker >/dev/null 2>&1; then
  echo "Docker Desktop is required."
  exit 1
fi

rm -rf "$APP_DIR"
mkdir -p "$APP_DIR"

curl -fsSL "$ZIP_URL" -o /tmp/landing-platform.zip
rm -rf "/tmp/$REPO_NAME-main"
unzip -q /tmp/landing-platform.zip -d /tmp
cp -R "/tmp/$REPO_NAME-main/." "$APP_DIR"

docker pull "$IMAGE"

mkdir -p "$BIN_DIR"

cat > "$BIN_DIR/landing-platform" <<EOF2
#!/bin/bash
cd "$APP_DIR"

docker run -it --rm \
  -v "\$PWD":/workspace \
  "$IMAGE"
EOF2

chmod +x "$BIN_DIR/landing-platform"

echo ""
echo "Installation completed."
echo "Run:"
echo "landing-platform"
echo ""
echo "If command is not found, run:"
echo 'export PATH="$HOME/.local/bin:$PATH"'
