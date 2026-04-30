import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/blouge.svg';
import { forgotPassword } from '../services/api';
import '../styles/Login.css';

export default function ForgotPassword() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [result, setResult] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setResult(null);

        try {
            const data = await forgotPassword(email);
            setResult(data);
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
                <h1 className="login-title">Mot de passe oublié</h1>

                {!result ? (
                    <form onSubmit={handleSubmit}>
                        <div>
                            <label className="login-label">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="login-input"
                                required
                                autoComplete="email"
                                placeholder="votre@email.com"
                            />
                        </div>

                        {error && <p className="login-error">{error}</p>}

                        <button type="submit" className="login-button" disabled={loading}>
                            {loading ? 'Envoi en cours...' : 'Envoyer le lien'}
                        </button>
                    </form>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <p style={{ color: '#059669', fontWeight: 600 }}>{result.message}</p>

                        {result.debug_token && (
                            <div style={{
                                background: 'rgba(79,70,229,0.07)',
                                border: '1px solid rgba(79,70,229,0.2)',
                                borderRadius: '12px',
                                padding: '1rem',
                                fontSize: '0.85rem',
                            }}>
                                <p style={{ margin: '0 0 0.5rem', color: '#6b7280', fontWeight: 600 }}>
                                    En développement, votre token :
                                </p>
                                <code style={{
                                    display: 'block',
                                    wordBreak: 'break-all',
                                    color: '#4f46e5',
                                    fontFamily: 'monospace',
                                    fontSize: '0.8rem',
                                }}>
                                    {result.debug_token}
                                </code>
                                <p style={{ margin: '0.5rem 0 0', color: '#6b7280', fontSize: '0.78rem' }}>
                                    Utilisez-le sur la page de réinitialisation.
                                </p>
                            </div>
                        )}
                    </div>
                )}

                <button
                    type="button"
                    className="login-link"
                    onClick={() => navigate('/')}
                    style={{ marginTop: '1rem' }}
                >
                    ← Retour à la connexion
                </button>
            </div>
        </div>
    );
}
