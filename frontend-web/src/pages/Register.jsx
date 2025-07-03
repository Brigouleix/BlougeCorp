import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import logo from '../assets/blouge.svg';
import '../styles/Login.css';

export default function Register() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');

    useEffect(() => {
    if (success) {
        const timer = setTimeout(() => {
            navigate('/'); // redirection vers la page de connexion
        }, 4000); // attend 4 secondes

        return () => clearTimeout(timer);
    }
}, [success, navigate]);



    const validatePassword = (password) => {
        if (password.length < 12) {
            return "Le mot de passe doit contenir au moins 12 caractères.";
        }

        const hasLowercase = /[a-z]/.test(password);
        const hasUppercase = /[A-Z]/.test(password);
        const hasNumbers = /[0-9]/.test(password);
        const hasSpecialChars = /[!@#$%^&*(),.?\":{}|<>]/.test(password);

        const typesCount = [hasLowercase, hasUppercase, hasNumbers, hasSpecialChars].filter(Boolean).length;

        if (typesCount < 4) {
            return "Le mot de passe doit contenir au moins 4 types différents : minuscules, majuscules, chiffres et caractères spéciaux.";
        }

        return null;
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError("Les mots de passe ne correspondent pas.");
            return;
        }

        const passwordError = validatePassword(password);
        if (passwordError) {
            setError(passwordError);
            return;
        }

        setLoading(true);


        try {
            const API_URL = process.env.REACT_APP_API_URL;
            const response = await fetch('http://localhost:8000/api/register', {


                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password, username }),
            });

            const data = await response.json();

            if (response.ok && data.user) {
                setSuccess("✅ Inscription réussie ! Vous allez être redirigé vers la page de connexion...");
                setEmail('');
                setUsername('');
                setPassword('');
                setConfirmPassword('');
            } else {
                setError(data.error || "Erreur lors de l'inscription.");
            }

           


        } catch (err) {
            setError("Erreur réseau ou serveur.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <img src={logo} alt="Logo Blouge" className="login-logo" />
                <h1 className="login-title">Inscription</h1>

                <form onSubmit={handleRegister}>
                    <div>
                        <label className="login-label">Nom d'utilisateur</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="login-input"
                            required
                        />
                    </div>

                    <div>
                        <label className="login-label">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="login-input"
                            required
                        />
                    </div>

                    <div>
                        <label className="login-label">Mot de passe</label>
                        <br />
                        <small className="password-hint">
                            ⚠️ Le mot de passe doit contenir au moins 12 caractères avec 4 types différents : minuscules, majuscules, chiffres et caractères spéciaux. ⚠️
                        </small>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="login-input"
                            required
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
                        />
                    </div>

                    
                    {success && <p className="login-success">{success}</p>}
                    {error && <p className="login-error">{error}</p>}



                    

                    <button type="submit" className="login-button" disabled={loading}>
                        {loading ? 'Création en cours...' : "S'inscrire"}
                    </button>

                    <div className="register-link">
                        <span>Déjà un compte ? </span>
                        <Link to="/" className="login-link">Se connecter</Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
