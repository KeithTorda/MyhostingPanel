# NEW CLIENT SETUP & PORT GUIDE

This guide ensures that all new Minecraft servers (clients) are set up correctly across VPS 1 and VPS 2, and that documentation is kept updated to prevent AI errors.

---

## 1. THE PORT BIBLE (VPS 2 - 187.127.109.117)

Use these ranges for all new servers. **Do not use ports outside these ranges.**

| Type | Port Range | Protocol | Notes |
| :--- | :--- | :--- | :--- |
| **Java Edition** | `25565 - 25700` | TCP & UDP | Standard Minecraft Java |
| **Bedrock / Geyser** | `19132 - 19200` | TCP & UDP | Geyser/Bedrock Range |

### The "Dual-Layer" Rule
1. **Hostinger Panel**: You MUST open the port in the Hostinger Firewall Dashboard.
2. **UFW (Internal)**: You MUST ensure the port is allowed in UFW. (The ranges above are already pre-opened in UFW, but run `ufw reload` if connection fails).

---

## 2. PLUGIN SETUP (ANTI-HALLUCINATION)

To ensure Geyser and Floodgate work perfectly every time:

1. **Automatic Sync**: Use the "Connect Cross Server" button in the Pterodactyl Startup tab (if available for the egg).
2. **Manual Check**:
   - `bedrock.port`: Must match the assigned port (e.g., 25570).
   - `bedrock.address`: Set to `0.0.0.0`.
   - `auth-type`: Set to `floodgate`.
   - `clone-remote-port`: Set to `true` if you want Bedrock and Java to use the same port number (Recommended).

---

### 3. CROSSPLAY SYNC (Geyser/Floodgate)
Para hindi mag-error ang Bedrock connection:
*   **Geyser Config**: 
    *   `auth-type: floodgate`
    *   `clone-remote-port: true`
    *   **CRITICAL**: Sa Geyser `config.yml`, siguraduhin na ang `port` sa ilalim ng `bedrock:` ay **HINDI 0**. Itype ang actual port (e.g., `25565`).
*   **Key Sync**: Siguraduhin na ang `key.pem` sa Floodgate folder at Geyser folder ay pareho.

---

## 4. TROUBLESHOOTING (Kapag hindi makakonek)
1.  **UFW Reload**: Kahit "Allow" na ang port, minsan kailangan ng reload:
    ```bash
    ufw reload
    ```
2.  **Check Logs**: Gamitin ang `tail -f logs/latest.log` para makita kung may "Started Geyser on UDP port 0". Kung 0 ang nakasulat, palitan ito sa config.
3.  **Port Check**: 
    ```bash
    ss -tulpn | grep <PORT>
    ```

---

## 5. SERVER INVENTORY PROTOCOL
Whenever you add a new client/server, **update the `SERVER_INVENTORY.md` file.** This is the "Source of Truth" for the AI.

### Protocol:
1. Open `SERVER_INVENTORY.md`.
2. Add the new server details (Name, Port, IP, UUID).
3. If the AI "hallucinates" or guesses wrong, tell it: *"Check SERVER_INVENTORY.md for the latest data."*

---

## 6. QUICK COMMANDS
To fix common "cannot connect" issues:
```bash
# Reload firewall (Fixes most sync issues)
ufw reload

# Check if a port is actually listening
ss -tulpn | grep <PORT>

# Check if docker is mapping the port
docker ps | grep <PORT>
```

