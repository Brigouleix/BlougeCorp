import React, { useEffect, useState } from 'react';
import { fetchGroups, getCurrentUser, deleteGroup } from '../services/api';
import GroupCard from '../components/GroupCards';
import CreateGroup from '../components/GroupCreate';
import '../styles/MyGroup.css';

export default function MyGroups() {
    const [groups, setGroups] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [deleteMode, setDeleteMode] = useState(false);
    const [showAddMemberForm, setShowAddMemberForm] = useState(false);

    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteMessage, setInviteMessage] = useState('');
    const [selectedGroup, setSelectedGroup] = useState('');

    const currentUser = getCurrentUser();

    useEffect(() => {
        fetchGroups().then(setGroups);
    }, []);

    const handleCreated = (g) => setGroups(prev => [...prev, g]);

    const handleDelete = async (id) => {
        try {
            const response = await deleteGroup(id);
            console.log('Réponse suppression :', response);
            setGroups(groups.filter(g => g.id !== id));
        } catch (error) {
            alert(error.message);
        }
    };

    const handleInviteSubmit = async (e) => {
        e.preventDefault();

        if (!selectedGroup || !inviteEmail) {
            alert("Veuillez remplir tous les champs obligatoires.");
            return;
        }

        try {
            const res = await fetch(`http://localhost/blougecorp/api/invitations`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify({
                    groupe_id: selectedGroup,
                    email: inviteEmail,
                    message: inviteMessage,
                }),
            });

            const data = await res.json();

            if (res.ok) {
                alert("Invitation envoyée avec succès !");
                setInviteEmail('');
                setInviteMessage('');
                setSelectedGroup('');
                setShowAddMemberForm(false);
            } else {
                alert(data.message || "Erreur lors de l'envoi de l'invitation.");
            }
        } catch (error) {
            alert("Erreur réseau ou serveur : " + error.message);
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
                    <button className="add-member-button" onClick={() => setShowAddMemberForm(prev => !prev)}>
                        Ajouter un Membre
                    </button>
                </div>
            </div>

            {showAddMemberForm && (
                <div className="add-member-form">
                    <h3>Inviter un membre dans un groupe</h3>
                    <form onSubmit={handleInviteSubmit}>
                        <label>
                            Groupe :
                            <select
                                value={selectedGroup}
                                onChange={e => setSelectedGroup(e.target.value)}
                                required
                            >
                                <option value="">-- Choisir un groupe --</option>
                                {groups.map(group => (
                                    <option key={group.id} value={group.id}>{group.nom}</option>
                                ))}
                            </select>
                        </label>

                        <label>
                            Email du membre :
                            <input
                                type="email"
                                value={inviteEmail}
                                onChange={e => setInviteEmail(e.target.value)}
                                required
                            />
                        </label>

                        <label>
                            Message :
                            <textarea
                                value={inviteMessage}
                                onChange={e => setInviteMessage(e.target.value)}
                                placeholder="Entrez un message personnalisé"
                            />
                        </label>

                        <button type="submit">Envoyer l'invitation</button>
                    </form>
                </div>
            )}

            <div className="groups-grid">
                {groups.map(group => (
                    <GroupCard
                        key={group.id}
                        {...group}
                        currentUserId={currentUser?.id} // 👈 passe l'ID, pas le username
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
        </div>
    );
}
