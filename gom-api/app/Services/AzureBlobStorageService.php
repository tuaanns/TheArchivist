<?php

namespace App\Services;

use App\Utils\FileUtils;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Contracts\Filesystem\Filesystem;
use Exception;
use InvalidArgumentException;

class AzureBlobStorageService
{
    protected Filesystem $disk;
    protected string $defaultFolderName;

    public function __construct()
    {
        $this->disk = Storage::disk('azure');
        $this->defaultFolderName = config('filesystems.disks.azure.container', 'default');
    }

    public function uploadSingleFile(UploadedFile $file, ?string $folderName = null): string
    {
        FileUtils::validateFile($file);

        $resolvedFolderName = $this->resolveFolderName($folderName);
        $normalizedFileName = FileUtils::normalizeFileName($file->getClientOriginalName());

        $path = $resolvedFolderName . '/' . $normalizedFileName;

        try {
            $success = $this->disk->put($path, file_get_contents($file->getRealPath()), 'public');
            if (!$success) {
                throw new Exception("Tải lên Azure Blob thất bại.");
            }
            $baseUrl = rtrim(config('filesystems.disks.azure.url'), '/');
            if (empty($baseUrl)) {
                $baseUrl = "https://" . config('filesystems.disks.azure.name') . ".blob.core.windows.net/" . config('filesystems.disks.azure.container');
            }
            return $baseUrl . '/' . ltrim($path, '/');
        } catch (Exception $e) {
            throw new Exception("Tải tệp lên Azure Blob thất bại: " . $e->getMessage());
        }
    }

    public function uploadMultipleFiles(array $files, ?string $folderName = null): array
    {
        $urls = [];
        foreach ($files as $file) {
            if ($file instanceof UploadedFile) {
                $urls[] = $this->uploadSingleFile($file, $folderName);
            }
        }
        return $urls;
    }

    public function deleteSingleFile(string $filePath): void
    {
        FileUtils::validateFilePath($filePath);

        if (!$this->disk->exists($filePath)) {
            throw new Exception("File không tồn tại trên hệ thống.");
        }

        $this->disk->delete($filePath);
    }

    public function deleteMultipleFiles(array $filePaths): void
    {
        foreach ($filePaths as $filePath) {
            $this->deleteSingleFile($filePath);
        }
    }

    public function moveSingleFile(string $sourceKey, string $destinationFolder): void
    {
        FileUtils::validateFilePath($sourceKey);

        if (!$this->disk->exists($sourceKey)) {
            throw new Exception("File nguồn không tồn tại: " . $sourceKey);
        }

        $fileName = basename($sourceKey);
        $destinationKey = rtrim($destinationFolder, '/') . '/' . $fileName;

        $this->disk->move($sourceKey, $destinationKey);
    }

    public function moveMultipleFiles(array $sourceKeys, string $destinationFolder): void
    {
        foreach ($sourceKeys as $sourceKey) {
            $this->moveSingleFile($sourceKey, $destinationFolder);
        }
    }

    public function extractFilePathFromBlobUrl(string $blobUrl): ?string
    {
        $urlParts = parse_url($blobUrl);
        if (isset($urlParts['path'])) {
            $path = ltrim($urlParts['path'], '/');
            // Remove container name from path if needed depending on url structure
            $container = config('filesystems.disks.azure.container');
            if (strpos($path, $container . '/') === 0) {
                $path = substr($path, strlen($container) + 1);
            }
            return $path;
        }
        return null;
    }

    private function resolveFolderName(?string $folderName): string
    {
        if (!empty(trim($folderName))) {
            return trim($folderName);
        }
        return $this->defaultFolderName;
    }
}
