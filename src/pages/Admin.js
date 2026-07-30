import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI, adminAPI } from '../api/api';

const Admin = ({ user, setUser, setIsLoggedIn }) => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [stats, setStats] = useState({
        totalNews: 0,
        totalUsers: 0,
        featuredNews: 0
    });
    const [formData, setFormData] = useState({
        title: '',
        category: 'Politics',
        summary: '',
        content: '',
        featured: false,
        tags: ''
    });
    const [images, setImages] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);
    const [message, setMessage] = useState('');

    // ✅ Check if user has access to dashboard
    const canAccessDashboard = user?.role === 'reporter' || user?.role === 'admin' || user?.role === 'super_admin';

    useEffect(() => {
        if (!user) {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }
            // If user exists but not loaded, redirect to login to fetch user
            navigate('/login');
            return;
        }

        if (!canAccessDashboard) {
            navigate('/');
            return;
        }

        fetchStats();
    }, [user]);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const response = await adminAPI.getStats();
            if (response.success) {
                setStats(response.data);
            }
        } catch (err) {
            console.error('Error fetching stats:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            setImages(files);
            const previews = files.map(file => URL.createObjectURL(file));
            setImagePreviews(previews);
        }
    };

    const removeImage = (index) => {
        const newImages = images.filter((_, i) => i !== index);
        const newPreviews = imagePreviews.filter((_, i) => i !== index);
        setImages(newImages);
        setImagePreviews(newPreviews);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setError('');

        const form = new FormData();
        form.append('title', formData.title);
        form.append('category', formData.category);
        form.append('summary', formData.summary);
        form.append('content', formData.content);
        form.append('featured', formData.featured ? 'true' : 'false');
        form.append('tags', formData.tags);
        
        images.forEach(image => {
            form.append('images', image);
        });

        try {
            const response = await adminAPI.createNews(form);
            
            if (response.success) {
                setMessage('✅ News published successfully with ' + images.length + ' images!');
                setFormData({
                    title: '',
                    category: 'Politics',
                    summary: '',
                    content: '',
                    featured: false,
                    tags: ''
                });
                setImages([]);
                setImagePreviews([]);
                document.getElementById('imageInput').value = '';
                fetchStats(); // Refresh stats
            } else {
                setError(response.error || 'Failed to publish');
            }
        } catch (err) {
            console.error('Publish error:', err);
            setError('Error publishing news: ' + err.message);
        }
        setLoading(false);
    };

    if (!user) {
        return (
            <div className="admin-container">
                <div className="container">
                    <h2>Please Login</h2>
                    <p>You need to be logged in to access the admin panel.</p>
                    <Link to="/login" className="btn-primary">Login</Link>
                </div>
            </div>
        );
    }

    if (!canAccessDashboard) {
        return (
            <div className="admin-container">
                <div className="container">
                    <h2>Access Denied</h2>
                    <p>You do not have permission to access the admin panel.</p>
                    <Link to="/" className="btn-primary">Return to Home</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-container">
            <div className="container">
                <div className="admin-header">
                    <div className="header-left">
                        <h2>📊 Dashboard</h2>
                        <p className="subtitle">
                            {user?.role === 'reporter' && '👤 Reporter - Create and manage your own articles.'}
                            {user?.role === 'admin' && '👤 Admin - Manage all articles, but only edit/delete your own.'}
                            {user?.role === 'super_admin' && '👑 Super Admin - Full access to everything.'}
                        </p>
                    </div>
                    <div className="header-right">
                        <span className={`role-badge ${user?.role}`}>{user?.role}</span>
                    </div>
                </div>

                {error && <div className="error-message">{error}</div>}
                {message && <div className="success-message">{message}</div>}

                {/* Stats Grid */}
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon">📰</div>
                        <div className="stat-content">
                            <h3>{stats.totalNews}</h3>
                            <p>Total Articles</p>
                            {user?.role === 'reporter' && <small>Your articles only</small>}
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon">⭐</div>
                        <div className="stat-content">
                            <h3>{stats.featuredNews}</h3>
                            <p>Featured Articles</p>
                        </div>
                    </div>

                    {(user?.role === 'admin' || user?.role === 'super_admin') && (
                        <div className="stat-card">
                            <div className="stat-icon">👥</div>
                            <div className="stat-content">
                                <h3>{stats.totalUsers}</h3>
                                <p>Total Users</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Quick Actions */}
                <div className="quick-actions">
                    <h3>Quick Actions</h3>
                    <div className="action-grid">
                        <Link to="/manage-news" className="action-card">
                            <div className="action-icon">✏️</div>
                            <h4>Manage News</h4>
                            <p>Create, edit, or delete articles</p>
                        </Link>

                        {(user?.role === 'admin' || user?.role === 'super_admin') && (
                            <Link to="/users" className="action-card">
                                <div className="action-icon">👥</div>
                                <h4>Manage Users</h4>
                                <p>View and manage user accounts</p>
                            </Link>
                        )}

                        <Link to="/" className="action-card">
                            <div className="action-icon">🏠</div>
                            <h4>Visit Site</h4>
                            <p>View the live news site</p>
                        </Link>
                    </div>
                </div>

                {/* Create News Form */}
                <div className="create-news-form">
                    <h3>📝 Create News Article</h3>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Title *</label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({...formData, title: e.target.value})}
                                placeholder="Enter news title"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Category *</label>
                            <select
                                value={formData.category}
                                onChange={(e) => setFormData({...formData, category: e.target.value})}
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
                            <label>Summary (max 200 chars) *</label>
                            <textarea
                                value={formData.summary}
                                onChange={(e) => setFormData({...formData, summary: e.target.value})}
                                maxLength="200"
                                rows="2"
                                placeholder="Brief summary of the news"
                                required
                            />
                            <small>{formData.summary.length}/200</small>
                        </div>

                        <div className="form-group">
                            <label>Content *</label>
                            <textarea
                                value={formData.content}
                                onChange={(e) => setFormData({...formData, content: e.target.value})}
                                rows="8"
                                placeholder="Full news content"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Tags (comma separated)</label>
                            <input
                                type="text"
                                value={formData.tags}
                                onChange={(e) => setFormData({...formData, tags: e.target.value})}
                                placeholder="e.g., politics, economy, elections"
                            />
                        </div>

                        <div className="form-group">
                            <label>📸 Upload Images (Select up to 10)</label>
                            <input
                                id="imageInput"
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleImageChange}
                            />
                            <small>Hold Ctrl/Cmd to select multiple images</small>
                            
                            {imagePreviews.length > 0 && (
                                <div className="image-preview-grid">
                                    {imagePreviews.map((preview, index) => (
                                        <div key={index} className="image-preview-item">
                                            <img src={preview} alt={`Preview ${index + 1}`} />
                                            <button 
                                                type="button" 
                                                className="remove-image"
                                                onClick={() => removeImage(index)}
                                            >
                                                ✕
                                            </button>
                                            <span className="image-number">{index + 1}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="form-group checkbox">
                            <label>
                                <input
                                    type="checkbox"
                                    checked={formData.featured}
                                    onChange={(e) => setFormData({...formData, featured: e.target.checked})}
                                />
                                ⭐ Featured Story
                            </label>
                        </div>

                        <button type="submit" disabled={loading} className="btn-primary">
                            {loading ? '⏳ Publishing...' : '📰 Publish News'}
                        </button>
                    </form>
                </div>

                {/* Role Info */}
                <div className="role-info">
                    <h4>Your Permissions</h4>
                    <ul>
                        {user?.role === 'reporter' && (
                            <>
                                <li>✅ Create and publish news articles</li>
                                <li>✅ Edit and delete ONLY your own articles</li>
                                <li>✅ See ONLY your own articles in Manage News</li>
                                <li>❌ Cannot manage users</li>
                            </>
                        )}
                        {user?.role === 'admin' && (
                            <>
                                <li>✅ Create and publish news articles</li>
                                <li>✅ Edit and delete ONLY your own articles</li>
                                <li>✅ See ALL articles in Manage News</li>
                                <li>✅ Manage users (view, add, update roles)</li>
                                <li>❌ Cannot delete the last super_admin</li>
                            </>
                        )}
                        {user?.role === 'super_admin' && (
                            <>
                                <li>✅ Create, edit, and delete ANY article</li>
                                <li>✅ See ALL articles in Manage News</li>
                                <li>✅ Full user management (create, update roles, delete)</li>
                                <li>✅ Complete system control</li>
                            </>
                        )}
                    </ul>
                </div>
            </div>

            <style>{`
                .admin-container {
                    padding: 20px;
                    background: #f0f4ff;
                    min-height: 100vh;
                }

                .container {
                    max-width: 1200px;
                    margin: 0 auto;
                }

                .admin-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 20px;
                    flex-wrap: wrap;
                }

                .header-left h2 {
                    color: #1a365d;
                    margin: 0;
                    font-size: 1.8rem;
                }

                .subtitle {
                    color: #718096;
                    margin: 5px 0 0 0;
                    font-size: 0.9rem;
                }

                .header-right {
                    margin-top: 5px;
                }

                .role-badge {
                    display: inline-block;
                    padding: 4px 16px;
                    border-radius: 20px;
                    font-size: 0.8rem;
                    font-weight: 600;
                    text-transform: uppercase;
                }

                .role-badge.reporter {
                    background: #ebf8ff;
                    color: #2b6cb0;
                }

                .role-badge.admin {
                    background: #fefcbf;
                    color: #744210;
                }

                .role-badge.super_admin {
                    background: #c6f6d5;
                    color: #22543d;
                }

                .error-message {
                    background: #fed7d7;
                    color: #c53030;
                    padding: 12px;
                    border-radius: 8px;
                    margin-bottom: 20px;
                }

                .success-message {
                    background: #c6f6d5;
                    color: #276749;
                    padding: 12px;
                    border-radius: 8px;
                    margin-bottom: 20px;
                }

                .btn-primary {
                    display: inline-block;
                    padding: 12px 24px;
                    background: linear-gradient(135deg, #1a365d, #2563eb);
                    color: white;
                    border: none;
                    border-radius: 8px;
                    font-weight: 600;
                    cursor: pointer;
                    text-decoration: none;
                    transition: opacity 0.3s;
                }

                .btn-primary:hover:not(:disabled) {
                    opacity: 0.9;
                }

                .btn-primary:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }

                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 20px;
                    margin-bottom: 30px;
                }

                .stat-card {
                    background: white;
                    padding: 20px;
                    border-radius: 12px;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                    display: flex;
                    align-items: center;
                    gap: 16px;
                }

                .stat-icon {
                    font-size: 2.5rem;
                }

                .stat-content h3 {
                    font-size: 1.8rem;
                    margin: 0;
                    color: #1a365d;
                }

                .stat-content p {
                    margin: 0;
                    color: #718096;
                    font-size: 0.9rem;
                }

                .stat-content small {
                    color: #a0aec0;
                    font-size: 0.7rem;
                }

                .quick-actions {
                    background: white;
                    padding: 30px;
                    border-radius: 12px;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                    margin-bottom: 30px;
                }

                .quick-actions h3 {
                    margin-bottom: 20px;
                    color: #1a365d;
                }

                .action-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 16px;
                }

                .action-card {
                    background: #f7fafc;
                    padding: 20px;
                    border-radius: 8px;
                    text-decoration: none;
                    color: #1a365d;
                    transition: all 0.3s;
                    text-align: center;
                }

                .action-card:hover {
                    background: #ebf8ff;
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(0,0,0,0.08);
                }

                .action-icon {
                    font-size: 2rem;
                    margin-bottom: 8px;
                }

                .action-card h4 {
                    margin: 0 0 4px 0;
                    font-size: 1rem;
                }

                .action-card p {
                    margin: 0;
                    color: #718096;
                    font-size: 0.8rem;
                }

                .create-news-form {
                    background: white;
                    padding: 30px;
                    border-radius: 12px;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                    margin-bottom: 30px;
                }

                .create-news-form h3 {
                    margin-bottom: 20px;
                    color: #1a365d;
                }

                .form-group {
                    margin-bottom: 20px;
                }

                .form-group label {
                    display: block;
                    margin-bottom: 5px;
                    font-weight: 600;
                    color: #2d3748;
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

                .form-group textarea {
                    resize: vertical;
                    min-height: 100px;
                }

                .form-group small {
                    display: block;
                    margin-top: 5px;
                    color: #718096;
                    font-size: 0.85rem;
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

                .image-preview-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
                    gap: 10px;
                    margin-top: 10px;
                }

                .image-preview-item {
                    position: relative;
                    border: 2px solid #e2e8f0;
                    border-radius: 8px;
                    overflow: hidden;
                    aspect-ratio: 1;
                }

                .image-preview-item img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                .image-preview-item .remove-image {
                    position: absolute;
                    top: 5px;
                    right: 5px;
                    background: rgba(229, 62, 62, 0.9);
                    color: white;
                    border: none;
                    border-radius: 50%;
                    width: 25px;
                    height: 25px;
                    cursor: pointer;
                    font-size: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: background 0.2s;
                }

                .image-preview-item .remove-image:hover {
                    background: #e53e3e;
                }

                .image-preview-item .image-number {
                    position: absolute;
                    bottom: 5px;
                    left: 5px;
                    background: rgba(0, 0, 0, 0.7);
                    color: white;
                    padding: 2px 8px;
                    border-radius: 12px;
                    font-size: 0.7rem;
                }

                .role-info {
                    background: white;
                    padding: 20px;
                    border-radius: 12px;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                }

                .role-info h4 {
                    margin-bottom: 12px;
                    color: #1a365d;
                }

                .role-info ul {
                    list-style: none;
                    padding: 0;
                    margin: 0;
                }

                .role-info ul li {
                    padding: 4px 0;
                    font-size: 0.9rem;
                    color: #4a5568;
                }

                @media (max-width: 768px) {
                    .stats-grid {
                        grid-template-columns: 1fr;
                    }
                    
                    .action-grid {
                        grid-template-columns: 1fr;
                    }

                    .admin-header {
                        flex-direction: column;
                    }

                    .header-right {
                        margin-top: 10px;
                    }
                }
            `}</style>
        </div>
    );
};

export default Admin;