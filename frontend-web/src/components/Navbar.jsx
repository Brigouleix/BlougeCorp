import { useNavigate } from 'react-router-dom';
import logo from '../assets/blouge.svg';
import '../styles/Navbar.css';

export default function Navbar({ darkMode, setDarkMode }) {
    const navigate = useNavigate();

    const handleLogout = () => {
        // Ici tu peux aussi nettoyer le localStorage ou un contexte utilisateur
        navigate('/');
    };

    return (
        <nav className="navbar-container">
            {/* Logo à gauche */}
            <div className="navbar-left" onClick={() => navigate('/groups')}>
                <img src={logo} alt="Blouge Logo" className="nav-logo" />
            </div>

            {/* Boutons centraux */}
            <div className="navbar-center">
                <button
                    onClick={() => navigate('/groups')}
                    className="nav-button"
                >
                    Home
                </button>

                <button
                    onClick={() => setDarkMode(!darkMode)}
                    className="nav-button"
                >
                    {darkMode ? '☀️ Mode Clair' : '🌙 Mode Sombre'}
                </button>
            </div>

            {/* Logout à droite */}
            <div className="navbar-right">
                <button
                    onClick={handleLogout}
                    className="logout-button"
                >
                    Déconnexion
                </button>
            </div>
        </nav>
    );
}
