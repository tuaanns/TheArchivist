<?php

namespace App\Http\Requests\File;

use Illuminate\Foundation\Http\FormRequest;

class SingleMoveFileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'sourceKey' => ['required', 'string'],
            'destinationFolder' => ['required', 'string', 'max:255'],
        ];
    }

    public function messages(): array
    {
        return [
            'sourceKey.required' => 'Đường dẫn file nguồn không được để trống.',
            'destinationFolder.required' => 'Thư mục đích không được để trống.',
        ];
    }
}
