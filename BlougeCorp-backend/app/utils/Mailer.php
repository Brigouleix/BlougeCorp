<?php
namespace App\Utils;


use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;
use Dotenv\Dotenv;




class Mailer {
    private static function getMailer(): PHPMailer {
        

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
        } catch (Exception $e) {
            throw new Exception("Erreur de configuration mail : {$e->getMessage()}");
        }
        return $mail;
    }

    public static function sendConfirmation(string $to, string $token): void {
        $mail = self::getMailer();
        try {
            $mail->addAddress($to);
            $url = "http://localhost/confirm.php?token=$token";
            $mail->Subject = 'Confirmation de votre inscription';
            $mail->Body    = "Cliquez ici pour confirmer votre compte : $url";
            $mail->send();
        } catch (Exception $e) {
            throw new Exception("Erreur d’envoi confirmation : {$mail->ErrorInfo}");
        }
    }

    public static function sendInvitation(string $to, string $groupName): void {
        $mail = self::getMailer();
        try {
            $mail->addAddress($to);
            $mail->Subject = "Invitation au groupe $groupName";
            $mail->Body    = "Vous avez été invité à rejoindre le groupe '$groupName'. Connectez-vous pour accepter.";
            $mail->send();
        } catch (Exception $e) {
            throw new Exception("Erreur d’envoi invitation : {$mail->ErrorInfo}");
        }
    }

    public static function sendSignup(string $to): void {
        $mail = self::getMailer();
        try {
            $mail->addAddress($to);
            $mail->Subject = "Invitation à rejoindre Blouge";
            $mail->Body    = "Vous avez été invité à rejoindre Blouge. Inscrivez-vous ici : http://localhost/register.php";
            $mail->send();
        } catch (Exception $e) {
            throw new Exception("Erreur d’envoi inscription : {$mail->ErrorInfo}");
        }
    }
}
