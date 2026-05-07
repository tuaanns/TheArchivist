<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Pottery extends Model
{
    protected $fillable = [
        'user_id',
        'image_path',
        'predicted_label',
        'country',
        'era',
        'confidence',
        'debate_data',
    ];

    protected $casts = [
        'debate_data' => 'array',
        'confidence'  => 'float',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
