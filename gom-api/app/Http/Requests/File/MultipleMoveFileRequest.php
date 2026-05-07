<?php

namespace App\Http\Requests\File;

use Illuminate\Foundation\Http\FormRequest;

class MultipleMoveFileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'sourceKeys' => ['required', 'array', 'min:1'],
            'sourceKeys.*' => ['required', 'string'],
            'destinationFolder' => ['required', 'string', 'max:255'],
        ];
    }

    public function messages(): array
    {
        return [
            'sourceKeys.required' => 'Danh sách đường dẫn nguồn không được để trống.',
            'sourceKeys.min' => 'Phải có ít nhất 1 file để di chuyển.',
            'destinationFolder.required' => 'Thư mục đích không được để trống.',
        ];
    }
}
