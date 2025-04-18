import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { fetchDestinations } from '../services/api';
import DestinationCard from '../components/DestinationCards';
import CreateDestination from '../components/DestinationsCreate';
import { GoogleMap, Marker } from '@react-google-maps/api';
import '../styles/GroupDetails.css';
import '../styles/Groups.css';

export default function Destinations() {
    const { state } = useLocation();
    const [groups, setGroups] = useState([]);
    const [showModal, setShowModal] = useState(false);

    const groupMembers = state?.members || [];
    const groupName = state?.groupName || "Nos destinations";

    useEffect(() => {
        fetchDestinations().then((data) => {
            setGroups(data);
        });
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

            {/* Google Maps avec marqueurs */}
            <GoogleMap
                mapContainerStyle={{
                    width: '100%',
                    height: '400px',
                    marginBottom: '20px',
                    borderRadius: '8px'
                }}
                center={{ lat: 43.6, lng: 1.433 }} // Point intermédiaire par défaut
                zoom={4}
            >
                {groups.map((group) =>
                    group.location?.lat && group.location?.lng && (
                        <Marker
                            key={group.id}
                            position={{
                                lat: group.location.lat,
                                lng: group.location.lng
                            }}
                            title={group.name}
                        />
                    )
                )}
            </GoogleMap>

            {/* Cartes de destinations */}
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

            {/* Modal de création */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <button className="close-modal" onClick={() => setShowModal(false)}>✖</button>
                        <CreateDestination
                            onClose={() => setShowModal(false)}
                            onCreate={(newGroup) =>
                                setGroups(prev => [...prev, newGroup])
                            }
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
