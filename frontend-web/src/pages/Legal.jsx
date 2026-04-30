import '../styles/global.css';

export default function Legal() {
    return (
        <div className="static-page">
            <div className="static-page-card">
                <h1>Mentions légales</h1>
                <h2>Éditeur</h2>
                <p>BlougeCorp est une application web développée à titre personnel par Antoine.</p>
                <h2>Hébergement</h2>
                <p>L'application est hébergée localement à des fins de développement.</p>
                <h2>Propriété intellectuelle</h2>
                <p>Tous les contenus présents sur ce site sont la propriété de leurs auteurs respectifs.</p>
                <h2>Données personnelles</h2>
                <p>Les données collectées (email, nom d'utilisateur) sont utilisées uniquement pour le fonctionnement de l'application. Elles ne sont pas transmises à des tiers.</p>
                <h2>Contact</h2>
                <p>Pour toute question, utilisez la <a href="/contact">page de contact</a>.</p>
            </div>
        </div>
    );
}
