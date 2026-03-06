import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { fetchDestinations, deleteDestination, getCurrentUser } from '../services/api';
import DestinationCard from '../components/DestinationCards';
import CreateDestination from '../components/DestinationsCreate';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import '../styles/GroupDetails.css';
import '../styles/Groups.css';

// Fix default Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

export default function Destinations() {
    const { state } = useLocation();
    const navigate = useNavigate();
    const [destinations, setDestinations] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [deleteMode, setDeleteMode] = useState(false);

    const groupId = state?.groupId;
    const groupName = state?.name || "Nos destinations";
    const groupMembers = state?.members || [];
    const groupCreator = state?.creator || "";
    const currentUser = getCurrentUser();
    const isCreator = currentUser?.username === groupCreator;

    useEffect(() => {
        if (groupId) {
            fetchDestinations(groupId).then(setDestinations);
        }
    }, [groupId]);

    const handleDeleteDestination = async (destId) => {
        try {
            await deleteDestination(destId);
            setDestinations(prev => prev.filter(d => d.id !== destId));
        } catch (error) {
            alert(error.message);
        }
    };

    return (
        <div className="groups-container">
            <div className="groups-header">
                <button className="create-group-button" onClick={() => navigate('/my-groups')}>
                    &#8592; Retourner aux groupes
                </button>

                <h1 className="groups-title">{groupName}</h1>

                {groupMembers.length > 0 && (
                    <p className="group-members">
                        Membres : {groupMembers.join(', ')}
                    </p>
                )}

                <div className="groups-actions">
                    <button
                        className="create-group-button"
                        onClick={() => setShowModal(true)}
                    >
                        + Créer une destination
                    </button>

                    {isCreator && (
                        <button
                            className="delete-mode-button"
                            onClick={() => setDeleteMode(!deleteMode)}
                        >
                            &#128465;
                        </button>
                    )}
                </div>
            </div>

            {/* OpenStreetMap with Leaflet */}
            <MapContainer
                center={[43.6, 1.433]}
                zoom={2}
                style={{
                    width: '100%',
                    height: '400px',
                    marginBottom: '20px',
                    borderRadius: '8px'
                }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {destinations.map((d) =>
                    d.location?.lat && d.location?.lng ? (
                        <Marker
                            key={d.id}
                            position={[d.location.lat, d.location.lng]}
                        >
                            <Popup>{d.name}</Popup>
                        </Marker>
                    ) : null
                )}
            </MapContainer>

            {/* Cartes de destinations */}
            <div className="groups-grid">
                {destinations.map((d) => (
                    <DestinationCard
                        key={d.id}
                        id={d.id}
                        name={d.name}
                        image={d.image}
                        comments={d.comments}
                        priceHouse={parseFloat(d.priceHouse)}
                        priceTravel={parseFloat(d.priceTravel)}
                        proposedBy={d.proposedBy}
                        members={d.members}
                        dates={d.dates}
                        showDelete={deleteMode && isCreator}
                        onDelete={handleDeleteDestination}
                    />
                ))}
            </div>

            {/* Modal de création */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <button className="close-modal" onClick={() => setShowModal(false)}>&#10006;</button>
                        <CreateDestination
                            groupId={groupId}
                            onClose={() => {
                                setShowModal(false);
                                fetchDestinations(groupId).then(setDestinations);
                            }}
                            members={groupMembers}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
