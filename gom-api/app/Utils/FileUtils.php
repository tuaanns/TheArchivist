<?php

namespace App\Utils;

use Illuminate\Http\UploadedFile;
use InvalidArgumentException;
use Illuminate\Support\Str;

class FileUtils
{
    private const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

    public static function validateFile(UploadedFile $file): void
    {
        if (!$file->isValid()) {
            throw new InvalidArgumentException("File upload không hợp lệ.");
        }
        self::validateFileSize($file->getSize());
    }

    public static function validateFileSize(int $size): void
    {
        if ($size > self::MAX_FILE_SIZE) {
            throw new InvalidArgumentException("Dung lượng file vượt quá giới hạn " . (self::MAX_FILE_SIZE / 1024 / 1024) . "MB.");
        }
    }

    public static function normalizeFileName(string $fileName): string
    {
        $extension = pathinfo($fileName, PATHINFO_EXTENSION);
        $name = pathinfo($fileName, PATHINFO_FILENAME);

        // Remove special characters, Vietnamese accents and spaces
        $name = Str::slug($name);

        // Return with extension if exists
        return $extension ? $name . '.' . strtolower($extension) : $name;
    }

    public static function validateFilePath(string $filePath): void
    {
        if (empty(trim($filePath))) {
            throw new InvalidArgumentException("Đường dẫn file không được để trống.");
        }
    }
}
