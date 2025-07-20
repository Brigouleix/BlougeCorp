// src/components/GroupCards.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Groups.css';

export default function GroupCard({
  id,
  name,
  members,
  creator_email,
  creator_name,
  currentUser,
  showDelete,
  onDelete,
}) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/destinations', {
      state: {
        groupId: id,
        name,
        members: Array.isArray(members) ? members : [],
      },
    });
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    if (onDelete) onDelete(id);
  };

  return (
    <div className="group-card" onClick={handleClick}>
      <div className="group-info">
        <h2 className="group-title">{name}</h2>

        <p>
          <strong>Admin&nbsp;:</strong> {creator_name || creator_email || 'Inconnu'}
        </p>

        <p>
          <strong>Membres&nbsp;:</strong>
        </p>
        <ul>
          {Array.isArray(members) && members.length > 0 ? (
            members.map((member, idx) => <li key={idx}>{member}</li>)
          ) : (
            <li>Aucun membre</li>
          )}
        </ul>

        {showDelete && (currentUser === creator_email || currentUser === creator_name) && (
          <button className="delete-group-button" onClick={handleDelete}>
            🗑 Supprimer
          </button>
        )}
      </div>
    </div>
  );
}