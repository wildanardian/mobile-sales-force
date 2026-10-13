<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\RefreshToken;
use App\Models\User;
use App\Support\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Cookie;

class AuthController extends Controller
{
    private const REFRESH_COOKIE = 'refresh_token';
    private const REFRESH_DAYS = 7;

    /**
     * Create a new AuthController instance.
     *
     * @return void
     */
    public function __construct()
    {
        // $this->middleware('auth:api', ['except' => ['login']]);
    }

    /**
     * Get a JWT via given credentials.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|string|min:6',
        ]);

        if (!$token = auth('api')->attempt($request->only('email', 'password'))) {
            return ApiResponse::error('Email atau password salah', 401);
        }

        $user = auth('api')->user();
        $refresh = $this->issueRefreshToken($user);

        $data = [
            'access_token' => $token,
            'token_type' => 'bearer',
            'expires_in' => auth('api')->factory()->getTTL() * 60,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
            ],
        ];

        return ApiResponse::success($data, 'Login berhasil')->withCookie($this->makeCookie($refresh));
    }

    /**
     * Get the authenticated User.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function me()
    {
        return ApiResponse::success(auth('api')->user(), 'User retrieved successfully');
    }

    /**
     * Log the user out (Invalidate the token).
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function logout(Request $request)
    {
        if ($plain = $request->cookie(self::REFRESH_COOKIE)) {
            RefreshToken::where('token_hash', hash('sha256', $plain))->delete();
        }

        try {
            auth('api')->logout(); // invalidasi access token bila masih valid
        } catch (\Throwable $e) {
            // access token sudah habis, tidak masalah
        }

        return ApiResponse::success(null, 'Logout berhasil')
            ->withCookie($this->forgetCookie());
    }

    /**
     * Refresh a token.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function refresh(Request $request)
    {
        $plain = $request->cookie(self::REFRESH_COOKIE);

        if (! $plain) {
            return ApiResponse::error('Sesi berakhir, silakan login kembali.', 401);
        }

        $record = RefreshToken::with('user')
            ->where('token_hash', hash('sha256', $plain))
            ->where('expires_at', '>', now())
            ->first();

        if (! $record || ! $record->user) {
            return ApiResponse::error('Sesi berakhir, silakan login kembali.', 401)
                ->withCookie($this->forgetCookie());
        }

        $user = $record->user;

        // Rotation: hapus yang lama, terbitkan yang baru
        $newRefresh = DB::transaction(function () use ($record, $user) {
            $record->delete();
            return $this->issueRefreshToken($user);
        });

        $token = auth('api')->login($user);

        $data = [
            'access_token' => $token,
            'token_type' => 'bearer',
            'expires_in' => auth('api')->factory()->getTTL() * 60,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
            ],
        ];

        return ApiResponse::success($data, 'Token diperbarui')->withCookie($this->makeCookie($newRefresh));
    }

    /**
     * Get the token array structure.
     *
     * @param  string $token
     *
     * @return \Illuminate\Http\JsonResponse
     */
    protected function respondWithToken($token)
    {
        return response()->json([
            'success' => true,
            'message' => 'Token retrieved successfully',
            'data' => [
                'access_token' => $token,
                'token_type' => 'bearer',
                'expires_in' => auth('api')->factory()->getTTL() * 60,
                'user' => [
                    'id' => auth('api')->user()->id,
                    'name' => auth('api')->user()->name,
                    'email' => auth('api')->user()->email,
                    'role' => auth('api')->user()->role,
                ],
            ],
        ]);
    }

    private function issueRefreshToken(User $user): string
    {
        $plain = Str::random(64);

        RefreshToken::create([
            'user_id'    => $user->id,
            'token_hash' => hash('sha256', $plain),   // yang disimpan hash-nya
            'expires_at' => now()->addDays(self::REFRESH_DAYS),
        ]);

        return $plain;
    }

    private function forgetCookie(): Cookie
    {
        return cookie()->forget(self::REFRESH_COOKIE, '/api');
    }

    private function makeCookie(string $value): Cookie
    {
        return cookie(
            self::REFRESH_COOKIE,
            $value,
            60 * 24 * self::REFRESH_DAYS,   // MENIT
            '/api',                         // path
            null,                           // domain
            app()->isProduction(),          // secure
            true,                           // httpOnly
            false,                          // raw
            'Lax'                           // sameSite
        );
    }
}
