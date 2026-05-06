# Pterodactyl Crossplay Sync - Maintenance & Update Guide

This document serves as a reference for maintaining and updating the custom Crossplay (Geyser/Floodgate) synchronization feature and Plugin Importer system implemented on this panel.

---

## 1. System Components

The crossplay sync and plugin importer features consist of the following files:

### Backend (PHP/Laravel)
- **Service**: `/var/www/pterodactyl/app/Services/Servers/CrossplaySyncService.php`
  - Handles the logic for generating the `config.yml`.
- **Controller**: `/var/www/pterodactyl/app/Http/Controllers/Api/Client/Servers/CrossplayController.php`
  - Receives the API request from the frontend.
- **Plugin Importer Controller**: `/var/www/pterodactyl/app/Http/Controllers/Api/Client/Servers/ImporterController.php`
  - Handles plugin installation logic from Hangar.
- **Routes**: `/var/www/pterodactyl/routes/api-client.php`
  - Defines the sync and install endpoints.

### Frontend (React/TypeScript)
- **Crossplay Helper**: `/var/www/pterodactyl/resources/scripts/api/server/syncCrossplay.ts`
- **Startup UI**: `/var/www/pterodactyl/resources/scripts/components/server/startup/StartupContainer.tsx`
  - Contains the "Connect Cross Server" button.
- **Plugin Importer UI**: `/var/www/pterodactyl/resources/scripts/components/server/plugins/ServerPluginsContainer.tsx`
  - React component for searching and installing plugins from Hangar with confirmation modals.

### Plugin Sources (Hangar)
- **Hangar Project**: [Hangar Papermc](https://hangar.papermc.io/)
- **Geyser (Hangar)**: [GeyserMC/Geyser](https://hangar.papermc.io/GeyserMC/Geyser)
- **Floodgate (Hangar)**: [GeyserMC/Floodgate](https://hangar.papermc.io/GeyserMC/Floodgate)

---

## 2. Common Maintenance Tasks

### A. Updating Geyser/Floodgate Versions
The Geyser and Floodgate versions are controlled via **Egg Variables** in the Admin Panel:
1. Go to **Admin Panel** > **Nests** > **Minecraft** > **Paper + Crossplay**.
2. Go to the **Variables** tab.
3. Update the **Default Value** for `GEYSER_VERSION`, `GEYSER_BUILD`, etc.

### B. Plugin Importer
The Plugin Importer uses the Hangar API. If Hangar changes their API structure, you will need to update `ImporterController.php` (for the download URL) and `ServerPluginsContainer.tsx` (for the search/list mapping).

---

## 3. Applying Code Changes (Rebuild)

Whenever you modify any file in `resources/scripts/`, you **MUST** rebuild the panel assets for the changes to take effect:

```bash
cd /var/www/pterodactyl
npm run build
```

If you only modified PHP files (Backend), you only need to clear the cache:

```bash
php artisan route:clear
php artisan cache:clear
```

---

## 4. Troubleshooting

- **Button doesn't appear**: Check if the `egg_id` of the server matches the one in `StartupContainer.tsx`.
- **Plugin Download Failed**: Check the Hangar project name/slug. Some plugins might not have a `PAPER` platform release on Hangar.
- **500 Error**: Check the Laravel logs:
  ```bash
  tail -f /var/www/pterodactyl/storage/logs/laravel.log
  ```

---

*Guide updated on: 2026-05-04*

