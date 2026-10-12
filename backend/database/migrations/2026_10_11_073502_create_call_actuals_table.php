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
        Schema::create('call_actuals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('plan_id')->nullable()->constrained('call_plans')->restrictOnDelete();
            $table->foreignId('user_id')->constrained('users')->restrictOnDelete();
            $table->foreignId('doctor_id')->constrained('master_customers')->restrictOnDelete();
            $table->date('visit_date');
            $table->time('check_in');
            $table->time('check_out');
            $table->text('photo_url')->nullable();
            $table->text('signature_url')->nullable();
            $table->string('visit_type');
            $table->string('status');
            $table->timestamps();

            $table->unique(['doctor_id', 'visit_date']);
            $table->index(['user_id', 'visit_date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('call_actuals');
    }
};
