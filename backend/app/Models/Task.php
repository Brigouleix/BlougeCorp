<?php
class Task {
    private $db;

    public function __construct() {
        $this->db = new Database();
    }

    public function getAllTasks() {
        $this->db->query("SELECT * FROM tasks");
        return $this->db->resultSet();
    }

    // CRUD methods...
}