import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../api/api';

const ManageNews = ({ user }) => {
    const navigate = useNavigate();
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [editingNews, setEditingNews] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        category: 'Politics',
        summary: '',
        content: '',
        featured: false,
        tags: '',
        images: []
    });
    const [imageFiles, setImageFiles] = useState([]);

    // ✅ Check if user has permission
    const canManageNews = user?.role === 'reporter' || user?.role === 'admin' || user?.role === 'super_admin';

    useEffect(() => {
        if (!canManageNews) {
            navigate('/');
            return;
        }
        fetchNews();
    }, [user]);

    const fetchNews = async () => {
        try {
            setLoading(true);
            const response = await adminAPI.getNews();
            if (response.success) {
                setNews(response.data);
            } else {
                setError('Failed to fetch news');
            }
        } catch (err) {
            console.error('Error fetching news:', err);
            setError('Error loading news');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        setImageFiles(files);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!formData.title || !formData.category || !formData.summary || !formData.content) {
            setError('Please fill in all required fields');
            return;
        }

        try {
            const form = new FormData();
            form.append('title', formData.title);
            form.append('category', formData.category);
            form.append('summary', formData.summary);
            form.append('content', formData.content);
            form.append('featured', formData.featured);
            form.append('tags', formData.tags);
            
            imageFiles.forEach(file => {
                form.append('images', file);
            });

            let response;
            if (editingNews) {
                response = await adminAPI.updateNews(editingNews._id, form);
            } else {
                response = await adminAPI.createNews(form);
            }

            if (response.success) {
                setEditingNews(null);
                setFormData({
                    title: '',
                    category: 'Politics',
                    summary: '',
                    content: '',
                    featured: false,
                    tags: '',
                    images: []
                });
                setImageFiles([]);
                fetchNews();
            } else {
                setError(response.error || 'Failed to save news');
            }
        } catch (err) {
            console.error('Error saving news:', err);
            setError('Error saving news');
        }
    };

    const handleEdit = (newsItem) => {
        setEditingNews(newsItem);
        setFormData({
            title: newsItem.title,
            category: newsItem.category,
            summary: newsItem.summary,
            content: newsItem.content,
            featured: newsItem.featured || false,
            tags: newsItem.tags ? newsItem.tags.join(', ') : '',
            images: []
        });
        setImageFiles([]);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this news?')) return;

        try {
            const response = await adminAPI.deleteNews(id);
            if (response.success) {
                fetchNews();
            } else {
                setError(response.error || 'Failed to delete news');
            }
        } catch (err) {
            console.error('Error deleting news:', err);
            setError('Error deleting news');
        }
    };

    // ✅ Check if user can edit/delete a specific article
    const canEditDelete = (newsItem) => {
        // Super Admin can edit/delete anything
        if (user?.role === 'super_admin') return true;
        // Admin and Reporter can only edit/delete their own articles
        if (user?.role === 'admin' || user?.role === 'reporter') {
            return newsItem.authorId?._id === user?.id || newsItem.authorId === user?.id;
        }
        return false;
    };

    // ✅ Check if user can see all articles or only their own
    const canSeeAllArticles = user?.role === 'admin' || user?.role === 'super_admin';

    if (!canManageNews) {
        return (
            <div className="container">
                <h2>Access Denied</h2>
                <p>You do not have permission to manage news.</p>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="container">
                <h2>Loading...</h2>
            </div>
        );
    }

    return (
        <div className="manage-news-container">
            <div className="container">
                <h2>📰 Manage News</h2>
                <p className="subtitle">
                    {user?.role === 'reporter' ? 'You can only see and manage your own articles.' :
                     user?.role === 'admin' ? 'You can see all articles but only edit/delete your own.' :
                     'You have full access to all articles.'}
                </p>

                {error && <div className="error-message">{error}</div>}

                {/* News Form */}
                <div className="news-form">
                    <h3>{editingNews ? '✏️ Edit News' : '✏️ Create News'}</h3>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Title *</label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleInputChange}
                                placeholder="Enter news title"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Category *</label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleInputChange}
                                required
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
                                name="summary"
                                value={formData.summary}
                                onChange={handleInputChange}
                                placeholder="Brief summary (max 200 characters)"
                                maxLength="200"
                                rows="2"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Content *</label>
                            <textarea
                                name="content"
                                value={formData.content}
                                onChange={handleInputChange}
                                placeholder="Full news content"
                                rows="8"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Tags (comma separated)</label>
                            <input
                                type="text"
                                name="tags"
                                value={formData.tags}
                                onChange={handleInputChange}
                                placeholder="e.g. politics, economy, elections"
                            />
                        </div>

                        <div className="form-group">
                            <label>Images</label>
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleImageChange}
                            />
                            {imageFiles.length > 0 && (
                                <p>{imageFiles.length} image(s) selected</p>
                            )}
                        </div>

                        <div className="form-group checkbox">
                            <label>
                                <input
                                    type="checkbox"
                                    name="featured"
                                    checked={formData.featured}
                                    onChange={handleInputChange}
                                />
                                Featured News
                            </label>
                        </div>

                        <div className="form-actions">
                            <button type="submit" className="btn-primary">
                                {editingNews ? 'Update News' : 'Create News'}
                            </button>
                            {editingNews && (
                                <button
                                    type="button"
                                    className="btn-secondary"
                                    onClick={() => {
                                        setEditingNews(null);
                                        setFormData({
                                            title: '',
                                            category: 'Politics',
                                            summary: '',
                                            content: '',
                                            featured: false,
                                            tags: '',
                                            images: []
                                        });
                                        setImageFiles([]);
                                    }}
                                >
                                    Cancel
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                {/* News List */}
                <div className="news-list">
                    <h3>
                        {canSeeAllArticles ? '📋 All News Articles' : '📋 My Articles'}
                        <span className="badge">
                            {news.length} article{news.length !== 1 ? 's' : ''}
                        </span>
                    </h3>

                    {news.length === 0 ? (
                        <p>No news articles found.</p>
                    ) : (
                        <div className="news-grid">
                            {news.map((item) => (
                                <div key={item._id} className="news-card">
                                    <div className="news-header">
                                        <h4>{item.title}</h4>
                                        <span className="category-badge">{item.category}</span>
                                    </div>
                                    <p className="news-summary">{item.summary}</p>
                                    <div className="news-meta">
                                        <span>By: {item.author}</span>
                                        <span>{new Date(item.publishedDate).toLocaleDateString()}</span>
                                    </div>
                                    <div className="news-actions">
                                        {canEditDelete(item) && (
                                            <>
                                                <button
                                                    className="btn-edit"
                                                    onClick={() => handleEdit(item)}
                                                >
                                                    ✏️ Edit
                                                </button>
                                                <button
                                                    className="btn-delete"
                                                    onClick={() => handleDelete(item._id)}
                                                >
                                                    🗑️ Delete
                                                </button>
                                            </>
                                        )}
                                        {!canEditDelete(item) && (
                                            <span className="read-only-badge">🔒 Read Only</span>
                                        )}
                                        {item.featured && (
                                            <span className="featured-badge">⭐ Featured</span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                .manage-news-container {
                    padding: 20px;
                    background: #f0f4ff;
                    min-height: 100vh;
                }

                .container {
                    max-width: 1200px;
                    margin: 0 auto;
                }

                .subtitle {
                    color: #718096;
                    margin-bottom: 20px;
                    font-size: 0.9rem;
                }

                .error-message {
                    background: #fed7d7;
                    color: #c53030;
                    padding: 12px;
                    border-radius: 8px;
                    margin-bottom: 20px;
                }

                .news-form {
                    background: white;
                    padding: 30px;
                    border-radius: 12px;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                    margin-bottom: 30px;
                }

                .news-form h3 {
                    margin-bottom: 20px;
                    color: #1a365d;
                }

                .form-group {
                    margin-bottom: 16px;
                }

                .form-group label {
                    display: block;
                    font-weight: 600;
                    margin-bottom: 5px;
                    color: #2d3748;
                }

                .form-group input,
                .form-group select,
                .form-group textarea {
                    width: 100%;
                    padding: 10px;
                    border: 2px solid #e2e8f0;
                    border-radius: 8px;
                    font-size: 1rem;
                    transition: border-color 0.3s;
                }

                .form-group input:focus,
                .form-group select:focus,
                .form-group textarea:focus {
                    outline: none;
                    border-color: #2563eb;
                }

                .form-group.checkbox {
                    display: flex;
                    align-items: center;
                }

                .form-group.checkbox label {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    cursor: pointer;
                }

                .form-group.checkbox input {
                    width: auto;
                }

                .form-actions {
                    display: flex;
                    gap: 10px;
                    margin-top: 10px;
                }

                .btn-primary {
                    padding: 12px 24px;
                    background: linear-gradient(135deg, #1a365d, #2563eb);
                    color: white;
                    border: none;
                    border-radius: 8px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: opacity 0.3s;
                }

                .btn-primary:hover {
                    opacity: 0.9;
                }

                .btn-secondary {
                    padding: 12px 24px;
                    background: #e2e8f0;
                    color: #2d3748;
                    border: none;
                    border-radius: 8px;
                    font-weight: 600;
                    cursor: pointer;
                }

                .btn-secondary:hover {
                    background: #cbd5e0;
                }

                .news-list {
                    background: white;
                    padding: 30px;
                    border-radius: 12px;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                }

                .news-list h3 {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 20px;
                    color: #1a365d;
                }

                .badge {
                    background: #e2e8f0;
                    padding: 4px 12px;
                    border-radius: 20px;
                    font-size: 0.8rem;
                    font-weight: 600;
                }

                .news-grid {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }

                .news-card {
                    border: 1px solid #e2e8f0;
                    padding: 16px;
                    border-radius: 8px;
                    transition: box-shadow 0.3s;
                }

                .news-card:hover {
                    box-shadow: 0 4px 12px rgba(0,0,0,0.08);
                }

                .news-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 8px;
                }

                .news-header h4 {
                    color: #1a365d;
                    font-size: 1.1rem;
                    margin: 0;
                    flex: 1;
                }

                .category-badge {
                    background: #ebf8ff;
                    color: #2b6cb0;
                    padding: 2px 10px;
                    border-radius: 12px;
                    font-size: 0.75rem;
                    font-weight: 600;
                    white-space: nowrap;
                    margin-left: 10px;
                }

                .news-summary {
                    color: #4a5568;
                    margin-bottom: 8px;
                    font-size: 0.9rem;
                }

                .news-meta {
                    display: flex;
                    gap: 16px;
                    color: #718096;
                    font-size: 0.8rem;
                    margin-bottom: 10px;
                }

                .news-actions {
                    display: flex;
                    gap: 8px;
                    flex-wrap: wrap;
                    align-items: center;
                }

                .btn-edit {
                    padding: 6px 14px;
                    background: #ebf8ff;
                    color: #2b6cb0;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 0.8rem;
                    transition: background 0.3s;
                }

                .btn-edit:hover {
                    background: #bee3f8;
                }

                .btn-delete {
                    padding: 6px 14px;
                    background: #fff5f5;
                    color: #e53e3e;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 0.8rem;
                    transition: background 0.3s;
                }

                .btn-delete:hover {
                    background: #fed7d7;
                }

                .read-only-badge {
                    background: #e2e8f0;
                    color: #4a5568;
                    padding: 4px 10px;
                    border-radius: 12px;
                    font-size: 0.75rem;
                    font-weight: 600;
                }

                .featured-badge {
                    background: #f6e05e;
                    color: #744210;
                    padding: 4px 10px;
                    border-radius: 12px;
                    font-size: 0.75rem;
                    font-weight: 600;
                }

                @media (max-width: 768px) {
                    .news-header {
                        flex-direction: column;
                        gap: 8px;
                    }
                    
                    .form-actions {
                        flex-direction: column;
                    }
                    
                    .btn-primary,
                    .btn-secondary {
                        width: 100%;
                    }
                }
            `}</style>
        </div>
    );
};

export default ManageNews;