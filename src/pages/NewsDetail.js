import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
// ✅ Import from api.js
import { getSingleNews, API_URL, getImageUrl } from '../api/api';
import ImageSlider from '../components/ImageSlider';
// ✅ Import ShareButtons component
import ShareButtons from '../components/ShareButtons';

function NewsDetail({ user }) {
    const { id } = useParams();
    const [news, setNews] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const viewCounted = useRef(false);

    useEffect(() => {
        const fetchNews = async () => {
            try {
                setLoading(true);
                const response = await getSingleNews(id);
                if (response.success) {
                    setNews(response.data);
                } else {
                    setError('News not found');
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchNews();
    }, [id]);

    // ✅ View counting
    useEffect(() => {
        if (!viewCounted.current && news) {
            viewCounted.current = true;
            
            const countView = async () => {
                try {
                    const token = localStorage.getItem('token');
                    await fetch(`${API_URL}/api/news/${id}/view`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            ...(token && { 'Authorization': `Bearer ${token}` })
                        }
                    });
                } catch (error) {
                    console.error('View counting error:', error);
                }
            };
            
            countView();
        }
    }, [news, id]);

    // ✅ Updated handleCommentSubmit with username and userId
    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!comment.trim()) return;
        if (!user) {
            alert('Please login to comment');
            return;
        }

        setSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/news/${id}/comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ 
                    text: comment.trim(),
                    username: user.username || user.name,
                    userId: user.id || user._id
                })
            });
            const data = await response.json();
            if (data.success) {
                setNews(prev => ({
                    ...prev,
                    comments: [...prev.comments, data.comment]
                }));
                setComment('');
            } else {
                alert(data.error || 'Failed to add comment');
            }
        } catch (error) {
            console.error('Comment error:', error);
            alert('Network error. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteComment = async (commentId) => {
        if (!window.confirm('Are you sure you want to delete this comment?')) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/news/${id}/comments/${commentId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setNews(prev => ({
                    ...prev,
                    comments: prev.comments.filter(c => c._id !== commentId)
                }));
            } else {
                alert(data.error || 'Failed to delete comment');
            }
        } catch (error) {
            console.error('Delete comment error:', error);
            alert('Network error. Please try again.');
        }
    };

    if (loading) return <div className="loading">Loading article...</div>;
    if (error) return <div className="error">Error: {error}</div>;
    if (!news) return <div className="error">Article not found</div>;

    return (
        <div className="news-detail">
            <Link to="/" className="back-button">← Back to News</Link>
            
            <article>
                <div className="article-header">
                    <span className="category">{news.category}</span>
                    <h1>{news.title}</h1>
                    <div className="article-meta">
                        <span>📝 {news.author}</span>
                        <span>•</span>
                        <span>📅 {new Date(news.publishedDate).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        })}</span>
                        <span>•</span>
                        <span>👁️ {news.views || 0} views</span>
                        <span>•</span>
                        <span>💬 {news.comments?.length || 0} comments</span>
                    </div>
                </div>

                {/* ✅ Share Buttons - Placed after header for better visibility */}
                <ShareButtons article={news} />

                {/* ✅ Uses imported getImageUrl */}
                {news.images && news.images.length > 0 && (
                    <ImageSlider images={news.images.map(img => getImageUrl(img))} />
                )}

                <div className="article-content">
                    <p className="article-summary">{news.summary}</p>
                    <div className="article-body">
                        {news.content.split('\n').map((paragraph, index) => (
                            <p key={index}>{paragraph}</p>
                        ))}
                    </div>
                </div>

                {news.tags && news.tags.length > 0 && (
                    <div className="article-tags">
                        <strong>Tags:</strong>
                        {news.tags.map((tag, index) => (
                            <span key={index} className="tag">#{tag}</span>
                        ))}
                    </div>
                )}

                {/* Comments Section */}
                <div className="comments-section">
                    <h3>💬 Comments ({news.comments?.length || 0})</h3>

                    {user ? (
                        <form onSubmit={handleCommentSubmit} className="comment-form">
                            <textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="Write a comment..."
                                rows="3"
                                maxLength="500"
                                required
                            />
                            <button type="submit" disabled={submitting}>
                                {submitting ? 'Posting...' : 'Post Comment'}
                            </button>
                        </form>
                    ) : (
                        <p className="login-to-comment">
                            <Link to="/login">Login</Link> to leave a comment
                        </p>
                    )}

                    <div className="comments-list">
                        {news.comments && news.comments.length > 0 ? (
                            [...news.comments].reverse().map((c) => (
                                <div key={c._id} className="comment-item">
                                    <div className="comment-header">
                                        <strong>{c.username}</strong>
                                        <span>{new Date(c.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <p>{c.text}</p>
                                    {(user && (c.user === user.id || user.role === 'admin' || user.role === 'super_admin')) && (
                                        <button 
                                            className="delete-comment"
                                            onClick={() => handleDeleteComment(c._id)}
                                        >
                                            Delete
                                        </button>
                                    )}
                                </div>
                            ))
                        ) : (
                            <p className="no-comments">No comments yet. Be the first!</p>
                        )}
                    </div>
                </div>
            </article>

            <style>{`
                .news-detail {
                    max-width: 900px;
                    margin: 0 auto;
                    padding: 20px;
                }

                .back-button {
                    display: inline-block;
                    margin-bottom: 30px;
                    color: #1a365d;
                    text-decoration: none;
                    font-weight: 600;
                    padding: 8px 16px;
                    border-radius: 6px;
                    background: #f0f4ff;
                    transition: background 0.2s;
                }

                .back-button:hover {
                    background: #e2e8f0;
                }

                article {
                    background: white;
                    border-radius: 12px;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                    overflow: hidden;
                    padding: 40px;
                }

                .article-header {
                    margin-bottom: 30px;
                }

                .article-header .category {
                    display: inline-block;
                    background: #1a365d;
                    color: white;
                    padding: 4px 14px;
                    border-radius: 20px;
                    font-size: 0.85rem;
                    margin-bottom: 15px;
                }

                .article-header h1 {
                    font-size: 2.2rem;
                    color: #1a202c;
                    margin-bottom: 15px;
                    line-height: 1.3;
                }

                .article-meta {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 8px;
                    color: #718096;
                    font-size: 0.9rem;
                }

                .article-content {
                    margin-top: 30px;
                }

                .article-summary {
                    font-size: 1.2rem;
                    color: #4a5568;
                    line-height: 1.8;
                    border-left: 4px solid #1a365d;
                    padding-left: 20px;
                    margin-bottom: 30px;
                    font-weight: 500;
                }

                .article-body p {
                    font-size: 1.05rem;
                    line-height: 1.9;
                    color: #2d3748;
                    margin-bottom: 20px;
                }

                .article-tags {
                    margin-top: 40px;
                    padding-top: 20px;
                    border-top: 1px solid #e2e8f0;
                }

                .article-tags strong {
                    color: #4a5568;
                    margin-right: 10px;
                }

                .tag {
                    display: inline-block;
                    background: #edf2f7;
                    color: #2d3748;
                    padding: 4px 12px;
                    border-radius: 20px;
                    font-size: 0.85rem;
                    margin: 0 5px 5px 0;
                }

                .comments-section {
                    margin-top: 40px;
                    padding-top: 30px;
                    border-top: 2px solid #edf2f7;
                }

                .comments-section h3 {
                    color: #1a365d;
                    margin-bottom: 20px;
                }

                .comment-form {
                    margin-bottom: 25px;
                }

                .comment-form textarea {
                    width: 100%;
                    padding: 12px;
                    border: 2px solid #e2e8f0;
                    border-radius: 8px;
                    font-size: 1rem;
                    resize: vertical;
                    font-family: inherit;
                    transition: border-color 0.3s;
                }

                .comment-form textarea:focus {
                    outline: none;
                    border-color: #2563eb;
                }

                .comment-form button {
                    margin-top: 10px;
                    padding: 10px 24px;
                    background: #2563eb;
                    color: white;
                    border: none;
                    border-radius: 8px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: background 0.3s;
                }

                .comment-form button:hover:not(:disabled) {
                    background: #1a365d;
                }

                .comment-form button:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }

                .login-to-comment {
                    color: #718096;
                    padding: 15px 0;
                }

                .login-to-comment a {
                    color: #2563eb;
                    text-decoration: none;
                    font-weight: 600;
                }

                .comments-list {
                    display: flex;
                    flex-direction: column;
                    gap: 15px;
                }

                .comment-item {
                    background: #f7fafc;
                    padding: 15px;
                    border-radius: 8px;
                    position: relative;
                }

                .comment-header {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 5px;
                }

                .comment-header strong {
                    color: #1a365d;
                }

                .comment-header span {
                    color: #a0aec0;
                    font-size: 0.8rem;
                }

                .comment-item p {
                    color: #2d3748;
                    line-height: 1.6;
                    margin: 0;
                }

                .delete-comment {
                    margin-top: 8px;
                    background: #fc8181;
                    color: white;
                    border: none;
                    padding: 4px 12px;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 0.75rem;
                }

                .delete-comment:hover {
                    background: #e53e3e;
                }

                .no-comments {
                    color: #a0aec0;
                    text-align: center;
                    padding: 20px;
                }

                @media (max-width: 768px) {
                    .news-detail {
                        padding: 10px;
                    }

                    article {
                        padding: 20px;
                    }

                    .article-header h1 {
                        font-size: 1.6rem;
                    }

                    .article-summary {
                        font-size: 1rem;
                    }

                    .article-body p {
                        font-size: 0.95rem;
                    }
                }
            `}</style>
        </div>
    );
}

export default NewsDetail;