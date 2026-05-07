<?php

namespace App\Http\Requests\File;

use Illuminate\Foundation\Http\FormRequest;

class SingleUploadFileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'folderName' => ['nullable', 'string', 'max:255'],
            'file' => ['required', 'file', 'max:5120'], // 5MB max
        ];
    }

    public function messages(): array
    {
        return [
            'file.required' => 'File tải lên không được để trống.',
            'file.max' => 'Dung lượng file không được vượt quá 5MB.',
        ];
    }
}
