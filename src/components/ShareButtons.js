import React, { useState } from 'react';
import { getImageUrl } from '../api/api';

const ShareButtons = ({ article }) => {
    const [copied, setCopied] = useState(false);

    if (!article) return null;

    // Get the first image or use default
    const getImage = () => {
        if (article.images && article.images.length > 0) {
            return getImageUrl(article.images[0]);
        }
        return 'https://www.godaygacalo.com/images/og-default.jpg';
    };

    // Build the share URL using the OG route
    // In ShareButtons.js - Update the shareUrl
   // In ShareButtons.js - Update the shareUrl
const shareUrl = `https://www.godaygacalo.com/og.html#news/${article._id}`;
    const title = article.title;
    const summary = article.summary || article.content.substring(0, 150);

    // Share handlers
    const shareOnWhatsApp = () => {
        window.open(
            `https://wa.me/?text=${encodeURIComponent(`${title}\n\n${summary}\n\n📰 ${shareUrl}`)}`,
            '_blank'
        );
    };

    const shareOnFacebook = () => {
        window.open(
            `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
            '_blank'
        );
    };

    const shareOnTwitter = () => {
        window.open(
            `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(shareUrl)}`,
            '_blank'
        );
    };

    const shareOnLinkedIn = () => {
        window.open(
            `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
            '_blank'
        );
    };

    const shareOnTelegram = () => {
        window.open(
            `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(title)}`,
            '_blank'
        );
    };

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 3000);
        } catch (error) {
            console.error('Copy failed:', error);
        }
    };

    return (
        <div className="share-buttons-container">
            <div className="share-label">
                <span>📤 Share this article</span>
            </div>
            
            <div className="share-buttons">
                {/* WhatsApp */}
                <button 
                    className="share-btn whatsapp" 
                    onClick={shareOnWhatsApp}
                    title="Share on WhatsApp"
                >
                    <span className="share-icon">📱</span>
                    <span className="share-name">WhatsApp</span>
                </button>

                {/* Facebook */}
                <button 
                    className="share-btn facebook" 
                    onClick={shareOnFacebook}
                    title="Share on Facebook"
                >
                    <span className="share-icon">👍</span>
                    <span className="share-name">Facebook</span>
                </button>

                {/* Twitter */}
                <button 
                    className="share-btn twitter" 
                    onClick={shareOnTwitter}
                    title="Share on Twitter"
                >
                    <span className="share-icon">🐦</span>
                    <span className="share-name">Twitter</span>
                </button>

                {/* LinkedIn */}
                <button 
                    className="share-btn linkedin" 
                    onClick={shareOnLinkedIn}
                    title="Share on LinkedIn"
                >
                    <span className="share-icon">💼</span>
                    <span className="share-name">LinkedIn</span>
                </button>

                {/* Telegram */}
                <button 
                    className="share-btn telegram" 
                    onClick={shareOnTelegram}
                    title="Share on Telegram"
                >
                    <span className="share-icon">✈️</span>
                    <span className="share-name">Telegram</span>
                </button>

                {/* Copy Link */}
                <button 
                    className={`share-btn copy ${copied ? 'copied' : ''}`} 
                    onClick={copyToClipboard}
                    title="Copy link"
                >
                    <span className="share-icon">{copied ? '✅' : '📋'}</span>
                    <span className="share-name">{copied ? 'Copied!' : 'Copy Link'}</span>
                </button>
            </div>

            <style>{`
                .share-buttons-container {
                    margin: 25px 0;
                    padding: 20px;
                    background: #f7fafc;
                    border-radius: 12px;
                    border: 1px solid #e2e8f0;
                }

                .share-label {
                    text-align: center;
                    margin-bottom: 15px;
                    font-size: 0.95rem;
                    font-weight: 600;
                    color: #2d3748;
                }

                .share-buttons {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 10px;
                    justify-content: center;
                }

                .share-btn {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 10px 18px;
                    border: none;
                    border-radius: 8px;
                    font-size: 0.9rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    color: white;
                    min-width: 100px;
                    justify-content: center;
                }

                .share-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                }

                .share-btn:active {
                    transform: translateY(0px);
                }

                .share-icon {
                    font-size: 1.2rem;
                }

                .share-name {
                    font-size: 0.85rem;
                }

                /* Platform Colors */
                .share-btn.whatsapp {
                    background: #25D366;
                }
                .share-btn.whatsapp:hover {
                    background: #1da851;
                }

                .share-btn.facebook {
                    background: #1877F2;
                }
                .share-btn.facebook:hover {
                    background: #0d65d9;
                }

                .share-btn.twitter {
                    background: #000000;
                }
                .share-btn.twitter:hover {
                    background: #1a1a1a;
                }

                .share-btn.linkedin {
                    background: #0A66C2;
                }
                .share-btn.linkedin:hover {
                    background: #0855a3;
                }

                .share-btn.telegram {
                    background: #0088cc;
                }
                .share-btn.telegram:hover {
                    background: #0077b3;
                }

                .share-btn.copy {
                    background: #718096;
                }
                .share-btn.copy:hover {
                    background: #4a5568;
                }
                .share-btn.copy.copied {
                    background: #48bb78;
                }

                /* Responsive */
                @media (max-width: 640px) {
                    .share-btn {
                        min-width: 70px;
                        padding: 8px 12px;
                        font-size: 0.8rem;
                    }
                    .share-name {
                        display: none;
                    }
                    .share-icon {
                        font-size: 1.5rem;
                    }
                }

                @media (max-width: 480px) {
                    .share-buttons {
                        gap: 6px;
                    }
                    .share-btn {
                        padding: 8px 12px;
                        min-width: 50px;
                        border-radius: 50%;
                        width: 44px;
                        height: 44px;
                    }
                    .share-name {
                        display: none;
                    }
                    .share-icon {
                        font-size: 1.3rem;
                        margin: 0;
                    }
                }
            `}</style>
        </div>
    );
};

export default ShareButtons;