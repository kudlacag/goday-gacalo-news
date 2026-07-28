import React, { useState } from 'react';

// ✅ API URL configuration
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// ✅ Helper function to fix image URLs
const getImageUrl = (imagePath) => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http')) return imagePath;
    if (imagePath.startsWith('/uploads')) {
        return `${API_URL}${imagePath}`;
    }
    return `${API_URL}/uploads/${imagePath}`;
};

const ImageSlider = ({ images }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFullscreen, setIsFullscreen] = useState(false);

    // ✅ Process images through getImageUrl
    const processedImages = images && images.length > 0 
        ? images.map(img => getImageUrl(img))
        : [];

    if (!processedImages || processedImages.length === 0) {
        return null;
    }

    if (processedImages.length === 1) {
        return (
            <div className="single-image-container">
                <img 
                    src={processedImages[0]} 
                    alt="Article image"
                    className="single-image"
                    onClick={() => setIsFullscreen(true)}
                />
                {isFullscreen && (
                    <div className="fullscreen-overlay" onClick={() => setIsFullscreen(false)}>
                        <img src={processedImages[0]} alt="Fullscreen" />
                        <button className="close-fullscreen">✕</button>
                    </div>
                )}
                <style>{`
                    .single-image-container {
                        margin: 20px 0;
                        border-radius: 12px;
                        overflow: hidden;
                        background: #1a202c;
                        cursor: pointer;
                    }

                    .single-image {
                        width: 100%;
                        max-height: 500px;
                        object-fit: cover;
                        display: block;
                        transition: opacity 0.3s ease;
                    }

                    .single-image:hover {
                        opacity: 0.95;
                    }

                    .fullscreen-overlay {
                        position: fixed;
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        background: rgba(0, 0, 0, 0.95);
                        z-index: 9999;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        cursor: pointer;
                        animation: fadeIn 0.3s ease;
                    }

                    .fullscreen-overlay img {
                        max-width: 90vw;
                        max-height: 90vh;
                        object-fit: contain;
                    }

                    .close-fullscreen {
                        position: absolute;
                        top: 20px;
                        right: 30px;
                        background: none;
                        border: none;
                        color: white;
                        font-size: 2rem;
                        cursor: pointer;
                        z-index: 10;
                    }

                    @keyframes fadeIn {
                        from { opacity: 0; }
                        to { opacity: 1; }
                    }
                `}</style>
            </div>
        );
    }

    const goToPrevious = () => {
        setCurrentIndex((prevIndex) => 
            prevIndex === 0 ? processedImages.length - 1 : prevIndex - 1
        );
    };

    const goToNext = () => {
        setCurrentIndex((prevIndex) => 
            prevIndex === processedImages.length - 1 ? 0 : prevIndex + 1
        );
    };

    const goToSlide = (index) => {
        setCurrentIndex(index);
    };

    const toggleFullscreen = () => {
        setIsFullscreen(!isFullscreen);
    };

    return (
        <div className={`slider-container ${isFullscreen ? 'fullscreen' : ''}`}>
            <div className="slider-main">
                <button className="slider-btn prev" onClick={goToPrevious}>
                    ❮
                </button>
                
                <div className="slider-image-wrapper">
                    <img 
                        src={processedImages[currentIndex]} 
                        alt={`Slide ${currentIndex + 1}`}
                        className="slider-image"
                        onClick={toggleFullscreen}
                    />
                    <div className="image-counter">
                        {currentIndex + 1} / {processedImages.length}
                    </div>
                    <button className="fullscreen-btn" onClick={toggleFullscreen}>
                        ⛶
                    </button>
                </div>

                <button className="slider-btn next" onClick={goToNext}>
                    ❯
                </button>
            </div>

            <div className="slider-thumbnails">
                {processedImages.map((image, index) => (
                    <div
                        key={index}
                        className={`thumbnail ${index === currentIndex ? 'active' : ''}`}
                        onClick={() => goToSlide(index)}
                    >
                        <img src={image} alt={`Thumbnail ${index + 1}`} />
                    </div>
                ))}
            </div>

            <style>{`
                .slider-container {
                    position: relative;
                    width: 100%;
                    margin: 20px 0;
                }

                .slider-container.fullscreen {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    z-index: 9999;
                    background: rgba(0, 0, 0, 0.95);
                    margin: 0;
                    padding: 20px;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                }

                .slider-main {
                    position: relative;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 100%;
                }

                .slider-image-wrapper {
                    position: relative;
                    width: 100%;
                    max-width: 800px;
                    max-height: 500px;
                    overflow: hidden;
                    border-radius: 12px;
                    background: #1a202c;
                }

                .slider-container.fullscreen .slider-image-wrapper {
                    max-height: 80vh;
                    max-width: 90vw;
                }

                .slider-image {
                    width: 100%;
                    height: 100%;
                    max-height: 500px;
                    object-fit: contain;
                    cursor: pointer;
                    transition: transform 0.3s ease;
                }

                .slider-container.fullscreen .slider-image {
                    max-height: 80vh;
                    cursor: default;
                }

                .slider-btn {
                    position: absolute;
                    top: 50%;
                    transform: translateY(-50%);
                    background: rgba(0, 0, 0, 0.6);
                    color: white;
                    border: none;
                    padding: 15px 20px;
                    cursor: pointer;
                    border-radius: 50%;
                    font-size: 1.5rem;
                    transition: background 0.3s ease;
                    z-index: 10;
                }

                .slider-btn:hover {
                    background: rgba(0, 0, 0, 0.9);
                }

                .slider-btn.prev {
                    left: 10px;
                }

                .slider-btn.next {
                    right: 10px;
                }

                .slider-container.fullscreen .slider-btn {
                    padding: 20px 25px;
                    font-size: 2rem;
                }

                .image-counter {
                    position: absolute;
                    bottom: 15px;
                    right: 15px;
                    background: rgba(0, 0, 0, 0.7);
                    color: white;
                    padding: 5px 12px;
                    border-radius: 20px;
                    font-size: 0.85rem;
                    z-index: 5;
                }

                .fullscreen-btn {
                    position: absolute;
                    top: 15px;
                    right: 15px;
                    background: rgba(0, 0, 0, 0.7);
                    color: white;
                    border: none;
                    padding: 8px 12px;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 1.2rem;
                    z-index: 5;
                    transition: background 0.3s ease;
                }

                .fullscreen-btn:hover {
                    background: rgba(0, 0, 0, 0.9);
                }

                .slider-thumbnails {
                    display: flex;
                    gap: 10px;
                    justify-content: center;
                    margin-top: 15px;
                    flex-wrap: wrap;
                }

                .slider-container.fullscreen .slider-thumbnails {
                    margin-top: 20px;
                }

                .thumbnail {
                    width: 70px;
                    height: 50px;
                    overflow: hidden;
                    border-radius: 6px;
                    cursor: pointer;
                    border: 3px solid transparent;
                    transition: border-color 0.3s ease;
                }

                .slider-container.fullscreen .thumbnail {
                    width: 100px;
                    height: 70px;
                }

                .thumbnail.active {
                    border-color: #2563eb;
                }

                .thumbnail:hover {
                    opacity: 0.8;
                }

                .thumbnail img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                @media (max-width: 768px) {
                    .slider-btn {
                        padding: 10px 15px;
                        font-size: 1rem;
                    }

                    .thumbnail {
                        width: 50px;
                        height: 40px;
                    }

                    .slider-container.fullscreen .thumbnail {
                        width: 60px;
                        height: 50px;
                    }

                    .slider-container.fullscreen .slider-btn {
                        padding: 15px 20px;
                        font-size: 1.5rem;
                    }
                }
            `}</style>
        </div>
    );
};

export default ImageSlider;