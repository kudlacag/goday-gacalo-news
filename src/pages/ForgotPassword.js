import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { API_URL } from '../api/api';

function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setError('');

        // Set a timeout to prevent infinite loading
        const timeoutId = setTimeout(() => {
            if (loading) {
                setLoading(false);
                setError('Request is taking too long. Please try again.');
            }
        }, 30000); // 30 seconds timeout

        try {
            console.log('📧 Sending forgot password request for:', email);
            console.log('📡 API URL:', `${API_URL}/api/auth/forgot-password`);
            
            const response = await fetch(`${API_URL}/api/auth/forgot-password`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email })
            });

            clearTimeout(timeoutId);

            console.log('📥 Response status:', response.status);
            
            const data = await response.json();
            console.log('📥 Response data:', data);
            
            if (response.ok && data.success) {
                setMessage('✅ Password reset link sent to your email! Please check your inbox.');
                setEmail('');
            } else {
                const errorMsg = data.details || data.error || 'Failed to send reset email';
                setError(errorMsg);
                console.error('❌ Server error:', data);
            }
        } catch (error) {
            clearTimeout(timeoutId);
            console.error('❌ Forgot password error:', error);
            setError(`Error: ${error.message || 'Network error. Please try again.'}`);
        } finally {
            clearTimeout(timeoutId);
            setLoading(false);
        }
    };

    return (
        <div className="forgot-password-container">
            <div className="forgot-password-card">
                <h2>🔐 Forgot Password</h2>
                <p>Enter your email address and we'll send you a reset link.</p>
                
                {message && <div className="message success">{message}</div>}
                {error && <div className="message error">{error}</div>}
                
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            required
                            disabled={loading}
                        />
                    </div>
                    
                    <button type="submit" disabled={loading} className="submit-btn">
                        {loading ? (
                            <>
                                <span className="spinner"></span> Sending...
                            </>
                        ) : (
                            'Send Reset Link'
                        )}
                    </button>
                </form>
                
                <div className="links">
                    <Link to="/login">← Back to Login</Link>
                    <Link to="/">🏠 Home</Link>
                </div>
            </div>

            <style>{`
                .forgot-password-container {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    min-height: 70vh;
                    padding: 20px;
                    background: #f0f4ff;
                }

                .forgot-password-card {
                    max-width: 450px;
                    width: 100%;
                    padding: 40px;
                    background: white;
                    border-radius: 12px;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.1);
                }

                .forgot-password-card h2 {
                    color: #1a365d;
                    margin-bottom: 10px;
                }

                .forgot-password-card p {
                    color: #4a5568;
                    margin-bottom: 25px;
                    line-height: 1.6;
                }

                .form-group {
                    margin-bottom: 20px;
                }

                .form-group label {
                    display: block;
                    margin-bottom: 8px;
                    font-weight: 600;
                    color: #2d3748;
                }

                .form-group input {
                    width: 100%;
                    padding: 12px;
                    border: 2px solid #e2e8f0;
                    border-radius: 8px;
                    font-size: 16px;
                    transition: border-color 0.2s;
                }

                .form-group input:focus {
                    outline: none;
                    border-color: #1a365d;
                    box-shadow: 0 0 0 3px rgba(26, 54, 93, 0.1);
                }

                .form-group input:disabled {
                    background: #f7fafc;
                    cursor: not-allowed;
                }

                .submit-btn {
                    width: 100%;
                    padding: 12px;
                    background: #1a365d;
                    color: white;
                    border: none;
                    border-radius: 8px;
                    font-size: 16px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: background 0.2s;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    gap: 10px;
                }

                .submit-btn:hover:not(:disabled) {
                    background: #2a4a7f;
                }

                .submit-btn:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }

                .spinner {
                    display: inline-block;
                    width: 20px;
                    height: 20px;
                    border: 3px solid rgba(255,255,255,0.3);
                    border-radius: 50%;
                    border-top-color: #fff;
                    animation: spin 1s ease-in-out infinite;
                }

                @keyframes spin {
                    to { transform: rotate(360deg); }
                }

                .message {
                    padding: 12px;
                    border-radius: 6px;
                    margin-bottom: 20px;
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

                .links {
                    margin-top: 20px;
                    display: flex;
                    justify-content: space-between;
                }

                .links a {
                    color: #1a365d;
                    text-decoration: none;
                    font-weight: 500;
                }

                .links a:hover {
                    text-decoration: underline;
                }

                @media (max-width: 480px) {
                    .forgot-password-card {
                        padding: 20px;
                    }
                    .links {
                        flex-direction: column;
                        gap: 10px;
                        align-items: center;
                    }
                }
            `}</style>
        </div>
    );
}

export default ForgotPassword;