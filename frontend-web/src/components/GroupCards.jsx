// src/components/GroupCard.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Groups.css';

const GroupCard = ({ id, name, members, creator }) => {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate('/destinations', {
            state: {
                groupId: id,
                groupName: name,
                members,
                creator,
            },
        });
    };
    

    return (
        <div className="group-card" onClick={handleClick}>
            <div className="group-info">
                <h2 className="group-title">{name}</h2>
                <p><strong>Admin:</strong> {creator}</p>
                <p><strong>Membres:</strong></p>
                <ul>
                    {members.map((member, index) => (
                        <li key={index}>{member}</li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default GroupCard;
