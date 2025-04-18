// src/pages/Groups.jsx
import { useEffect, useState } from 'react';
import { fetchGroups } from '../services/api';  // Fonction pour récupérer les groupes
import GroupCard from '../components/GroupCards'; 
import CreateGroup from '../components/GroupCreate';

import '../styles/Groups.css';

export default function Groups() {
    const [groups, setGroups] = useState([]);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        fetchGroups().then(setGroups);  // Récupère les groupes (les destinations)
    }, []);

    return (
        <div className="groups-container">
            <div className="groups-header">
                <h1 className="groups-title">Nos Groupes</h1>

                <button
                    className="create-group-button"
                    onClick={() => setShowModal(true)}
                >
                    Créer un Groupe
                </button>
            </div>
            


            <div className="groups-grid">
            {groups.map(group => (
        <GroupCard
            key={group.id}
            id={group.id}
            name={group.name}
            creator={group.creator}
            members={group.members}
        />
    ))}
</div>


            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <button className="close-modal" onClick={() => setShowModal(false)}>✖</button>
                        <CreateGroup onClose={() => setShowModal(false)} />
                    </div>
                </div>
            )}
        </div>
    );
}
