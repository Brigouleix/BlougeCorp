import { useNavigate } from 'react-router-dom';
import '../styles/Groups.css'; 

export default function DestinationCards({ id, name, image, members, comments = [], price, dates, proposedBy }) {

    const navigate = useNavigate();

    // Calcul de la note moyenne
    const averageRating =
        comments.length > 0
            ? (comments.reduce((sum, c) => sum + (parseInt(c.rating) || 0), 0) / comments.length).toFixed(1)
            : '—';

    return (
        <div className="group-card" onClick={() => navigate(`/groups/${id}`)}>
            <img src={image} alt={name} className="group-image" />

            <div className="group-info">
                <h2 className="group-name">{name}</h2>

                {/* Note moyenne */}
                <p className="group-rating">
                    <strong>{averageRating}</strong> ⭐
                </p>

                    <p><strong>Prix :</strong> {price} €/personne</p>
                    <p><strong>Dates :</strong> {dates}</p>
                    <p><strong>Proposé par :</strong> {proposedBy}</p>

            </div>
        </div>
    );
}
