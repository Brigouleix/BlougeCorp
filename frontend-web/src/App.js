// src/App.js

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';

import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Destinations from './pages/Destinations';
import MyGroups from './pages/MyGroups';
import GroupDetails from './pages/GroupDetails';
import CreateGroup from './components/CreateGroup';
import ProtectedRoute from './components/ProtectedRoute'; 

function App() {
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
            <div className={`app-container ${darkMode ? 'dark' : ''}`}>
                <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />

                    <Routes>
                        <Route path="/" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/destinations" element={<ProtectedRoute><Destinations /></ProtectedRoute>} />
                        <Route path="/my-groups" element={<ProtectedRoute><MyGroups /></ProtectedRoute>}
                    />
                            
                    <Route
                        path="/groups/:groupId"
                        element={
                            <ProtectedRoute>
                                <GroupDetails />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/create-group"
                        element={
                            <ProtectedRoute>
                                <CreateGroup />
                            </ProtectedRoute>
                        }
                    />
                    </Routes>
            </div>
        </Router>
    );
}

export default App;

