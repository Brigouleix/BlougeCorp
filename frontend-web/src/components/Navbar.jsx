import { useNavigate } from 'react-router-dom';
import logo from '../assets/blouge.svg';
import '../styles/Navbar.css';

export default function Navbar({ darkMode, setDarkMode }) {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.clear(); // Vide toutes les infos de session
        navigate('/');
    };

    // Vérifie si l'utilisateur est connecté (exemple : presence d'un "user" ou d'un "token")
    const isLoggedIn = localStorage.getItem('user') !== null;

    const handleHomeClick = () => {
        if (isLoggedIn) {
            navigate('/my-groups');
        } else {
            navigate('/');
        }
    };

    return (
        <nav className="navbar-container">
            {/* Logo à gauche */}
            <div className="navbar-left" onClick={handleHomeClick}>
                <img src={logo} alt="Blouge Logo" className="nav-logo" />
            </div>

            {/* Boutons centraux */}
            <div className="navbar-center">
                <button
                    onClick={handleHomeClick}
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

            {/* Account + Logout à droite */}
            <div className="navbar-right">
                {isLoggedIn && (
                    <button
                        onClick={() => navigate('/my-account')}
                        className="nav-button"
                    >
                        &#128100; Mon Compte
                    </button>
                )}
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
