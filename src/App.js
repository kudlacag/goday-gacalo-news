import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
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
import { API_URL } from './api/api';
import UserManagement from './pages/UserManagement';
import ManageNews from './pages/ManageNews';

function AppContent() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();

    // Categories in Somali
    const categories = [
        { key: 'All', label: 'Dhammaan' },
        { key: 'Politics', label: 'Siyaasada' },
        { key: 'Business', label: 'Dhaqaalaha' },
        { key: 'Sports', label: 'Ciyaaraha' },
        { key: 'Entertainment', label: 'Suugaanta' },
        { key: 'Health', label: 'Caafimaadka' },
        { key: 'Tech', label: 'Teknolojiyada' }
    ];

    // Categories for dropdown (all except first 3 on desktop, first 2 on tablet)
    const getVisibleCategories = () => {
        const width = window.innerWidth;
        if (width <= 768) return []; // Mobile - all in dropdown
        if (width <= 1024) return categories.slice(0, 2); // Tablet - first 2 visible
        return categories.slice(0, 3); // Desktop - first 3 visible
    };

    const getDropdownCategories = () => {
        const width = window.innerWidth;
        if (width <= 768) return categories; // Mobile - all in dropdown
        if (width <= 1024) return categories.slice(2); // Tablet - rest in dropdown
        return categories.slice(3); // Desktop - rest in dropdown
    };

    useEffect(() => {
        const redirectPath = sessionStorage.getItem('redirect');
        if (redirectPath) {
            sessionStorage.removeItem('redirect');
            navigate(redirectPath);
        }

        const token = localStorage.getItem('token');
        if (token) {
            fetchUser(token);
        }
    }, [navigate]);

    useEffect(() => {
        const handleResize = () => {
            // Close dropdown on resize to avoid layout issues
            setIsCategoryDropdownOpen(false);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const fetchUser = async (token) => {
        try {
            const response = await fetch(`${API_URL}/api/auth/me`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (data.success) {
                setUser(data.user);
                setIsLoggedIn(true);
            } else {
                localStorage.removeItem('token');
            }
        } catch (error) {
            console.error('Error fetching user:', error);
        }
    };

    const handleCategoryClick = (categoryKey) => {
        setSelectedCategory(categoryKey);
        setIsCategoryDropdownOpen(false);
        setIsMenuOpen(false);
        navigate(categoryKey === 'All' ? '/' : `/?category=${categoryKey}`);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        setIsLoggedIn(false);
        setUser(null);
        navigate('/login');
    };

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
        setIsCategoryDropdownOpen(false);
    };

    const toggleCategoryDropdown = () => {
        setIsCategoryDropdownOpen(!isCategoryDropdownOpen);
    };

    const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';
    const isSuperAdmin = user?.role === 'super_admin';

    // Get the label for the selected category
    const getSelectedLabel = () => {
        const cat = categories.find(c => c.key === selectedCategory);
        return cat ? cat.label : 'Dhammaan';
    };

    const visibleCats = getVisibleCategories();
    const dropdownCats = getDropdownCategories();

    return (
        <div className="App">
            <nav className="nav-bar">
                <div className="nav-container">
                    <Link to="/" className="nav-logo" onClick={() => setSelectedCategory('All')}>
                        📰 Godey News
                    </Link>

                    <button className={`hamburger ${isMenuOpen ? 'open' : ''}`} onClick={toggleMenu}>
                        <span className="bar"></span>
                        <span className="bar"></span>
                        <span className="bar"></span>
                    </button>

                    {/* Desktop Navigation */}
                    <div className="nav-links desktop">
                        {/* Visible Categories */}
                        {visibleCats.map((cat) => (
                            <button
                                key={cat.key}
                                className={`nav-link category-link ${selectedCategory === cat.key ? 'active' : ''}`}
                                onClick={() => handleCategoryClick(cat.key)}
                            >
                                {cat.label}
                            </button>
                        ))}

                        {/* Categories Dropdown */}
                        {dropdownCats.length > 0 && (
                            <div className="dropdown-container">
                                <button 
                                    className={`dropdown-toggle nav-link ${isCategoryDropdownOpen ? 'active' : ''}`}
                                    onClick={toggleCategoryDropdown}
                                >
                                    Barnaamijyada ▼
                                </button>
                                {isCategoryDropdownOpen && (
                                    <div className="dropdown-menu">
                                        {dropdownCats.map((cat) => (
                                            <button
                                                key={cat.key}
                                                className={`dropdown-item ${selectedCategory === cat.key ? 'active' : ''}`}
                                                onClick={() => handleCategoryClick(cat.key)}
                                            >
                                                {cat.label}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {isLoggedIn ? (
                            <>
                                {isAdmin && (
                                    <>
                                        <Link to="/admin" className="nav-link admin-link">📝 Dashboard</Link>
                                        <Link to="/manage-news" className="nav-link admin-link">📰 Maamul</Link>
                                    </>
                                )}
                                {isSuperAdmin && (
                                    <Link to="/users" className="nav-link admin-link">👥 Isticmaalayaasha</Link>
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
                    <div className="mobile-categories">
                        {categories.map((cat) => (
                            <button
                                key={cat.key}
                                className={`mobile-link ${selectedCategory === cat.key ? 'active' : ''}`}
                                onClick={() => handleCategoryClick(cat.key)}
                            >
                                {cat.label}
                            </button>
                        ))}
                    </div>

                    <hr className="mobile-divider" />

                    {isLoggedIn ? (
                        <>
                            <div className="mobile-user-section">
                                <Link to="/profile" className="mobile-link" onClick={() => setIsMenuOpen(false)}>
                                    👤 {user?.username}
                                </Link>
                                {isAdmin && (
                                    <>
                                        <Link to="/admin" className="mobile-link" onClick={() => setIsMenuOpen(false)}>
                                            📝 Dashboard
                                        </Link>
                                        <Link to="/manage-news" className="mobile-link" onClick={() => setIsMenuOpen(false)}>
                                            📰 Maamul
                                        </Link>
                                    </>
                                )}
                                {isSuperAdmin && (
                                    <Link to="/users" className="mobile-link" onClick={() => setIsMenuOpen(false)}>
                                        👥 Isticmaalayaasha
                                    </Link>
                                )}
                            </div>
                            <button onClick={handleLogout} className="mobile-link logout-mobile">
                                🚪 Logout
                            </button>
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
                <Route path="/reset-password/:token" element={<ResetPassword />} />
                <Route path="/" element={<Home selectedCategory={selectedCategory} user={user} />} />
                <Route path="/login" element={<Login setUser={setUser} setIsLoggedIn={setIsLoggedIn} />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/profile" element={<Profile user={user} setUser={setUser} />} />
                <Route path="/admin" element={<Admin user={user} />} />
                <Route path="/manage-news" element={<ManageNews />} />
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