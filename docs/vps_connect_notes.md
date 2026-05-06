# VPS Connection Notes

## SSH Connection Method
Password login has been **DISABLED** for security. You must use the SSH private key stored on your computer.

### Connecting to VPS 1 (Panel)
Run this in your PowerShell:
```powershell
ssh -i C:\Users\admin\.ssh\phcrafter_vps2_ed25519 root@187.77.156.161
```

### Connecting to VPS 2 (Node)
Run this in your PowerShell:
```powershell
ssh -i C:\Users\admin\.ssh\phcrafter_vps2_ed25519 root@187.127.109.117
```

---

## Important Technical Notes

### 1. Why Password Login was Disabled
To prevent "Brute Force" attacks. Bots constantly try to guess server passwords. By using a Key, 100% of these automated hacking attempts are blocked instantly.

### 2. Port 8443 (The Console Port)
Both VPS nodes are now configured to use **Port 8443** for the Wings Daemon (Console connection).
- **Reason**: Port 8443 is a Cloudflare-supported HTTPS port. This allows us to hide the Node IP behind Cloudflare Proxy without breaking the panel console.
- **Firewall**: Port 8443 must remain **OPEN** in both Hostinger (Dashboard) and UFW (internal) firewalls.

### 3. Cloudflare SSL Mode
Must be set to **Full (Strict)** in the Cloudflare Dashboard. If set to "Flexible", the panel will encounter a "Too many redirects" error.

### 4. Backup your Key
The file `C:\Users\admin\.ssh\phcrafter_vps2_ed25519` is your only way into the server. Keep it safe and do not share it.

