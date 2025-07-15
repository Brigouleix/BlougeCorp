// src/components/GroupCards.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Groups.css';

export default function GroupCard({
  id,
  name,
  members,
  creator,
  currentUser,
  showDelete,
  onDelete,
}) {
  const navigate = useNavigate();

  /* --------- handlers --------- */
  const handleClick = () => {
    navigate('/destinations', {
      state: {
        groupId: id,
        name,
        members: Array.isArray(members) ? members : [], // sécurisé
      },
    });
  };

  const handleDelete = (e) => {
    e.stopPropagation();          // n’active pas la navigation
    if (onDelete) onDelete(id);
  };


  return (
    <div className="group-card" onClick={handleClick}>
      <div className="group-info">
        <h2 className="group-title">{name}</h2>

        <p>
          <strong>Admin&nbsp;:</strong> {creator}
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

        {showDelete && currentUser === creator && (
          <button className="delete-group-button" onClick={handleDelete}>
            🗑 Supprimer
          </button>
        )}
      </div>
    </div>
  );
}
