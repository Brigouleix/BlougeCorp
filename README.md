# BlougeCorp

Application web de planification de voyages en groupe. Crée des groupes, propose des destinations et organise tes trips avec tes amis.

## Stack technique

| Couche | Techno |
|--------|--------|
| Frontend | React 18, React Router v6, Tailwind CSS |
| Backend | PHP 8 (MVC custom), JWT auth |
| Base de données | MySQL |
| Serveur local | XAMPP (Apache + MySQL) |
| Dépendances PHP | firebase/php-jwt, vlucas/phpdotenv, phpmailer/phpmailer |

## Fonctionnalités

- Inscription / connexion avec confirmation par email
- Création et gestion de groupes de voyage
- Proposition de destinations (nom, lieu, prix logement, prix transport, dates, photo)
- Commentaires et notes sur les destinations
- Invitation de membres par email
- Mode sombre

## Structure du projet

BlougeCorp/
│
├── frontend-web/
│   ├── src/
│   │   ├── pages/          # Login, Register, MyGroups, Destinations, GroupDetails
│   │   ├── components/     # Navbar, Footer, GroupCard, DestinationCard
│   │   ├── services/       # api.js (appels HTTP)
│   │   └── styles/         # CSS par page/composant
│   └── package.json
│
├── BlougeCorp-backend/
│   ├── public/             # index.php (point d'entrée)
│   ├── app/
│   │   ├── Controllers/    # AuthController, GroupController, DestinationController
│   │   ├── Models/         # User, Group, Destination
│   │   └── Core/           # Router, Auth JWT
│   ├── routes/
│   └── composer.json
│
└── .env                    # Variables d'environnement (non versionné)


## Installation locale

### Prérequis

- [XAMPP](https://www.apachefriends.org/) (Apache + MySQL)
- [Composer](https://getcomposer.org/)
- [Node.js](https://nodejs.org/) 18+

### 1. Cloner le repo

git clone https://github.com/Brigouleix/BlougeCorp.git
cd BlougeCorp
