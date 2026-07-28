import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
// ✅ Import API_URL from api.js
import { API_URL } from '../api/api';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        username: '',
        email: '',
        mobile: '',
        age: '',
        sex: 'Male',
        password: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            setLoading(false);
            return;
        }

        try {
            const { confirmPassword, ...userData } = formData;
            // ✅ Use API_URL from api.js instead of hardcoded localhost
            const response = await fetch(`${API_URL}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });

            const data = await response.json();
            if (data.success) {
                localStorage.setItem('token', data.token);
                navigate('/');
            } else {
                setError(data.error || 'Registration failed');
            }
        } catch (err) {
            console.error('Registration error:', err);
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="register-container">
            <div className="register-card">
                <h2>Create Account</h2>
                <p className="register-subtitle">Join Godey Gacalo News community</p>
                
                {error && <div className="register-error">{error}</div>}
                
                <form onSubmit={handleSubmit}>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Full Name *</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Enter your full name"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Username *</label>
                            <input
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                placeholder="Choose a username"
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Email *</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Enter your email"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Mobile Number *</label>
                        <input
                            type="tel"
                            name="mobile"
                            value={formData.mobile}
                            onChange={handleChange}
                            placeholder="Enter your mobile number"
                            required
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Age *</label>
                            <input
                                type="number"
                                name="age"
                                value={formData.age}
                                onChange={handleChange}
                                placeholder="Your age"
                                min="13"
                                max="120"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Sex *</label>
                            <select
                                name="sex"
                                value={formData.sex}
                                onChange={handleChange}
                                required
                            >
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Password *</label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Min 6 characters"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Confirm Password *</label>
                            <input
                                type="password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                placeholder="Confirm your password"
                                required
                            />
                        </div>
                    </div>
                    
                    <button type="submit" disabled={loading} className="register-btn-submit">
                        {loading ? 'Creating Account...' : 'Create Account'}
                    </button>
                </form>
                
                <p className="register-footer">
                    Already have an account? <Link to="/login">Login</Link>
                </p>
            </div>

            <style>{`
                .register-container {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    min-height: 80vh;
                    padding: 20px;
                    background: #f0f4ff;
                }

                .register-card {
                    background: white;
                    padding: 40px;
                    border-radius: 16px;
                    box-shadow: 0 4px 20px rgba(37, 99, 235, 0.1);
                    max-width: 600px;
                    width: 100%;
                }

                .register-card h2 {
                    color: #1a365d;
                    font-size: 1.8rem;
                    margin-bottom: 8px;
                }

                .register-subtitle {
                    color: #718096;
                    margin-bottom: 25px;
                }

                .register-error {
                    background: #fed7d7;
                    color: #c53030;
                    padding: 10px;
                    border-radius: 8px;
                    margin-bottom: 15px;
                    font-size: 0.9rem;
                }

                .form-row {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 15px;
                }

                .form-group {
                    margin-bottom: 18px;
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
                    padding: 12px;
                    border: 2px solid #e2e8f0;
                    border-radius: 8px;
                    font-size: 1rem;
                    transition: border-color 0.3s;
                    background: white;
                }

                .form-group input:focus,
                .form-group select:focus {
                    outline: none;
                    border-color: #2563eb;
                }

                .register-btn-submit {
                    width: 100%;
                    padding: 14px;
                    background: linear-gradient(135deg, #1a365d, #2563eb);
                    color: white;
                    border: none;
                    border-radius: 8px;
                    font-size: 1rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: opacity 0.3s;
                    margin-top: 10px;
                }

                .register-btn-submit:hover:not(:disabled) {
                    opacity: 0.9;
                }

                .register-btn-submit:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }

                .register-footer {
                    text-align: center;
                    margin-top: 20px;
                    color: #718096;
                }

                .register-footer a {
                    color: #2563eb;
                    text-decoration: none;
                    font-weight: 600;
                }

                .register-footer a:hover {
                    text-decoration: underline;
                }

                @media (max-width: 480px) {
                    .register-card {
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

export default Register;