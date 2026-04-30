// src/App.js

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './styles/global.css';
import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Destinations from './pages/Destinations';
import MyGroups from './pages/MyGroups';
import GroupDetails from './pages/GroupDetails';
import GroupCreate from './components/GroupCreate';
import ProtectedRoute from './components/ProtectedRoute';
import NotFound from './pages/NotFound';
import Footer from './components/Footer';
import Legal from './pages/Legal';
import Contact from './pages/Contact';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Privacy from './pages/Privacy';
import RoadTripPage from './pages/RoadTripPage';
import AdminDashboard from './pages/AdminDashboard';
import { LanguageProvider } from './i18n/LanguageContext';

function App() {
    const [darkMode, setDarkMode] = useState(false);

    useEffect(() => {
        if (darkMode) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
    }, [darkMode]);

    return (
        <LanguageProvider>
        <Router>
            <div className={`app-container ${darkMode ? 'dark' : ''}`}>
                <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />

                <Routes>
                    <Route path="/" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/legal" element={<Legal />} />
                    <Route path="/privacy" element={<Privacy />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/reset-password" element={<ResetPassword />} />
                    <Route path="/destinations" element={<ProtectedRoute><Destinations /></ProtectedRoute>} />
                    <Route path="/my-groups" element={<ProtectedRoute><MyGroups /></ProtectedRoute>} />
                    <Route path="/groups/:groupId" element={<ProtectedRoute><GroupDetails /></ProtectedRoute>} />
                    <Route path="/create-group" element={<ProtectedRoute><GroupCreate /></ProtectedRoute>} />
                    <Route path="/roadtrip" element={<ProtectedRoute><RoadTripPage /></ProtectedRoute>} />
                    <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
                    <Route path="*" element={<NotFound />} />
                </Routes>

                <Footer />
            </div>
        </Router>
        </LanguageProvider>
    );
}

export default App;
