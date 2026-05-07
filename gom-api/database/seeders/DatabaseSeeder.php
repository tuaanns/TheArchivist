<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     *
     * Default: only UserSeeder runs (admin + demo accounts).
     *
     * Other seeders are intentionally kept as files but NOT invoked here so
     * that `php artisan migrate:fresh --seed` is fast and side-effect free.
     * Run them manually when needed:
     *
     *   php artisan db:seed --class=CeramicLineSeeder
     *   php artisan db:seed --class=PredictionSeeder   # calls the real AI service
     *   php artisan db:seed --class=PaymentSeeder
     */
    public function run(): void
    {
        $this->call([UserSeeder::class]);
    }
}
