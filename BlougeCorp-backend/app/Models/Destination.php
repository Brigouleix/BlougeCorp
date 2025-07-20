<?php
namespace App\Models;

use PDO;
use Database;

class Destination
{
    private PDO $conn;

    public function __construct()
    {
        $this->conn = (new Database())->getConnection();
    }

    /** Crée une nouvelle destination */
    public function create(array $d): ?array
    {
        $sql = "
          INSERT INTO destinations
            (group_id, name, image, price_house, price_travel, dates,
             proposed_by, location)
          VALUES
            (:group_id, :name, :image, :price_house, :price_travel, :dates,
             :proposed_by, :location)
        ";
        $ok = $this->conn->prepare($sql)->execute([
            ':group_id'     => $d['groupId'],
            ':name'         => $d['name'],
            ':image'        => $d['image']       ?? null,
            ':price_house'  => $d['priceHouse'],
            ':price_travel' => $d['priceTravel'],
            ':dates'        => $d['dates'],
            ':proposed_by'  => $d['proposedBy'],
            ':location'     => json_encode($d['location'] ?? null),
        ]);

        if (!$ok) {
            return null;
        }

        $id = $this->conn->lastInsertId();

        //  Ajoute les membres associés à la destination
        if (!empty($d['members']) && is_array($d['members'])) {
            $this->addMembers((int)$id, $d['members']);
        }

        return $this->find((int)$id);
    }

    /** Ajoute des membres dans la table de jointure */
    private function addMembers(int $destinationId, array $userIds): void
    {
        $sql = "INSERT INTO destination_members (destination_id, user_id) VALUES (:destination_id, :user_id)";
        $stmt = $this->conn->prepare($sql);

        foreach ($userIds as $userId) {
            $stmt->execute([
                ':destination_id' => $destinationId,
                ':user_id'        => $userId,
            ]);
        }
    }

    /** Récupère une destination avec les noms des membres */
    public function find(int $id): ?array
    {
        $st = $this->conn->prepare("SELECT * FROM destinations WHERE id = :id");
        $st->execute(['id' => $id]);
        $dest = $st->fetch(PDO::FETCH_ASSOC);

        if ($dest) {
            $dest['location'] = json_decode($dest['location'] ?? 'null', true);
            $dest['members'] = $this->getMembers($id);
        }

        return $dest ?: null;
    }

    /** Liste des destinations avec option de filtre par groupe */
    public function list(?int $groupId = null): array
    {
        $sql = 'SELECT * FROM destinations';
        $params = [];

        if ($groupId) {
            $sql .= ' WHERE group_id = :gid';
            $params['gid'] = $groupId;
        }

        $st = $this->conn->prepare($sql);
        $st->execute($params);
        $rows = $st->fetchAll(PDO::FETCH_ASSOC);

        return array_map(function ($r) {
            $r['location'] = json_decode($r['location'] ?? 'null', true);
            $r['members'] = $this->getMembers($r['id']);
            return $r;
        }, $rows);
    }

    /** Supprime une destination */
    public function delete(int $id): bool
    {
        return $this->conn
            ->prepare("DELETE FROM destinations WHERE id = :id")
            ->execute(['id' => $id]);
    }

    /** Récupère les membres associés à une destination */
    private function getMembers(int $destinationId): array
    {
        $sql = "
            SELECT u.id, u.name, u.email
            FROM destination_members dm
            JOIN users u ON u.id = dm.user_id
            WHERE dm.destination_id = :id
        ";

        $st = $this->conn->prepare($sql);
        $st->execute(['id' => $destinationId]);

        return $st->fetchAll(PDO::FETCH_ASSOC); // tableau de membres
    }
}
