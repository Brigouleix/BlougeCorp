import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/blouge.svg';
import '../styles/Login.css';

export default function Login() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log(email, password);
        console.log('handleSubmit appelé');  // Debug : vérifier que la fonction est bien déclenchée
        setLoading(true);
        setError('');

        try {
            const response = await fetch('http://localhost/BlougeCorp-backend/public/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            console.log('Réponse reçue:', response.status);  // Debug : vérifier le statut HTTP
            

            if (!response.ok) {
                if (response.status === 401) {
                    setError('Email ou mot de passe incorrect.');
                } else if (response.status === 403) {
                    setError('Compte non confirmé. Vérifiez vos e-mails.');
                } else {
                    setError('Une erreur est survenue lors de la connexion.');
                }
                setLoading(false);
                return;
            }

            const data = await response.json();
            console.log('Données reçues:', data);  // Debug : vérifier la réponse JSON

            if (data.user) {
                localStorage.setItem('user', JSON.stringify(data.user));
                localStorage.setItem('token', data.token);
                window.location.href = "/my-groups";


                navigate('/my-groups');
            } else {
                setError('Email ou mot de passe incorrect.');
            }
        } catch (err) {
            console.error('Erreur réseau ou serveur:', err);
            setError('Erreur réseau ou serveur indisponible.');
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = () => {
        alert("Fonctionnalité à venir : récupération du mot de passe !");
    };

    const handleSignUpRedirect = () => {
        navigate('/register');
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <img src={logo} alt="Logo Blouge" className="login-logo" />

                <h1 className="login-title">On se connait ?</h1>

                <form onSubmit={handleSubmit}>
                    <div>
                        <label className="login-label">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="login-input"
                            required
                            autoComplete="username"
                        />
                    </div>

                    <div>
                        <label className="login-label">Mot de passe</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="login-input"
                            required
                            autoComplete="current-password"
                        />
                    </div>

                    {error && <p className="login-error">{error}</p>}

                    <button type="submit" className="login-button" disabled={loading}>
                        {loading ? 'Connexion en cours...' : 'Se connecter'}
                    </button>

                    <button
                        type="button"
                        onClick={handleForgotPassword}
                        className="login-link"
                    >
                        Mot de passe oublié ?
                    </button>

                    <button
                        type="button"
                        onClick={handleSignUpRedirect}
                        className="login-link"
                    >
                        Pas encore de compte ? Rejoins-nous !!
                    </button>
                </form>
            </div>
        </div>
    );
}
