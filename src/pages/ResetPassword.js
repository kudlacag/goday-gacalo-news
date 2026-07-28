import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { API_URL } from '../api/api';

const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (!token) {
            setError('Invalid reset link. Please request a new password reset.');
        } else {
            console.log('🔐 Reset token received:', token.substring(0, 10) + '...');
        }
    }, [token]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setError('');

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            setLoading(false);
            return;
        }

        try {
            console.log('🔐 Resetting password with token:', token.substring(0, 10) + '...');
            console.log('📡 API URL:', `${API_URL}/api/auth/reset-password/${token}`);
            
            const response = await fetch(`${API_URL}/api/auth/reset-password/${token}`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ password })
            });

            console.log('📥 Response status:', response.status);
            
            const data = await response.json();
            console.log('📥 Response data:', data);
            
            if (response.ok && data.success) {
                setMessage('✅ Password reset successfully! Redirecting to login...');
                setTimeout(() => navigate('/login'), 2000);
            } else {
                setError(data.error || 'Failed to reset password');
            }
        } catch (err) {
            console.error('❌ Reset password error:', err);
            setError('Network error. Please check your connection and try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="reset-container">
            <div className="reset-card">
                <h2>🔑 Create New Password</h2>
                <p className="reset-subtitle">Enter your new password below.</p>
                
                {message && <div className="reset-success">{message}</div>}
                {error && <div className="reset-error">{error}</div>}
                
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>New Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Min 6 characters"
                            required
                            disabled={loading}
                        />
                    </div>
                    
                    <div className="form-group">
                        <label>Confirm Password</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm your new password"
                            required
                            disabled={loading}
                        />
                    </div>
                    
                    <button 
                        type="submit" 
                        disabled={loading || !token} 
                        className="reset-btn"
                    >
                        {loading ? 'Resetting...' : 'Reset Password'}
                    </button>
                </form>
                
                <p className="reset-footer">
                    <Link to="/login">Back to Login</Link>
                </p>
            </div>

            <style>{`
                .reset-container {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    min-height: 80vh;
                    padding: 20px;
                    background: #f0f4ff;
                }

                .reset-card {
                    background: white;
                    padding: 40px;
                    border-radius: 16px;
                    box-shadow: 0 4px 20px rgba(37, 99, 235, 0.1);
                    max-width: 400px;
                    width: 100%;
                }

                .reset-card h2 {
                    color: #1a365d;
                    font-size: 1.8rem;
                    margin-bottom: 8px;
                }

                .reset-subtitle {
                    color: #718096;
                    margin-bottom: 25px;
                }

                .reset-success {
                    background: #c6f6d5;
                    color: #276749;
                    padding: 10px;
                    border-radius: 8px;
                    margin-bottom: 15px;
                    font-size: 0.9rem;
                }

                .reset-error {
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

                .form-group input:disabled {
                    background: #f7fafc;
                    cursor: not-allowed;
                }

                .reset-btn {
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

                .reset-btn:hover:not(:disabled) {
                    opacity: 0.9;
                }

                .reset-btn:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }

                .reset-footer {
                    text-align: center;
                    margin-top: 20px;
                }

                .reset-footer a {
                    color: #2563eb;
                    text-decoration: none;
                    font-weight: 600;
                }

                .reset-footer a:hover {
                    text-decoration: underline;
                }

                @media (max-width: 480px) {
                    .reset-card {
                        padding: 30px 20px;
                    }
                }
            `}</style>
        </div>
    );
};

export default ResetPassword;