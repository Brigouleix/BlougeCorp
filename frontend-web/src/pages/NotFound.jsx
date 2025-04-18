import { useNavigate } from 'react-router-dom';
import '../styles/NotFound.css';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="notfound-container">
      <h1 className="notfound-title">404</h1>
      <p className="notfound-text">Page non trouvée</p>
      <button className="notfound-button" onClick={() => navigate('/')}>
        Retour à l'accueil
      </button>
    </div>
  );
}
