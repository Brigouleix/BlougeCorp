import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { fetchDestinationById, createComment, deleteComment, getCurrentUser } from '../services/api';
import { useTranslation } from '../i18n/LanguageContext';
import RoadTripMap from '../components/RoadTripMap';
import TravelComparators from '../components/TravelComparators';
import '../styles/Groups.css';
import '../styles/GroupDetails.css';
import '../styles/RoadTrip.css';

export default function RoadTripPage() {
    const { state } = useLocation();
    const navigate = useNavigate();
    const roadTrip = state?.roadTrip;
    const members = state?.members || [];
    const currentUser = getCurrentUser();
    const { t } = useTranslation();

    // Fresh destination data (with up-to-date comments)
    const [dests, setDests] = useState(roadTrip?.dests || []);
    const [loading, setLoading] = useState(true);

    // Per-destination comment state: { [destId]: { comments, newText, rating, sort } }
    const [commentState, setCommentState] = useState({});

    useEffect(() => {
        if (!roadTrip?.dests?.length) { setLoading(false); return; }

        Promise.all(roadTrip.dests.map(d => fetchDestinationById(d.id).catch(() => d)))
            .then(freshDests => {
                setDests(freshDests);
                const init = {};
                freshDests.forEach(d => {
                    init[d.id] = {
                        comments: d.comments || [],
                        newText: '',
                        rating: 5,
                        sort: 'date',
                    };
                });
                setCommentState(init);
                setLoading(false);
            });
    }, []); // mount only — roadTrip comes from router state, never changes

    if (!roadTrip) {
        return (
            <div className="groups-container">
                <p style={{ textAlign: 'center', color: '#9ca3af', marginTop: '4rem' }}>
                    {t('rt.notFound')}
                </p>
            </div>
        );
    }

    const totalBudget = dests.reduce(
        (sum, d) => sum + (parseFloat(d.priceHouse) || 0) + (parseFloat(d.priceTravel) || 0), 0
    );
    const perPerson = members.length > 0 ? (totalBudget / members.length).toFixed(0) : null;
    const allRatings = dests.flatMap(d =>
        (commentState[d.id]?.comments || d.comments || []).map(c => parseInt(c.rating) || 0)
    );
    const avgRating = allRatings.length > 0
        ? (allRatings.reduce((a, b) => a + b, 0) / allRatings.length).toFixed(1)
        : null;

    const updateComment = (destId, field, value) => {
        setCommentState(prev => ({
            ...prev,
            [destId]: { ...prev[destId], [field]: value },
        }));
    };

    const handleAddComment = async (destId) => {
        const cs = commentState[destId];
        if (!cs?.newText?.trim()) return;
        try {
            const comment = await createComment(destId, cs.newText, Number(cs.rating));
            setCommentState(prev => ({
                ...prev,
                [destId]: { ...prev[destId], comments: [comment, ...prev[destId].comments], newText: '', rating: 5 },
            }));
        } catch (err) {
            alert(err.message);
        }
    };

    const handleDeleteComment = async (destId, commentId) => {
        try {
            await deleteComment(commentId);
            setCommentState(prev => ({
                ...prev,
                [destId]: { ...prev[destId], comments: prev[destId].comments.filter(c => c.id !== commentId) },
            }));
        } catch (err) {
            alert(err.message);
        }
    };

    const getSorted = (destId) => {
        const cs = commentState[destId];
        if (!cs) return [];
        const sorted = [...cs.comments];
        return cs.sort === 'rating'
            ? sorted.sort((a, b) => b.rating - a.rating)
            : sorted.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    };

    const getAvg = (destId) => {
        const comments = commentState[destId]?.comments || [];
        if (!comments.length) return 0;
        return (comments.reduce((s, c) => s + (parseInt(c.rating) || 0), 0) / comments.length).toFixed(1);
    };

    return (
        <div className="groups-container roadtrip-page">
            <div className="groups-header no-print">
                <h1 className="groups-title">🗺️ {t('rt.title')}</h1>
                <div className="groups-actions">
                    <button className="icon-btn" title={t('common.back')} onClick={() => navigate(-1)}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M19 12H5M12 5l-7 7 7 7"/>
                        </svg>
                    </button>
                    <button className="icon-btn" title={t('rt.exportPdf')} onClick={() => window.print()}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                            <polyline points="14 2 14 8 20 8"/>
                            <line x1="12" y1="18" x2="12" y2="12"/>
                            <polyline points="9 15 12 18 15 15"/>
                        </svg>
                    </button>
                </div>
            </div>

            {/* Print header */}
            <div className="print-only roadtrip-print-header">
                <h1>🗺️ Road Trip — {dests.length} étape{dests.length !== 1 ? 's' : ''}</h1>
                <p>{dests.map(d => d.name).join(' → ')}</p>
            </div>

            {/* Stats bar */}
            <div className="roadtrip-stats">
                <div className="roadtrip-stat">
                    <span className="roadtrip-stat-label">{t('rt.stages')}</span>
                    <span className="roadtrip-stat-value">{dests.length}</span>
                </div>
                {totalBudget > 0 && (
                    <div className="roadtrip-stat">
                        <span className="roadtrip-stat-label">{t('rt.budget')}</span>
                        <span className="roadtrip-stat-value">{totalBudget.toFixed(0)} €</span>
                    </div>
                )}
                {perPerson && (
                    <div className="roadtrip-stat">
                        <span className="roadtrip-stat-label">{t('rt.perPerson')}</span>
                        <span className="roadtrip-stat-value">{perPerson} €</span>
                    </div>
                )}
                {avgRating && (
                    <div className="roadtrip-stat">
                        <span className="roadtrip-stat-label">{t('comments.avgRating')}</span>
                        <span className="roadtrip-stat-value">⭐ {avgRating}/5</span>
                    </div>
                )}
                {members.length > 0 && (
                    <div className="roadtrip-stat">
                        <span className="roadtrip-stat-label">{t('rt.travellers')}</span>
                        <span className="roadtrip-stat-value">{members.length}</span>
                    </div>
                )}
            </div>

            {/* Itinerary map */}
            {!loading && (
                <div className="roadtrip-map-section">
                    <RoadTripMap destinations={dests} />
                </div>
            )}

            {loading && (
                <p className="loading-text">{t('rt.loading')}</p>
            )}

            {/* Per-destination sections */}
            {!loading && dests.map((d, i) => {
                const cs = commentState[d.id] || { comments: [], newText: '', rating: 5, sort: 'date' };
                const destBudget = (parseFloat(d.priceHouse) || 0) + (parseFloat(d.priceTravel) || 0);
                const destPerPerson = members.length > 0 ? (destBudget / members.length).toFixed(0) : null;

                return (
                    <div key={d.id ?? i} className="roadtrip-dest-section">
                        {/* Destination header */}
                        <div className="roadtrip-step-card">
                            <div className="roadtrip-step-number">{i + 1}</div>
                            {d.image && (
                                <img src={d.image} alt={d.name} className="roadtrip-step-img" />
                            )}
                            <div className="roadtrip-step-info">
                                <h3 className="roadtrip-step-name">{d.name}</h3>
                                {d.location?.address && (
                                    <p className="roadtrip-step-address">📍 {d.location.address}</p>
                                )}
                                <div className="roadtrip-step-meta">
                                    {getAvg(d.id) > 0 && <span>⭐ {getAvg(d.id)}/5</span>}
                                    {destBudget > 0 && (
                                        <span>💶 {destBudget.toFixed(0)} €{destPerPerson ? ` · ${destPerPerson} €/pers.` : ''}</span>
                                    )}
                                    {d.dates && <span>📅 {d.dates}</span>}
                                </div>
                                {d.proposedBy && (
                                    <p className="roadtrip-step-proposed">{t('details.proposedBy')} {d.proposedBy}</p>
                                )}
                            </div>
                        </div>

                        {/* Comparator links */}
                        <div className="no-print">
                            <TravelComparators destination={d} />
                        </div>

                        {/* Comments */}
                        <section className="comments-section">
                            <h2>{t('comments.title')}</h2>
                            <p className="average-rating">{t('comments.avgRating')} : {getAvg(d.id)} ⭐</p>

                            <div className="sort-options no-print">
                                <label>{t('comments.sort')} :</label>
                                <select value={cs.sort} onChange={e => updateComment(d.id, 'sort', e.target.value)}>
                                    <option value="date">{t('comments.sortByDate')}</option>
                                    <option value="rating">{t('comments.sortByRating')}</option>
                                </select>
                            </div>

                            <div className="comments-list">
                                {getSorted(d.id).map(comment => (
                                    <div key={comment.id} className="comment-card">
                                        <p className="comment-author"><strong>{comment.username}</strong></p>
                                        <p className="comment-text">{comment.text}</p>
                                        <p className="comment-rating">{t('comments.rating')} : {comment.rating}/5</p>
                                        <p className="comment-date">{new Date(comment.created_at).toLocaleString()}</p>
                                        {currentUser && currentUser.id === comment.user_id && (
                                            <button onClick={() => handleDeleteComment(d.id, comment.id)}>{t('comments.delete')}</button>
                                        )}
                                    </div>
                                ))}
                                {getSorted(d.id).length === 0 && (
                                    <p style={{ color: '#9ca3af', fontSize: '0.9rem' }}>{t('comments.noComments')}</p>
                                )}
                            </div>

                            <div className="add-comment no-print">
                                <textarea
                                    placeholder={t('comments.placeholder')}
                                    value={cs.newText}
                                    onChange={e => updateComment(d.id, 'newText', e.target.value)}
                                />
                                <select value={cs.rating} onChange={e => updateComment(d.id, 'rating', e.target.value)}>
                                    {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n}</option>)}
                                </select>
                                <button onClick={() => handleAddComment(d.id)}>{t('common.send')}</button>
                            </div>
                        </section>
                    </div>
                );
            })}

            {members.length > 0 && (
                <div className="roadtrip-members no-print">
                    <span className="roadtrip-members-label">{t('rt.travellers')} :</span>
                    {members.map((m, i) => (
                        <span key={i} className="roadtrip-member-tag">{m}</span>
                    ))}
                </div>
            )}
        </div>
    );
}
