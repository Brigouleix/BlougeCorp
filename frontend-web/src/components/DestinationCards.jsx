import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Groups.css';

export default function DestinationCards({ id, name, image, priceHouse, priceTravel, dates, proposedBy }) {
    const navigate = useNavigate();
    const [members, setMembers] = useState([]);
    const [averageRating, setAverageRating] = useState('—');

    // Récupération des membres depuis l’API
    useEffect(() => {
        fetch(`http://localhost/blougecorp/api/groups/${id}/members`)
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setMembers(data);
                }
            })
            .catch(err => console.error('Erreur membres:', err));
    }, [id]);

    // Récupération de la moyenne des commentaires depuis l’API
    useEffect(() => {
        fetch(`http://localhost/blougecorp/api/groups/${id}/average-rating`)
            .then(res => res.json())
            .then(data => {
                if (data && data.average !== undefined) {
                    setAverageRating(parseFloat(data.average).toFixed(1));
                }
            })
            .catch(err => console.error('Erreur rating:', err));
    }, [id]);

    // Calcul du prix par personne
    let pricePerPerson;
    if (members.length > 0 && !isNaN(priceHouse) && !isNaN(priceTravel)) {
        pricePerPerson = ((priceHouse / members.length) + priceTravel).toFixed(2);
    } else if (members.length === 0) {
        pricePerPerson = 'Pas encore de membres';
    } else {
        pricePerPerson = 'Pas encore déterminé';
    }

    return (
        <div className="group-card" onClick={() => navigate(`/groups/${id}`)}>
            <img src={image} alt={name} className="group-image" />
            <div className="group-info">
                <h2 className="group-name">{name}</h2>
                <p className="group-rating"><strong>{averageRating}</strong> ⭐</p>
                <p><strong>Prix :</strong> {pricePerPerson} €/personne</p>
                <p><strong>Dates :</strong> {dates}</p>
                <p><strong>Proposé par :</strong> {proposedBy}</p>
            </div>
        </div>
    );
}
