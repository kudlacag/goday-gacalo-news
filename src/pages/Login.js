import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
// ✅ Import API_URL from api.js
import { API_URL } from '../api/api';

const Login = ({ setUser, setIsLoggedIn }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // ✅ Use API_URL instead of hardcoded localhost
            const response = await fetch(`${API_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();
            if (data.success) {
                localStorage.setItem('token', data.token);
                setUser(data.user);
                setIsLoggedIn(true);
                navigate('/');
            } else {
                setError(data.error || 'Login failed');
            }
        } catch (err) {
            console.error('Login error:', err);
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2>Welcome Back</h2>
                <p className="auth-subtitle">Login to your Godey Gacalo News account</p>
                
                {error && <div className="auth-error">{error}</div>}
                
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            required
                        />
                    </div>
                    
                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            required
                        />
                    </div>
                    
                    <div className="auth-options">
                        <Link to="/forgot-password" className="forgot-link">Forgot Password?</Link>
                    </div>
                    
                    <button type="submit" disabled={loading} className="auth-btn">
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>
                
                <p className="auth-footer">
                    Don't have an account? <Link to="/register">Register</Link>
                </p>
            </div>

            <style>{`
                .auth-container {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    min-height: 80vh;
                    padding: 20px;
                    background: #f0f4ff;
                }

                .auth-card {
                    background: white;
                    padding: 40px;
                    border-radius: 16px;
                    box-shadow: 0 4px 20px rgba(37, 99, 235, 0.1);
                    max-width: 400px;
                    width: 100%;
                }

                .auth-card h2 {
                    color: #1a365d;
                    font-size: 1.8rem;
                    margin-bottom: 8px;
                }

                .auth-subtitle {
                    color: #718096;
                    margin-bottom: 25px;
                }

                .auth-error {
                    background: #fed7d7;
                    color: #c53030;
                    padding: 10px;
                    border-radius: 8px;
                    margin-bottom: 15px;
                    font-size: 0.9rem;
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

                .form-group input {
                    width: 100%;
                    padding: 12px;
                    border: 2px solid #e2e8f0;
                    border-radius: 8px;
                    font-size: 1rem;
                    transition: border-color 0.3s;
                }

                .form-group input:focus {
                    outline: none;
                    border-color: #2563eb;
                }

                .auth-options {
                    text-align: right;
                    margin-bottom: 20px;
                }

                .forgot-link {
                    color: #2563eb;
                    text-decoration: none;
                    font-size: 0.9rem;
                }

                .forgot-link:hover {
                    text-decoration: underline;
                }

                .auth-btn {
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
                }

                .auth-btn:hover:not(:disabled) {
                    opacity: 0.9;
                }

                .auth-btn:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }

                .auth-footer {
                    text-align: center;
                    margin-top: 20px;
                    color: #718096;
                }

                .auth-footer a {
                    color: #2563eb;
                    text-decoration: none;
                    font-weight: 600;
                }

                .auth-footer a:hover {
                    text-decoration: underline;
                }

                @media (max-width: 480px) {
                    .auth-card {
                        padding: 30px 20px;
                    }
                }
            `}</style>
        </div>
    );
};

export default Login;