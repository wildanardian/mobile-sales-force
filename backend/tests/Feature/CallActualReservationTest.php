<?php

namespace Tests\Feature;

use App\Enums\CallListStatus;
use App\Enums\CallPlanStatus;
use App\Enums\Role;
use App\Models\CallList;
use App\Models\CallPlan;
use App\Models\MasterCustomer;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Plan aktif yang belum diaktualisasi memesan slot dokter + tanggal:
 * kunjungan tanpa plan ke dokter itu pada tanggal itu harus ditolak.
 */
class CallActualReservationTest extends TestCase
{
    use RefreshDatabase;

    private User $userA;
    private User $userB;
    private CallList $callListA;
    private Product $product;

    protected function setUp(): void
    {
        parent::setUp();

        // UserFactory bawaan tidak cocok dengan tabel users proyek ini, jadi user dibuat langsung
        $this->userA = $this->makeUser('a@example.test');
        $this->userB = $this->makeUser('b@example.test');

        $this->callListA = CallList::create([
            'user_id' => $this->userA->id,
            'period'  => today()->startOfMonth()->toDateString(),
            'status'  => CallListStatus::APPROVED->value,
        ]);

        $this->product = Product::create(['name' => 'Produk Uji', 'category' => 'Uji']);
    }

    public function test_plan_milik_user_lain_memesan_slot_lalu_diaktualisasi_pemiliknya(): void
    {
        $doctorX = $this->makeDoctor('X');
        $plan = $this->makePlan($doctorX);

        // 1. User B tanpa plan_id ke dokter X hari ini -> ditolak, tanpa membocorkan pemilik plan
        $this->postVisit($this->userB, $doctorX)
            ->assertStatus(409)
            ->assertJsonPath('message', 'Dokter ini sudah terjadwal pada tanggal tersebut melalui Call Plan lain.');
        $this->assertDatabaseCount('call_actuals', 0);

        // 2. User A lewat plan-nya -> tersimpan sebagai planned
        $this->postVisit($this->userA, $doctorX, $plan->id)
            ->assertStatus(201)
            ->assertJsonPath('data.visit_type', 'planned');

        // 3. User B tanpa plan_id ke dokter X lagi -> double visit
        $this->postVisit($this->userB, $doctorX)
            ->assertStatus(409)
            ->assertJsonPath('message', 'Dokter ini sudah dikunjungi pada tanggal tersebut.');
        $this->assertDatabaseCount('call_actuals', 1);
    }

    public function test_dokter_tanpa_plan_tetap_bisa_dikunjungi_tanpa_plan(): void
    {
        $this->makePlan($this->makeDoctor('X'));
        $doctorY = $this->makeDoctor('Y');

        // 4. Dokter Y tidak punya plan pada tanggal itu
        $response = $this->postVisit($this->userB, $doctorY)->assertStatus(201);

        $this->assertContains($response->json('data.visit_type'), ['unplan', 'non_target']);
    }

    public function test_plan_cancelled_tidak_memesan_slot(): void
    {
        $doctorZ = $this->makeDoctor('Z');
        $this->makePlan($doctorZ, CallPlanStatus::CANCELLED);

        // 5. Plan cancelled tidak memblokir
        $this->postVisit($this->userB, $doctorZ)->assertStatus(201);
    }

    public function test_pemilik_plan_diarahkan_memakai_mode_sesuai_call_plan(): void
    {
        $doctorX = $this->makeDoctor('X');
        $this->makePlan($doctorX);

        // 6. User A tanpa plan_id ke dokter yang punya plan miliknya sendiri
        $this->postVisit($this->userA, $doctorX)
            ->assertStatus(409)
            ->assertJsonPath(
                'message',
                'Dokter ini sudah punya Call Plan pada tanggal tersebut. Gunakan mode "Sesuai Call Plan".'
            );
        $this->assertDatabaseCount('call_actuals', 0);
    }

    private function makeUser(string $email): User
    {
        return User::create([
            'name'     => $email,
            'email'    => $email,
            'password' => 'password',
            'role'     => Role::MR->value,
        ]);
    }

    private function makeDoctor(string $code): MasterCustomer
    {
        return MasterCustomer::create([
            'name'           => "dr. Uji {$code}",
            'specialization' => 'Umum',
            'address'        => 'Jl. Uji',
            'phone'          => '0800-0000-0000',
        ]);
    }

    private function makePlan(MasterCustomer $doctor, CallPlanStatus $status = CallPlanStatus::PLANNED): CallPlan
    {
        return CallPlan::create([
            'call_list_id' => $this->callListA->id,
            'user_id'      => $this->userA->id,
            'doctor_id'    => $doctor->id,
            'plan_date'    => today()->toDateString(),
            'plan_time'    => '08:00',
            'status'       => $status->value,
        ]);
    }

    private function postVisit(User $user, MasterCustomer $doctor, ?int $planId = null)
    {
        // Jam paling awal hari ini, agar tidak melanggar aturan "tidak melewati jam sekarang"
        return $this->actingAs($user, 'api')->postJson('/api/call-actuals', [
            'plan_id'       => $planId,
            'doctor_id'     => $doctor->id,
            'visit_date'    => today()->toDateString(),
            'check_in'      => '00:00:00',
            'check_out'     => '00:00:01',
            'photo_url'     => 'https://example.com/foto.jpg',
            'signature_url' => 'https://example.com/signature.jpg',
            'products'      => [$this->product->id],
        ]);
    }
}
