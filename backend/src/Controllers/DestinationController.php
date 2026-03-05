<?php

class DestinationController
{
    private PDO $db;

    public function __construct(PDO $db) { $this->db = $db; }

    public function index(array $params): void
    {
        $rows = $this->db->query('SELECT * FROM destinations ORDER BY created_at DESC')->fetchAll();

        $result = array_map(function ($r) {
            return [
                'id' => (int) $r['id'],
                'name' => $r['name'],
                'image' => $r['image'],
                'priceHouse' => (float) $r['price_house'],
                'priceTravel' => (float) $r['price_travel'],
                'dates' => $r['dates'],
                'proposedBy' => $r['proposed_by'],
                'members' => json_decode($r['members'] ?? '[]', true),
                'location' => [
                    'lat' => (float) $r['location_lat'],
                    'lng' => (float) $r['location_lng'],
                    'address' => $r['location_address'],
                ],
            ];
        }, $rows);

        echo json_encode($result);
    }

    public function create(array $params): void
    {
        $input = json_decode(file_get_contents('php://input'), true);
        $name = trim($input['name'] ?? '');

        if (!$name) {
            http_response_code(400);
            echo json_encode(['error' => 'Le nom est requis.']);
            return;
        }

        $loc = $input['location'] ?? [];
        $stmt = $this->db->prepare('INSERT INTO destinations (name, image, price_house, price_travel, dates, proposed_by, members, location_lat, location_lng, location_address) VALUES (?,?,?,?,?,?,?,?,?,?)');
        $stmt->execute([
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
}
