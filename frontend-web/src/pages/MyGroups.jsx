import React, { useEffect, useState } from 'react';
import { fetchGroups, getCurrentUser, deleteGroup } from '../services/api';
import GroupCard from '../components/GroupCards';
import CreateGroup from '../components/GroupCreate';
import '../styles/Groups.css';

export default function MyGroups() {
    const [groups, setGroups] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [deleteMode, setDeleteMode] = useState(false);

    useEffect(() => {
        fetchGroups().then(setGroups);
    }, []);

    const currentUser = getCurrentUser();

    const handleDelete = async (id) => {
        try {
            const response = await deleteGroup(id);
            console.log('Réponse suppression :', response);
            setGroups(groups.filter(g => g.id !== id));
        } catch (error) {
            alert(error.message);
        }
    };



    return (
        <div className="groups-container">
            <div className="groups-header">
                <h1 className="groups-title">Mes Groupes</h1>
                <div className="groups-actions">
                    <button className="create-group-button" onClick={() => setShowModal(true)}>
                        Créer un Groupe
                    </button>
                    <button className="delete-mode-button" onClick={() => setDeleteMode(!deleteMode)}>
                        🗑
                    </button>
                </div>
            </div>

            <div className="groups-grid">
                {groups.map(group => (
                    <GroupCard
                        key={group.id}
                        {...group}
                        currentUser={currentUser?.username}
                        showDelete={deleteMode}
                        onDelete={handleDelete}
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
