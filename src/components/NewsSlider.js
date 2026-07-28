import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
// ✅ Import getImageUrl helper
import { getImageUrl } from '../api/api';

const NewsSlider = ({ articles }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (!articles || articles.length === 0) return;

        const interval = setInterval(() => {
            setCurrentIndex((prevIndex) => 
                prevIndex === articles.length - 1 ? 0 : prevIndex + 1
            );
        }, 4000); // Change slide every 4 seconds

        return () => clearInterval(interval);
    }, [articles]);

    if (!articles || articles.length === 0) {
        return null;
    }

    const goToSlide = (index) => {
        setCurrentIndex(index);
    };

    const goToPrevious = () => {
        setCurrentIndex((prevIndex) => 
            prevIndex === 0 ? articles.length - 1 : prevIndex - 1
        );
    };

    const goToNext = () => {
        setCurrentIndex((prevIndex) => 
            prevIndex === articles.length - 1 ? 0 : prevIndex + 1
        );
    };

    const currentArticle = articles[currentIndex];

    return (
        <div className="news-slider">
            <Link to={`/news/${currentArticle._id}`} className="slider-link">
                <div className="slider-image-wrapper">
                    {currentArticle.images && currentArticle.images.length > 0 ? (
                        // ✅ FIXED: Use getImageUrl helper
                        <img src={getImageUrl(currentArticle.images[0])} alt={currentArticle.title} />
                    ) : (
                        <div className="slider-no-image">📰</div>
                    )}
                    <div className="slider-overlay">
                        <span className="slider-category">{currentArticle.category}</span>
                        <h2 className="slider-title">{currentArticle.title}</h2>
                        <p className="slider-summary">{currentArticle.summary}</p>
                        <span className="slider-date">
                            {new Date(currentArticle.publishedDate).toLocaleDateString()}
                        </span>
                    </div>
                </div>
            </Link>

            {/* Navigation Dots */}
            <div className="slider-dots">
                {articles.map((_, index) => (
                    <button
                        key={index}
                        className={`dot ${index === currentIndex ? 'active' : ''}`}
                        onClick={() => goToSlide(index)}
                    />
                ))}
            </div>

            {/* Arrow Buttons */}
            <button className="slider-arrow prev" onClick={goToPrevious}>
                ❮
            </button>
            <button className="slider-arrow next" onClick={goToNext}>
                ❯
            </button>

            <style>{`
                .news-slider {
                    position: relative;
                    width: 100%;
                    height: 400px;
                    overflow: hidden;
                    background: #1a202c;
                    margin-bottom: 2px;
                }

                .slider-link {
                    text-decoration: none;
                    color: inherit;
                    display: block;
                    height: 100%;
                }

                .slider-image-wrapper {
                    position: relative;
                    width: 100%;
                    height: 100%;
                }

                .slider-image-wrapper img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                .slider-no-image {
                    width: 100%;
                    height: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: linear-gradient(135deg, #1a365d, #2563eb);
                    font-size: 4rem;
                    color: white;
                }

                .slider-overlay {
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    padding: 40px 30px;
                    background: linear-gradient(transparent, rgba(0, 0, 0, 0.85));
                    color: white;
                }

                .slider-category {
                    display: inline-block;
                    background: #2563eb;
                    color: white;
                    padding: 3px 12px;
                    border-radius: 20px;
                    font-size: 0.7rem;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    margin-bottom: 10px;
                }

                .slider-title {
                    font-size: 1.5rem;
                    font-weight: 700;
                    margin-bottom: 8px;
                    line-height: 1.3;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }

                .slider-summary {
                    font-size: 0.95rem;
                    opacity: 0.9;
                    margin-bottom: 8px;
                    display: -webkit-box;
                    -webkit-line-clamp: 1;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }

                .slider-date {
                    font-size: 0.8rem;
                    opacity: 0.7;
                }

                /* Navigation Dots */
                .slider-dots {
                    position: absolute;
                    bottom: 100px;
                    right: 30px;
                    display: flex;
                    gap: 8px;
                    z-index: 5;
                }

                .dot {
                    width: 10px;
                    height: 10px;
                    border-radius: 50%;
                    background: rgba(255, 255, 255, 0.4);
                    border: 2px solid rgba(255, 255, 255, 0.6);
                    cursor: pointer;
                    transition: all 0.3s ease;
                    padding: 0;
                }

                .dot.active {
                    background: #2563eb;
                    border-color: #2563eb;
                    transform: scale(1.2);
                }

                /* Arrow Buttons */
                .slider-arrow {
                    position: absolute;
                    top: 50%;
                    transform: translateY(-50%);
                    background: rgba(0, 0, 0, 0.5);
                    color: white;
                    border: none;
                    padding: 15px 20px;
                    cursor: pointer;
                    border-radius: 50%;
                    font-size: 1.2rem;
                    transition: all 0.3s ease;
                    z-index: 5;
                }

                .slider-arrow:hover {
                    background: rgba(37, 99, 235, 0.8);
                }

                .slider-arrow.prev {
                    left: 15px;
                }

                .slider-arrow.next {
                    right: 15px;
                }

                /* Mobile */
                @media (max-width: 768px) {
                    .news-slider {
                        height: 300px;
                    }

                    .slider-overlay {
                        padding: 20px 15px;
                    }

                    .slider-title {
                        font-size: 1.2rem;
                    }

                    .slider-summary {
                        font-size: 0.85rem;
                        -webkit-line-clamp: 2;
                    }

                    .slider-dots {
                        bottom: 80px;
                        right: 15px;
                    }

                    .slider-arrow {
                        padding: 10px 14px;
                        font-size: 0.9rem;
                    }

                    .slider-arrow.prev {
                        left: 8px;
                    }

                    .slider-arrow.next {
                        right: 8px;
                    }
                }
            `}</style>
        </div>
    );
};

export default NewsSlider;