import React, { useState, useEffect } from 'react';
import {HashRouter as Router, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Admin from './pages/Admin';
import NewsDetail from './pages/NewsDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Profile from './pages/Profile';
import './App.css';
import NotFound from './pages/NotFound';
// ✅ Import API_URL
import { API_URL } from './api/api';
// ✅ Import UserManagement
import UserManagement from './pages/UserManagement';
// ✅ Import ManageNews
import ManageNews from './pages/ManageNews';

function AppContent() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();

    const categories = ['All', 'Politics', 'Business', 'Sports', 'Entertainment', 'Health', 'Tech'];

    useEffect(() => {
        // Check if user is logged in
        const token = localStorage.getItem('token');
        if (token) {
            fetchUser(token);
        }
    }, []);

    const fetchUser = async (token) => {
        try {
            // ✅ Use API_URL instead of hardcoded localhost
            const response = await fetch(`${API_URL}/api/auth/me`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (data.success) {
                // console.log('User data:', data.user);
                setUser(data.user);
                setIsLoggedIn(true);
            } else {
                localStorage.removeItem('token');
            }
        } catch (error) {
            console.error('Error fetching user:', error);
        }
    };

    const handleCategoryClick = (category) => {
        setSelectedCategory(category);
        setIsMenuOpen(false);
        navigate(category === 'All' ? '/' : `/?category=${category}`);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        setIsLoggedIn(false);
        setUser(null);
        navigate('/login');
    };

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    // Check if user is admin
    const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';
    const isSuperAdmin = user?.role === 'super_admin';

    return (
        <div className="App">
            {/* Navigation */}
            <nav className="nav-bar">
                <div className="nav-container">
                    <Link to="/" className="nav-logo" onClick={() => setSelectedCategory('All')}>
                        📰 Godey News
                    </Link>

                    {/* Hamburger Menu Button */}
                    <button className={`hamburger ${isMenuOpen ? 'open' : ''}`} onClick={toggleMenu}>
                        <span className="bar"></span>
                        <span className="bar"></span>
                        <span className="bar"></span>
                    </button>

                    {/* Desktop Navigation */}
                    <div className="nav-links desktop">
                        {categories.map((cat, index) => (
                            <Link
                                to={cat === 'All' ? '/' : `/?category=${cat}`}
                                key={index}
                                className={`nav-link ${selectedCategory === cat ? 'active' : ''}`}
                                onClick={() => setSelectedCategory(cat)}
                            >
                                {cat}
                            </Link>
                        ))}
                        {isLoggedIn ? (
                            <>
                                {/* ✅ Show Admin Dashboard for admins and super admins */}
                                {isAdmin && (
                                    <>
                                        <Link to="/admin" className="nav-link admin-link">📝 Dashboard</Link>
                                        <Link to="/manage-news" className="nav-link admin-link">📰 Manage News</Link>
                                    </>
                                )}
                                {/* ✅ Show User Management for super admins only */}
                                {isSuperAdmin && (
                                    <Link to="/users" className="nav-link admin-link">👥 Users</Link>
                                )}
                                <Link to="/profile" className="nav-link">
                                    👤 {user?.username}
                                </Link>
                                <button onClick={handleLogout} className="nav-link logout-btn">Logout</button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="nav-link">Login</Link>
                                <Link to="/register" className="nav-link register-btn">Register</Link>
                            </>
                        )}
                    </div>
                </div>

                {/* Mobile Menu */}
                <div className={`mobile-menu ${isMenuOpen ? 'open' : ''}`}>
                    {categories.map((cat, index) => (
                        <button
                            key={index}
                            className={`mobile-link ${selectedCategory === cat ? 'active' : ''}`}
                            onClick={() => handleCategoryClick(cat)}
                        >
                            {cat}
                        </button>
                    ))}
                    <hr className="mobile-divider" />
                    {isLoggedIn ? (
                        <>
                            {isAdmin && (
                                <>
                                    <Link to="/admin" className="mobile-link" onClick={() => setIsMenuOpen(false)}>
                                        📝 Dashboard
                                    </Link>
                                    <Link to="/manage-news" className="mobile-link" onClick={() => setIsMenuOpen(false)}>
                                        📰 Manage News
                                    </Link>
                                </>
                            )}
                            {isSuperAdmin && (
                                <Link to="/users" className="mobile-link" onClick={() => setIsMenuOpen(false)}>
                                    👥 Users
                                </Link>
                            )}
                            <Link to="/profile" className="mobile-link" onClick={() => setIsMenuOpen(false)}>
                                👤 {user?.username}
                            </Link>
                            <button onClick={handleLogout} className="mobile-link logout-mobile">Logout</button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="mobile-link" onClick={() => setIsMenuOpen(false)}>Login</Link>
                            <Link to="/register" className="mobile-link register-mobile" onClick={() => setIsMenuOpen(false)}>Register</Link>
                        </>
                    )}
                </div>
            </nav>

            <Routes>
                <Route path="/" element={<Home selectedCategory={selectedCategory} user={user} />} />
                <Route path="/login" element={<Login setUser={setUser} setIsLoggedIn={setIsLoggedIn} />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password/:token" element={<ResetPassword />} />
                <Route path="/profile" element={<Profile user={user} setUser={setUser} />} />
                <Route path="/admin" element={<Admin user={user} />} />
                {/* ✅ Add ManageNews route - only accessible by admin/super_admin */}
                <Route path="/manage-news" element={<ManageNews />} />
                {/* ✅ Add UserManagement route - only accessible by super_admin */}
                <Route path="/users" element={<UserManagement />} />
                <Route path="/news/:id" element={<NewsDetail user={user} />} />
                <Route path="*" element={<NotFound />} />
            </Routes>
        </div>
    );
}

function App() {
    return (
        <Router>
            <AppContent />
        </Router>
    );
}

export default App;