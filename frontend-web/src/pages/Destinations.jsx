// src/pages/Destinations.jsx
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { fetchDestinations } from '../services/api';
import DestinationCard   from '../components/DestinationCards';
import CreateDestination from '../components/DestinationsCreate';
import { GoogleMap, Marker } from '@react-google-maps/api';
import '../styles/Groups.css';

export default function Destinations() {
  const { state }  = useLocation();

  /* ---------- données du groupe ---------- */
  const groupId   = state?.groupId;
  const groupName = state?.name ?? 'Nos destinations';

  /** 
   *    Cast sûr : si ce n’est pas déjà un tableau → tableau vide
   *  (évite l’erreur “join is not a function”)
   */
  const groupMembers = Array.isArray(state?.members) ? state.members : [];


  /* ---------- destinations ---------- */
  const [destinations, setDestinations] = useState([]);
  const [showModal,    setShowModal]    = useState(false);

  useEffect(() => {
    fetchDestinations(groupId)
      .then(setDestinations)
      .catch(console.error);
  }, [groupId]);

  /* ---------- rendu ---------- */
  return (
    <div className="groups-container">
      <div className="groups-header">
        <h1 className="groups-title">{groupName}</h1>

        {groupMembers.length > 0 && (
          <p className="group-members">
            Membres&nbsp;: {groupMembers.join(', ')}
          </p>
        )}

        <button className="create-group-button" onClick={() => setShowModal(true)}>
          Créer une destination
        </button>
      </div>

      <GoogleMap
        mapContainerStyle={{ width: '100%', height: 400, borderRadius: 8 }}
        zoom={2}
        center={{ lat: 43.6, lng: 1.433 }}
      >
        {destinations.map(d =>
          d.location?.lat && d.location?.lng && (
            <Marker key={d.id} position={d.location} title={d.name} />
          )
        )}
      </GoogleMap>

      <div className="groups-grid">
        {destinations.map(d => <DestinationCard key={d.id} {...d} />)}
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="close-modal" onClick={() => setShowModal(false)}>
              ✖
            </button>

            <CreateDestination
              defaultMembers={groupMembers}
              groupId={groupId}
              onClose={(newDest) => {
                if (newDest) setDestinations(prev => [...prev, newDest]);
                setShowModal(false);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
