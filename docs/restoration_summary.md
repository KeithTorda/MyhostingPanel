# Restoration & Security Summary (2026-05-04)

## 1. Infrastructure Restoration
- **Hostinger Firewall**: Identified that the server was completely blocked. Reset the firewall on the Hostinger dashboard to restore access to ports 22, 80, 443, and 8443.
- **Nginx Proxy Fix (VPS 1)**: Resolved a `502 Bad Gateway` error caused by a misconfigured `admin.conf` proxying to an inactive port 3000.
- **Wings Service (VPS 1)**: Restarted the Wings service to fix the hanging "red banner" connection issue.

## 2. Security Hardening (Both VPS)
- **Fail2Ban**: Installed and activated on VPS 1 and VPS 2. Automatically blocks IPs that attempt to brute-force or attack the server.
- **SSH Security**:
  - Configured SSH Key-based authentication for both servers.
  - **DISABLED** SSH password authentication. Only your local key (`phcrafter_vps2_ed25519`) can now access the servers.
  - This prevents 99% of automated hacking attempts on your VPS.

## 3. Cloudflare Integration
- **Proxy Status**: Pointed `panel.phcrafter.online` and `billing.phcrafter.online` to VPS 1 via Cloudflare Proxy.
- **SSL Settings**: Configured to **Full (Strict)** mode to ensure secure communication between Cloudflare and the origin server.
- **Node Protection**: Advised setting up `play.phcrafter.online` for VPS 2 to hide its direct IP.

## 4. VPS 2 Node Optimization
- **Port Change**: Moved Wings port on VPS 2 from `8080` to `8443`.
- **Reason**: Cloudflare Proxy does not support HTTPS on port 8080. Using 8443 allows you to keep the node protected by Cloudflare without breaking the console.
- **Action Needed**: FQDN in Pterodactyl Admin Panel for VPS 2 should be updated to `play.phcrafter.online` with "Use SSL" and "Behind Proxy" enabled.

## 5. Current Folder State
- Cleaned up local `VPS` folder.
- Kept only `.md` documentation files for clarity.

