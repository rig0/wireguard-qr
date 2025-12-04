<div align="center">

<img src="public/css/wg-qr.png" alt="WireGuard-QR" width="200"/>

# WireGuard-QR

![NodeJS](https://img.shields.io/badge/Node.js-339933?logo=node.js&logoColor=white)
![EJS](https://img.shields.io/badge/ejs-b5125e?logo=ejs&logoColor=white)
![WireGuard](https://img.shields.io/badge/WireGuard-88171A?logo=wireguard&logoColor=white)

![Release](https://img.shields.io/github/v/release/rig0/wireguard-qr?labelColor=222&color=80ff63)
![Stability](https://img.shields.io/badge/stability-stable-80ff63?labelColor=222)
![Maintained](https://img.shields.io/badge/maintained-yes-80ff63?labelColor=222)
![GitHub last commit](https://img.shields.io/github/last-commit/rig0/wireguard-qr?labelColor=222&color=80ff63)

**A secure, self-hosted QR code generator for WireGuard configurations.**

Built with security in mind. Your keys never leave your infrastructure.

[🌐 Live Demo](https://wg-qr.rigslab.com/) • [Features](#features) • [Security](#security) • [Setup](#setup)

[![Wireguard-QR Demo Status](https://img.shields.io/website?url=https%3A%2F%2Fwg-qr.rigslab.com&up_message=Online&up_color=80ff63&down_message=Down&down_color=d82537&style=flat&logo=web&label=Demo&labelColor=222)](https://wg-qr.rigslab.com/) ![Wireguard-QR Demo Uptime](https://services.rigslab.com/api/badge/35/uptime?label=Uptime&color=80ff63&labelColor=222)
</div>

<div align="center">

![WireGuard-QR Demo](https://i.imgur.com/l0WuJvG.png)
![WireGuard-QR Demo](https://i.imgur.com/E6XAW93.png)

*Generate QR codes from forms with validation and download support*

</div>

## Features

- 🔐 **Form-based QR Generation** - Enter config details and generate QR codes instantly
- 📁 **File Upload Support** - Upload `.conf` files to generate QR codes
- ✅ **Config Validation** - Real-time validation ensures configs are correct before generating
- 💾 **Download Configs** - Export your configurations as `.conf` files
- 🔑 **Key Generator** - Built-in WireGuard keypair generation
- 🎨 **Modern UI** - Clean Catppuccin Macchiato inspired theme
- 📱 **Mobile Friendly** - Responsive design works on all devices

## Security

**Zero-Storage Architecture** - Your configurations are never stored, logged, or persisted anywhere.

- ❌ **No server-side storage** - Configs exist only during request/response
- ❌ **No browser storage** - No localStorage, sessionStorage, or cookies
- ❌ **No logging** - Config contents are never written to logs
- ✅ **Client-side processing** - Downloads happen entirely in your browser
- ✅ **Memory-only validation** - All operations are ephemeral
- ✅ **Self-hosted** - Full control over your infrastructure

**Why self-host?** Public QR generators ***might*** expose your private keys to third parties. This app ensures your WireGuard secrets stay yours.

## Setup

### Option 1: Docker Compose (Recommended)
```yaml
services:
  wireguard-qr:
    container_name: wireguard-qr
    image: rig05/wireguard-qr:latest
    restart: always
    user: 1000:1000
    ports:
      - 127.0.0.1:5182:5182
```

```bash
docker-compose up -d
```
> [!NOTE]
> Only exposes port internally. Intended for use locally or behind reverse proxy with SSL. 
> Remove `127.0.0.1:` to expose port externally.

### Option 2: Node.js (From Source)

```bash
# Clone repository
git clone https://github.com/rig0/wireguard-qr
cd wireguard-qr

# Install dependencies
npm install

# Start application
node app.js
```

The application will be available at `http://localhost:5182`

## Usage

1. **Manual Entry**: Fill out the WireGuard config form and click "Create QR"
2. **File Upload**: Upload an existing `.conf` file to generate a QR code
3. **Generate Keys**: Use the built-in key generator for new configurations
4. **Download**: After generating a QR code, download the config for safekeeping

## Configuration

- **Port**: Default `5182` (configurable via `PORT` environment variable)
- **Reverse Proxy**: Recommended for production deployments

## Security Features in Detail

### Form Behavior
- Private keys and preshared keys are masked (password fields)
- All forms clear after QR generation
- Forms reset on page reload
- No browser autocomplete for sensitive fields

### Validation
- Validates Base64 key format (44 characters)
- Checks CIDR notation for IPs
- Validates endpoint format (host:port)
- Ensures all required fields are present
- Provides clear error messages for invalid configs

### Download Process
- Downloads are generated client-side using Blob API
- No server request made for downloads
- Config cleared from memory when popup closes
- No network transmission of complete configs

## Contributing

This is a personal project, but suggestions are welcome! Open an issue to discuss improvements.
