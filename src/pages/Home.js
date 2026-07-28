import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { getNews, getFeaturedNews, getImageUrl } from '../api/api'; // ✅ Import getImageUrl
import NewsSlider from '../components/NewsSlider';

function Home({ selectedCategory = 'All', user }) {
    const [news, setNews] = useState([]);
    const [featured, setFeatured] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const location = useLocation();

    const queryParams = new URLSearchParams(location.search);
    const categoryFromUrl = queryParams.get('category') || 'All';
    const currentCategory = selectedCategory || categoryFromUrl;

    useEffect(() => {
        setNews([]);
        setPage(1);
        setHasMore(true);
        setError(null);
        fetchFeatured();
        fetchNews(1, currentCategory);
    }, [currentCategory]);

    const fetchFeatured = async () => {
        try {
            // console.log('📡 Fetching featured news...');
            const response = await getFeaturedNews();
            // console.log('📡 Featured response:', response);
            
            if (response && response.success) {
                setFeatured(response.data || []);
            } else {
                console.warn('⚠️ Featured news not available:', response?.error || 'Unknown error');
                setFeatured([]);
            }
        } catch (err) {
            console.error('❌ Error fetching featured:', err);
            setFeatured([]);
        }
    };

    const fetchNews = async (pageNum, category) => {
        try {
            if (pageNum === 1) {
                setLoading(true);
            } else {
                setLoadingMore(true);
            }

            const response = await getNews(pageNum, 15, category);
            // console.log('📡 News response:', response);
            
            if (response && response.success) {
                if (pageNum === 1) {
                    setNews(response.data || []);
                } else {
                    setNews(prev => [...prev, ...(response.data || [])]);
                }
                setHasMore(response.data && response.data.length > 0);
                setError(null);
            } else {
                const errorMsg = response?.error || 'Failed to fetch news';
                console.error('❌ News error:', errorMsg);
                setError(errorMsg);
            }
        } catch (err) {
            console.error('❌ Error fetching news:', err);
            setError(err.message || 'Network error. Please try again.');
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    const handleScroll = useCallback(() => {
        if (loadingMore || !hasMore) return;

        const scrollTop = document.documentElement.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight;
        const clientHeight = document.documentElement.clientHeight;

        if (scrollTop + clientHeight >= scrollHeight - 100) {
            setPage(prev => prev + 1);
            fetchNews(page + 1, currentCategory);
        }
    }, [loadingMore, hasMore, page, currentCategory]);

    useEffect(() => {
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [handleScroll]);

    if (loading) {
        return (
            <div className="loading">
                <div className="spinner"></div>
                <p>Loading {currentCategory !== 'All' ? currentCategory : ''} news...</p>
                <style>{`
                    .loading {
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        min-height: 60vh;
                        gap: 20px;
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

    if (error) {
        return (
            <div className="error-container">
                <div className="error-icon">⚠️</div>
                <h2>Oops! Something went wrong</h2>
                <p>{error}</p>
                <button onClick={() => {
                    setError(null);
                    fetchNews(1, currentCategory);
                    fetchFeatured();
                }} className="retry-button">
                    Try Again
                </button>
                <style>{`
                    .error-container {
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        min-height: 60vh;
                        padding: 20px;
                        text-align: center;
                    }
                    .error-icon {
                        font-size: 3rem;
                        margin-bottom: 15px;
                    }
                    .error-container h2 {
                        color: #1a365d;
                        margin-bottom: 10px;
                    }
                    .error-container p {
                        color: #4a5568;
                        max-width: 400px;
                        margin-bottom: 20px;
                    }
                    .retry-button {
                        background: #2563eb;
                        color: white;
                        border: none;
                        padding: 10px 30px;
                        border-radius: 6px;
                        font-size: 1rem;
                        cursor: pointer;
                        transition: background 0.3s;
                    }
                    .retry-button:hover {
                        background: #1a365d;
                    }
                `}</style>
            </div>
        );
    }

    const gridArticles = news.slice(0, 9);
    const remainingArticles = news.slice(9);

    return (
        <div className="home">
            <div className="category-header">
                <h1>{currentCategory !== 'All' ? currentCategory : 'All News'}</h1>
                <span>{news.length} articles</span>
            </div>

            {currentCategory === 'All' && featured.length > 0 && <NewsSlider articles={featured} />}

            <section className="grid-section">
                <div className="grid-title">
                    <h2>📰 {currentCategory !== 'All' ? currentCategory : 'Latest'} News</h2>
                </div>
                {gridArticles.length === 0 ? (
                    <div className="no-articles">
                        <p>No articles found in this category</p>
                    </div>
                ) : (
                    <div className="news-grid">
                        {gridArticles.map((item) => (
                            <Link to={`/news/${item._id}`} key={item._id} className="news-card-link">
                                <div className="news-card">
                                    {item.images && item.images.length > 0 ? (
                                        // ✅ FIXED: Use getImageUrl helper
                                        <img src={getImageUrl(item.images[0])} alt={item.title} />
                                    ) : (
                                        <div className="no-image">📰</div>
                                    )}
                                    <div className="news-content">
                                        <span className="category">{item.category}</span>
                                        <h3>{item.title}</h3>
                                        <p>{item.summary}</p>
                                        <div className="news-meta">
                                            <span>💬 {item.comments?.length || 0}</span>
                                            <span>•</span>
                                            <span>👁️ {item.views || 0}</span>
                                            <span>•</span>
                                            <span>{new Date(item.publishedDate).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </section>

            {remainingArticles.length > 0 && (
                <section className="scroll-section">
                    <div className="scroll-grid">
                        {remainingArticles.map((item) => (
                            <Link to={`/news/${item._id}`} key={item._id} className="scroll-card-link">
                                <div className="scroll-card">
                                    {item.images && item.images.length > 0 ? (
                                        // ✅ FIXED: Use getImageUrl helper
                                        <img src={getImageUrl(item.images[0])} alt={item.title} />
                                    ) : (
                                        <div className="no-image-small">📰</div>
                                    )}
                                    <div className="scroll-content">
                                        <span className="scroll-category">{item.category}</span>
                                        <h4>{item.title}</h4>
                                        <div className="scroll-meta">
                                            <span>💬 {item.comments?.length || 0}</span>
                                            <span>•</span>
                                            <span>{new Date(item.publishedDate).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            {loadingMore && (
                <div className="loading-more">
                    <div className="spinner-small"></div>
                    <p>Loading more...</p>
                </div>
            )}

            {!hasMore && news.length > 0 && (
                <div className="no-more">
                    <p>You've seen all {currentCategory !== 'All' ? currentCategory : ''} news! 🎉</p>
                </div>
            )}

            <style>{`
                .home {
                    max-width: 100%;
                    margin: 0;
                    padding: 0;
                    background: #f0f4ff;
                }

                .category-header {
                    padding: 15px 20px;
                    background: white;
                    border-bottom: 2px solid #e8f0fe;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .category-header h1 {
                    font-size: 1.4rem;
                    color: #1a365d;
                    font-weight: 700;
                }

                .category-header span {
                    color: #a0aec0;
                    font-size: 0.85rem;
                    background: #f0f4ff;
                    padding: 4px 12px;
                    border-radius: 20px;
                }

                .no-articles {
                    text-align: center;
                    padding: 60px 20px;
                    color: #4a5568;
                    font-size: 1.1rem;
                }

                .grid-section {
                    padding: 15px;
                    background: #f0f4ff;
                }

                .grid-title h2 {
                    font-size: 1.3rem;
                    color: #1a365d;
                    margin-bottom: 15px;
                    font-weight: 700;
                }

                .news-grid {
                    display: grid;
                    grid-template-columns: 1fr;
                    gap: 12px;
                }

                .news-card-link {
                    text-decoration: none;
                    color: inherit;
                    display: block;
                }

                .news-card {
                    background: white;
                    border-radius: 12px;
                    overflow: hidden;
                    box-shadow: 0 2px 8px rgba(37, 99, 235, 0.08);
                    transition: all 0.3s ease;
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                }

                .news-card:hover {
                    transform: translateY(-3px);
                    box-shadow: 0 8px 25px rgba(37, 99, 235, 0.15);
                }

                .news-card img {
                    width: 100%;
                    height: 200px;
                    object-fit: cover;
                }

                .news-card .no-image {
                    width: 100%;
                    height: 200px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: #e8f0fe;
                    font-size: 3rem;
                    color: #2563eb;
                }

                .news-content {
                    padding: 15px;
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                }

                .news-content .category {
                    display: inline-block;
                    background: #2563eb;
                    color: white;
                    padding: 4px 12px;
                    border-radius: 20px;
                    font-size: 0.7rem;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    margin-bottom: 8px;
                    align-self: flex-start;
                }

                .news-content h3 {
                    font-size: 1.1rem;
                    color: #1a202c;
                    line-height: 1.4;
                    margin-bottom: 8px;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }

                .news-content p {
                    color: #4a5568;
                    font-size: 0.9rem;
                    line-height: 1.6;
                    display: -webkit-box;
                    -webkit-line-clamp: 3;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                    flex: 1;
                }

                .news-meta {
                    display: flex;
                    gap: 12px;
                    color: #a0aec0;
                    font-size: 0.75rem;
                    margin-top: 10px;
                }

                .scroll-section {
                    padding: 0 15px 15px;
                    background: #f0f4ff;
                }

                .scroll-grid {
                    display: grid;
                    grid-template-columns: 1fr;
                    gap: 10px;
                }

                .scroll-card-link {
                    text-decoration: none;
                    color: inherit;
                    display: block;
                }

                .scroll-card {
                    display: flex;
                    gap: 12px;
                    background: white;
                    border-radius: 10px;
                    padding: 12px;
                    box-shadow: 0 1px 4px rgba(37, 99, 235, 0.06);
                    transition: all 0.3s ease;
                }

                .scroll-card:hover {
                    background: #f8faff;
                    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.12);
                }

                .scroll-card img {
                    width: 120px;
                    height: 90px;
                    object-fit: cover;
                    border-radius: 8px;
                    flex-shrink: 0;
                }

                .scroll-card .no-image-small {
                    width: 120px;
                    height: 90px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: #e8f0fe;
                    border-radius: 8px;
                    font-size: 2rem;
                    color: #2563eb;
                    flex-shrink: 0;
                }

                .scroll-content {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                }

                .scroll-category {
                    display: inline-block;
                    background: #2563eb;
                    color: white;
                    padding: 2px 10px;
                    border-radius: 12px;
                    font-size: 0.6rem;
                    text-transform: uppercase;
                    letter-spacing: 0.3px;
                    margin-bottom: 6px;
                    align-self: flex-start;
                }

                .scroll-content h4 {
                    font-size: 0.95rem;
                    color: #1a202c;
                    line-height: 1.3;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }

                .scroll-meta {
                    display: flex;
                    gap: 10px;
                    font-size: 0.65rem;
                    color: #a0aec0;
                    margin-top: 4px;
                }

                .loading-more {
                    text-align: center;
                    padding: 30px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 10px;
                }

                .spinner-small {
                    width: 30px;
                    height: 30px;
                    border: 3px solid #e2e8f0;
                    border-top: 3px solid #2563eb;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }

                .no-more {
                    text-align: center;
                    padding: 30px;
                    color: #a0aec0;
                    font-size: 0.9rem;
                }

                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }

                @media (min-width: 601px) and (max-width: 1024px) {
                    .news-grid {
                        grid-template-columns: repeat(2, 1fr);
                        gap: 15px;
                    }
                    .news-card img {
                        height: 180px;
                    }
                    .scroll-grid {
                        grid-template-columns: repeat(2, 1fr);
                    }
                }

                @media (min-width: 1025px) {
                    .news-grid {
                        grid-template-columns: repeat(3, 1fr);
                        gap: 20px;
                    }
                    .news-card img {
                        height: 200px;
                    }
                    .scroll-grid {
                        grid-template-columns: repeat(3, 1fr);
                        gap: 15px;
                    }
                    .scroll-card {
                        flex-direction: column;
                        padding: 0;
                        border-radius: 12px;
                        overflow: hidden;
                    }
                    .scroll-card img {
                        width: 100%;
                        height: 180px;
                        border-radius: 0;
                    }
                    .scroll-card .no-image-small {
                        width: 100%;
                        height: 180px;
                        border-radius: 0;
                        font-size: 3rem;
                    }
                    .scroll-content {
                        padding: 15px;
                    }
                    .scroll-content h4 {
                        font-size: 1rem;
                    }
                }

                @media (min-width: 1400px) {
                    .news-grid {
                        grid-template-columns: repeat(4, 1fr);
                    }
                    .scroll-grid {
                        grid-template-columns: repeat(4, 1fr);
                    }
                }
            `}</style>
        </div>
    );
}

export default Home;