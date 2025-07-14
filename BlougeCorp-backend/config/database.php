<?php
class Database {
    private $host = 'localhost';
    private $db_name = 'blougecorp';  // adapte selon ta BDD
    private $username = 'root';        // adapte selon ta config
    private $password = '';            // adapte selon ta config
    private $conn = null;

    public function getConnection() {
        if ($this->conn === null) {
            try {
                $this->conn = new PDO(
                    "mysql:host={$this->host};dbname={$this->db_name};charset=utf8",
                    $this->username,
                    $this->password
                );
                $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            } catch (PDOException $e) {
                die(json_encode(['error' => 'Erreur connexion BDD : ' . $e->getMessage()]));
            }
        }
        return $this->conn;
    }
}
