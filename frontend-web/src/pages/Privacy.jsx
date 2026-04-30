import '../styles/global.css';

export default function Privacy() {
    return (
        <div className="static-page">
            <div className="static-page-card">
                <h1>Politique de confidentialité</h1>
                <h2>Responsable du traitement</h2>
                <p>Antoine, développeur de BlougeCorp, est responsable du traitement des données personnelles collectées via cette application.</p>
                <h2>Données collectées</h2>
                <p>L'application collecte les données suivantes :</p>
                <ul>
                    <li>Adresse e-mail (pour la création de compte et l'authentification)</li>
                    <li>Nom d'utilisateur (pseudo choisi lors de l'inscription)</li>
                    <li>Contenus créés (groupes, destinations, commentaires, photos)</li>
                </ul>
                <h2>Finalité du traitement</h2>
                <p>Ces données sont utilisées exclusivement pour :</p>
                <ul>
                    <li>La gestion des comptes utilisateurs</li>
                    <li>Le fonctionnement des fonctionnalités de l'application</li>
                    <li>L'envoi de notifications liées au compte (ex : réinitialisation de mot de passe)</li>
                </ul>
                <h2>Durée de conservation</h2>
                <p>Les données sont conservées tant que le compte est actif. Vous pouvez supprimer votre compte à tout moment depuis les paramètres.</p>
                <h2>Partage des données</h2>
                <p>Aucune donnée personnelle n'est transmise à des tiers. L'application fonctionne dans un environnement local ou privé.</p>
                <h2>Vos droits</h2>
                <p>Conformément au RGPD, vous disposez d'un droit d'accès, de rectification et de suppression de vos données. Pour exercer ces droits, contactez-nous via la <a href="/contact">page de contact</a>.</p>
                <h2>Cookies</h2>
                <p>L'application utilise le stockage local du navigateur (localStorage) uniquement pour maintenir votre session de connexion. Aucun cookie de suivi n'est utilisé.</p>
            </div>
        </div>
    );
}
