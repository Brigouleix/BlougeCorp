<?php
namespace App\Controllers;

use App\Core\Controller;
use App\Models\User;

class AuthController extends Controller
{
    public function register() {
        $data = json_decode(file_get_contents('php://input'), true);

        $email = $data['email'] ?? '';
        $password = $data['password'] ?? '';
        $username = $data['username'] ?? '';

        if (!$email || !$password || !$username) {
            return $this->json(['error' => 'Champs manquants.'], 400);
        }

        if (User::findByEmail($email)) {
            return $this->json(['error' => 'Cet email est déjà utilisé.'], 409);
        }

        $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
        $userId = User::create($email, $hashedPassword, $username);
        $user = User::findByEmail($email);

        return $this->json(['user' => $user]);
    }

    public function login() {
        $data = json_decode(file_get_contents('php://input'), true);

        $email = $data['email'] ?? '';
        $password = $data['password'] ?? '';

        if (!$email || !$password) {
            return $this->json(['error' => 'Email et mot de passe requis.'], 400);
        }

        $user = User::findByEmailAndPassword($email, $password);
        if (!$user) {
            return $this->json(['error' => 'Identifiants incorrects.'], 401);
        }

        return $this->json(['user' => $user]);
    }
}
