import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { changePassword, deleteAccount, getCurrentUser } from '../services/api';
import '../styles/MyAccount.css';

export default function MyAccount() {
    const navigate = useNavigate();
    const user = getCurrentUser();

    // Password change
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [pwdMsg, setPwdMsg] = useState('');
    const [pwdError, setPwdError] = useState('');

    // Account deletion
    const [deletePassword, setDeletePassword] = useState('');
    const [deleteMsg, setDeleteMsg] = useState('');
    const [showConfirm, setShowConfirm] = useState(false);

    const handleChangePassword = async (e) => {
        e.preventDefault();
        setPwdMsg('');
        setPwdError('');

        if (newPassword !== confirmPassword) {
            setPwdError('Les mots de passe ne correspondent pas.');
            return;
        }
        if (newPassword.length < 12) {
            setPwdError('Le nouveau mot de passe doit contenir au moins 12 caractères.');
            return;
        }

        try {
            const result = await changePassword(oldPassword, newPassword);
            setPwdMsg(result.message);
            setOldPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err) {
            setPwdError(err.message);
        }
    };

    const handleDeleteAccount = async () => {
        setDeleteMsg('');
        try {
            await deleteAccount(deletePassword);
            localStorage.clear();
            navigate('/');
        } catch (err) {
            setDeleteMsg(err.message);
        }
    };

    return (
        <div className="account-container">
            <button className="create-group-button" onClick={() => navigate('/my-groups')}>
                &#8592; Retourner aux groupes
            </button>
            <h1 className="account-title">Mon Compte</h1>

            <div className="account-info">
                <p><strong>Nom d'utilisateur :</strong> {user?.username}</p>
                <p><strong>Email :</strong> {user?.email}</p>
            </div>

            {/* Change password section */}
            <section className="account-section">
                <h2>Changer le mot de passe</h2>
                <form onSubmit={handleChangePassword} className="account-form">
                    <label>Ancien mot de passe</label>
                    <input type="password" value={oldPassword} onChange={e => setOldPassword(e.target.value)} required />

                    <label>Nouveau mot de passe</label>
                    <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required />

                    <label>Confirmer le nouveau mot de passe</label>
                    <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />

                    <button type="submit" className="btn-primary">Modifier le mot de passe</button>

                    {pwdMsg && <p className="success-msg">{pwdMsg}</p>}
                    {pwdError && <p className="error-msg">{pwdError}</p>}
                </form>
            </section>

            {/* Delete account section */}
            <section className="account-section danger-zone">
                <h2>Supprimer mon compte</h2>
                <p className="danger-text">
                    Cette action est irréversible. Tous vos groupes et données seront supprimés.
                </p>

                {!showConfirm ? (
                    <button className="btn-danger" onClick={() => setShowConfirm(true)}>
                        Supprimer mon compte
                    </button>
                ) : (
                    <div className="confirm-delete">
                        <label>Entrez votre mot de passe pour confirmer :</label>
                        <input type="password" value={deletePassword} onChange={e => setDeletePassword(e.target.value)} />
                        <div className="confirm-actions">
                            <button className="btn-danger" onClick={handleDeleteAccount}>Confirmer la suppression</button>
                            <button className="btn-secondary" onClick={() => { setShowConfirm(false); setDeletePassword(''); }}>Annuler</button>
                        </div>
                        {deleteMsg && <p className="error-msg">{deleteMsg}</p>}
                    </div>
                )}
            </section>
        </div>
    );
}
