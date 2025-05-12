// src/App.js

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { LoadScript, Autocomplete } from '@react-google-maps/api';

import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Destinations from './pages/Destinations';
import MyGroups from './pages/MyGroups';
import GroupDetails from './pages/GroupDetails';
import CreateGroup from './components/CreateGroup';
import ProtectedRoute from './components/ProtectedRoute'; 
import NotFound from './pages/NotFound';
import Footer from './components/Footer'; 

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

    useEffect(() => {
        const scriptId = 'google-api-script';
      
        if (!document.getElementById(scriptId)) {
          const script = document.createElement('script');
          script.src = 'https://accounts.google.com/gsi/client';
          script.id = scriptId;
          script.async = true;
          script.defer = true;
          document.body.appendChild(script);
        }
      }, []);
      useEffect(() => {
        if (window.google && window.google.accounts) {
          window.google.accounts.id.initialize({
            client_id: "AIzaSyCYi43JdVAzPYWGqsNP724LNeA2MQK7z8w",
            callback: handleCallbackResponse,
          });
      
          window.google.accounts.id.renderButton(
            document.getElementById("google-signin-button"),
            { theme: "outline", size: "large" }
          );
        }
      }, []);
      
      
    
    

    return (
        <LoadScript googleMapsApiKey="AIzaSyCYi43JdVAzPYWGqsNP724LNeA2MQK7z8w" libraries={['places']}>
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
                    
                    <Route path="*" element={<NotFound />} />
                    </Routes>
                    <Footer />

            </div>
        </Router>
        </LoadScript>
    );
}

export default App;

