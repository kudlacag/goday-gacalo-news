import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../api/api';

const ManageNews = () => {
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [editingNews, setEditingNews] = useState(null);

    useEffect(() => {
        fetchNews();
    }, []);

    const fetchNews = async () => {
        try {
            setLoading(true);
            const response = await adminAPI.getNews();
            if (response.success) {
                setNews(response.data);
            } else {
                setMessage('❌ Failed to load news');
            }
        } catch (error) {
            console.error('Error fetching news:', error);
            setMessage('❌ Error loading news');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id, title) => {
        if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;
        
        try {
            const response = await adminAPI.deleteNews(id);
            if (response.success) {
                setMessage('✅ News deleted successfully!');
                fetchNews();
                setTimeout(() => setMessage(''), 3000);
            } else {
                setMessage('❌ ' + (response.error || 'Failed to delete'));
            }
        } catch (error) {
            console.error('Delete error:', error);
            setMessage('❌ Error deleting news');
        }
    };

    const handleEdit = (newsItem) => {
        setEditingNews(newsItem);
        // Scroll to edit form
        document.getElementById('edit-form').scrollIntoView({ behavior: 'smooth' });
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            const response = await adminAPI.updateNews(editingNews._id, {
                title: editingNews.title,
                category: editingNews.category,
                summary: editingNews.summary,
                content: editingNews.content,
                featured: editingNews.featured,
                tags: editingNews.tags ? editingNews.tags.join(', ') : ''
            });

            if (response.success) {
                setMessage('✅ News updated successfully!');
                setEditingNews(null);
                fetchNews();
                setTimeout(() => setMessage(''), 3000);
            } else {
                setMessage('❌ ' + (response.error || 'Failed to update'));
            }
        } catch (error) {
            console.error('Update error:', error);
            setMessage('❌ Error updating news');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    if (loading && news.length === 0) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Loading news...</p>
                <style>{`
                    .loading-container {
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        min-height: 60vh;
                    }
                    .spinner {
                        width: 40px;
                        height: 40px;
                        border: 4px solid #e2e8f0;
                        border-top: 4px solid #2563eb;
                        border-radius: 50%;
                        animation: spin 1s linear infinite;
                    }
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                `}</style>
            </div>
        );
    }

    return (
        <div className="manage-news">
            <div className="manage-header">
                <h2>📰 Manage News Articles</h2>
                <Link to="/admin" className="create-btn">➕ Create New</Link>
            </div>

            {message && <div className={`message ${message.includes('✅') ? 'success' : 'error'}`}>{message}</div>}

            {/* Edit Form */}
            {editingNews && (
                <div id="edit-form" className="edit-form">
                    <h3>✏️ Edit Article</h3>
                    <form onSubmit={handleEditSubmit}>
                        <div className="form-group">
                            <label>Title *</label>
                            <input
                                type="text"
                                value={editingNews.title || ''}
                                onChange={(e) => setEditingNews({...editingNews, title: e.target.value})}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Category *</label>
                            <select
                                value={editingNews.category || 'Politics'}
                                onChange={(e) => setEditingNews({...editingNews, category: e.target.value})}
                            >
                                <option value="Politics">Politics</option>
                                <option value="Business">Business</option>
                                <option value="Sports">Sports</option>
                                <option value="Entertainment">Entertainment</option>
                                <option value="Health">Health</option>
                                <option value="Tech">Tech</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Summary *</label>
                            <textarea
                                value={editingNews.summary || ''}
                                onChange={(e) => setEditingNews({...editingNews, summary: e.target.value})}
                                rows="2"
                                maxLength="200"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Content *</label>
                            <textarea
                                value={editingNews.content || ''}
                                onChange={(e) => setEditingNews({...editingNews, content: e.target.value})}
                                rows="6"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Tags (comma separated)</label>
                            <input
                                type="text"
                                value={editingNews.tags ? editingNews.tags.join(', ') : ''}
                                onChange={(e) => setEditingNews({...editingNews, tags: e.target.value.split(',').map(t => t.trim())})}
                                placeholder="e.g., breaking, politics, economy"
                            />
                        </div>
                        <div className="form-group checkbox">
                            <label>
                                <input
                                    type="checkbox"
                                    checked={editingNews.featured || false}
                                    onChange={(e) => setEditingNews({...editingNews, featured: e.target.checked})}
                                />
                                ⭐ Featured Story
                            </label>
                        </div>
                        <div className="edit-actions">
                            <button type="submit" className="save-btn" disabled={loading}>
                                {loading ? 'Saving...' : '💾 Save Changes'}
                            </button>
                            <button type="button" className="cancel-btn" onClick={() => setEditingNews(null)}>
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* News List */}
            <div className="news-list">
                {news.length === 0 ? (
                    <div className="empty-state">
                        <p>No news articles found. Create your first article!</p>
                    </div>
                ) : (
                    <table className="news-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Title</th>
                                <th>Category</th>
                                <th>Author</th>
                                <th>Date</th>
                                <th>Featured</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {news.map((item, index) => (
                                <tr key={item._id}>
                                    <td>{index + 1}</td>
                                    <td>
                                        <div className="news-title">
                                            <Link to={`/news/${item._id}`} target="_blank">
                                                {item.title}
                                            </Link>
                                            {item.images && item.images.length > 0 && (
                                                <span className="image-indicator">🖼️</span>
                                            )}
                                        </div>
                                    </td>
                                    <td><span className="category-badge">{item.category}</span></td>
                                    <td>{item.author || 'Admin'}</td>
                                    <td>{formatDate(item.publishedDate)}</td>
                                    <td>
                                        {item.featured ? (
                                            <span className="featured-badge">⭐ Featured</span>
                                        ) : (
                                            <span className="not-featured">—</span>
                                        )}
                                    </td>
                                    <td>
                                        <div className="action-buttons">
                                            <button 
                                                className="edit-btn"
                                                onClick={() => handleEdit(item)}
                                            >
                                                ✏️ Edit
                                            </button>
                                            <button 
                                                className="delete-btn"
                                                onClick={() => handleDelete(item._id, item.title)}
                                            >
                                                🗑️ Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            <style>{`
                .manage-news {
                    max-width: 1200px;
                    margin: 40px auto;
                    padding: 20px;
                    background: white;
                    border-radius: 12px;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                }

                .manage-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 20px;
                }

                .manage-header h2 {
                    color: #1a365d;
                }

                .create-btn {
                    background: #2563eb;
                    color: white;
                    padding: 10px 20px;
                    border: none;
                    border-radius: 6px;
                    text-decoration: none;
                    font-weight: 600;
                    transition: background 0.3s;
                }

                .create-btn:hover {
                    background: #1a365d;
                    color: white;
                }

                .message {
                    padding: 12px 15px;
                    border-radius: 6px;
                    margin-bottom: 20px;
                    font-weight: 500;
                }

                .message.success {
                    background: #c6f6d5;
                    color: #276749;
                    border: 1px solid #9ae6b4;
                }

                .message.error {
                    background: #fed7d7;
                    color: #c53030;
                    border: 1px solid #feb2b2;
                }

                .edit-form {
                    background: #f7fafc;
                    padding: 25px;
                    border-radius: 8px;
                    margin-bottom: 30px;
                    border: 2px solid #e2e8f0;
                }

                .edit-form h3 {
                    color: #1a365d;
                    margin-bottom: 15px;
                }

                .form-group {
                    margin-bottom: 15px;
                }

                .form-group label {
                    display: block;
                    font-weight: 600;
                    color: #2d3748;
                    margin-bottom: 5px;
                    font-size: 0.9rem;
                }

                .form-group input,
                .form-group textarea,
                .form-group select {
                    width: 100%;
                    padding: 10px;
                    border: 2px solid #e2e8f0;
                    border-radius: 8px;
                    font-size: 1rem;
                    transition: border-color 0.3s;
                }

                .form-group input:focus,
                .form-group textarea:focus,
                .form-group select:focus {
                    outline: none;
                    border-color: #2563eb;
                }

                .form-group.checkbox label {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    cursor: pointer;
                }

                .form-group.checkbox input {
                    width: auto;
                }

                .edit-actions {
                    display: flex;
                    gap: 10px;
                    margin-top: 10px;
                }

                .save-btn {
                    background: #38a169;
                    color: white;
                    padding: 10px 24px;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                    font-weight: 600;
                    transition: background 0.3s;
                }

                .save-btn:hover:not(:disabled) {
                    background: #2f855a;
                }

                .save-btn:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }

                .cancel-btn {
                    background: #718096;
                    color: white;
                    padding: 10px 24px;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                    font-weight: 600;
                    transition: background 0.3s;
                }

                .cancel-btn:hover {
                    background: #4a5568;
                }

                .news-list {
                    overflow-x: auto;
                }

                .news-table {
                    width: 100%;
                    border-collapse: collapse;
                }

                .news-table th {
                    background: #f7fafc;
                    padding: 12px;
                    text-align: left;
                    font-weight: 600;
                    color: #2d3748;
                    border-bottom: 2px solid #e2e8f0;
                }

                .news-table td {
                    padding: 12px;
                    border-bottom: 1px solid #e2e8f0;
                }

                .news-table tr:hover {
                    background: #f7fafc;
                }

                .news-title {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .news-title a {
                    color: #1a365d;
                    text-decoration: none;
                    font-weight: 500;
                }

                .news-title a:hover {
                    color: #2563eb;
                    text-decoration: underline;
                }

                .image-indicator {
                    font-size: 0.8rem;
                }

                .category-badge {
                    display: inline-block;
                    background: #e2e8f0;
                    padding: 2px 10px;
                    border-radius: 12px;
                    font-size: 0.8rem;
                    color: #2d3748;
                }

                .featured-badge {
                    display: inline-block;
                    background: #f6e05e;
                    padding: 2px 10px;
                    border-radius: 12px;
                    font-size: 0.8rem;
                    color: #744210;
                }

                .not-featured {
                    color: #a0aec0;
                }

                .action-buttons {
                    display: flex;
                    gap: 8px;
                }

                .edit-btn {
                    background: #4299e1;
                    color: white;
                    border: none;
                    padding: 6px 12px;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 0.85rem;
                    transition: background 0.3s;
                }

                .edit-btn:hover {
                    background: #3182ce;
                }

                .delete-btn {
                    background: #fc8181;
                    color: white;
                    border: none;
                    padding: 6px 12px;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 0.85rem;
                    transition: background 0.3s;
                }

                .delete-btn:hover {
                    background: #e53e3e;
                }

                .empty-state {
                    text-align: center;
                    padding: 60px 20px;
                    color: #718096;
                }

                @media (max-width: 768px) {
                    .manage-news {
                        padding: 10px;
                    }
                    .news-table {
                        font-size: 0.85rem;
                    }
                    .action-buttons {
                        flex-direction: column;
                    }
                }
            `}</style>
        </div>
    );
};

export default ManageNews;