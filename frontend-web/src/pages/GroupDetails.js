import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchDestinationById, fetchComments, createComment, deleteComment, getCurrentUser } from '../services/api';
import TravelComparators from '../components/TravelComparators';
import { useTranslation } from '../i18n/LanguageContext';
import '../styles/GroupDetails.css';

export default function GroupDetails() {
    const { groupId } = useParams();
    const navigate = useNavigate();
    const [destination, setDestination] = useState(null);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [rating, setRating] = useState(5);
    const [sortType, setSortType] = useState('date');

    const currentUser = getCurrentUser();
    const { t } = useTranslation();

    useEffect(() => {
        fetchDestinationById(groupId)
            .then(data => {
                setDestination(data);
                setComments(data.comments || []);
            })
            .catch(console.error);
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
        if (comments.length === 0) return 0;
        const total = comments.reduce((sum, c) => sum + (parseInt(c.rating) || 0), 0);
        return (total / comments.length).toFixed(1);
    };

    if (!destination) return <p className="loading-text">Chargement...</p>;

    return (
        <div className="group-details-container">
            <button className="create-group-button" onClick={() => navigate(-1)} style={{ marginBottom: '20px' }}>
                ← Retour
            </button>

            <h1 className="group-title">{destination.name}</h1>

            {destination.location?.address && (
                <p><strong>Adresse :</strong> {destination.location.address}</p>
            )}

            {destination.location?.lat && destination.location?.lng && (
                <div className="destination-map">
                    <iframe
                        title="Carte de la destination"
                        src={`https://www.openstreetmap.org/export/embed.html?bbox=${destination.location.lng - 0.015},${destination.location.lat - 0.015},${destination.location.lng + 0.015},${destination.location.lat + 0.015}&layer=mapnik&marker=${destination.location.lat},${destination.location.lng}`}
                        style={{ width: '100%', height: '320px', border: 'none', borderRadius: '16px' }}
                        loading="lazy"
                    />
                </div>
            )}

            <TravelComparators destination={destination} />

            <section className="comments-section">
                <h2>{t('comments.title')}</h2>
                <p className="average-rating">{t('comments.avgRating')} : {calculateAverageRating()} ⭐</p>

                <div className="sort-options">
                    <label>{t('comments.sort')} :</label>
                    <select value={sortType} onChange={(e) => setSortType(e.target.value)}>
                        <option value="date">{t('comments.sortByDate')}</option>
                        <option value="rating">{t('comments.sortByRating')}</option>
                    </select>
                </div>

                <div className="comments-list">
                    {getSortedComments().map(comment => (
                        <div key={comment.id} className="comment-card">
                            <p className="comment-author"><strong>{comment.username}</strong></p>
                            <p className="comment-text">{comment.text}</p>
                            <p className="comment-rating">{t('comments.rating')} : {comment.rating}/5</p>
                            <p className="comment-date">{new Date(comment.created_at).toLocaleString()}</p>
                            {currentUser && currentUser.id === comment.user_id && (
                                <button onClick={() => handleDeleteComment(comment.id)}>{t('comments.delete')}</button>
                            )}
                        </div>
                    ))}
                </div>

                <div className="add-comment">
                    <textarea
                        placeholder={t('comments.placeholder')}
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                    />
                    <select value={rating} onChange={(e) => setRating(e.target.value)}>
                        {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                    <button onClick={handleAddComment}>{t('common.send')}</button>
                </div>
            </section>

            {destination.members && destination.members.length > 0 && (
                <section className="members-section">
                    <h2>Membres du groupe</h2>
                    <ul className="members-list">
                        {destination.members.map((m, index) => (
                            <li key={index}>{m}</li>
                        ))}
                    </ul>
                </section>
            )}
        </div>
    );
}
