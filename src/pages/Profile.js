import React, { useState } from 'react';
// ✅ Import API_URL from api.js
import { API_URL } from '../api/api';

const Profile = ({ user, setUser }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: user?.name || '',
        username: user?.username || '',
        mobile: user?.mobile || '',
        age: user?.age || '',
        sex: user?.sex || 'Male'
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    if (!user) {
        return (
            <div className="profile-container">
                <p>Please login to view your profile.</p>
                <style>{`
                    .profile-container {
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        min-height: 60vh;
                        font-size: 1.2rem;
                        color: #718096;
                    }
                `}</style>
            </div>
        );
    }

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            const token = localStorage.getItem('token');
            
            // ✅ Use API_URL from api.js
            const response = await fetch(`${API_URL}/api/auth/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();
            
            if (data.success) {
                // Update the user state with new data
                setUser(data.user);
                setMessage('✅ Profile updated successfully!');
                setIsEditing(false);
            } else {
                setMessage('❌ ' + (data.error || 'Failed to update profile'));
            }
        } catch (error) {
            console.error('Profile update error:', error);
            setMessage('❌ Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Format date properly
    const formatDate = (dateString) => {
        if (!dateString) return 'Not available';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return 'Not available';
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch (e) {
            return 'Not available';
        }
    };

    return (
        <div className="profile-container">
            <div className="profile-card">
                <div className="profile-header">
                    <div className="profile-avatar">
                        {user.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <h2>{user.name || 'User'}</h2>
                    <p className="profile-role">
                        {user.role === 'super_admin' ? '👑 Super Admin' : 
                         user.role === 'admin' ? '🛡️ Admin' : '👤 User'}
                    </p>
                </div>

                {message && <div className={`profile-message ${message.includes('✅') ? 'success' : 'error'}`}>{message}</div>}

                <div className="profile-info">
                    <div className="info-item">
                        <span className="info-label">Username</span>
                        <span className="info-value">@{user.username || 'N/A'}</span>
                    </div>
                    <div className="info-item">
                        <span className="info-label">Full Name</span>
                        <span className="info-value">{user.name || 'N/A'}</span>
                    </div>
                    <div className="info-item">
                        <span className="info-label">Email</span>
                        <span className="info-value">{user.email || 'N/A'}</span>
                    </div>
                    <div className="info-item">
                        <span className="info-label">Mobile</span>
                        <span className="info-value">{user.mobile || 'N/A'}</span>
                    </div>
                    <div className="info-item">
                        <span className="info-label">Age</span>
                        <span className="info-value">{user.age || 'N/A'}</span>
                    </div>
                    <div className="info-item">
                        <span className="info-label">Sex</span>
                        <span className="info-value">{user.sex || 'N/A'}</span>
                    </div>
                    <div className="info-item">
                        <span className="info-label">Role</span>
                        <span className="info-value">
                            {user.role === 'super_admin' ? '👑 Super Admin' : 
                             user.role === 'admin' ? '🛡️ Admin' : 
                             '👤 User'}
                        </span>
                    </div>
                    <div className="info-item">
                        <span className="info-label">Member Since</span>
                        <span className="info-value">{formatDate(user.createdAt)}</span>
                    </div>
                    {user.lastLogin && (
                        <div className="info-item">
                            <span className="info-label">Last Login</span>
                            <span className="info-value">{formatDate(user.lastLogin)}</span>
                        </div>
                    )}
                </div>

                <div className="profile-stats">
                    <div className="stat-box">
                        <span className="stat-number">📝</span>
                        <span className="stat-label">Articles</span>
                    </div>
                    <div className="stat-box">
                        <span className="stat-number">💬</span>
                        <span className="stat-label">Comments</span>
                    </div>
                </div>

                <button 
                    className="edit-profile-btn"
                    onClick={() => {
                        setIsEditing(!isEditing);
                        if (!isEditing) {
                            // Reset form data to current user data when opening
                            setFormData({
                                name: user?.name || '',
                                username: user?.username || '',
                                mobile: user?.mobile || '',
                                age: user?.age || '',
                                sex: user?.sex || 'Male'
                            });
                        }
                    }}
                >
                    {isEditing ? 'Cancel' : '✏️ Edit Profile'}
                </button>

                {isEditing && (
                    <form onSubmit={handleSubmit} className="edit-form">
                        <div className="form-group">
                            <label>Full Name</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Username</label>
                            <input
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Mobile</label>
                            <input
                                type="tel"
                                name="mobile"
                                value={formData.mobile}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Age</label>
                                <input
                                    type="number"
                                    name="age"
                                    value={formData.age}
                                    onChange={handleChange}
                                    min="13"
                                    max="120"
                                />
                            </div>
                            <div className="form-group">
                                <label>Sex</label>
                                <select
                                    name="sex"
                                    value={formData.sex}
                                    onChange={handleChange}
                                >
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                        </div>
                        <button type="submit" disabled={loading} className="save-btn">
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </form>
                )}
            </div>

            <style>{`
                .profile-container {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    min-height: 80vh;
                    padding: 20px;
                    background: #f0f4ff;
                }

                .profile-card {
                    background: white;
                    padding: 40px;
                    border-radius: 16px;
                    box-shadow: 0 4px 20px rgba(37, 99, 235, 0.1);
                    max-width: 550px;
                    width: 100%;
                }

                .profile-header {
                    text-align: center;
                    margin-bottom: 30px;
                }

                .profile-avatar {
                    width: 80px;
                    height: 80px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #1a365d, #2563eb);
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 2rem;
                    font-weight: 700;
                    margin: 0 auto 15px;
                }

                .profile-header h2 {
                    color: #1a365d;
                    margin-bottom: 5px;
                }

                .profile-role {
                    color: #718096;
                    font-size: 0.9rem;
                }

                .profile-message {
                    padding: 10px;
                    border-radius: 8px;
                    margin-bottom: 20px;
                    text-align: center;
                }

                .profile-message.success {
                    background: #c6f6d5;
                    color: #276749;
                }

                .profile-message.error {
                    background: #fed7d7;
                    color: #c53030;
                }

                .profile-info {
                    margin-bottom: 25px;
                }

                .info-item {
                    display: flex;
                    justify-content: space-between;
                    padding: 10px 0;
                    border-bottom: 1px solid #edf2f7;
                }

                .info-item:last-child {
                    border-bottom: none;
                }

                .info-label {
                    color: #718096;
                    font-weight: 600;
                }

                .info-value {
                    color: #2d3748;
                    font-weight: 500;
                }

                .profile-stats {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 15px;
                    margin: 20px 0;
                }

                .stat-box {
                    background: #f7fafc;
                    padding: 15px;
                    border-radius: 10px;
                    text-align: center;
                }

                .stat-number {
                    display: block;
                    font-size: 1.8rem;
                    margin-bottom: 5px;
                }

                .stat-label {
                    color: #718096;
                    font-size: 0.85rem;
                }

                .edit-profile-btn {
                    width: 100%;
                    padding: 12px;
                    background: #2563eb;
                    color: white;
                    border: none;
                    border-radius: 8px;
                    font-size: 1rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: background 0.3s;
                    margin-top: 10px;
                }

                .edit-profile-btn:hover {
                    background: #1a365d;
                }

                .edit-form {
                    margin-top: 20px;
                    padding-top: 20px;
                    border-top: 2px solid #edf2f7;
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
                .form-group select {
                    width: 100%;
                    padding: 10px;
                    border: 2px solid #e2e8f0;
                    border-radius: 8px;
                    font-size: 1rem;
                    transition: border-color 0.3s;
                }

                .form-group input:focus,
                .form-group select:focus {
                    outline: none;
                    border-color: #2563eb;
                }

                .form-row {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 15px;
                }

                .save-btn {
                    width: 100%;
                    padding: 12px;
                    background: #48bb78;
                    color: white;
                    border: none;
                    border-radius: 8px;
                    font-size: 1rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: background 0.3s;
                }

                .save-btn:hover:not(:disabled) {
                    background: #38a169;
                }

                .save-btn:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }

                @media (max-width: 480px) {
                    .profile-card {
                        padding: 30px 20px;
                    }
                    .form-row {
                        grid-template-columns: 1fr;
                        gap: 0;
                    }
                }
            `}</style>
        </div>
    );
};

export default Profile;