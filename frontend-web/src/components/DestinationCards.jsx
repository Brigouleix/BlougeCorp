import { useNavigate } from 'react-router-dom';
import '../styles/Groups.css';

export default function DestinationCards({ id, name, image, comments = [], priceHouse, priceTravel, dates, proposedBy, members = [], showDelete, onDelete }) {
    const navigate = useNavigate();

    // Calcul de la moyenne des évaluations
    const averageRating =
        comments.length > 0
            ? (comments.reduce((sum, c) => sum + (parseInt(c.rating) || 0), 0) / comments.length).toFixed(1)
            : '—';

    // Calcul du prix par personne
    let pricePerPerson;
    if (members.length > 0 && !isNaN(priceHouse) && !isNaN(priceTravel)) {
        pricePerPerson = ((priceHouse / members.length) + priceTravel).toFixed(2);
    } else if (members.length === 0) {
        pricePerPerson = 'Pas encore de membres';
    } else {
        pricePerPerson = 'Pas encore déterminé';
    }

    const handleDelete = (e) => {
        e.stopPropagation();
        onDelete(id);
    };

    return (
        <div className="group-card" onClick={() => navigate(`/groups/${id}`)}>
            <img src={image} alt={name} className="group-image" />
            <div className="group-info">
                <h2 className="group-name">{name}</h2>
                <p className="group-rating"><strong>{averageRating}</strong> ⭐</p>

                {/* Calcul du prix par personne */}
                <p>
                    <strong>Prix :</strong> {pricePerPerson} €/personne
                </p>

                <p><strong>Dates :</strong> {dates}</p>
                <p><strong>Proposé par :</strong> {proposedBy}</p>

                {showDelete && (
                    <button className="delete-group-button" onClick={handleDelete}>
                        &#128465; Supprimer
                    </button>
                )}
            </div>
        </div>
    );
}
