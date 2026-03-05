<?php

class DestinationController
{
    private PDO $db;

    public function __construct(PDO $db)
    {
        $this->db = $db;
    }

    public function index(array $params): void
    {
        $stmt = $this->db->query('SELECT * FROM destinations ORDER BY created_at DESC');
        $destinations = $stmt->fetchAll();

        // Format response
        foreach ($destinations as &$dest) {
            $dest['priceHouse']  = (float) $dest['price_house'];
            $dest['priceTravel'] = (float) $dest['price_travel'];
            $dest['members']     = json_decode($dest['members'] ?? '[]', true);
            $dest['location']    = [
                'lat'     => (float) $dest['location_lat'],
                'lng'     => (float) $dest['location_lng'],
                'address' => $dest['location_address'],
            ];
            $dest['proposedBy'] = $dest['proposed_by'];

            unset($dest['price_house'], $dest['price_travel']);
            unset($dest['location_lat'], $dest['location_lng'], $dest['location_address']);
            unset($dest['proposed_by']);
        }

        echo json_encode($destinations);
    }

    public function create(array $params): void
    {
        $input = json_decode(file_get_contents('php://input'), true);

        $name        = trim($input['name'] ?? '');
        $image       = $input['image'] ?? null;
        $priceHouse  = $input['priceHouse'] ?? 0;
        $priceTravel = $input['priceTravel'] ?? 0;
        $dates       = $input['dates'] ?? null;
        $proposedBy  = $input['proposedBy'] ?? null;
        $members     = $input['members'] ?? [];
        $location    = $input['location'] ?? null;

        if (!$name) {
            http_response_code(400);
            echo json_encode(['error' => 'Le nom de la destination est requis.']);
            return;
        }

        $stmt = $this->db->prepare('
            INSERT INTO destinations (name, image, price_house, price_travel, dates, proposed_by, members, location_lat, location_lng, location_address)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ');

        $stmt->execute([
            $name,
            $image,
            $priceHouse,
            $priceTravel,
            $dates,
            $proposedBy,
            json_encode($members),
            $location['lat'] ?? null,
            $location['lng'] ?? null,
            $location['address'] ?? null,
        ]);

        $id = $this->db->lastInsertId();

        echo json_encode([
            'id'          => (int) $id,
            'name'        => $name,
            'image'       => $image,
            'priceHouse'  => (float) $priceHouse,
            'priceTravel' => (float) $priceTravel,
            'dates'       => $dates,
            'proposedBy'  => $proposedBy,
            'members'     => $members,
            'location'    => $location,
        ]);
    }
}
