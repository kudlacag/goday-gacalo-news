import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { adminLogin, adminAPI } from '../api/api';

const Admin = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [token, setToken] = useState('');
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
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleLogin = async (password) => {
        try {
            const response = await adminLogin({ password });
            if (response.success) {
                setToken(response.token);
                localStorage.setItem('token', response.token); // ✅ Save token
                setIsLoggedIn(true);
                setMessage('✅ Login successful!');
                setTimeout(() => setMessage(''), 3000);
            } else {
                setMessage('❌ ' + (response.error || 'Login failed'));
            }
        } catch (error) {
            setMessage('❌ Login error: ' + error.message);
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

        const form = new FormData();
        form.append('title', formData.title);
        form.append('category', formData.category);
        form.append('summary', formData.summary);
        form.append('content', formData.content);
        // ✅ Fix: Convert boolean to string
        form.append('featured', formData.featured ? 'true' : 'false');
        form.append('tags', formData.tags);
        
        images.forEach(image => {
            form.append('images', image);
        });

        // ✅ Debug: Log what we're sending
        console.log('📝 Sending form data:');
        console.log('- Title:', formData.title);
        console.log('- Category:', formData.category);
        console.log('- Summary:', formData.summary);
        console.log('- Content:', formData.content);
        console.log('- Featured:', formData.featured);
        console.log('- Tags:', formData.tags);
        console.log('- Images:', images.length);

        try {
            // ✅ Fix: Don't pass extra headers here
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
            } else {
                setMessage('❌ Error: ' + (response.error || 'Failed to publish'));
            }
        } catch (error) {
            console.error('Publish error:', error);
            setMessage('❌ Error: ' + error.message);
        }
        setLoading(false);
    };

    if (!isLoggedIn) {
        return <Login onLogin={handleLogin} message={message} />;
    }

    return (
        <div className="admin-panel">
            <h2>📝 Create News Article</h2>
            {message && <div className="message">{message}</div>}
            
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Title *</label>
                    <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
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
                        required
                    />
                    <small>{formData.summary.length}/200</small>
                </div>

                <div className="form-group">
                    <label>Content *</label>
                    <textarea
                        value={formData.content}
                        onChange={(e) => setFormData({...formData, content: e.target.value})}
                        rows="10"
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Tags (comma separated)</label>
                    <input
                        type="text"
                        value={formData.tags}
                        onChange={(e) => setFormData({...formData, tags: e.target.value})}
                        placeholder="e.g., breaking, politics, economy"
                    />
                </div>

                <div className="form-group">
                    <label>📸 Upload Multiple Images (Select up to 10)</label>
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

                <button type="submit" disabled={loading}>
                    {loading ? '⏳ Publishing...' : '📰 Publish News'}
                </button>
            </form>

            <style>{`
                .admin-panel {
                    max-width: 800px;
                    margin: 40px auto;
                    padding: 30px;
                    background: white;
                    border-radius: 12px;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                }
                .admin-panel h2 {
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
                    border: 1px solid #e2e8f0;
                    border-radius: 6px;
                    font-size: 16px;
                    transition: border-color 0.2s;
                }
                .form-group input:focus, 
                .form-group textarea:focus, 
                .form-group select:focus {
                    outline: none;
                    border-color: #1a365d;
                    box-shadow: 0 0 0 3px rgba(26, 54, 93, 0.1);
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

                button {
                    background: #1a365d;
                    color: white;
                    padding: 12px 30px;
                    border: none;
                    border-radius: 6px;
                    font-size: 16px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: background 0.2s;
                }
                button:hover:not(:disabled) {
                    background: #2a4a7f;
                }
                button:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }
                .message {
                    padding: 12px 15px;
                    border-radius: 6px;
                    margin-bottom: 20px;
                    font-weight: 500;
                    background: #f0f4ff;
                    color: #1a365d;
                    border: 1px solid #c3dafe;
                }
            `}</style>
        </div>
    );
};

const Login = ({ onLogin, message }) => {
    const [password, setPassword] = useState('');

    return (
        <div className="login-panel">
            <h2>🔐 Admin Login</h2>
            {message && <div className="message">{message}</div>}
            <form onSubmit={(e) => {
                e.preventDefault();
                onLogin(password);
            }}>
                <input
                    type="password"
                    placeholder="Enter admin password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <button type="submit">Login</button>
            </form>
            
            <div className="forgot-link">
                <Link to="/forgot-password">Forgot password?</Link>
            </div>

            <style>{`
                .login-panel {
                    max-width: 400px;
                    margin: 100px auto;
                    padding: 30px;
                    background: white;
                    border-radius: 12px;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                    text-align: center;
                }
                .login-panel h2 {
                    margin-bottom: 20px;
                    color: #1a365d;
                }
                .login-panel input {
                    width: 100%;
                    padding: 12px;
                    border: 1px solid #e2e8f0;
                    border-radius: 6px;
                    margin-bottom: 15px;
                    font-size: 16px;
                }
                .login-panel input:focus {
                    outline: none;
                    border-color: #1a365d;
                    box-shadow: 0 0 0 3px rgba(26, 54, 93, 0.1);
                }
                .login-panel button {
                    width: 100%;
                    padding: 12px;
                }
                .message {
                    padding: 10px;
                    border-radius: 6px;
                    margin-bottom: 15px;
                    background: #f0f4ff;
                    color: #1a365d;
                    border: 1px solid #c3dafe;
                }
                .forgot-link {
                    margin-top: 15px;
                }
                .forgot-link a {
                    color: #1a365d;
                    text-decoration: none;
                    font-size: 0.9rem;
                }
                .forgot-link a:hover {
                    text-decoration: underline;
                }
            `}</style>
        </div>
    );
};

export default Admin;