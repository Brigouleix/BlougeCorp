import { useNavigate } from 'react-router-dom';
import '../styles/Groups.css'; // ou Tailwind

export default function GroupCard({ id, name, image, members, comments = [] }) {
    const navigate = useNavigate();

    // Calcul de la note moyenne
    const averageRating =
        comments.length > 0
            ? (comments.reduce((sum, c) => sum + (parseInt(c.rating) || 0), 0) / comments.length).toFixed(1)
            : '—';

    return (
        <div className="group-card" onClick={() => navigate(`/groups/${id}`)}>
            <img src={image} alt={name} className="group-image" />

            <div className="group-info">
                <h2 className="group-name">{name}</h2>
                
                {/* Note moyenne */}
                <p className="group-rating">
                <strong>{averageRating}</strong> ⭐
                </p>

                {/* Nombre de membres */}
                <p className="group-members">
                    {members?.length || 0} membres
                </p>

                {/* Liste des noms */}
                <ul className="group-member-names">
                    {members?.slice(0, 3).map((member, index) => (
                        <li key={index} className="text-sm text-gray-600 dark:text-gray-300">
                            • {member.name || member}
                        </li>
                    ))}
                    {members?.length > 3 && (
                        <li className="text-sm italic text-gray-500 dark:text-gray-400">+ autres...</li>
                    )}
                </ul>
            </div>
        </div>
    );
}
