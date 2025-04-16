import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { fetchDestinations } from '../services/api';
import DestinationCard from '../components/DestinationCards';
import CreateDestination from '../components/DestinationsCreate';
import '../styles/Groups.css';

export default function Destinations() {
    const { state } = useLocation();
    const [groups, setDestinations] = useState([]);
    const [showModal, setShowModal] = useState(false);

    const groupMembers = state?.members || [];
    const groupName = state?.groupName || "Nos destinations";

    useEffect(() => {
        fetchDestinations().then(setDestinations);
    }, []);

    return (
        <div className="groups-container">
            <div className="groups-header">
                <h1 className="groups-title">{groupName}</h1>

                {groupMembers.length > 0 && (
                    <p className="group-members">
                        Membres : {groupMembers.join(', ')}
                    </p>
                )}

                <button
                    className="create-group-button"
                    onClick={() => setShowModal(true)}
                >
                    Créer une destination
                </button>
            </div>

            <div className="groups-grid">
                {groups.map(group => (
                    <DestinationCard
                    key={group.id}
                    id={group.id}
                    name={group.name}
                    image={group.image}
                    price={group.price}
                    startDate={group.startDate}
                    endDate={group.endDate}
                    creator={group.creator}
                    comments={group.comments}
                />
                
                ))}
            </div>

                            {showModal && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <button className="close-modal" onClick={() => setShowModal(false)}>✖</button>
                            <CreateDestination
                                onClose={() => setShowModal(false)}
                                onCreate={(newGroup) => setDestinations(prev => [...prev, newGroup])}
                            />
                        </div>
                    </div>
                )}

        </div>
    );
}
