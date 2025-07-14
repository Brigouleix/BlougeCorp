<?php
namespace App\Controllers;

use App\Core\Controller;
use App\Core\Auth;
use App\Models\User;

/**
 * Gère l’inscription, la connexion et la confirmation d’un compte.
 */
class AuthController extends Controller
{
    private User $userModel;

    public function __construct()
    {
        $this->userModel = new User();
    }

    /* ─────────────────────────── REGISTER ─────────────────────────── */

    public function register(): void
    {
        $data = json_decode(file_get_contents('php://input'), true);
        $email    = $data['email']    ?? '';
        $password = $data['password'] ?? '';
        $username = $data['username'] ?? '';

        if (!$email || !$password || !$username) {
            $this->json(['error' => 'Champs manquants.'], 400);
            return;
        }

        if ($this->userModel->findByEmail($email)) {
            $this->json(['error' => 'Email déjà utilisé.'], 409);
            return;
        }

        $hashed = password_hash($password, PASSWORD_DEFAULT);
        $token  = bin2hex(random_bytes(32));

        $this->userModel->create($email, $hashed, $username, $token);
        // TODO : envoyer le mail de confirmation
        $this->json(['message' => 'Compte créé. Vérifiez vos e‑mails.']);
    }

    /* ───────────────────────────── LOGIN ──────────────────────────── */

    public function login(): void
    {
        $data = json_decode(file_get_contents('php://input'), true);
        $email    = $data['email']    ?? '';
        $password = $data['password'] ?? '';

        if (!$email || !$password) {
            $this->json(['error' => 'Email et mot de passe requis.'], 400);
            return;
        }

        $user = $this->userModel->checkCredentials($email, $password);
        if (!$user) {
            $this->json(['error' => 'Identifiants incorrects.'], 401);
            return;
        }
        if (!$user['est_confirme']) {
            $this->json(['error' => 'Compte non confirmé.'], 403);
            return;
        }

        $jwt = Auth::generateToken($user['id'], $user['email']);
        // On enlève le hash du mot de passe avant de renvoyer l’objet
        unset($user['mot_de_passe']);

        $this->json(['user' => $user, 'token' => $jwt]);
    }

    /* ────────────────────────── CONFIRMATION ───────────────────────── */

    public function confirm(string $token): void
    {
        $user = $this->userModel->confirmAccount($token);
        if ($user) {
            $this->json(['message' => 'Compte confirmé avec succès.']);
        } else {
            $this->json(['error' => 'Lien invalide ou expiré.'], 400);
        }
    }
}
