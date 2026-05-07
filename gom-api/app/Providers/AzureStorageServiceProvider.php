<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Storage;
use Illuminate\Filesystem\FilesystemAdapter;
use League\Flysystem\Filesystem;
use League\Flysystem\AzureBlobStorage\AzureBlobStorageAdapter;
use MicrosoftAzure\Storage\Blob\BlobRestProxy;

class AzureStorageServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        Storage::extend('azure', function ($app, $config) {
            $options = [
                'http' => [
                    'verify' => false // Disable SSL verification for local testing
                ]
            ];
            $client = BlobRestProxy::createBlobService($config['connection_string'] ?? sprintf(
                'DefaultEndpointsProtocol=https;AccountName=%s;AccountKey=%s;EndpointSuffix=core.windows.net',
                $config['name'],
                $config['key']
            ), $options);

            $adapter = new AzureBlobStorageAdapter(
                $client,
                $config['container'],
                $config['prefix'] ?? ''
            );

            return new FilesystemAdapter(
                new Filesystem($adapter, $config),
                $adapter,
                $config
            );
        });
    }
}
