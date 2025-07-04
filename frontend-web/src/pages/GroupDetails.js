import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchDestinationsById } from '../mocks/mockDestinations';
import { GoogleMap, LoadScript, Marker, Autocomplete } from '@react-google-maps/api';

import '../styles/GroupDetails.css';

export default function GroupDetails() {
    const { groupId } = useParams();
    const [group, setGroup] = useState(null);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [rating, setRating] = useState(5);
    const [sortType, setSortType] = useState('date');

    const [mapCenter, setMapCenter] = useState({ lat: 48.8566, lng: 2.3522 }); // Valeur par défaut = Paris
    const [markerPosition, setMarkerPosition] = useState(null);
    const autocompleteRef = useRef(null);

    useEffect(() => {
        fetchDestinationsById(groupId).then(data => {
            setGroup(data);
            const saved = JSON.parse(localStorage.getItem(`comments-${groupId}`)) || [];
            setComments(saved);

            if (data?.location?.lat && data?.location?.lng) {
                const loc = { lat: data.location.lat, lng: data.location.lng };
                setMapCenter(loc);
                setMarkerPosition(loc);
            }
        });
    }, [groupId]);

    const handleAddComment = () => {
        if (!newComment.trim()) return;

        const comment = {
            id: Date.now(),
            text: newComment,
            rating: Number(rating),
            date: new Date().toISOString()
        };

        const updated = [...comments, comment];
        setComments(updated);
        localStorage.setItem(`comments-${groupId}`, JSON.stringify(updated));
        setNewComment('');
        setRating(5);
    };

    const handleDeleteComment = (id) => {
        const updated = comments.filter(c => c.id !== id);
        setComments(updated);
        localStorage.setItem(`comments-${groupId}`, JSON.stringify(updated));
    };

    const getSortedComments = () => {
        const sorted = [...comments];
        return sortType === 'rating'
            ? sorted.sort((a, b) => b.rating - a.rating)
            : sorted.sort((a, b) => new Date(b.date) - new Date(a.date));
    };

    const calculateAverageRating = () => {
        if (comments.length === 0) return 0;
        const total = comments.reduce((sum, c) => sum + c.rating, 0);
        return (total / comments.length).toFixed(1);
    };

    const handlePlaceChanged = () => {
        const place = autocompleteRef.current.getPlace();
        if (place && place.geometry) {
            const location = place.geometry.location;
            const latLng = {
                lat: location.lat(),
                lng: location.lng(),
            };
            setMapCenter(latLng);
            setMarkerPosition(latLng);
        }
    };

    if (!group) return <p className="loading-text">Chargement...</p>;

    const mapContainerStyle = {
        width: '100%',
        height: '400px'
    };

    return (
        <div className="group-details-container">
            <h1 className="group-title">{group.name}</h1>

            <div className="group-banner">
               
                    
                    <Autocomplete
                        onLoad={(autocomplete) => (autocompleteRef.current = autocomplete)}
                        onPlaceChanged={handlePlaceChanged}
                    >
                        <input
                            type="text"
                            placeholder="Rechercher une adresse..."
                            style={{
                                width: '100%',
                                padding: '10px',
                                fontSize: '16px',
                                borderRadius: '8px',
                                marginBottom: '10px',
                                border: '1px solid #ccc',
                            }}
                        />
                    </Autocomplete>

                    <GoogleMap
                        mapContainerStyle={mapContainerStyle}
                        center={mapCenter}
                        zoom={12}
                    >
                        {markerPosition && <Marker position={markerPosition} />}
                    </GoogleMap>
                    
                
            </div>

            <section className="comments-section">
                <h2>Commentaires</h2>
                <p className="average-rating">Note moyenne : {calculateAverageRating()} ⭐</p>

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
                            <p className="comment-text">{comment.text}</p>
                            <p className="comment-rating">Note : {comment.rating}/5</p>
                            <p className="comment-date">
                                {new Date(comment.date).toLocaleString()}
                            </p>
                            <button onClick={() => handleDeleteComment(comment.id)}>🗑️ Supprimer</button>
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