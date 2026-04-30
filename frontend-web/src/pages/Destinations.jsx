import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { fetchDestinations, fetchArchivedDestinations, archiveDestination, deleteDestination, updateDestination, fetchRoadTrips, createRoadTrip, deleteRoadTrip, getCurrentUser } from '../services/api';
import { useTranslation } from '../i18n/LanguageContext';
import DestinationCard from '../components/DestinationCards';
import CreateDestination from '../components/DestinationsCreate';
import EditDestination from '../components/EditDestination';
import PhotoAlbum from '../components/PhotoAlbum';
import DestinationsMap from '../components/DestinationsMap';
import RoadTripCard from '../components/RoadTripCard';
import '../styles/GroupDetails.css';
import '../styles/Groups.css';

export default function Destinations() {
    const { state } = useLocation();
    const navigate = useNavigate();
    const [destinations, setDestinations] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [showAlbum, setShowAlbum] = useState(false);
    const [editingDest, setEditingDest] = useState(null);   // destination en cours d'édition
    const [archiveMode, setArchiveMode] = useState(false);
    const [showArchived, setShowArchived] = useState(false);
    const [archivedDestinations, setArchivedDestinations] = useState([]);
    const [roadTripMode, setRoadTripMode] = useState(false);
    const [selectedDests, setSelectedDests] = useState([]);
    const [roadTrips, setRoadTrips] = useState([]);   // { id, destination_ids, dests[] }

    const { t } = useTranslation();
    const groupId = state?.groupId;
    const groupName = state?.name || "Nos destinations";
    const groupMembers = state?.members || [];
    const creator = state?.creator;
    const currentUser = getCurrentUser();
    const isCreator = currentUser?.username === creator;

    // Charge destinations + road trips
    useEffect(() => {
        if (!groupId) return;
        fetchDestinations(groupId).then(setDestinations).catch(console.error);
        fetchRoadTrips(groupId)
            .then(trips => {
                // On stocke juste les IDs — les dests seront résolus après le chargement des destinations
                setRoadTrips(trips.map(t => ({ id: t.id, destination_ids: t.destination_ids })));
            })
            .catch(console.error);
    }, [groupId]);

    // Quand les destinations et les road trips sont chargés, résoudre les dests
    const resolvedRoadTrips = roadTrips.map(rt => ({
        ...rt,
        dests: (rt.destination_ids || [])
            .map(id => destinations.find(d => d.id === id || d.id === Number(id)))
            .filter(Boolean),
    }));

    const handleArchive = async (destId) => {
        try {
            await archiveDestination(destId);
            setDestinations(prev => prev.filter(d => d.id !== destId));
        } catch (error) {
            alert(error.message);
        }
    };

    const handleDirectDelete = async (destId) => {
        try {
            await deleteDestination(destId);
            setDestinations(prev => prev.filter(d => d.id !== destId));
        } catch (error) {
            alert(error.message);
        }
    };

    const handlePermanentDelete = async (destId) => {
        try {
            await deleteDestination(destId);
            setArchivedDestinations(prev => prev.filter(d => d.id !== destId));
        } catch (error) {
            alert(error.message);
        }
    };

    const handleToggleArchives = async () => {
        if (!showArchived) {
            try {
                const data = await fetchArchivedDestinations(groupId);
                setArchivedDestinations(data);
            } catch (err) {
                alert(err.message);
            }
        }
        setShowArchived(prev => !prev);
    };

    const handleCreate = (newDest) => {
        setDestinations(prev => [...prev, newDest]);
    };

    const handleEditSave = async (destId, fields) => {
        try {
            const updated = await updateDestination(destId, fields);
            setDestinations(prev => prev.map(d => d.id === destId ? { ...d, ...updated } : d));
            setEditingDest(null);
        } catch (err) {
            alert(err.message);
        }
    };

    const handleToggleRoadTrip = () => {
        setRoadTripMode(prev => !prev);
        setSelectedDests([]);
    };

    const handleSelect = (dest) => {
        setSelectedDests(prev => {
            const already = prev.some(d => d.id === dest.id);
            if (already) return prev.filter(d => d.id !== dest.id);
            return [...prev, dest];
        });
    };

    const handleCreateRoadTrip = async () => {
        if (selectedDests.length < 2) return;
        try {
            const ids = selectedDests.map(d => d.id);
            const rt = await createRoadTrip(groupId, ids);
            setRoadTrips(prev => [{ id: rt.id, destination_ids: rt.destination_ids }, ...prev]);
            setRoadTripMode(false);
            setSelectedDests([]);
        } catch (err) {
            alert(err.message);
        }
    };

    const handleDeleteRoadTrip = async (rtId) => {
        try {
            await deleteRoadTrip(rtId);
            setRoadTrips(prev => prev.filter(rt => rt.id !== rtId));
        } catch (err) {
            alert(err.message);
        }
    };

    const handleCancelRoadTrip = () => {
        setRoadTripMode(false);
        setSelectedDests([]);
    };

    return (
        <div className="groups-container">
            <div className="groups-header">
                <h1 className="groups-title">{groupName}</h1>

                {groupMembers.length > 0 && (
                    <p className="group-members">
                        Membres : {groupMembers.join(', ')}
                    </p>
                )}

                <div className="groups-actions">
                    <button className="icon-btn" title="Retour" onClick={() => navigate(-1)}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
                    </button>
                    <button className="icon-btn" title="Créer une destination" onClick={() => setShowModal(true)}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    </button>
                    {groupId && (
                        <button className="icon-btn" title="Album photos" onClick={() => setShowAlbum(true)}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                        </button>
                    )}
                    <button
                        className={`icon-btn${roadTripMode ? ' icon-btn-active' : ''}`}
                        title="Mode Road Trip"
                        onClick={handleToggleRoadTrip}
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 17l4-8 4 4 4-6 4 10"/><circle cx="3" cy="17" r="1.5" fill="currentColor"/><circle cx="21" cy="17" r="1.5" fill="currentColor"/></svg>
                    </button>
                    {isCreator && (
                        <button
                            className={`icon-btn${archiveMode ? ' icon-btn-active' : ''}`}
                            title={t('common.archive')}
                            onClick={() => setArchiveMode(prev => !prev)}
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/>
                            </svg>
                        </button>
                    )}
                    <button
                        className={`icon-btn${showArchived ? ' icon-btn-active' : ''}`}
                        title={showArchived ? t('dest.hideArchives') : t('dest.showArchives')}
                        onClick={handleToggleArchives}
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                        </svg>
                    </button>
                </div>
            </div>

            {/* Carte avec les pins */}
            <DestinationsMap destinations={destinations} />

            {/* Grille: road trips en premier, destinations derrière */}
            <div className={`groups-grid${resolvedRoadTrips.length > 0 ? ' has-road-trip' : ''}`}>
                {resolvedRoadTrips.map(rt => (
                    <RoadTripCard
                        key={rt.id}
                        roadTrip={rt}
                        members={groupMembers}
                        onDelete={() => handleDeleteRoadTrip(rt.id)}
                    />
                ))}
                {destinations.map((d) => {
                    const canDelete = isCreator || currentUser?.username === d.proposedBy;
                    return (
                        <DestinationCard
                            key={d.id}
                            id={d.id}
                            name={d.name}
                            image={d.image}
                            comments={d.comments}
                            priceHouse={parseFloat(d.priceHouse)}
                            priceTravel={parseFloat(d.priceTravel)}
                            proposedBy={d.proposedBy}
                            location={d.location}
                            members={groupMembers}
                            dates={d.dates}
                            showDelete={archiveMode && isCreator}
                            onDelete={handleArchive}
                            showPermDelete={canDelete}
                            onPermDelete={handleDirectDelete}
                            onEdit={() => setEditingDest(d)}
                            roadTripMode={roadTripMode}
                            selected={selectedDests.some(s => s.id === d.id)}
                            onSelect={handleSelect}
                        />
                    );
                })}
            </div>

            {/* Archived destinations panel */}
            {showArchived && (
                <div className="archived-section">
                    <h2 className="archived-title">{t('dest.archivedSection')}</h2>
                    {archivedDestinations.length === 0 ? (
                        <p className="archived-empty">{t('dest.noDest')}</p>
                    ) : (
                        <div className="groups-grid">
                            {archivedDestinations.map((d) => (
                                <DestinationCard
                                    key={d.id}
                                    id={d.id}
                                    name={d.name}
                                    image={d.image}
                                    comments={d.comments}
                                    priceHouse={parseFloat(d.priceHouse)}
                                    priceTravel={parseFloat(d.priceTravel)}
                                    proposedBy={d.proposedBy}
                                    location={d.location}
                                    members={groupMembers}
                                    dates={d.dates}
                                    showDelete={true}
                                    onDelete={handlePermanentDelete}
                                    isArchived={true}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Floating bar Road Trip */}
            {roadTripMode && (
                <div className="road-trip-floating-bar">
                    <span className="road-trip-count">
                        {selectedDests.length} {selectedDests.length !== 1 ? t('rt.destinations') : t('rt.destination')} {t('dest.selected')}
                    </span>
                    <div className="road-trip-floating-actions">
                        <button
                            className="create-group-button"
                            disabled={selectedDests.length < 2}
                            onClick={handleCreateRoadTrip}
                        >
                            {t('dest.createRoadTrip')}
                        </button>
                        <button className="delete-group-button" onClick={handleCancelRoadTrip}>
                            {t('dest.cancelRoadTrip')}
                        </button>
                    </div>
                </div>
            )}

            {/* Modal création destination */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <button className="close-modal" onClick={() => setShowModal(false)}>✖</button>
                        <CreateDestination
                            onClose={() => setShowModal(false)}
                            onCreate={handleCreate}
                            groupId={groupId}
                            members={groupMembers}
                        />
                    </div>
                </div>
            )}

            {/* Modal édition destination */}
            {editingDest && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <button className="close-modal" onClick={() => setEditingDest(null)}>✖</button>
                        <EditDestination
                            destination={editingDest}
                            members={groupMembers}
                            onSave={handleEditSave}
                            onClose={() => setEditingDest(null)}
                        />
                    </div>
                </div>
            )}

            {/* Modal album photo */}
            {showAlbum && (
                <div className="modal-overlay">
                    <div className="modal-content modal-large">
                        <button className="close-modal" onClick={() => setShowAlbum(false)}>✖</button>
                        <PhotoAlbum groupId={groupId} />
                    </div>
                </div>
            )}
        </div>
    );
}
