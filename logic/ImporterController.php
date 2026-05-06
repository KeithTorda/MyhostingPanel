<?php

namespace Pterodactyl\Http\Controllers\Api\Client\Servers;

use Pterodactyl\Models\Server;
use Illuminate\Http\Request;
use Pterodactyl\Http\Controllers\Api\Client\ClientApiController;
use Illuminate\Support\Facades\Http;

class ImporterController extends ClientApiController
{
    public function import(Request $request, Server $server)
    {
        $this->validate($request, [
            'host' => 'required|string',
            'port' => 'required|numeric',
            'username' => 'required|string',
            'password' => 'required|string',
        ]);

        $uuid = $server->uuid;
        $volumePath = '/var/lib/pterodactyl/volumes/' . $uuid;

        if (!is_dir($volumePath)) {
            return response()->json(['error' => 'Server volume not found on this node.'], 404);
        }

        $hostInput = $request->input('host');
        $portInput = $request->input('port');
        
        $isSftp = str_contains($hostInput, 'sftp://');
        
        $host = escapeshellarg($hostInput);
        $port = escapeshellarg($portInput);
        $user = escapeshellarg($request->input('username'));
        $pass = escapeshellarg($request->input('password'));

        $scriptDir = storage_path('importer');
        if (!is_dir($scriptDir)) {
            mkdir($scriptDir, 0755, true);
            exec("chown www-data:www-data " . escapeshellarg($scriptDir));
        }

        $script = $scriptDir . "/import_{$uuid}.sh";
        $cmd = "#!/bin/bash\n";
        $cmd .= "export LFTP_PASSWORD={$pass}\n";
        
        if ($isSftp) {
            $cmd .= "lftp -u {$user},\$LFTP_PASSWORD {$host} -e 'set sftp:auto-confirm yes; set sftp:connect-program \"ssh -a -x -o StrictHostKeyChecking=no\"; mirror -v -c -e / {$volumePath}; quit'\n";
        } else {
            $cmd .= "lftp -u {$user},\$LFTP_PASSWORD -p {$port} {$host} -e 'set ftp:ssl-allow no; set ssl:verify-certificate no; mirror -v -c -e / {$volumePath}; quit'\n";
        }
        $cmd .= "chown -R pterodactyl:pterodactyl {$volumePath}\n";

        file_put_contents($script, $cmd);
        chmod($script, 0755);

        exec("nohup sudo {$script} > /tmp/import_{$uuid}.log 2>&1 &");

        return response()->json(['success' => true, 'message' => 'Migration started in the background.']);
    }

    public function status(Request $request, Server $server)
    {
        $uuid = $server->uuid;
        $logFile = "/tmp/import_{$uuid}.log";

        if (!file_exists($logFile)) {
            return response()->json(['status' => 'idle']);
        }

        $pid = exec("pgrep -f \"import_{$uuid}.sh\"");
        $isRunning = !empty($pid);
        $lastLine = exec("tail -n 1 " . escapeshellarg($logFile));
        
        return response()->json([
            'status' => $isRunning ? 'running' : 'completed',
            'log' => $lastLine ?: 'Waiting for start...',
            'is_running' => $isRunning,
        ]);
    }

    public function installVersion(Request $request, Server $server)
    {
        $this->validate($request, [
            'type' => 'required|string',
            'version' => 'required|string',
        ]);

        $type = strtolower($request->input('type'));
        $version = $request->input('version');
        $uuid = $server->uuid;
        $volumePath = '/var/lib/pterodactyl/volumes/' . $uuid;
        $nodeIp = $server->node->ip;

        $url = "";
        $isZip = false;
        $destFile = "server.jar";

        if ($type === 'paper') {
            $url = "https://api.papermc.io/v2/projects/paper/versions/{$version}/builds/latest/downloads/paper-{$version}-latest.jar";
        } elseif ($type === 'purpur') {
            $url = "https://api.purpurmc.org/v2/purpur/{$version}/latest/download";
        } elseif ($type === 'bedrock') {
            $url = "https://minecraft.azureedge.net/bin-linux/bedrock-server-{$version}.zip";
            $isZip = true;
        } elseif ($type === 'vanilla') {
            $url = "https://piston-data.mojang.com/v1/objects/latest/server.jar";
        } elseif ($type === 'pocketmine') {
            $url = "https://github.com/pmmp/PocketMine-MP/releases/download/{$version}/PocketMine-MP.phar";
            $destFile = "PocketMine-MP.phar";
        }

        if (empty($url)) {
            return response()->json(['error' => 'Automated download for this software is coming soon.'], 400);
        }

        $scriptDir = storage_path('importer');
        if (!is_dir($scriptDir)) {
            mkdir($scriptDir, 0755, true);
        }

        $script = $scriptDir . "/install_{$uuid}.sh";
        $cmd = "#!/bin/bash\n";
        
        $isLocal = ($nodeIp === '127.0.0.1' || $nodeIp === '187.77.156.161');
        
        $remoteCmd = "";
        if ($isZip) {
            $dest = $volumePath . "/bedrock_server.zip";
            $remoteCmd .= "wget -O " . escapeshellarg($dest) . " " . escapeshellarg($url) . " && ";
            $remoteCmd .= "unzip -o " . escapeshellarg($dest) . " -d " . escapeshellarg($volumePath) . " && ";
            $remoteCmd .= "rm " . escapeshellarg($dest);
        } else {
            $dest = $volumePath . "/" . $destFile;
            $remoteCmd .= "wget -O " . escapeshellarg($dest) . " " . escapeshellarg($url);
        }
        $remoteCmd .= " && chown -R pterodactyl:pterodactyl " . escapeshellarg($volumePath);

        if ($isLocal) {
            $cmd .= $remoteCmd . "\n";
        } else {
            $cmd .= "ssh -o StrictHostKeyChecking=no root@{$nodeIp} " . escapeshellarg($remoteCmd) . "\n";
        }
        
        file_put_contents($script, $cmd);
        chmod($script, 0755);
        
        exec("nohup sudo {$script} > /tmp/install_{$uuid}.log 2>&1 &");

        return response()->json(['success' => true]);
    }

    public function installPlugin(Request $request, Server $server)
    {
        $this->validate($request, [
            'author' => 'required|string',
            'slug' => 'required|string',
            'name' => 'required|string',
        ]);

        $author = $request->input('author');
        $slug = $request->input('slug');
        $name = str_replace([' ', '/', '\\'], '_', $request->input('name')) . ".jar";
        
        $uuid = $server->uuid;
        $volumePath = '/var/lib/pterodactyl/volumes/' . $uuid;
        $pluginDir = $volumePath . "/plugins";
        $nodeIp = $server->node->ip;

        $url = "https://hangar.papermc.io/api/v1/projects/{$author}/{$slug}/versions/latest/PAPER/download";
        $dest = $pluginDir . "/" . $name;
        
        $scriptDir = storage_path('importer');
        if (!is_dir($scriptDir)) {
            mkdir($scriptDir, 0755, true);
        }

        $script = $scriptDir . "/plugin_{$uuid}.sh";
        $cmd = "#!/bin/bash\n";
        
        $isLocal = ($nodeIp === '127.0.0.1' || $nodeIp === '187.77.156.161');
        
        $remoteCmd = "mkdir -p " . escapeshellarg($pluginDir) . " && ";
        $remoteCmd .= "wget -O " . escapeshellarg($dest) . " " . escapeshellarg($url) . " && ";
        $remoteCmd .= "chown -R pterodactyl:pterodactyl " . escapeshellarg($pluginDir);

        if ($isLocal) {
            $cmd .= $remoteCmd . "\n";
        } else {
            $cmd .= "ssh -o StrictHostKeyChecking=no root@{$nodeIp} " . escapeshellarg($remoteCmd) . "\n";
        }
        
        file_put_contents($script, $cmd);
        chmod($script, 0755);
        
        exec("nohup sudo {$script} > /tmp/plugin_{$uuid}.log 2>&1 &");

        return response()->json(['success' => true]);
    }

    public function getVersions(Request $request)
    {
        try {
            $paperResponse = Http::get('https://api.papermc.io/v2/projects/paper');
            $paperVersions = $paperResponse->json()['versions'] ?? [];
            
            $purpurResponse = Http::get('https://api.purpurmc.org/v2/purpur');
            $purpurVersions = $purpurResponse->json()['versions'] ?? [];

            $pmmpResponse = Http::get('https://api.github.com/repos/pmmp/PocketMine-MP/releases');
            $pmmpVersions = collect($pmmpResponse->json())->pluck('tag_name')->take(10)->toArray();
            
            return response()->json([
                'Paper' => array_reverse(array_slice($paperVersions, -15)),
                'Purpur' => array_reverse(array_slice($purpurVersions, -15)),
                'PocketMine' => $pmmpVersions,
                'Vanilla' => ['1.21', '1.20.6', '1.20.4', '1.20.1', '1.19.4', '1.18.2', '1.17.1', '1.16.5'],
                'Bedrock' => ['1.21.0.03', '1.20.81.01', '1.20.73.01', '1.20.62.01'],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'Paper' => ['1.21', '1.20.4', '1.20.1'],
                'PocketMine' => ['5.42.1', '5.41.0'],
                'Purpur' => ['1.21', '1.20.4', '1.20.1'],
                'Vanilla' => ['1.21'],
                'Bedrock' => ['1.21.0.03'],
            ]);
        }
    }
}


