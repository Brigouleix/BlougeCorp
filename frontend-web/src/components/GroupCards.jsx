// src/components/GroupCards.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Groups.css';


export default function GroupCard({
  id,
  name,
  members,
  creator_id,
  creator_email,
  creator_name,
  currentUserId,   // 👈 récupère currentUserId
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

        <p><strong>Admin :</strong> {creator_name || creator_email || 'Inconnu'}</p>

        <p><strong>Membres :</strong></p>
        <ul>
          {Array.isArray(members) && members.length > 0
            ? members.map((member, idx) => <li key={idx}>{member}</li>)
            : <li>Aucun membre</li>}
        </ul>

        {/* ✅ Afficher le bouton de suppression seulement si : */}
        {/* - le mode suppression est activé (deleteMode == true) */}
        {/* - et l'utilisateur courant est le créateur du groupe */}
        {showDelete && currentUserId === creator_id && (
          <button className="delete-group-button" onClick={handleDelete}>
            🗑 Supprimer
          </button>
        )}
      </div>
    </div>
  );
}