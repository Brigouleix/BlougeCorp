import { useNavigate } from 'react-router-dom';
import logo from '../assets/blouge.svg';
import '../styles/Navbar.css';


export default function Navbar({ darkMode, setDarkMode }) {
    const navigate = useNavigate();

    return (
        <nav className="flex justify-between items-center p-4 bg-white dark:bg-gray-900 shadow-md">
             <img src={logo} alt="Blouge Logo" className="nav-logo" />
             
            {/* Bouton Home */}
            <button
                onClick={() => navigate('/Groups')}
                className="text-lg font-semibold text-gray-900 dark:text-white"
            >
                Home
            </button>

            {/* Switch Dark Mode */}
            <button
                onClick={() => setDarkMode(!darkMode)}
                className="text-lg font-semibold text-gray-900 dark:text-white"
            >
                {darkMode ? '☀️ Mode Clair' : '🌙 Mode Sombre'}
            </button>
        </nav>
    );
}
