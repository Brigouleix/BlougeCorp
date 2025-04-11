import { useNavigate } from 'react-router-dom';
import '../styles/Groups.css'; // important si non encore importé ici

export default function GroupCard({ id, name, image, members }) {
    const navigate = useNavigate();

    return (
        <div className="group-card" onClick={() => navigate(`/groups/${id}`)}>
            <img src={image} alt={name} className="group-image" />
            <div className="group-info">
                <h2 className="group-name">{name}</h2>
                <p className="group-members">{members.length} membres</p>
            </div>
        </div>
    );
}
