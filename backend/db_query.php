<?php
// Usage: php db_query.php "SELECT * FROM users"
$dbPath = __DIR__ . '/data/blougecorp.sqlite';
$db = new PDO("sqlite:$dbPath", null, null, [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
]);

$query = $argv[1] ?? "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name";

$stmt = $db->query($query);
$rows = $stmt->fetchAll();

if (count($rows) === 0) {
    echo "Aucun résultat.\n";
} else {
    // Header
    echo implode(' | ', array_keys($rows[0])) . "\n";
    echo str_repeat('-', 60) . "\n";
    foreach ($rows as $row) {
        $display = array_map(function($v) {
            if (is_string($v) && strlen($v) > 50) return substr($v, 0, 50) . '...';
            return $v ?? 'NULL';
        }, $row);
        echo implode(' | ', $display) . "\n";
    }
    echo "\n(" . count($rows) . " lignes)\n";
}
