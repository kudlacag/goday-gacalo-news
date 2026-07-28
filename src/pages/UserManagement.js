import React, { useState, useEffect } from 'react';
import { adminAPI } from '../api/api';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [editingUser, setEditingUser] = useState(null);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [newUser, setNewUser] = useState({
        name: '',
        username: '',
        email: '',
        password: '',
        mobile: '',
        age: '',
        sex: 'Male',
        role: 'user'
    });

    const roles = ['user', 'reporter', 'admin', 'super_admin'];

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await adminAPI.getUsers();
            if (response.success) {
                setUsers(response.data);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
            setMessage('❌ Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    const handleRoleChange = async (userId, newRole) => {
        try {
            const response = await adminAPI.updateUserRole(userId, newRole);
            if (response.success) {
                setMessage(`✅ User role updated to ${newRole}`);
                fetchUsers();
                setTimeout(() => setMessage(''), 3000);
            } else {
                setMessage('❌ ' + (response.error || 'Failed to update role'));
            }
        } catch (error) {
            console.error('Error updating role:', error);
            setMessage('❌ Error updating role');
        }
    };

    const handleDeleteUser = async (userId, userName) => {
        if (!window.confirm(`Are you sure you want to delete ${userName}?`)) return;
        
        try {
            const response = await adminAPI.deleteUser(userId);
            if (response.success) {
                setMessage('✅ User deleted successfully');
                fetchUsers();
                setTimeout(() => setMessage(''), 3000);
            } else {
                setMessage('❌ ' + (response.error || 'Failed to delete user'));
            }
        } catch (error) {
            console.error('Error deleting user:', error);
            setMessage('❌ Error deleting user');
        }
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        try {
            const response = await adminAPI.createUser(newUser);
            if (response.success) {
                setMessage(`✅ User ${newUser.username} created successfully!`);
                setNewUser({
                    name: '',
                    username: '',
                    email: '',
                    password: '',
                    mobile: '',
                    age: '',
                    sex: 'Male',
                    role: 'user'
                });
                setShowCreateForm(false);
                fetchUsers();
                setTimeout(() => setMessage(''), 3000);
            } else {
                setMessage('❌ ' + (response.error || 'Failed to create user'));
            }
        } catch (error) {
            console.error('Error creating user:', error);
            setMessage('❌ Error creating user');
        }
    };

    const getRoleColor = (role) => {
        switch(role) {
            case 'super_admin': return '#e53e3e';
            case 'admin': return '#ed8936';
            case 'reporter': return '#38a169';
            default: return '#718096';
        }
    };

    const getRoleBadge = (role) => {
        switch(role) {
            case 'super_admin': return '👑 Super Admin';
            case 'admin': return '🛡️ Admin';
            case 'reporter': return '📝 Reporter';
            default: return '👤 User';
        }
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Loading users...</p>
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
        <div className="user-management">
            <div className="user-management-header">
                <h2>👥 User Management</h2>
                <button className="create-user-btn" onClick={() => setShowCreateForm(!showCreateForm)}>
                    {showCreateForm ? '✕ Cancel' : '➕ Create User'}
                </button>
            </div>

            {message && <div className="message">{message}</div>}

            {showCreateForm && (
                <div className="create-user-form">
                    <h3>Create New User</h3>
                    <form onSubmit={handleCreateUser}>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Full Name *</label>
                                <input
                                    type="text"
                                    value={newUser.name}
                                    onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Username *</label>
                                <input
                                    type="text"
                                    value={newUser.username}
                                    onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                                    required
                                />
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Email *</label>
                                <input
                                    type="email"
                                    value={newUser.email}
                                    onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Password *</label>
                                <input
                                    type="password"
                                    value={newUser.password}
                                    onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                                    required
                                    minLength="6"
                                />
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Mobile</label>
                                <input
                                    type="tel"
                                    value={newUser.mobile}
                                    onChange={(e) => setNewUser({...newUser, mobile: e.target.value})}
                                />
                            </div>
                            <div className="form-group">
                                <label>Age</label>
                                <input
                                    type="number"
                                    value={newUser.age}
                                    onChange={(e) => setNewUser({...newUser, age: e.target.value})}
                                    min="13"
                                    max="120"
                                />
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Sex</label>
                                <select
                                    value={newUser.sex}
                                    onChange={(e) => setNewUser({...newUser, sex: e.target.value})}
                                >
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Role *</label>
                                <select
                                    value={newUser.role}
                                    onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                                    required
                                >
                                    {roles.map(role => (
                                        <option key={role} value={role}>
                                            {role.charAt(0).toUpperCase() + role.slice(1)}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <button type="submit" className="submit-btn">Create User</button>
                    </form>
                </div>
            )}

            <div className="users-table-container">
                <table className="users-table">
                    <thead>
                        <tr>
                            <th>User</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user._id}>
                                <td>
                                    <div className="user-info">
                                        <div className="user-avatar">
                                            {user.name?.charAt(0).toUpperCase() || 'U'}
                                        </div>
                                        <div>
                                            <div className="user-name">{user.name}</div>
                                            <div className="user-username">@{user.username}</div>
                                        </div>
                                    </div>
                                </td>
                                <td>{user.email}</td>
                                <td>
                                    <span 
                                        className="role-badge"
                                        style={{ backgroundColor: getRoleColor(user.role) }}
                                    >
                                        {getRoleBadge(user.role)}
                                    </span>
                                </td>
                                <td>
                                    <span className={`status-badge ${user.isActive ? 'active' : 'inactive'}`}>
                                        {user.isActive ? '✅ Active' : '❌ Inactive'}
                                    </span>
                                </td>
                                <td>
                                    <div className="action-buttons">
                                        <select
                                            value={user.role}
                                            onChange={(e) => handleRoleChange(user._id, e.target.value)}
                                            className="role-select"
                                        >
                                            {roles.map(role => (
                                                <option key={role} value={role}>
                                                    {role.charAt(0).toUpperCase() + role.slice(1)}
                                                </option>
                                            ))}
                                        </select>
                                        <button 
                                            className="delete-btn"
                                            onClick={() => handleDeleteUser(user._id, user.name)}
                                            disabled={user.role === 'super_admin'}
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <style>{`
                .user-management {
                    max-width: 1200px;
                    margin: 40px auto;
                    padding: 20px;
                    background: white;
                    border-radius: 12px;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                }

                .user-management-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 20px;
                }

                .user-management-header h2 {
                    color: #1a365d;
                }

                .create-user-btn {
                    background: #2563eb;
                    color: white;
                    padding: 10px 20px;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                    font-weight: 600;
                    transition: background 0.3s;
                }

                .create-user-btn:hover {
                    background: #1a365d;
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

                .create-user-form {
                    background: #f7fafc;
                    padding: 20px;
                    border-radius: 8px;
                    margin-bottom: 20px;
                }

                .create-user-form h3 {
                    margin-bottom: 15px;
                    color: #1a365d;
                }

                .form-row {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 15px;
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

                .submit-btn {
                    background: #38a169;
                    color: white;
                    padding: 12px 24px;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                    font-weight: 600;
                    transition: background 0.3s;
                    width: 100%;
                }

                .submit-btn:hover {
                    background: #2f855a;
                }

                .users-table-container {
                    overflow-x: auto;
                }

                .users-table {
                    width: 100%;
                    border-collapse: collapse;
                }

                .users-table th {
                    background: #f7fafc;
                    padding: 12px;
                    text-align: left;
                    font-weight: 600;
                    color: #2d3748;
                    border-bottom: 2px solid #e2e8f0;
                }

                .users-table td {
                    padding: 12px;
                    border-bottom: 1px solid #e2e8f0;
                }

                .users-table tr:hover {
                    background: #f7fafc;
                }

                .user-info {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .user-avatar {
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    background: #2563eb;
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 700;
                }

                .user-name {
                    font-weight: 600;
                    color: #1a202c;
                }

                .user-username {
                    font-size: 0.85rem;
                    color: #718096;
                }

                .role-badge {
                    display: inline-block;
                    padding: 4px 12px;
                    border-radius: 20px;
                    color: white;
                    font-size: 0.8rem;
                    font-weight: 600;
                }

                .status-badge {
                    display: inline-block;
                    padding: 4px 12px;
                    border-radius: 20px;
                    font-size: 0.8rem;
                    font-weight: 600;
                }

                .status-badge.active {
                    background: #c6f6d5;
                    color: #276749;
                }

                .status-badge.inactive {
                    background: #fed7d7;
                    color: #c53030;
                }

                .action-buttons {
                    display: flex;
                    gap: 8px;
                    align-items: center;
                }

                .role-select {
                    padding: 6px 10px;
                    border: 1px solid #e2e8f0;
                    border-radius: 4px;
                    font-size: 0.85rem;
                    background: white;
                }

                .delete-btn {
                    background: #fc8181;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    padding: 6px 10px;
                    cursor: pointer;
                    transition: background 0.3s;
                }

                .delete-btn:hover:not(:disabled) {
                    background: #e53e3e;
                }

                .delete-btn:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                @media (max-width: 768px) {
                    .form-row {
                        grid-template-columns: 1fr;
                    }
                    .user-management {
                        padding: 10px;
                    }
                    .users-table {
                        font-size: 0.85rem;
                    }
                }
            `}</style>
        </div>
    );
};

export default UserManagement;