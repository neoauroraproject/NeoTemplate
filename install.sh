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

# Install dependencies if missing
if ! command -v git &> /dev/null; then
    echo "Installing git..."
    apt-get update && apt-get install -y git
fi

# Clone repository to a temporary directory
TMP_DIR=$(mktemp -d)
echo "Downloading NeoTemplate repository..."
git clone --depth 1 "$REPO_URL" "$TMP_DIR"

# Create directories
mkdir -p "$INSTALL_DIR"
mkdir -p "$CONFIG_DIR"

# Copy theme-manager files
echo "Copying files to $INSTALL_DIR..."
cp -r "$TMP_DIR/theme-manager/"* "$INSTALL_DIR/"

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
rm -rf "$TMP_DIR"

echo "Installation complete!"
echo "Starting NeoTemplate Manager..."
echo "----------------------------------------"
neotemplate < /dev/tty
