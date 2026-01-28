#!/bin/sh
# install.sh - Install birdhouse CLI
# Usage: curl -fsSL https://raw.githubusercontent.com/birdcar/birdhouse/main/install.sh | sh

set -e

REPO="birdcar/birdhouse"
INSTALL_DIR="${INSTALL_DIR:-/usr/local/bin}"
BINARY_NAME="bh"

# Detect OS and architecture
detect_platform() {
    OS="$(uname -s)"
    ARCH="$(uname -m)"

    case "$OS" in
        Darwin) OS="darwin" ;;
        Linux) OS="linux" ;;
        MINGW*|MSYS*|CYGWIN*)
            OS="win32"
            BINARY_SUFFIX=".exe"
            ;;
        *)
            echo "Error: Unsupported operating system: $OS"
            echo "Supported: macOS (Darwin), Linux, Windows (via Git Bash/MSYS2/Cygwin)"
            exit 1
            ;;
    esac

    case "$ARCH" in
        x86_64|amd64) ARCH="x64" ;;
        arm64|aarch64) ARCH="arm64" ;;
        *)
            echo "Error: Unsupported architecture: $ARCH"
            echo "Supported: x64 (x86_64), arm64 (aarch64)"
            exit 1
            ;;
    esac

    # Check for unsupported combinations
    if [ "$OS" = "win32" ] && [ "$ARCH" = "arm64" ]; then
        echo "Error: Windows ARM64 is not yet supported"
        echo "Supported platforms: darwin-arm64, darwin-x64, linux-arm64, linux-x64, win32-x64"
        exit 1
    fi

    PLATFORM="${OS}-${ARCH}${BINARY_SUFFIX:-}"
    echo "Detected platform: $PLATFORM"
}

# Get latest release version
get_latest_version() {
    VERSION=$(curl -fsSL "https://api.github.com/repos/${REPO}/releases/latest" | grep '"tag_name"' | sed -E 's/.*"([^"]+)".*/\1/')
    if [ -z "$VERSION" ]; then
        echo "Error: Could not determine latest version"
        exit 1
    fi
    echo "Latest version: $VERSION"
}

# Download and verify binary
download_binary() {
    BINARY_URL="https://github.com/${REPO}/releases/download/${VERSION}/bh-${PLATFORM}"
    CHECKSUM_URL="https://github.com/${REPO}/releases/download/${VERSION}/SHA256SUMS"

    TMPDIR=$(mktemp -d)
    trap 'rm -rf "$TMPDIR"' EXIT

    echo "Downloading bh-${PLATFORM}..."
    curl -fsSL "$BINARY_URL" -o "$TMPDIR/bh"

    echo "Downloading checksums..."
    curl -fsSL "$CHECKSUM_URL" -o "$TMPDIR/SHA256SUMS"

    echo "Verifying checksum..."
    EXPECTED=$(grep "bh-${PLATFORM}" "$TMPDIR/SHA256SUMS" | cut -d' ' -f1)
    ACTUAL=$(shasum -a 256 "$TMPDIR/bh" | cut -d' ' -f1)

    if [ "$EXPECTED" != "$ACTUAL" ]; then
        echo "Error: Checksum verification failed!"
        echo "Expected: $EXPECTED"
        echo "Actual:   $ACTUAL"
        exit 1
    fi
    echo "Checksum verified."

    DOWNLOADED_BINARY="$TMPDIR/bh"
}

# Install binary
install_binary() {
    INSTALL_NAME="${BINARY_NAME}${BINARY_SUFFIX:-}"
    echo "Installing to ${INSTALL_DIR}/${INSTALL_NAME}..."

    # Check if we need sudo
    if [ -w "$INSTALL_DIR" ]; then
        cp "$DOWNLOADED_BINARY" "${INSTALL_DIR}/${INSTALL_NAME}"
        chmod +x "${INSTALL_DIR}/${INSTALL_NAME}"
    else
        echo "Note: Requires sudo to install to ${INSTALL_DIR}"
        sudo cp "$DOWNLOADED_BINARY" "${INSTALL_DIR}/${INSTALL_NAME}"
        sudo chmod +x "${INSTALL_DIR}/${INSTALL_NAME}"
    fi

    echo ""
    echo "Successfully installed birdhouse ${VERSION}!"
    echo ""
    echo "Run 'bh --help' to get started."
}

main() {
    detect_platform
    get_latest_version
    download_binary
    install_binary
}

main
