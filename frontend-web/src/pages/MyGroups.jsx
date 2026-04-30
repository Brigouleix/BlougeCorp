import React, { useEffect, useState } from 'react';
import { fetchGroups, getCurrentUser, deleteGroup, sendInvitations, fetchInvitations, acceptInvitation, declineInvitation } from '../services/api';
import GroupCard from '../components/GroupCards';
import CreateGroup from '../components/GroupCreate';
import { useTranslation } from '../i18n/LanguageContext';
import '../styles/Groups.css';

export default function MyGroups() {
    const [groups, setGroups] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [deleteMode, setDeleteMode] = useState(false);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [inviteGroupId, setInviteGroupId] = useState('');
    const [inviteEmails, setInviteEmails] = useState('');
    const [inviteMessage, setInviteMessage] = useState('');
    const [pendingInvitations, setPendingInvitations] = useState([]);

    useEffect(() => {
        fetchGroups().then(setGroups).catch(console.error);
        fetchInvitations().then(setPendingInvitations).catch(() => {});
    }, []);

    const currentUser = getCurrentUser();
    const { t } = useTranslation();

    const handleDelete = async (groupId) => {
        try {
            await deleteGroup(groupId);
            setGroups(prev => prev.filter(group => group.id !== groupId));
        } catch (error) {
            alert(error.message);
        }
    };

    const handleSendInvitations = async () => {
        if (!inviteGroupId || !inviteEmails.trim()) {
            setInviteMessage('Veuillez sélectionner un groupe et entrer des emails.');
            return;
        }

        const emails = inviteEmails.split(',').map(e => e.trim()).filter(Boolean);

        try {
            const result = await sendInvitations(parseInt(inviteGroupId), emails);
            setInviteMessage(result.message);
            setInviteEmails('');
        } catch (error) {
            setInviteMessage('Erreur : ' + error.message);
        }
    };

    const handleAccept = async (id) => {
        try {
            await acceptInvitation(id);
            setPendingInvitations(prev => prev.filter(inv => inv.id !== id));
            const updated = await fetchGroups();
            setGroups(updated);
        } catch (e) { alert(e.message); }
    };

    const handleDecline = async (id) => {
        try {
            await declineInvitation(id);
            setPendingInvitations(prev => prev.filter(inv => inv.id !== id));
        } catch (e) { alert(e.message); }
    };

    return (
        <div className="groups-container">

            {/* Invitations en attente */}
            {pendingInvitations.length > 0 && (
                <div className="invitations-banner">
                    <h3>📬 {t('groups.pendingInvitations')} ({pendingInvitations.length})</h3>
                    {pendingInvitations.map(inv => (
                        <div key={inv.id} className="invitation-item">
                            <span>Vous êtes invité(e) à rejoindre <strong>{inv.group_name}</strong></span>
                            <div className="invitation-actions">
                                <button className="btn-accept" onClick={() => handleAccept(inv.id)}>✓ {t('groups.accept')}</button>
                                <button className="btn-decline" onClick={() => handleDecline(inv.id)}>✕ {t('groups.decline')}</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="groups-header">
                <h1 className="groups-title">{t('groups.title')}</h1>
                <div className="groups-actions">
                    <button className="create-group-button" onClick={() => setShowModal(true)}>
                        {t('groups.create')}
                    </button>
                    <button className="create-group-button" onClick={() => setShowInviteModal(true)}>
                        ✉ {t('groups.invite')}
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

            {/* Modal création de groupe */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <button className="close-modal" onClick={() => setShowModal(false)}>✖</button>
                        <CreateGroup onClose={() => setShowModal(false)} />
                    </div>
                </div>
            )}

            {/* Modal envoi d'invitations */}
            {showInviteModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <button className="close-modal" onClick={() => {
                            setShowInviteModal(false);
                            setInviteMessage('');
                        }}>✖</button>

                        <h2>{t('groups.invite')}</h2>

                        <label>Sélectionner un groupe</label>
                        <select
                            value={inviteGroupId}
                            onChange={(e) => setInviteGroupId(e.target.value)}
                            style={{ width: '100%', padding: '8px', marginBottom: '12px', borderRadius: '6px', border: '1px solid #ccc' }}
                        >
                            <option value="">-- Choisir un groupe --</option>
                            {groups.map(g => (
                                <option key={g.id} value={g.id}>{g.name}</option>
                            ))}
                        </select>

                        <label>{t('groups.inviteEmails')}</label>
                        <input
                            type="text"
                            value={inviteEmails}
                            onChange={(e) => setInviteEmails(e.target.value)}
                            placeholder="email1@test.com, email2@test.com"
                            style={{ width: '100%', padding: '8px', marginBottom: '12px', borderRadius: '6px', border: '1px solid #ccc' }}
                        />

                        {inviteMessage && (
                            <p style={{ color: inviteMessage.startsWith('Erreur') ? '#e74c3c' : '#27ae60', marginBottom: '12px' }}>
                                {inviteMessage}
                            </p>
                        )}

                        <button className="create-group-button" onClick={handleSendInvitations}>
                            {t('common.send')}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
