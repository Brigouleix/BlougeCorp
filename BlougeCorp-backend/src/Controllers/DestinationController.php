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
        $groupId = $_GET['group_id'] ?? null;

        $showArchived = ($_GET['archived'] ?? '0') === '1';

        if ($groupId) {
            if ($showArchived) {
                $stmt = $this->db->prepare('SELECT * FROM destinations WHERE group_id = ? AND archived = 1 ORDER BY created_at DESC');
            } else {
                $stmt = $this->db->prepare('SELECT * FROM destinations WHERE group_id = ? AND (archived IS NULL OR archived = 0) ORDER BY created_at DESC');
            }
            $stmt->execute([(int) $groupId]);
        } else {
            if ($showArchived) {
                $stmt = $this->db->query('SELECT * FROM destinations WHERE archived = 1 ORDER BY created_at DESC');
            } else {
                $stmt = $this->db->query('SELECT * FROM destinations WHERE (archived IS NULL OR archived = 0) ORDER BY created_at DESC');
            }
        }

        $destinations = $stmt->fetchAll();

        foreach ($destinations as &$dest) {
            $dest['priceHouse']  = (float) $dest['price_house'];
            $dest['priceTravel'] = (float) $dest['price_travel'];
            $dest['members']     = json_decode($dest['members'] ?? '[]', true);
            $dest['location']    = [
                'lat'     => $dest['location_lat'] ? (float) $dest['location_lat'] : null,
                'lng'     => $dest['location_lng'] ? (float) $dest['location_lng'] : null,
                'address' => $dest['location_address'],
            ];
            $dest['proposedBy'] = $dest['proposed_by'];
            $dest['groupId']    = $dest['group_id'] ? (int) $dest['group_id'] : null;

            // Inclure les commentaires
            $dest['comments'] = $this->getCommentsForDestination($dest['id']);

            unset($dest['price_house'], $dest['price_travel']);
            unset($dest['location_lat'], $dest['location_lng'], $dest['location_address']);
            unset($dest['proposed_by'], $dest['group_id']);
        }

        echo json_encode($destinations);
    }

    public function show(array $params): void
    {
        $id = (int) ($params['id'] ?? 0);

        $stmt = $this->db->prepare('SELECT * FROM destinations WHERE id = ?');
        $stmt->execute([$id]);
        $dest = $stmt->fetch();

        if (!$dest) {
            http_response_code(404);
            echo json_encode(['error' => 'Destination introuvable.']);
            return;
        }

        $dest['priceHouse']  = (float) $dest['price_house'];
        $dest['priceTravel'] = (float) $dest['price_travel'];
        $dest['members']     = json_decode($dest['members'] ?? '[]', true);
        $dest['location']    = [
            'lat'     => $dest['location_lat'] ? (float) $dest['location_lat'] : null,
            'lng'     => $dest['location_lng'] ? (float) $dest['location_lng'] : null,
            'address' => $dest['location_address'],
        ];
        $dest['proposedBy'] = $dest['proposed_by'];
        $dest['groupId']    = $dest['group_id'] ? (int) $dest['group_id'] : null;
        $dest['comments']   = $this->getCommentsForDestination($dest['id']);

        unset($dest['price_house'], $dest['price_travel']);
        unset($dest['location_lat'], $dest['location_lng'], $dest['location_address']);
        unset($dest['proposed_by'], $dest['group_id']);

        echo json_encode($dest);
    }

    public function create(array $params): void
    {
        $user = JWT::getUserFromRequest();
        if (!$user) {
            http_response_code(401);
            echo json_encode(['error' => 'Non authentifié.']);
            return;
        }

        $input = json_decode(file_get_contents('php://input'), true);

        $name        = trim($input['name'] ?? '');
        $image       = $input['image'] ?? null;
        $priceHouse  = $input['priceHouse'] ?? 0;
        $priceTravel = $input['priceTravel'] ?? 0;
        $dates       = $input['dates'] ?? null;
        $proposedBy  = $input['proposedBy'] ?? null;
        $members     = $input['members'] ?? [];
        $location    = $input['location'] ?? null;
        $groupId     = $input['groupId'] ?? null;

        if (!$name) {
            http_response_code(400);
            echo json_encode(['error' => 'Le nom de la destination est requis.']);
            return;
        }

        $stmt = $this->db->prepare('
            INSERT INTO destinations (group_id, name, image, price_house, price_travel, dates, proposed_by, members, location_lat, location_lng, location_address)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ');

        $stmt->execute([
            $groupId ? (int) $groupId : null,
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
            'groupId'     => $groupId ? (int) $groupId : null,
            'comments'    => [],
        ]);
    }

    public function update(array $params): void
    {
        $user = JWT::getUserFromRequest();
        if (!$user) {
            http_response_code(401);
            echo json_encode(['error' => 'Non authentifié.']);
            return;
        }

        $id    = (int) ($params['id'] ?? 0);
        $input = json_decode(file_get_contents('php://input'), true) ?? [];

        $fields = [];
        $values = [];

        if (isset($input['priceHouse'])) { $fields[] = 'price_house = ?';    $values[] = (float) $input['priceHouse']; }
        if (isset($input['priceTravel'])){ $fields[] = 'price_travel = ?';   $values[] = (float) $input['priceTravel']; }
        if (isset($input['dates']))      { $fields[] = 'dates = ?';          $values[] = $input['dates']; }
        if (array_key_exists('image', $input)) { $fields[] = 'image = ?';   $values[] = $input['image']; }
        if (isset($input['name']))       { $fields[] = 'name = ?';           $values[] = trim($input['name']); }
        if (isset($input['location'])) {
            $loc = $input['location'];
            $fields[] = 'location_lat = ?';     $values[] = $loc['lat'] ?? null;
            $fields[] = 'location_lng = ?';     $values[] = $loc['lng'] ?? null;
            $fields[] = 'location_address = ?'; $values[] = $loc['address'] ?? null;
        }

        if (empty($fields)) {
            http_response_code(400);
            echo json_encode(['error' => 'Aucun champ à mettre à jour.']);
            return;
        }

        $values[] = $id;
        $sql = 'UPDATE destinations SET ' . implode(', ', $fields) . ' WHERE id = ?';
        $this->db->prepare($sql)->execute($values);

        // Retourne la destination mise à jour
        $this->show(['id' => $id]);
    }

    public function archive(array $params): void
    {
        $user = JWT::getUserFromRequest();
        if (!$user) {
            http_response_code(401);
            echo json_encode(['error' => 'Non authentifié.']);
            return;
        }

        $id = (int) ($params['id'] ?? 0);

        $stmt = $this->db->prepare('UPDATE destinations SET archived = 1 WHERE id = ?');
        $stmt->execute([$id]);

        echo json_encode(['message' => 'Destination archivée.']);
    }

    public function delete(array $params): void
    {
        $user = JWT::getUserFromRequest();
        if (!$user) {
            http_response_code(401);
            echo json_encode(['error' => 'Non authentifié.']);
            return;
        }

        $id = (int) ($params['id'] ?? 0);

        $stmt = $this->db->prepare('DELETE FROM destinations WHERE id = ?');
        $stmt->execute([$id]);

        echo json_encode(['message' => 'Destination supprimée.']);
    }

    private function getCommentsForDestination(int $destId): array
    {
        $stmt = $this->db->prepare('SELECT * FROM comments WHERE destination_id = ? ORDER BY created_at DESC');
        $stmt->execute([$destId]);
        return $stmt->fetchAll();
    }
}
