import React from 'react';
import { Link } from 'react-router-dom';

function NotFound() {
    return (
        <div className="not-found">
            <h1>404</h1>
            <h2>Page Not Found</h2>
            <p>The page you're looking for doesn't exist.</p>
            <Link to="/">← Go Home</Link>
            
            <style>{`
                .not-found {
                    text-align: center;
                    padding: 60px 20px;
                }
                .not-found h1 {
                    font-size: 4rem;
                    color: #1a365d;
                    margin-bottom: 10px;
                }
                .not-found h2 {
                    font-size: 2rem;
                    color: #4a5568;
                    margin-bottom: 20px;
                }
                .not-found a {
                    display: inline-block;
                    margin-top: 20px;
                    padding: 12px 30px;
                    background: #1a365d;
                    color: white;
                    text-decoration: none;
                    border-radius: 6px;
                }
            `}</style>
        </div>
    );
}

export default NotFound;