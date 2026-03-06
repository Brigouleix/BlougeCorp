import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchDestinationById, fetchComments, createComment, deleteComment, getCurrentUser } from '../services/api';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';

import '../styles/GroupDetails.css';

// Fix default Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Component to re-center map when center changes
function ChangeView({ center, zoom }) {
    const map = useMap();
    useEffect(() => {
        map.setView(center, zoom);
    }, [center, zoom, map]);
    return null;
}

export default function GroupDetails() {
    const { groupId } = useParams();
    const navigate = useNavigate();
    const currentUser = getCurrentUser();
    const [group, setGroup] = useState(null);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [rating, setRating] = useState(5);
    const [sortType, setSortType] = useState('date');

    const [mapCenter, setMapCenter] = useState([48.8566, 2.3522]);
    const [markerPosition, setMarkerPosition] = useState(null);

    // Nominatim autocomplete state
    const [searchQuery, setSearchQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const searchTimeout = useRef(null);

    useEffect(() => {
        fetchDestinationById(groupId).then(data => {
            setGroup(data);

            if (data?.location?.lat && data?.location?.lng) {
                const loc = [data.location.lat, data.location.lng];
                setMapCenter(loc);
                setMarkerPosition(loc);
            }
        });

        fetchComments(groupId).then(setComments).catch(() => {});
    }, [groupId]);

    const handleAddComment = async () => {
        if (!newComment.trim()) return;

        try {
            const comment = await createComment(groupId, newComment, Number(rating));
            setComments(prev => [comment, ...prev]);
            setNewComment('');
            setRating(5);
        } catch (error) {
            alert(error.message);
        }
    };

    const handleDeleteComment = async (id) => {
        try {
            await deleteComment(id);
            setComments(prev => prev.filter(c => c.id !== id));
        } catch (error) {
            alert(error.message);
        }
    };

    const getSortedComments = () => {
        const sorted = [...comments];
        return sortType === 'rating'
            ? sorted.sort((a, b) => b.rating - a.rating)
            : sorted.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    };

    const calculateAverageRating = () => {
        if (comments.length === 0) return '—';
        const total = comments.reduce((sum, c) => sum + c.rating, 0);
        return (total / comments.length).toFixed(1);
    };

    // Nominatim search with debounce
    const handleSearchChange = (e) => {
        const query = e.target.value;
        setSearchQuery(query);

        if (searchTimeout.current) clearTimeout(searchTimeout.current);

        if (query.length < 3) {
            setSuggestions([]);
            return;
        }

        searchTimeout.current = setTimeout(async () => {
            try {
                const res = await fetch(
                    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`,
                    { headers: { 'Accept-Language': 'fr' } }
                );
                const data = await res.json();
                setSuggestions(data);
            } catch (err) {
                console.error('Nominatim error:', err);
            }
        }, 400);
    };

    const handleSuggestionClick = (suggestion) => {
        const latLng = [parseFloat(suggestion.lat), parseFloat(suggestion.lon)];
        setMapCenter(latLng);
        setMarkerPosition(latLng);
        setSearchQuery(suggestion.display_name);
        setSuggestions([]);
    };

    if (!group) return <p className="loading-text">Chargement...</p>;

    return (
        <div className="group-details-container">
            <button className="create-group-button" onClick={() => navigate(-1)}>
                &#8592; Retourner aux destinations
            </button>
            <h1 className="group-title">{group.name}</h1>

            <div className="group-banner">
                {/* Nominatim address search */}
                <div style={{ position: 'relative', marginBottom: '10px' }}>
                    <input
                        type="text"
                        placeholder="Rechercher une adresse..."
                        value={searchQuery}
                        onChange={handleSearchChange}
                        style={{
                            width: '100%',
                            padding: '10px',
                            fontSize: '16px',
                            borderRadius: '8px',
                            border: '1px solid #ccc',
                            boxSizing: 'border-box',
                        }}
                    />
                    {suggestions.length > 0 && (
                        <ul style={{
                            position: 'absolute',
                            top: '100%',
                            left: 0,
                            right: 0,
                            background: 'white',
                            border: '1px solid #ccc',
                            borderRadius: '0 0 8px 8px',
                            listStyle: 'none',
                            margin: 0,
                            padding: 0,
                            zIndex: 1000,
                            maxHeight: '200px',
                            overflowY: 'auto',
                        }}>
                            {suggestions.map((s, i) => (
                                <li
                                    key={i}
                                    onClick={() => handleSuggestionClick(s)}
                                    style={{
                                        padding: '8px 12px',
                                        cursor: 'pointer',
                                        borderBottom: '1px solid #eee',
                                        fontSize: '14px',
                                    }}
                                    onMouseEnter={(e) => e.target.style.background = '#f0f0f0'}
                                    onMouseLeave={(e) => e.target.style.background = 'white'}
                                >
                                    {s.display_name}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <MapContainer
                    center={mapCenter}
                    zoom={12}
                    style={{ width: '100%', height: '400px' }}
                >
                    <ChangeView center={mapCenter} zoom={12} />
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    {markerPosition && (
                        <Marker position={markerPosition}>
                            <Popup>{group.name}</Popup>
                        </Marker>
                    )}
                </MapContainer>
            </div>

            <section className="comments-section">
                <h2>Commentaires</h2>
                <p className="average-rating">Note moyenne : {calculateAverageRating()} &#11088;</p>

                <div className="sort-options">
                    <label>Tri :</label>
                    <select value={sortType} onChange={(e) => setSortType(e.target.value)}>
                        <option value="date">Par date</option>
                        <option value="rating">Par note</option>
                    </select>
                </div>

                <div className="comments-list">
                    {getSortedComments().map(comment => (
                        <div key={comment.id} className="comment-card">
                            <p className="comment-author"><strong>{comment.username}</strong></p>
                            <p className="comment-text">{comment.text}</p>
                            <p className="comment-rating">Note : {comment.rating}/5</p>
                            <p className="comment-date">
                                {new Date(comment.created_at).toLocaleString()}
                            </p>
                            {currentUser && currentUser.id === comment.user_id && (
                                <button onClick={() => handleDeleteComment(comment.id)}>&#128465;&#65039; Supprimer</button>
                            )}
                        </div>
                    ))}
                </div>

                <div className="add-comment">
                    <textarea
                        placeholder="Votre commentaire..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                    />
                    <select value={rating} onChange={(e) => setRating(e.target.value)}>
                        {[1, 2, 3, 4, 5].map(n => (
                            <option key={n} value={n}>{n}</option>
                        ))}
                    </select>
                    <button onClick={handleAddComment}>Envoyer</button>
                </div>
            </section>

            <section className="members-section">
                <h2>Membres du groupe</h2>
                <ul className="members-list">
                    {group.members.map((m, index) => (
                        <li key={index}>{m}</li>
                    ))}
                </ul>
            </section>
        </div>
    );
}
