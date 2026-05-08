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

echo "Downloading platform files..."

curl -fsSL "$ZIP_URL" -o /tmp/landing-platform.zip

rm -rf "/tmp/$REPO_NAME-main"

unzip -q /tmp/landing-platform.zip -d /tmp

cp -R "/tmp/$REPO_NAME-main/." "$APP_DIR"

echo "Pulling Docker image..."

docker pull "$IMAGE"

mkdir -p "$BIN_DIR"

cat > "$BIN_DIR/landing-platform" <<'EOF2'
#!/bin/bash

APP_DIR="$HOME/.landing-platform"
IMAGE="ghcr.io/ozz129/landing-platform:latest"

COMMAND="$1"

shift || true

run_container() {
cd "$APP_DIR"

docker run -it --rm 
-v "$PWD":/workspace 
-v "$APP_DIR":/platform 
-w /workspace 
"$IMAGE" 
"$@"
}

case "$COMMAND" in
shell|"")
run_container bash
;;

claude)
run_container claude
;;

init)
PROJECT_NAME="$1"

```
if [ -z "$PROJECT_NAME" ]; then
  echo "Usage: landing-platform init <project-name>"
  exit 1
fi

run_container bash -lc "claude"

echo ""
echo "Inside Claude run:"
echo "/init-project $PROJECT_NAME"
;;
```

create)
URL="$1"
PROJECT_NAME="$2"

```
if [ -z "$URL" ] || [ -z "$PROJECT_NAME" ]; then
  echo "Usage: landing-platform create <url> <project-name>"
  exit 1
fi

run_container bash -lc "claude"

echo ""
echo "Inside Claude run:"
echo "/create-landing $URL $PROJECT_NAME"
;;
```

*)
echo "Unknown command: $COMMAND"
echo ""
echo "Available commands:"
echo "  landing-platform shell"
echo "  landing-platform claude"
echo "  landing-platform init <project-name>"
echo "  landing-platform create <url> <project-name>"
exit 1
;;
esac
EOF2

chmod +x "$BIN_DIR/landing-platform"

echo ""
echo "Installation completed."
echo ""
echo "Run:"
echo "  landing-platform shell"
echo "  landing-platform claude"
echo "  landing-platform init my-project"
echo "  landing-platform create https://stripe.com my-project"
echo ""

echo "If command is not found, run:"
echo 'export PATH="$HOME/.local/bin:$PATH"'
