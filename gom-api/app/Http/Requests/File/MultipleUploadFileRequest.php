<?php

namespace App\Http\Requests\File;

use Illuminate\Foundation\Http\FormRequest;

class MultipleUploadFileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'folderName' => ['nullable', 'string', 'max:255'],
            'files' => ['required', 'array', 'min:1'],
            'files.*' => ['required', 'file', 'max:5120'], // 5MB max each
        ];
    }

    public function messages(): array
    {
        return [
            'files.required' => 'Danh sách file không được để trống.',
            'files.min' => 'Phải có ít nhất 1 file.',
            'files.*.max' => 'Dung lượng mỗi file không được vượt quá 5MB.',
        ];
    }
}
