<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Contact\ContactSubmitRequest;
use App\Mail\ContactMessage;
use App\Traits\ApiResponses;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class ContactController extends Controller
{
    use ApiResponses;

    public function submit(ContactSubmitRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['subject'] = $data['subject'] ?: 'Không có chủ đề';

        $targetEmail = env('MAIL_USERNAME', 'dongnguyenkh123@gmail.com');

        try {
            Mail::to($targetEmail)->send(new ContactMessage($data));
            return $this->ok(null, 'Email sent successfully');
        } catch (\Throwable $e) {
            Log::error('Mail sending failed', ['error' => $e->getMessage()]);
            return $this->serverError('Failed to send email. Please try again later.');
        }
    }
}
