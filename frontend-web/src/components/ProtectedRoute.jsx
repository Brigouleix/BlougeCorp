import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children }) {
    const isLoggedIn = localStorage.getItem('user'); // Change 'user' selon ta clé réelle

    return isLoggedIn ? children : <Navigate to="/" replace />;
}
