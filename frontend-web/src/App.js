import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Groups from './pages/Groups';
import GroupDetails from './pages/GroupDetails';

export default function App() {
    return (
        <Router>
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