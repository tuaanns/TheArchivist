<?php

namespace App\Http\Requests\File;

use Illuminate\Foundation\Http\FormRequest;

class MultipleDeleteFileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'filePaths' => ['required', 'array', 'min:1'],
            'filePaths.*' => ['required', 'string'],
        ];
    }

    public function messages(): array
    {
        return [
            'filePaths.required' => 'Danh sách đường dẫn không được để trống.',
            'filePaths.min' => 'Phải có ít nhất 1 file để xóa.',
        ];
    }
}
