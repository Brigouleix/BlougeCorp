import { useEffect, useState } from 'react';
import { fetchGroups } from '../services/api';
import GroupCard from '../components/GroupCard';
import '../styles/Groups.css';

export default function Groups() {
    const [groups, setGroups] = useState([]);

    useEffect(() => {
        fetchGroups().then(setGroups);
    }, []);

    return (
        <div className="groups-container">
            <h1 className="groups-title">Mes Groupes</h1>
            <div className="groups-grid">
                {groups.map(group => (
                    <GroupCard
                        key={group.id}
                        id={group.id}
                        name={group.name}
                        image={group.image}
                        members={group.members}
                    />
                ))}
            </div>
        </div>
    );
}
