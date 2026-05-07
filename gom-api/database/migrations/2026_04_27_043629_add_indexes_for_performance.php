<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->index('created_at', 'idx_users_created_at');
            $table->index('role', 'idx_users_role');
        });

        Schema::table('payments', function (Blueprint $table) {
            $table->index('status', 'idx_payments_status');
            $table->index('created_at', 'idx_payments_created_at');
            $table->index(['user_id', 'created_at'], 'idx_payments_user_created');
        });

        Schema::table('predictions', function (Blueprint $table) {
            $table->index('created_at', 'idx_predictions_created_at');
            $table->index(['user_id', 'created_at'], 'idx_predictions_user_created');
        });

        Schema::table('ceramic_lines', function (Blueprint $table) {
            $table->index('is_featured', 'idx_ceramic_lines_featured');
            $table->index('name', 'idx_ceramic_lines_name');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex('idx_users_created_at');
            $table->dropIndex('idx_users_role');
        });

        Schema::table('payments', function (Blueprint $table) {
            $table->dropIndex('idx_payments_status');
            $table->dropIndex('idx_payments_created_at');
            $table->dropIndex('idx_payments_user_created');
        });

        Schema::table('predictions', function (Blueprint $table) {
            $table->dropIndex('idx_predictions_created_at');
            $table->dropIndex('idx_predictions_user_created');
        });

        Schema::table('ceramic_lines', function (Blueprint $table) {
            $table->dropIndex('idx_ceramic_lines_featured');
            $table->dropIndex('idx_ceramic_lines_name');
        });
    }
};
