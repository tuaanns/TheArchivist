<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\File\MultipleDeleteFileRequest;
use App\Http\Requests\File\MultipleMoveFileRequest;
use App\Http\Requests\File\MultipleUploadFileRequest;
use App\Http\Requests\File\SingleMoveFileRequest;
use App\Http\Requests\File\SingleUploadFileRequest;
use App\Services\AzureBlobStorageService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Exception;

class AzureBlobStorageController extends Controller
{
    protected AzureBlobStorageService $azureBlobStorageService;

    public function __construct(AzureBlobStorageService $azureBlobStorageService)
    {
        $this->azureBlobStorageService = $azureBlobStorageService;
    }

    private function buildMetaInfo(Request $request): array
    {
        return [
            'timestamp' => now()->toIso8601String(),
            'path' => $request->path()
        ];
    }

    public function uploadSingleFile(SingleUploadFileRequest $request): JsonResponse
    {
        try {
            $folderName = $request->input('folderName');
            $file = $request->file('file');

            $fileUrl = $this->azureBlobStorageService->uploadSingleFile($file, $folderName);

            $responseDto = [
                'originalFileName' => $file->getClientOriginalName(),
                'fileUrl' => $fileUrl
            ];

            return response()->json([
                'message' => 'Tải lên tệp đơn thành công',
                'data' => $responseDto,
                'meta' => $this->buildMetaInfo($request)
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'message' => 'Lỗi tải lên: ' . $e->getMessage()
            ], 400);
        }
    }

    public function uploadMultipleFiles(MultipleUploadFileRequest $request): JsonResponse
    {
        try {
            $folderName = $request->input('folderName');
            $files = $request->file('files');

            $fileUrls = $this->azureBlobStorageService->uploadMultipleFiles($files, $folderName);

            $fileResponses = [];
            foreach ($files as $index => $file) {
                $fileResponses[] = [
                    'originalFileName' => $file->getClientOriginalName(),
                    'fileUrl' => $fileUrls[$index]
                ];
            }

            return response()->json([
                'message' => 'Tải lên nhiều tệp thành công',
                'data' => [
                    'files' => $fileResponses
                ],
                'meta' => $this->buildMetaInfo($request)
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'message' => 'Lỗi tải lên nhiều tệp: ' . $e->getMessage()
            ], 400);
        }
    }

    public function deleteSingleFile(Request $request): JsonResponse
    {
        try {
            $filePath = $request->input('filePath');
            if (empty($filePath)) {
                return response()->json(['message' => 'filePath là bắt buộc'], 400);
            }

            $this->azureBlobStorageService->deleteSingleFile($filePath);

            return response()->json([
                'message' => 'Xóa tệp thành công',
                'meta' => $this->buildMetaInfo($request)
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'message' => 'Lỗi xóa tệp: ' . $e->getMessage()
            ], 400);
        }
    }

    public function deleteMultipleFiles(MultipleDeleteFileRequest $request): JsonResponse
    {
        try {
            $this->azureBlobStorageService->deleteMultipleFiles($request->input('filePaths'));

            return response()->json([
                'message' => 'Xóa nhiều tệp thành công',
                'meta' => $this->buildMetaInfo($request)
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'message' => 'Lỗi xóa nhiều tệp: ' . $e->getMessage()
            ], 400);
        }
    }

    public function moveSingleFile(SingleMoveFileRequest $request): JsonResponse
    {
        try {
            $sourceKey = $request->input('sourceKey');
            $destinationFolder = $request->input('destinationFolder');

            $this->azureBlobStorageService->moveSingleFile($sourceKey, $destinationFolder);

            return response()->json([
                'message' => 'Di chuyển tệp thành công',
                'data' => "Tệp đã được di chuyển từ: $sourceKey đến thư mục: $destinationFolder",
                'meta' => $this->buildMetaInfo($request)
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'message' => 'Lỗi di chuyển tệp: ' . $e->getMessage()
            ], 400);
        }
    }

    public function moveMultipleFiles(MultipleMoveFileRequest $request): JsonResponse
    {
        try {
            $destinationFolder = $request->input('destinationFolder');
            $this->azureBlobStorageService->moveMultipleFiles(
                $request->input('sourceKeys'),
                $destinationFolder
            );

            return response()->json([
                'message' => 'Di chuyển nhiều tệp thành công',
                'data' => "Các tệp đã được di chuyển tới thư mục: $destinationFolder",
                'meta' => $this->buildMetaInfo($request)
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'message' => 'Lỗi di chuyển nhiều tệp: ' . $e->getMessage()
            ], 400);
        }
    }
}
