import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Groups.css';

const GroupCard = ({ id, name, members, creator, currentUser, showDelete, onDelete }) => {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate('/destinations', { state: { name, members } });
    };

    const handleDelete = (e) => {
        e.stopPropagation(); // pour ne pas déclencher le navigate
        onDelete(id);
    };

    return (
        <div className="group-card" onClick={handleClick}>
            <div className="group-info">
                <h2 className="group-title">{name}</h2>
                <p><strong>Admin:</strong> {creator}</p>
                <p><strong>Membres:</strong></p>
                <ul>
                    {Array.isArray(members) ? members.map((member, index) => (
                        <li key={index}>{member}</li>
                    )) : <li>Aucun membre</li>}
                </ul>

                {showDelete && currentUser === creator && (
                    <button className="delete-group-button" onClick={handleDelete}>
                        🗑 Supprimer
                    </button>
                )}
            </div>
        </div>
    );
};

export default GroupCard;
