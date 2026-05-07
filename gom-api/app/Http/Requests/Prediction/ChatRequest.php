<?php

namespace App\Http\Requests\Prediction;

use Illuminate\Foundation\Http\FormRequest;

class ChatRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'question' => ['required', 'string', 'max:2000'],
        ];
    }
}
