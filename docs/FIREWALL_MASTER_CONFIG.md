# FIREWALL MASTER CONFIGURATION (2026-05-05)

> [!IMPORTANT]
> DO NOT MODIFY THESE SETTINGS WITHOUT EXPLICIT PERMISSION. This configuration is required for Pterodactyl Panel, Wings, and Minecraft (Java/Bedrock) connectivity across VPS 1 and VPS 2.

## VPS 1 (PANEL NODE) - 187.77.156.161
| Port | Protocol | Purpose | Location |
| :--- | :--- | :--- | :--- |
| 22 | TCP | SSH Access | Hostinger & UFW |
| 80 | TCP | HTTP (Panel/SSL) | Hostinger & UFW |
| 443 | TCP | HTTPS (Panel/SSL) | Hostinger & UFW |
| 8443 | TCP | Wings API (Cloudflare Friendly) | Hostinger & UFW |
| 2022 | TCP | Wings SFTP | Hostinger & UFW |
| 19132 | TCP/UDP | Bedrock Default (Optional) | Hostinger & UFW |

## VPS 2 (SERVER NODE) - 187.127.109.117
| Port | Protocol | Purpose | Location |
| :--- | :--- | :--- | :--- |
| 22 | TCP | SSH Access | Hostinger & UFW |
| 8443 | TCP | Wings API (Console Sync) | Hostinger & UFW |
| 2022 | TCP | Wings SFTP (File Manager) | Hostinger & UFW |
| **25565-25700** | **TCP/UDP** | **Minecraft Java Range** | **Hostinger & UFW** |
| **19132-19200** | **TCP/UDP** | **Minecraft Bedrock/Geyser Range** | **Hostinger & UFW** |

---

## CRITICAL NOTES FOR FUTURE AI ASSISTANTS:
1. **The Dual-Layer Rule**: Rules must exist in BOTH the Hostinger Dashboard Firewall and the internal UFW. If only one is updated, the connection WILL FAIL.
2. **Bedrock TCP Requirement**: While Bedrock primarily uses UDP, many servers on this node use **Geyser** or **Java** mapped to the 19132+ range. Therefore, **TCP MUST be allowed** for the 19132-19200 range.
3. **SFTP Consistency**: Port 2022 must be open on all nodes to allow the Pterodactyl File Manager to function.
4. **Cloudflare Ports**: 8443 is used for Wings to ensure compatibility with Cloudflare Proxy (Full Strict mode).

## LAST VERIFIED:
- **Date**: 2026-05-05
- **Status**: ALL PORTS SYNCED AND REACHABLE.
- **Tools Used**: UFW, ss, docker logs, Hostinger Firewall Dashboard.

