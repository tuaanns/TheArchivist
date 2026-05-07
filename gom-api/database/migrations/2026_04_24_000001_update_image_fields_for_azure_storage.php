<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * This migration updates image field types to support full Azure Blob Storage URLs
     */
    public function up(): void
    {
        // Update predictions table - change image to text to support long URLs
        Schema::table('predictions', function (Blueprint $table) {
            $table->text('image')->change();
        });
        
        // Update users table - change avatar to text to support long URLs
        Schema::table('users', function (Blueprint $table) {
            $table->text('avatar')->nullable()->change();
        });
        
        // Update ceramic_lines table - change image_url to text to support long URLs
        Schema::table('ceramic_lines', function (Blueprint $table) {
            $table->text('image_url')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revert back to string type
        Schema::table('predictions', function (Blueprint $table) {
            $table->string('image')->change();
        });
        
        Schema::table('users', function (Blueprint $table) {
            $table->string('avatar')->nullable()->change();
        });
        
        Schema::table('ceramic_lines', function (Blueprint $table) {
            $table->string('image_url')->nullable()->change();
        });
    }
};
