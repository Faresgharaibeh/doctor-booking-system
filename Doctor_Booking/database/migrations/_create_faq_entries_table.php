<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('faq_entries', function (Blueprint $table) {
            $table->id();
            $table->string('question');
            $table->text('answer');
            $table->string('tags')->nullable();      // booking,status,slots...
            $table->string('scope')->default('general'); // general|patient|doctor|admin
            $table->boolean('is_active')->default(true);
            $table->unsignedInteger('priority')->default(0);
            $table->timestamps();

            $table->index(['is_active', 'scope']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('faq_entries');
    }
};