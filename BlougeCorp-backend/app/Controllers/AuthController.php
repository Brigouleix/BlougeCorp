<?php
namespace App\Controllers;


use App\Core\Auth;
use App\Core\Controller;
use App\Models\User;
use Firebase\JWT\JWT;

class AuthController extends Controller
{
    private User $userModel;

    public function __construct()
    {
        $this->userModel = new User();
    }

    /* -----------  REGISTER  ----------- */
    public function register()
    {
        $data = json_decode(file_get_contents('php://input'), true);
        $email    = $data['email']    ?? '';
        $password = $data['password'] ?? '';
        $username = $data['username'] ?? '';

        if (!$email || !$password || !$username) {
            return $this->json(['error' => 'Champs manquants.'], 400);
        }

        if ($this->userModel->findByEmail($email)) {
            return $this->json(['error' => 'Email déjà utilisé.'], 409);
        }

        $hashed = password_hash($password, PASSWORD_DEFAULT);
        $token  = bin2hex(random_bytes(32));

        $this->userModel->create($email, $hashed, $username, $token);

        // TODO : envoyer email de confirmation
        return $this->json(['message' => 'Compte créé. Vérifiez vos e‑mails pour confirmer votre compte.']);
    }

    /* -----------  LOGIN  ----------- */
    public function login()
    {
        $data = json_decode(file_get_contents('php://input'), true);
        $email    = $data['email']    ?? '';
        $password = $data['password'] ?? '';

        if (!$email || !$password) {
            return $this->json(['error' => 'Email et mot de passe requis.'], 400);
        }

        $user = $this->userModel->checkCredentials($email, $password);
        if (!$user) {
            return $this->json(['error' => 'Identifiants incorrects.'], 401);
        }
        if (!$user['est_confirme']) {
            return $this->json(['error' => 'Compte non confirmé.'], 403);
        }

        $jwt = Auth::generateToken($user['id'], $user['email']);
        return $this->json(['token' => $jwt, 'user' => $user]);
    }

    /* -----------  CONFIRM  ----------- */
    public function confirm(string $token)
    {
        $user = $this->userModel->confirmAccount($token);
        if ($user) {
            return $this->json(['message' => 'Compte confirmé avec succès.']);
        }
        return $this->json(['error' => 'Lien invalide ou expiré.'], 400);
    }
}
