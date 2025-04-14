import { useEffect, useState } from 'react';
import { fetchGroups } from '../services/api';
import GroupCard from '../components/GroupCard';
import CreateGroup from './GroupCreate';
import '../styles/Groups.css';

export default function Groups() {
    const [groups, setGroups] = useState([]);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        fetchGroups().then(setGroups);
    }, []);

    return (
        <div className="groups-container">
            <div className="groups-header">
                <h1 className="groups-title">Mes Groupes</h1>
                <button
                    className="create-group-button"
                    onClick={() => setShowModal(true)}
                >
                    Créer une destination
                </button>
            </div>

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

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <button className="close-modal" onClick={() => setShowModal(false)}>✖</button>
                        <CreateGroup onClose={() => setShowModal(false)} />
                    </div>
                </div>
            )}
        </div>
    );
}
