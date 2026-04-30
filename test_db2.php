<?php
echo "Test 1: mysqli...\n";
$conn = @mysqli_connect('127.0.0.1', 'root', '', '', 3306);
if ($conn) {
    echo "mysqli OK!\n";
    mysqli_close($conn);
} else {
    echo "mysqli ERREUR: " . mysqli_connect_error() . "\n";
}

echo "Test 2: PDO via pipe...\n";
try {
    $pdo = new PDO('mysql:unix_socket=/xampp/mysql/mysql.sock', 'root', '');
    echo "pipe OK!\n";
} catch (Exception $e) {
    echo "pipe ERREUR: " . $e->getMessage() . "\n";
}

echo "Test 3: PDO 127.0.0.1 port 3306 explicit...\n";
try {
    $pdo = new PDO('mysql:host=127.0.0.1;port=3306;charset=utf8mb4', 'root', '', [
        PDO::ATTR_TIMEOUT => 3,
        PDO::MYSQL_ATTR_DIRECT_QUERY => true,
    ]);
    echo "PDO explicit OK!\n";
} catch (Exception $e) {
    echo "PDO explicit ERREUR: " . $e->getMessage() . "\n";
}

echo "Done.\n";
