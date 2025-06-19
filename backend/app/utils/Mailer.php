<?php
namespace App\Mail;

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;
use Dotenv\Dotenv;

require_once __DIR__ . '/../vendor/autoload.php';

class Mailer {
    public static function sendConfirmation(string $to, string $token): void {
        // Charge .env
        $dotenv = Dotenv::createImmutable(__DIR__ . '/../');
        $dotenv->load();
        file_put_contents(__DIR__ . '/../../mail_debug.log', "MAIL_HOST = {$_ENV['MAIL_HOST']}\n", FILE_APPEND);



        $mail = new PHPMailer(true);

        try {
            $mail->isSMTP();
            $mail->Host       = $_ENV['MAIL_HOST'];
            $mail->SMTPAuth   = true;
            $mail->Username   = $_ENV['MAIL_USERNAME'];
            $mail->Password   = $_ENV['MAIL_PASSWORD'];
            $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
            $mail->Port       = $_ENV['MAIL_PORT'];

            $mail->setFrom($_ENV['MAIL_FROM'], $_ENV['MAIL_FROM_NAME']);
            $mail->addAddress($to);

            $url = "http://localhost/confirm.php?token=$token";
            $mail->Subject = 'Confirmation de votre inscription';
            $mail->Body    = "Cliquez ici pour confirmer votre compte : $url";

            $mail->send();
        } catch (Exception $e) {
            throw new Exception("Erreur d’envoi : {$mail->ErrorInfo}");
        }
    }
}
public static function sendGroupInvitation(string $to, string $groupName): void {
    $mail = new PHPMailer(true);
    // ... configuration SMTP comme existant ...
    $mail->Subject = "Invitation au groupe $groupName";
    $mail->Body    = "Vous avez été invité à rejoindre le groupe '$groupName'. Connectez-vous pour accepter.";
    $mail->send();
}

public static function sendRegistrationInvite(string $to): void {
    $mail = new PHPMailer(true);
    // ... configuration SMTP comme existant ...
    $mail->Subject = "Invitation à rejoindre Blouge";
    $mail->Body    = "Vous avez été invité à rejoindre Blouge. Inscrivez-vous ici : http://localhost/register.php";
    $mail->send();
}
public static function sendInvitation(string $to, string $group): void {
    // Logique invitation
}

public static function sendSignup(string $to): void {
    // Logique inscription
}
