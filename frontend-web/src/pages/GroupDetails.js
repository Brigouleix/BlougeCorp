import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchGroupById } from '../services/api';

import '../styles/GroupDetails.css';

export default function GroupDetails() {
    const { groupId } = useParams();
    const [group, setGroup] = useState(null);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [rating, setRating] = useState(5);
    const [sortType, setSortType] = useState('date');

    useEffect(() => {
        fetchGroupById(groupId).then(data => {
            setGroup(data);
            const saved = JSON.parse(localStorage.getItem(`comments-${groupId}`)) || [];
            setComments(saved);
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
        if (sortType === 'rating') {
            return sorted.sort((a, b) => b.rating - a.rating);
        } else {
            return sorted.sort((a, b) => new Date(b.date) - new Date(a.date));
        }
    };

    const calculateAverageRating = () => {
        if (comments.length === 0) return 0;
        const total = comments.reduce((sum, c) => sum + c.rating, 0);
        return (total / comments.length).toFixed(1);
    };

    if (!group) return <p className="loading-text">Chargement...</p>;

    return (
        <div className="group-details-container">
            <h1 className="group-title">{group.name}</h1>

            <div className="group-banner">
                <img src={group.image} alt={group.name} className="banner-img" />
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
