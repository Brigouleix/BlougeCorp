import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/blouge.svg';
import { useTranslation } from '../i18n/LanguageContext';
import { LANGUAGES } from '../i18n/translations';
import '../styles/Navbar.css';

export default function Navbar({ darkMode, setDarkMode }) {
    const navigate = useNavigate();
    const { t, lang, setLang } = useTranslation();
    const [langOpen, setLangOpen] = useState(false);
    const langRef = useRef(null);

    const isLoggedIn = localStorage.getItem('user') !== null;
    const storedUser = isLoggedIn ? JSON.parse(localStorage.getItem('user')) : null;
    const isAdmin = storedUser?.email === 'antoine.brigouleix@gmail.com';

    const handleLogout = () => {
        localStorage.clear();
        navigate('/');
    };

    const handleHomeClick = () => {
        navigate(isLoggedIn ? '/my-groups' : '/');
    };

    // Fermer le menu si clic à l'extérieur
    useEffect(() => {
        const handler = (e) => {
            if (langRef.current && !langRef.current.contains(e.target)) {
                setLangOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const currentLang = LANGUAGES.find(l => l.code === lang) || LANGUAGES[0];

    return (
        <nav className="navbar-container">
            {/* Logo */}
            <div className="navbar-left" onClick={handleHomeClick} style={{ cursor: 'pointer' }}>
                <img src={logo} alt="Blouge Logo" className="nav-logo" />
            </div>

            {/* Centre */}
            <div className="navbar-center">
                <button onClick={handleHomeClick} className="nav-button">
                    {t('nav.home')}
                </button>
                <button onClick={() => setDarkMode(!darkMode)} className="nav-button">
                    {darkMode ? `☀️ ${t('nav.lightMode')}` : `🌙 ${t('nav.darkMode')}`}
                </button>
                {isAdmin && (
                    <button onClick={() => navigate('/admin')} className="nav-button nav-admin-btn">
                        🛡️ Admin
                    </button>
                )}
            </div>

            {/* Droite : sélecteur de langue + logout */}
            <div className="navbar-right" style={{ gap: '0.5rem' }}>
                {/* Sélecteur de langue */}
                <div className="lang-selector" ref={langRef}>
                    <button
                        className="lang-btn"
                        onClick={() => setLangOpen(o => !o)}
                        title={t('nav.language')}
                    >
                        <span>{currentLang.flag}</span>
                        <span className="lang-code">{currentLang.code.toUpperCase()}</span>
                        <span className="lang-chevron">{langOpen ? '▲' : '▼'}</span>
                    </button>
                    {langOpen && (
                        <ul className="lang-dropdown">
                            {LANGUAGES.map(l => (
                                <li
                                    key={l.code}
                                    className={`lang-option${l.code === lang ? ' lang-active' : ''}`}
                                    onClick={() => { setLang(l.code); setLangOpen(false); }}
                                >
                                    <span>{l.flag}</span>
                                    <span>{l.label}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <button onClick={handleLogout} className="logout-button">
                    {t('nav.logout')}
                </button>
            </div>
        </nav>
    );
}
