import React, { useEffect, useState } from 'react';
import { fetchGroups, getCurrentUser, deleteGroup, fetchInvitations, acceptInvitation, declineInvitation, sendInvitations } from '../services/api';
import GroupCard from '../components/GroupCards';
import CreateGroup from '../components/GroupCreate';
import '../styles/Groups.css';

export default function MyGroups() {
    const [groups, setGroups] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [deleteMode, setDeleteMode] = useState(false);
    const [invitations, setInvitations] = useState([]);
    const [showInvitations, setShowInvitations] = useState(false);

    // Send invitation modal state
    const [showSendInvite, setShowSendInvite] = useState(false);
    const [selectedGroupId, setSelectedGroupId] = useState('');
    const [inviteEmails, setInviteEmails] = useState('');
    const [sendLoading, setSendLoading] = useState(false);
    const [sendMsg, setSendMsg] = useState('');

    useEffect(() => {
        fetchGroups().then(setGroups);
        fetchInvitations().then(setInvitations).catch(() => {});
    }, []);

    const currentUser = getCurrentUser();

    const handleDelete = async (groupId) => {
        try {
            await deleteGroup(groupId);
            setGroups(prev => prev.filter(group => group.id !== groupId));
        } catch (error) {
            alert(error.message);
        }
    };

    const handleAccept = async (id) => {
        try {
            await acceptInvitation(id);
            setInvitations(prev => prev.filter(inv => inv.id !== id));
            fetchGroups().then(setGroups);
        } catch (error) {
            alert(error.message);
        }
    };

    const handleDecline = async (id) => {
        try {
            await declineInvitation(id);
            setInvitations(prev => prev.filter(inv => inv.id !== id));
        } catch (error) {
            alert(error.message);
        }
    };

    const handleSendInvitations = async (e) => {
        e.preventDefault();
        setSendLoading(true);
        setSendMsg('');
        try {
            const emails = inviteEmails.split(',').map(e => e.trim()).filter(Boolean);
            if (!selectedGroupId || emails.length === 0) {
                setSendMsg('Veuillez remplir tous les champs.');
                setSendLoading(false);
                return;
            }
            const result = await sendInvitations(parseInt(selectedGroupId), emails);
            setSendMsg(result.message);
            setInviteEmails('');
        } catch (error) {
            setSendMsg(error.message);
        } finally {
            setSendLoading(false);
        }
    };

    return (
        <div className="groups-container">
            <div className="groups-header">
                <h1 className="groups-title">Mes Groupes</h1>
                <div className="groups-actions">
                    {/* Invitation bell with badge */}
                    <button className="invitation-bell" onClick={() => setShowInvitations(true)} title="Invitations">
                        <span role="img" aria-label="invitations">&#128276;</span>
                        {invitations.length > 0 && (
                            <span className="invitation-badge">{invitations.length}</span>
                        )}
                    </button>

                    <button className="create-group-button" onClick={() => setShowSendInvite(true)}>
                        Envoyer une invitation
                    </button>

                    <button className="create-group-button" onClick={() => setShowModal(true)}>
                        Créer un Groupe
                    </button>
                    <button className="delete-mode-button" onClick={() => setDeleteMode(!deleteMode)}>
                        &#128465;
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

            {/* Create group modal */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <button className="close-modal" onClick={() => setShowModal(false)}>&#10006;</button>
                        <CreateGroup onClose={() => setShowModal(false)} />
                    </div>
                </div>
            )}

            {/* Send invitation modal */}
            {showSendInvite && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <button className="close-modal" onClick={() => { setShowSendInvite(false); setSendMsg(''); }}>&#10006;</button>
                        <h2 className="invitations-title">Envoyer une invitation</h2>
                        <form onSubmit={handleSendInvitations} className="create-group-form">
                            <label>Groupe</label>
                            <select value={selectedGroupId} onChange={(e) => setSelectedGroupId(e.target.value)} required>
                                <option value="">Sélectionner un groupe</option>
                                {groups.map(g => (
                                    <option key={g.id} value={g.id}>{g.name}</option>
                                ))}
                            </select>

                            <label>Adresses email (séparées par des virgules)</label>
                            <input
                                type="text"
                                value={inviteEmails}
                                onChange={(e) => setInviteEmails(e.target.value)}
                                placeholder="ex: alice@mail.com, bob@mail.com"
                                required
                            />

                            {sendMsg && <p style={{ color: sendMsg.includes('Erreur') ? '#e53935' : '#4caf50', fontWeight: 600 }}>{sendMsg}</p>}

                            <button type="submit" disabled={sendLoading}>
                                {sendLoading ? 'Envoi...' : 'Envoyer'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Invitations modal */}
            {showInvitations && (
                <div className="modal-overlay">
                    <div className="modal-content invitations-modal">
                        <button className="close-modal" onClick={() => setShowInvitations(false)}>&#10006;</button>
                        <h2 className="invitations-title">Invitations en attente</h2>
                        {invitations.length === 0 ? (
                            <p className="no-invitations">Aucune invitation en attente.</p>
                        ) : (
                            <div className="invitations-list">
                                {invitations.map(inv => (
                                    <div key={inv.id} className="invitation-card">
                                        <div className="invitation-info">
                                            <p className="invitation-group">{inv.group_name}</p>
                                            <p className="invitation-by">Invité par <strong>{inv.invited_by}</strong></p>
                                        </div>
                                        <div className="invitation-actions">
                                            <button className="btn-accept" onClick={() => handleAccept(inv.id)}>Accepter</button>
                                            <button className="btn-decline" onClick={() => handleDecline(inv.id)}>Refuser</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
