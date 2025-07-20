import React, { useEffect, useState } from 'react';
import { fetchGroups, getCurrentUser, deleteGroup } from '../services/api';
import GroupCard from '../components/GroupCards';
import CreateGroup from '../components/GroupCreate';
import '../styles/MyGroup.css';

export default function MyGroups() {
    const [groups, setGroups] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [deleteMode, setDeleteMode] = useState(false);
    const [notification, setNotification] = useState(null);

    const [inviteData, setInviteData] = useState({
        groupId: '',
        email: '',
        message: ''
    });

    useEffect(() => {
        fetchGroups().then(setGroups);
    }, []);

    const currentUser = getCurrentUser();

    const handleCreated = g => setGroups(prev => [...prev, g]);

    const handleDelete = async (id) => {
        try {
            const response = await deleteGroup(id);
            console.log('Réponse suppression :', response);
            setGroups(groups.filter(g => g.id !== id));
        } catch (error) {
            alert(error.message);
        }
    };

    const handleInviteSubmit = (e) => {
        e.preventDefault();
        console.log('Formulaire d\'invitation envoyé :', inviteData);

        // Simulation de l'envoi
        setNotification('Invitation envoyée avec succès !');
        setTimeout(() => setNotification(null), 3000);
        setShowInviteModal(false);
        setInviteData({ groupId: '', email: '', message: '' });
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
                    <button className="invite-member-button" onClick={() => setShowInviteModal(true)}>
                        Ajouter un membre
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
                        <CreateGroup
                            onClose={() => setShowModal(false)}
                            onCreated={handleCreated}
                        />
                    </div>
                </div>
            )}

            {showInviteModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <button className="close-modal" onClick={() => setShowInviteModal(false)}>✖</button>
                        <h2>Ajouter un membre</h2>
                        <form onSubmit={handleInviteSubmit} className="invite-form">
                            <label>Choisir un groupe :</label>
                            <select
                                required
                                value={inviteData.groupId}
                                onChange={e => setInviteData({ ...inviteData, groupId: e.target.value })}
                            >
                                <option value="">-- Sélectionnez --</option>
                                {groups.map(group => (
                                    <option key={group.id} value={group.id}>{group.titre}</option>
                                ))}
                            </select>

                            <label>Adresse email :</label>
                            <input
                                type="email"
                                required
                                value={inviteData.email}
                                onChange={e => setInviteData({ ...inviteData, email: e.target.value })}
                            />

                            <label>Message :</label>
                            <textarea
                                rows="4"
                                value={inviteData.message}
                                onChange={e => setInviteData({ ...inviteData, message: e.target.value })}
                            />

                            <button type="submit" className="submit-invite-button">Envoyer l'invitation</button>
                        </form>
                    </div>
                </div>
            )}

            {notification && <div className="notification success">{notification}</div>}
        </div>
    );
}
