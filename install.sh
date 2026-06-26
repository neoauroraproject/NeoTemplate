#!/usr/bin/env bash

# Installation script for 3x-ui Theme Manager

echo "Installing 3x-ui Theme Manager..."

INSTALL_DIR="/opt/3x-ui-theme-manager"
CONFIG_DIR="/etc/3x-ui-theme-manager"
REPO_URL="https://github.com/neoauroraproject/NeoTemplate.git"

# Check root privileges
if [[ $EUID -ne 0 ]]; then
   echo "This script must be run as root to install globally." 
   exit 1
fi

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Check if we are running from a local clone (either root or theme-manager directory)
if [[ -f "$SCRIPT_DIR/manager.sh" && -d "$SCRIPT_DIR/config" ]]; then
    USE_LOCAL=true
    LOCAL_SRC_DIR="$SCRIPT_DIR"
elif [[ -f "$SCRIPT_DIR/theme-manager/manager.sh" && -d "$SCRIPT_DIR/theme-manager/config" ]]; then
    USE_LOCAL=true
    LOCAL_SRC_DIR="$SCRIPT_DIR/theme-manager"
else
    USE_LOCAL=false
fi

if [ "$USE_LOCAL" = true ]; then
    echo "Using local repository files from $LOCAL_SRC_DIR..."
else
    # Install dependencies if missing
    if ! command -v curl &> /dev/null || ! command -v tar &> /dev/null; then
        echo "Installing dependencies (curl, tar)..."
        apt-get update && apt-get install -y curl tar
    fi

    # Download repository archive to a temporary directory
    TMP_DIR=$(mktemp -d)
    echo "Downloading NeoTemplate repository..."
    curl -sL "https://github.com/neoauroraproject/NeoTemplate/archive/refs/heads/main.tar.gz" | tar xz -C "$TMP_DIR" --strip-components=1
fi

# Create directories
mkdir -p "$INSTALL_DIR"
mkdir -p "$CONFIG_DIR"

# Copy theme-manager files
echo "Copying files to $INSTALL_DIR..."
if [ "$USE_LOCAL" = true ]; then
    cp -r "$LOCAL_SRC_DIR/"* "$INSTALL_DIR/"
else
    cp -r "$TMP_DIR/theme-manager/"* "$INSTALL_DIR/"
fi

# Setup default configuration (Force update for now)
cp "$INSTALL_DIR/config/config.json" "$CONFIG_DIR/config.json"

# Make scripts executable
chmod +x "$INSTALL_DIR/manager.sh"
chmod +x "$INSTALL_DIR/install.sh"
chmod +x "$INSTALL_DIR/lib/"*.sh

# Create symlink for easy access
ln -sf "$INSTALL_DIR/manager.sh" "/usr/local/bin/neotemplate"
ln -sf "$INSTALL_DIR/manager.sh" "/usr/local/bin/3x-ui-theme" # Keep old alias just in case

# Clean up
if [ "$USE_LOCAL" = false ]; then
    rm -rf "$TMP_DIR"
fi

echo "Installation complete!"
echo "Starting NeoTemplate Manager..."
echo "----------------------------------------"
neotemplate < /dev/tty
