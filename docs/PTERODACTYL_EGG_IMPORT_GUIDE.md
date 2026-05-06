# Pterodactyl Manual Egg Import Guide (CLI)

Dokumentasyon ito para sa pag-import ng Pterodactyl Eggs gamit ang Command Line Interface (CLI) kung hindi magamit ang Panel UI.

## Overview
Ang pag-import ng Egg JSON sa Pterodactyl ay nangangailangan ng pag-update sa maraming database tables (`eggs`, `egg_variables`). Ang pinakaligtas na paraan ay ang paggamit ng Laravel models ng Panel mismo.

## Step-by-Step Process

### 1. I-download ang Egg JSON
I-download ang official JSON file mula sa GitHub o source nito sa `/tmp` folder ng VPS.
```bash
wget -O /tmp/egg_file.json https://raw.githubusercontent.com/.../egg.json
```

### 2. Gamitin ang Import Script
Gumawa ng PHP script (halimbawa: `import_egg.php`) sa `/tmp` na gagamit sa Pterodactyl logic.

```php
<?php
// /tmp/import_egg.php
require '/var/www/pterodactyl/vendor/autoload.php';
$app = require_once '/var/www/pterodactyl/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Pterodactyl\Models\Egg;
use Pterodactyl\Models\EggVariable;
use Ramsey\Uuid\Uuid;

// Config
$jsonPath = '/tmp/egg_file.json'; // Palitan ito
$nestId = 1; // ID ng Nest (1 para sa Minecraft)

$content = file_get_contents($jsonPath);
$data = json_decode($content, true);

// Check kung existing na
if (Egg::where('name', $data['name'])->where('nest_id', $nestId)->exists()) {
    echo "Error: Egg with this name already exists in Nest $nestId.\n";
    exit(1);
}

// Create Egg
$egg = new Egg();
$egg->forceFill([
    'uuid' => Uuid::uuid4()->toString(),
    'nest_id' => $nestId,
    'author' => $data['author'],
    'name' => $data['name'],
    'description' => $data['description'],
    'features' => $data['features'],
    'docker_images' => $data['docker_images'],
    'file_denylist' => $data['file_denylist'],
    'update_url' => $data['meta']['update_url'] ?? null,
    'config_files' => $data['config']['files'],
    'config_startup' => $data['config']['startup'],
    'config_logs' => $data['config']['logs'],
    'config_stop' => $data['config']['stop'],
    'startup' => $data['startup'],
    'script_container' => $data['scripts']['installation']['container'],
    'script_entry' => $data['scripts']['installation']['entrypoint'],
    'script_install' => $data['scripts']['installation']['script'],
    'script_is_privileged' => 1,
]);
$egg->save();

// Create Variables
foreach ($data['variables'] as $var) {
    $v = new EggVariable();
    $v->forceFill([
        'egg_id' => $egg->id,
        'name' => $var['name'],
        'description' => $var['description'],
        'env_variable' => $var['env_variable'],
        'default_value' => $var['default_value'],
        'user_viewable' => $var['user_viewable'] ? 1 : 0,
        'user_editable' => $var['user_editable'] ? 1 : 0,
        'rules' => $var['rules'],
    ]);
    $v->save();
}

echo "Success! Imported Egg ID: " . $egg->id . "\n";
```

### 3. Patakbuhin ang Script
Gamitin ang `php` command para i-execute ang script.
```bash
php /tmp/import_egg.php
```

## Tips para sa Manual Download sa Container
Kung gusto mong payagan ang manual upload ng server files (halimbawa: `.phar` o `.jar`) nang hindi ito in-o-overwrite ng egg installation script:

1. Sa `script_install` section ng JSON, magdagdag ng check sa simula ng download function:
```bash
if [[ -f filename.phar ]]; then
    echo "File exists, skipping download."
    return
fi
```

## Database Reference
*   **Table `eggs`**: Dito nakasave ang main config ng server (startup, docker image).
*   **Table `egg_variables`**: Dito nakasave ang mga settings na nakikita ng user (VERSION, MEMORY, etc).
*   **Table `nests`**: Ang category kung saan kabilang ang egg.

---
*Created on 2026-05-05 for PhCrafter VPS Management.*

