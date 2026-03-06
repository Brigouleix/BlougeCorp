<?php

class DestinationController
{
    private PDO $db;

    public function __construct(PDO $db) { $this->db = $db; }

    private function getCommentsForDestination(int $destId): array
    {
        Database::ensureCommentsTable();
        $stmt = $this->db->prepare('SELECT * FROM comments WHERE destination_id = ? ORDER BY created_at DESC');
        $stmt->execute([$destId]);
        return $stmt->fetchAll();
    }

    public function index(array $params): void
    {
        Database::ensureGroupIdColumn();

        $groupId = $_GET['group_id'] ?? null;

        if ($groupId) {
            $stmt = $this->db->prepare('SELECT * FROM destinations WHERE group_id = ? ORDER BY created_at DESC');
            $stmt->execute([(int) $groupId]);
        } else {
            $stmt = $this->db->query('SELECT * FROM destinations ORDER BY created_at DESC');
        }

        $rows = $stmt->fetchAll();

        $result = array_map(function ($r) {
            $comments = $this->getCommentsForDestination((int) $r['id']);
            return [
                'id' => (int) $r['id'],
                'group_id' => isset($r['group_id']) ? (int) $r['group_id'] : null,
                'name' => $r['name'],
                'image' => $r['image'],
                'priceHouse' => (float) $r['price_house'],
                'priceTravel' => (float) $r['price_travel'],
                'dates' => $r['dates'],
                'proposedBy' => $r['proposed_by'],
                'members' => json_decode($r['members'] ?? '[]', true),
                'comments' => $comments,
                'location' => [
                    'lat' => (float) $r['location_lat'],
                    'lng' => (float) $r['location_lng'],
                    'address' => $r['location_address'],
                ],
            ];
        }, $rows);

        echo json_encode($result);
    }

    public function show(array $params): void
    {
        Database::ensureGroupIdColumn();
        $id = (int) ($params['id'] ?? 0);
        $stmt = $this->db->prepare('SELECT * FROM destinations WHERE id = ?');
        $stmt->execute([$id]);
        $row = $stmt->fetch();

        if (!$row) {
            http_response_code(404);
            echo json_encode(['error' => 'Destination introuvable']);
            return;
        }

        $comments = $this->getCommentsForDestination($id);

        echo json_encode([
            'id' => (int) $row['id'],
            'group_id' => isset($row['group_id']) ? (int) $row['group_id'] : null,
            'name' => $row['name'],
            'image' => $row['image'],
            'priceHouse' => (float) $row['price_house'],
            'priceTravel' => (float) $row['price_travel'],
            'dates' => $row['dates'],
            'proposedBy' => $row['proposed_by'],
            'members' => json_decode($row['members'] ?? '[]', true),
            'comments' => $comments,
            'location' => [
                'lat' => (float) $row['location_lat'],
                'lng' => (float) $row['location_lng'],
                'address' => $row['location_address'],
            ],
        ]);
    }

    public function create(array $params): void
    {
        Database::ensureGroupIdColumn();
        $input = json_decode(file_get_contents('php://input'), true);
        $name = trim($input['name'] ?? '');

        if (!$name) {
            http_response_code(400);
            echo json_encode(['error' => 'Le nom est requis.']);
            return;
        }

        $loc = $input['location'] ?? [];
        $groupId = $input['groupId'] ?? null;

        $stmt = $this->db->prepare('INSERT INTO destinations (group_id, name, image, price_house, price_travel, dates, proposed_by, members, location_lat, location_lng, location_address) VALUES (?,?,?,?,?,?,?,?,?,?,?)');
        $stmt->execute([
            $groupId,
            $name,
            $input['image'] ?? null,
            $input['priceHouse'] ?? 0,
            $input['priceTravel'] ?? 0,
            $input['dates'] ?? null,
            $input['proposedBy'] ?? null,
            json_encode($input['members'] ?? []),
            $loc['lat'] ?? null,
            $loc['lng'] ?? null,
            $loc['address'] ?? null,
        ]);

        echo json_encode([
            'id' => (int) $this->db->lastInsertId(),
            'name' => $name,
        ]);
    }

    public function delete(array $params): void
    {
        $user = JWT::getUserFromRequest();
        if (!$user) {
            http_response_code(401);
            echo json_encode(['error' => 'Non authentifié']);
            return;
        }

        $id = (int) ($params['id'] ?? 0);
        $stmt = $this->db->prepare('SELECT * FROM destinations WHERE id = ?');
        $stmt->execute([$id]);
        $row = $stmt->fetch();

        if (!$row) {
            http_response_code(404);
            echo json_encode(['error' => 'Destination introuvable']);
            return;
        }

        $stmt = $this->db->prepare('DELETE FROM destinations WHERE id = ?');
        $stmt->execute([$id]);

        echo json_encode(['message' => 'Destination supprimée']);
    }
}
