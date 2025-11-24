/**
 * WireGuard Configuration Validator
 *
 * SECURITY: This module validates WireGuard configs in-memory only.
 * NO CONFIG DATA IS EVER STORED, LOGGED, OR PERSISTED.
 * Only validation results (errors) are returned.
 */

/**
 * Validation regex patterns
 */
const patterns = {
    // Base64 key validation (WireGuard keys are 44 characters)
    base64Key: /^[A-Za-z0-9+/]{42}[A-Za-z0-9+/=]{2}$/,

    // IPv4 address
    ipv4: /^(\d{1,3}\.){3}\d{1,3}$/,

    // IPv6 address (simplified)
    ipv6: /^([0-9a-fA-F]{0,4}:){7}[0-9a-fA-F]{0,4}$/,

    // CIDR notation (IPv4)
    cidrV4: /^(\d{1,3}\.){3}\d{1,3}\/\d{1,2}$/,

    // CIDR notation (IPv6)
    cidrV6: /^([0-9a-fA-F]{0,4}:){2,7}[0-9a-fA-F]{0,4}\/\d{1,3}$/,

    // Endpoint format (domain:port or ip:port)
    endpoint: /^[a-zA-Z0-9.-]+:\d{1,5}$/,

    // Domain name
    domain: /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,
};

/**
 * Helper: Check if string is a valid base64 WireGuard key
 */
function isValidBase64Key(key) {
    if (!key || typeof key !== 'string') return false;
    return patterns.base64Key.test(key.trim());
}

/**
 * Helper: Check if string is a valid IPv4 address
 */
function isValidIPv4(ip) {
    if (!ip || typeof ip !== 'string') return false;
    if (!patterns.ipv4.test(ip)) return false;

    // Check octets are in valid range (0-255)
    const octets = ip.split('.');
    return octets.every(octet => {
        const num = parseInt(octet, 10);
        return num >= 0 && num <= 255;
    });
}

/**
 * Helper: Check if string is a valid CIDR notation
 */
function isValidCIDR(cidr) {
    if (!cidr || typeof cidr !== 'string') return false;

    // Check IPv4 CIDR
    if (patterns.cidrV4.test(cidr)) {
        const [ip, prefix] = cidr.split('/');
        const prefixNum = parseInt(prefix, 10);
        return isValidIPv4(ip) && prefixNum >= 0 && prefixNum <= 32;
    }

    // Check IPv6 CIDR
    if (patterns.cidrV6.test(cidr)) {
        const [, prefix] = cidr.split('/');
        const prefixNum = parseInt(prefix, 10);
        return prefixNum >= 0 && prefixNum <= 128;
    }

    return false;
}

/**
 * Helper: Check if string is a valid endpoint (host:port)
 */
function isValidEndpoint(endpoint) {
    if (!endpoint || typeof endpoint !== 'string') return false;
    if (!patterns.endpoint.test(endpoint)) return false;

    const [host, portStr] = endpoint.split(':');
    const port = parseInt(portStr, 10);

    // Validate port range
    if (port < 1 || port > 65535) return false;

    // Validate host (IP or domain)
    return isValidIPv4(host) || patterns.domain.test(host);
}

/**
 * Helper: Check if port number is valid
 */
function isValidPort(port) {
    const num = parseInt(port, 10);
    return !isNaN(num) && num >= 1 && num <= 65535;
}

/**
 * Helper: Parse WireGuard config into sections
 * @param {string} configString - Raw config string
 * @returns {object} Parsed sections (Interface, Peer)
 */
function parseConfigSections(configString) {
    const sections = {
        Interface: {},
        Peer: {}
    };

    let currentSection = null;
    const lines = configString.split('\n');

    for (const line of lines) {
        const trimmed = line.trim();

        // Skip empty lines and comments
        if (!trimmed || trimmed.startsWith('#')) continue;

        // Section headers
        if (trimmed === '[Interface]') {
            currentSection = 'Interface';
            continue;
        }
        if (trimmed === '[Peer]') {
            currentSection = 'Peer';
            continue;
        }

        // Key-value pairs
        if (currentSection && trimmed.includes('=')) {
            const [key, ...valueParts] = trimmed.split('=');
            const value = valueParts.join('=').trim();
            sections[currentSection][key.trim()] = value;
        }
    }

    return sections;
}

/**
 * Main validation function
 * @param {string} configString - Raw WireGuard config string
 * @returns {object} { valid: boolean, errors: string[] }
 */
function validateWireguardConfig(configString) {
    const errors = [];

    // Basic input validation
    if (!configString || typeof configString !== 'string') {
        return {
            valid: false,
            errors: ['Config is empty or invalid']
        };
    }

    // Parse config sections (in-memory only)
    const sections = parseConfigSections(configString);

    // ========================================
    // Validate [Interface] Section
    // ========================================
    if (!sections.Interface || Object.keys(sections.Interface).length === 0) {
        errors.push('Missing [Interface] section');
    } else {
        const iface = sections.Interface;

        // PrivateKey (required)
        if (!iface.PrivateKey) {
            errors.push('PrivateKey is required in [Interface]');
        } else if (!isValidBase64Key(iface.PrivateKey)) {
            errors.push('Invalid PrivateKey format (must be 44-character base64 string)');
        }

        // Address (required)
        if (!iface.Address) {
            errors.push('Address is required in [Interface]');
        } else {
            // Address can be comma-separated list of CIDRs
            const addresses = iface.Address.split(',').map(a => a.trim());
            const invalidAddresses = addresses.filter(addr => !isValidCIDR(addr));
            if (invalidAddresses.length > 0) {
                errors.push(`Invalid Address format (use CIDR notation, e.g., 10.0.0.2/24): ${invalidAddresses.join(', ')}`);
            }
        }

        // DNS (optional)
        if (iface.DNS) {
            const dnsServers = iface.DNS.split(',').map(d => d.trim());
            const invalidDNS = dnsServers.filter(dns => !isValidIPv4(dns));
            if (invalidDNS.length > 0) {
                errors.push(`Invalid DNS server format: ${invalidDNS.join(', ')}`);
            }
        }

        // MTU (optional)
        if (iface.MTU) {
            const mtu = parseInt(iface.MTU, 10);
            if (isNaN(mtu) || mtu < 576 || mtu > 65535) {
                errors.push('Invalid MTU value (must be between 576 and 65535)');
            }
        }
    }

    // ========================================
    // Validate [Peer] Section
    // ========================================
    if (!sections.Peer || Object.keys(sections.Peer).length === 0) {
        errors.push('Missing [Peer] section');
    } else {
        const peer = sections.Peer;

        // PublicKey (required)
        if (!peer.PublicKey) {
            errors.push('PublicKey is required in [Peer]');
        } else if (!isValidBase64Key(peer.PublicKey)) {
            errors.push('Invalid PublicKey format (must be 44-character base64 string)');
        }

        // Endpoint (required)
        if (!peer.Endpoint) {
            errors.push('Endpoint is required in [Peer]');
        } else if (!isValidEndpoint(peer.Endpoint)) {
            errors.push('Invalid Endpoint format (use hostname:port or ip:port, e.g., vpn.example.com:51820)');
        }

        // AllowedIPs (required)
        if (!peer.AllowedIPs) {
            errors.push('AllowedIPs is required in [Peer]');
        } else {
            const allowedIPs = peer.AllowedIPs.split(',').map(ip => ip.trim());
            const invalidIPs = allowedIPs.filter(ip => !isValidCIDR(ip));
            if (invalidIPs.length > 0) {
                errors.push(`Invalid AllowedIPs format (use CIDR notation): ${invalidIPs.join(', ')}`);
            }
        }

        // PreSharedKey (optional)
        if (peer.PreSharedKey && !isValidBase64Key(peer.PreSharedKey)) {
            errors.push('Invalid PreSharedKey format (must be 44-character base64 string)');
        }

        // PersistentKeepAlive (optional)
        if (peer.PersistentKeepAlive) {
            const keepalive = parseInt(peer.PersistentKeepAlive, 10);
            if (isNaN(keepalive) || keepalive < 0 || keepalive > 65535) {
                errors.push('Invalid PersistentKeepAlive value (must be between 0 and 65535)');
            }
        }
    }

    // Return validation result (errors only, no config data)
    return {
        valid: errors.length === 0,
        errors
    };
}

/**
 * Validate form data object
 * @param {object} formData - Form data with WireGuard fields
 * @returns {object} { valid: boolean, errors: string[] }
 */
function validateFormData(formData) {
    const errors = [];

    // Validate Interface fields
    if (!formData.PrivateKey) {
        errors.push('PrivateKey is required');
    } else if (!isValidBase64Key(formData.PrivateKey)) {
        errors.push('Invalid PrivateKey format');
    }

    if (!formData.Address) {
        errors.push('Address is required');
    } else if (!isValidCIDR(formData.Address)) {
        errors.push('Invalid Address format (use CIDR notation, e.g., 10.0.0.2/24)');
    }

    if (formData.DNS) {
        const dnsServers = formData.DNS.split(',').map(d => d.trim());
        const invalidDNS = dnsServers.filter(dns => !isValidIPv4(dns));
        if (invalidDNS.length > 0) {
            errors.push(`Invalid DNS server format: ${invalidDNS.join(', ')}`);
        }
    }

    // Validate Peer fields
    if (!formData.PublicKey) {
        errors.push('PublicKey is required');
    } else if (!isValidBase64Key(formData.PublicKey)) {
        errors.push('Invalid PublicKey format');
    }

    if (!formData.Endpoint) {
        errors.push('Endpoint is required');
    } else if (!isValidEndpoint(formData.Endpoint)) {
        errors.push('Invalid Endpoint format (use hostname:port or ip:port)');
    }

    if (!formData.AllowedIPs) {
        errors.push('AllowedIPs is required');
    } else {
        const allowedIPs = formData.AllowedIPs.split(',').map(ip => ip.trim());
        const invalidIPs = allowedIPs.filter(ip => !isValidCIDR(ip));
        if (invalidIPs.length > 0) {
            errors.push(`Invalid AllowedIPs format: ${invalidIPs.join(', ')}`);
        }
    }

    if (formData.PreSharedKey && !isValidBase64Key(formData.PreSharedKey)) {
        errors.push('Invalid PreSharedKey format');
    }

    if (formData.PersistentKeepAlive) {
        const keepalive = parseInt(formData.PersistentKeepAlive, 10);
        if (isNaN(keepalive) || keepalive < 0 || keepalive > 65535) {
            errors.push('Invalid PersistentKeepAlive value (must be 0-65535)');
        }
    }

    return {
        valid: errors.length === 0,
        errors
    };
}

module.exports = {
    validateWireguardConfig,
    validateFormData
};
