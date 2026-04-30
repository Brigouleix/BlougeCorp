<?php

class RoadTripController
{
    public function __construct(private PDO $db) {}

    // GET /api/groups/{groupId}/roadtrips
    public function index(array $params): void
    {
        $groupId = (int) $params['groupId'];

        $stmt = $this->db->prepare('SELECT * FROM road_trips WHERE group_id = ? ORDER BY created_at DESC');
        $stmt->execute([$groupId]);
        $trips = $stmt->fetchAll();

        foreach ($trips as &$trip) {
            $trip['destination_ids'] = json_decode($trip['destination_ids'], true) ?? [];
        }

        echo json_encode($trips);
    }

    // POST /api/groups/{groupId}/roadtrips
    public function create(array $params): void
    {
        $groupId = (int) $params['groupId'];
        $input   = json_decode(file_get_contents('php://input'), true) ?? [];
        $destIds = $input['destination_ids'] ?? [];

        if (empty($destIds) || !is_array($destIds)) {
            http_response_code(400);
            echo json_encode(['error' => 'destination_ids requis']);
            return;
        }

        $userId = $this->getAuthUserId();

        $stmt = $this->db->prepare(
            'INSERT INTO road_trips (group_id, destination_ids, created_by) VALUES (?, ?, ?)'
        );
        $stmt->execute([$groupId, json_encode($destIds), $userId]);

        $id = (int) $this->db->lastInsertId();

        http_response_code(201);
        echo json_encode([
            'id'              => $id,
            'group_id'        => $groupId,
            'destination_ids' => $destIds,
            'created_by'      => $userId,
            'created_at'      => date('Y-m-d H:i:s'),
        ]);
    }

    // DELETE /api/roadtrips/{id}
    public function delete(array $params): void
    {
        $id = (int) $params['id'];

        $stmt = $this->db->prepare('DELETE FROM road_trips WHERE id = ?');
        $stmt->execute([$id]);

        echo json_encode(['success' => true]);
    }

    private function getAuthUserId(): ?int
    {
        $header = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
        if (!preg_match('/Bearer\s+(.+)/', $header, $m)) return null;
        try {
            $payload = JWT::decode($m[1]);
            return (int) ($payload['user_id'] ?? 0) ?: null;
        } catch (\Exception $e) {
            return null;
        }
    }
}
