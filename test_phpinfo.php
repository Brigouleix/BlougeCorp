<?php
echo "PHP version: " . PHP_VERSION . "\n";
echo "php.ini: " . php_ini_loaded_file() . "\n";
echo "PDO drivers: " . implode(', ', PDO::getAvailableDrivers()) . "\n";
echo "mysqli: " . (extension_loaded('mysqli') ? 'YES' : 'NO') . "\n";

// Check mysql socket setting
echo "pdo_mysql.default_socket: " . ini_get('pdo_mysql.default_socket') . "\n";
echo "mysqli.default_socket: " . ini_get('mysqli.default_socket') . "\n";
echo "mysql.default_port: " . ini_get('mysqli.default_port') . "\n";
