#!/bin/bash
echo '🚀 Starting PHCrafter Setup Installation...'
PANEL_PATH='/var/www/pterodactyl'
cp logic/ImporterController.php \/app/Http/Controllers/Api/Client/Servers/
cp logic/api-client.php \/routes/
cp design/ServerVersionsContainer.tsx \/resources/scripts/components/server/versions/
cp design/routes.ts \/resources/scripts/routers/
cp design/ServerRouter.tsx \/resources/scripts/routers/
chown -R www-data:www-data \
chmod -R 755 \
cd \
npm run build
echo '✅ Installation Complete! Your custom panel is ready.'
