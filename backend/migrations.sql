
-- migrations.sql
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(100),
    prenom VARCHAR(100),
    email VARCHAR(255) UNIQUE NOT NULL,
    mot_de_passe VARCHAR(255) NOT NULL,
    confirmation_token VARCHAR(255),
    est_confirme TINYINT(1) DEFAULT 0,
    date_inscription DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE commentaire (
  id SERIAL PRIMARY KEY,
  contenu TEXT NOT NULL,
  date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  utilisateur_id INTEGER REFERENCES utilisateur(id) ON DELETE CASCADE,
  destination_id INTEGER REFERENCES destination(id) ON DELETE CASCADE
);



CREATE TABLE IF NOT EXISTS destinations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    image VARCHAR(255) NOT NULL,
    members JSON NOT NULL
);
CREATE TABLE IF NOT EXISTS groups (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    members JSON NOT NULL,
    creator_id INT NOT NULL,
    FOREIGN KEY (creator_id) REFERENCES users(id)
);

-- (Ajoutez les autres tables nécessaires)