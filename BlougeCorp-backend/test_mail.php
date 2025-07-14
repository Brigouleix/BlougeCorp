<?php
namespace App\Mail;

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;
use Dotenv\Dotenv;

require_once __DIR__ . '/../../vendor/autoload.php';

class Mailer {
    public static function sendConfirmation(string $to, string $token): void {
        // Charge .env
        $dotenv = Dotenv::createImmutable(__DIR__ . '/../../');
        $dotenv->safeLoad();

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
