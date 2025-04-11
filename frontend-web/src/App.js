import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Groups from './pages/Groups';
import GroupDetails from './pages/GroupDetails';
import Navbar from './components/Navbar'; // Importer la navbar

export default function App() {
    const [darkMode, setDarkMode] = useState(false);

    // Applique le mode sombre à tout le body
    useEffect(() => {
        if (darkMode) {
            document.body.classList.add('dark-mode'); // Ajoute la classe 'dark-mode' à body
        } else {
            document.body.classList.remove('dark-mode'); // Enlève la classe 'dark-mode' de body
        }
    }, [darkMode]);

    return (
        <Router>
            <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />

            <Routes>
                {/* Route racine */}
                <Route path="/" element={<Login />} />

                {/* Route groupes avec sous-route */}
                <Route path="/groups">
                    <Route index element={<Groups />} />
                    <Route path=":groupId" element={<GroupDetails />} />
                </Route>

                {/* Redirection pour les routes inconnues */}
                <Route path="*" element={<Login />} />
            </Routes>
        </Router>
    );
}
