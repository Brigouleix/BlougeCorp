import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchGroups } from '../services/api';
import groupImage from '../assets/photogroup1.jpg';
import '../styles/Groups.css'; // Import du fichier CSS

export default function Groups() {
    const [groups, setGroups] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetchGroups().then(data => setGroups(data));
    }, []);

    return (
        <div className="groups-container">
            <h1 className="groups-title">Mes Groupes</h1>

            <div className="groups-grid">
                {groups.map(group => (
                    <div
                        key={group.id}
                        onClick={() => navigate(`/groups/${group.id}`)}
                        className="group-card"
                    >
                        <img src={groupImage} alt={group.name} className="group-image" />
                        <div className="group-info">
                            <h2 className="group-name">{group.name}</h2>
                            <p className="group-members">{group.members.length} membres</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
