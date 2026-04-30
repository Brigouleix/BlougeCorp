import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import logo from '../assets/blouge.svg';
import { resetPassword } from '../services/api';
import '../styles/Login.css';

export default function ResetPassword() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [token, setToken] = useState(searchParams.get('token') || '');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Les mots de passe ne correspondent pas.');
            return;
        }

        if (password.length < 12) {
            setError('Le mot de passe doit contenir au moins 12 caractères.');
            return;
        }

        setLoading(true);

        try {
            await resetPassword(token, password);
            setSuccess(true);
        } catch (err) {
            setError(err.message || 'Une erreur est survenue.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <img src={logo} alt="Logo Blouge" className="login-logo" />
                <h1 className="login-title">Nouveau mot de passe</h1>

                {success ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', textAlign: 'center' }}>
                        <p style={{ color: '#059669', fontWeight: 600 }}>
                            Mot de passe réinitialisé avec succès !
                        </p>
                        <Link to="/" className="login-button" style={{ textAlign: 'center', textDecoration: 'none' }}>
                            Se connecter
                        </Link>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <div>
                            <label className="login-label">Token de réinitialisation</label>
                            <input
                                type="text"
                                value={token}
                                onChange={(e) => setToken(e.target.value)}
                                className="login-input"
                                required
                                placeholder="Collez votre token ici"
                                autoComplete="off"
                            />
                        </div>

                        <div>
                            <label className="login-label">Nouveau mot de passe</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="login-input"
                                required
                                placeholder="12 caractères minimum"
                                autoComplete="new-password"
                            />
                        </div>

                        <div>
                            <label className="login-label">Confirmer le mot de passe</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="login-input"
                                required
                                placeholder="Répétez le mot de passe"
                                autoComplete="new-password"
                            />
                        </div>

                        {error && <p className="login-error">{error}</p>}

                        <button type="submit" className="login-button" disabled={loading}>
                            {loading ? 'Réinitialisation...' : 'Réinitialiser'}
                        </button>
                    </form>
                )}

                <button
                    type="button"
                    className="login-link"
                    onClick={() => navigate('/')}
                    style={{ marginTop: '0.5rem' }}
                >
                    ← Retour à la connexion
                </button>
            </div>
        </div>
    );
}
