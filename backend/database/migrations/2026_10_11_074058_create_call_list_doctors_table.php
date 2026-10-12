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
        Schema::create('call_list_doctors', function (Blueprint $table) {
            $table->id();
            $table->foreignId('call_list_id')->constrained('call_lists')->cascadeOnDelete();
            $table->foreignId('doctor_id')->constrained('master_customers')->cascadeOnDelete();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('call_list_doctors');
    }
};
