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

    /** insère la destination et renvoie l’enregistrement complet */
    public function create(array $d): ?array
    {
        $sql = "
          INSERT INTO destinations
            (group_id, name, image, price_house, price_travel, dates,
             proposed_by, members, location)
          VALUES
            (:group_id, :name, :image, :price_house, :price_travel, :dates,
             :proposed_by, :members, :location)
        ";
        $ok = $this->conn->prepare($sql)->execute([
            ':group_id'     => $d['groupId'],
            ':name'         => $d['name'],
            ':image'        => $d['image']       ?? null,
            ':price_house'  => $d['priceHouse'],
            ':price_travel' => $d['priceTravel'],
            ':dates'        => $d['dates'],
            ':proposed_by'  => $d['proposedBy'],
            ':members'      => json_encode($d['members'] ?? []),
            ':location'     => json_encode($d['location'] ?? null),
        ]);

        if (!$ok) {
            return null;
        }
        $id = $this->conn->lastInsertId();
        return $this->find($id);
    }

    /** récupère une destination par id */
    public function find(int $id): ?array
    {
        $st = $this->conn->prepare("SELECT * FROM destinations WHERE id = :id");
        $st->execute(['id' => $id]);
        $dest = $st->fetch(PDO::FETCH_ASSOC);
        // décode JSON
        if ($dest) {
            $dest['members']  = json_decode($dest['members']  ?? '[]', true);
            $dest['location'] = json_decode($dest['location'] ?? 'null', true);
        }
        return $dest ?: null;
    }

    /** liste des destinations, option groupId */
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

        // décodage JSON pour chaque ligne
        return array_map(function ($r) {
            $r['members']  = json_decode($r['members']  ?? '[]', true);
            $r['location'] = json_decode($r['location'] ?? 'null', true);
            return $r;
        }, $rows);
    }

    public function delete(int $id): bool
    {
        return $this->conn
            ->prepare("DELETE FROM destinations WHERE id = :id")
            ->execute(['id' => $id]);
    }
}
