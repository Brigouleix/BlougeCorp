<?php
namespace App\Controllers;

use App\Core\Controller;
use App\Core\Auth;
use PDO;

class CommentaireController extends Controller
{
    private $conn;

    public function __construct() {
        $this->conn = (new \Database())->getConnection();
    }

    // Retourne un message de base ou liste tous les commentaires
    public function index(): void
    {
        try {
            $destination_id = $_GET['destination_id'] ?? null;

            if ($destination_id) {
                $sql = "SELECT c.id, c.contenu, c.rating, c.date_creation, u.nom AS auteur
                        FROM commentaire c
                        JOIN users u ON c.utilisateur_id = u.id
                        WHERE c.destination_id = :destination_id
                        ORDER BY c.date_creation DESC";

                $stmt = $this->conn->prepare($sql);
                $stmt->execute([':destination_id' => $destination_id]);
                $commentaires = $stmt->fetchAll(PDO::FETCH_ASSOC);

                $this->json(['success' => true, 'commentaires' => $commentaires]);
                return;
            }

            // Sinon : tous les commentaires
            $sql = "SELECT c.id, c.contenu, c.rating, c.date_creation, u.nom AS auteur, c.destination_id
                    FROM commentaire c
                    JOIN users u ON c.utilisateur_id = u.id
                    ORDER BY c.date_creation DESC";

            $stmt = $this->conn->query($sql);
            $commentaires = $stmt->fetchAll(PDO::FETCH_ASSOC);

            $this->json(['success' => true, 'commentaires' => $commentaires]);

        } catch (\PDOException $e) {
            http_response_code(500);
            $this->json(['error' => 'Erreur serveur : ' . $e->getMessage()]);
        }
    }

    // Ajouter un commentaire
    public function create(): void
    {
        $payload = Auth::checkToken();
        if (!$payload) {
            $this->json(['error' => 'Token manquant ou invalide'], 401);
            return;
        }

        $data = json_decode(file_get_contents('php://input'), true);
        $contenu = $data['contenu'] ?? '';
        $rating = $data['rating'] ?? null;
        $destination_id = $data['destination_id'] ?? null;

        if (!$contenu || !$destination_id || !is_numeric($rating)) {
            $this->json(['error' => 'Champs invalides'], 400);
            return;
        }

        // Insérer le commentaire
        $stmt = $this->conn->prepare("INSERT INTO commentaire (contenu, rating, utilisateur_id, destination_id, date_creation) VALUES (:contenu, :rating, :user_id, :destination_id, NOW())");

        $stmt->execute([
            ':contenu' => $contenu,
            ':rating' => (int)$rating,
            ':user_id' => $payload['sub'],
            ':destination_id' => $destination_id
        ]);

        // Recalculer la moyenne et mettre à jour la destination
        $this->updateAverageRating($destination_id);

        $this->json(['success' => true]);
    }

    // Supprimer un commentaire
    public function delete(int $id): void
    {
        $payload = Auth::checkToken();
        if (!$payload) {
            $this->json(['error' => 'Token manquant ou invalide'], 401);
            return;
        }

        // Vérifier que le commentaire appartient à l'utilisateur
        $stmt = $this->conn->prepare("SELECT destination_id, utilisateur_id FROM commentaire WHERE id = :id");
        $stmt->execute([':id' => $id]);
        $comment = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$comment) {
            $this->json(['error' => 'Commentaire non trouvé'], 404);
            return;
        }

        if ((int)$comment['utilisateur_id'] !== (int)$payload['sub']) {
            $this->json(['error' => 'Accès refusé'], 403);
            return;
        }

        // Supprimer
        $stmt = $this->conn->prepare("DELETE FROM commentaire WHERE id = :id");
        $stmt->execute([':id' => $id]);

        // Recalculer la moyenne
        $this->updateAverageRating($comment['destination_id']);

        $this->json(['success' => true]);
    }

    // Recalcul de la moyenne pour une destination
    private function updateAverageRating(int $destination_id): void
    {
        $stmt = $this->conn->prepare("SELECT AVG(rating) AS avg_rating FROM commentaire WHERE destination_id = :destination_id");
        $stmt->execute([':destination_id' => $destination_id]);
        $avg = $stmt->fetchColumn();
        $avg = $avg ?: 0;

        $stmt = $this->conn->prepare("UPDATE destination SET average_rating = :avg WHERE id = :destination_id");
        $stmt->execute([':avg' => $avg, ':destination_id' => $destination_id]);
    }

    // Récupérer tous les commentaires pour une destination (via méthode dédiée)
    public function getByDestination(int $destination_id): void
    {
        $stmt = $this->conn->prepare("
            SELECT c.id, c.contenu, c.rating, c.date_creation, u.nom AS auteur
            FROM commentaire c
            JOIN users u ON c.utilisateur_id = u.id
            WHERE c.destination_id = :destination_id
            ORDER BY c.date_creation DESC
        ");
        $stmt->execute([':destination_id' => $destination_id]);
        $commentaires = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $this->json($commentaires);
    }
}
