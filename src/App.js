import React, { useState } from 'react';
import './App.css';

function App() {
  const [news] = useState([
    {
      id: 1,
      title: "Godey Gacalo Celebrates Annual Cultural Festival",
      excerpt: "The city comes alive with traditional music, dance, and food as residents celebrate their rich cultural heritage.",
      category: "Culture",
      date: "2024-01-15",
      author: "Ahmed Hassan",
      image: "https://via.placeholder.com/800x400/1a365d/ffffff?text=Festival",
      content: "Full article content here..."
    },
    {
      id: 2,
      title: "New Market Opens in Godey Gacalo",
      excerpt: "A modern market facility has opened its doors, providing local businesses with a new space to thrive.",
      category: "Business",
      date: "2024-01-14",
      author: "Fatima Ibrahim",
      image: "https://via.placeholder.com/800x400/2d4a7a/ffffff?text=Market",
      content: "Full article content here..."
    },
    {
      id: 3,
      title: "Education Initiative Launches in Local Schools",
      excerpt: "A new program aims to improve literacy rates and provide better learning resources for students.",
      category: "Education",
      date: "2024-01-13",
      author: "Mohammed Ali",
      image: "https://via.placeholder.com/800x400/4a6fa5/ffffff?text=Education",
      content: "Full article content here..."
    }
  ]);

  return (
    <div className="App">
      <header className="site-header">
        <div className="container">
          <div className="header-content">
            <div className="logo">
              <h1>📰 Godey Gacalo News</h1>
              <span className="tagline">Your Daily Source</span>
            </div>
            <nav className="nav-menu">
              <a href="#home">Home</a>
              <a href="#local">Local</a>
              <a href="#culture">Culture</a>
              <a href="#business">Business</a>
              <a href="#events">Events</a>
            </nav>
          </div>
        </div>
      </header>

      <section className="hero-section">
        <div className="container">
          <div className="hero-content">
            <h1>Welcome to Godey Gacalo News</h1>
            <p>Your trusted source for local news, events, and stories from our vibrant community</p>
          </div>
        </div>
      </section>

      <main className="main-content">
        <div className="container">
          <div className="news-grid">
            {news.map(article => (
              <div key={article.id} className="news-card">
                <div className="card-image">
                  <img src={article.image} alt={article.title} />
                  <span className="category-badge">{article.category}</span>
                </div>
                <div className="card-content">
                  <h3>{article.title}</h3>
                  <p>{article.excerpt}</p>
                  <div className="article-meta">
                    <span className="date">{new Date(article.date).toLocaleDateString('de-DE')}</span>
                    <span className="author">By {article.author}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <footer className="site-footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <h3>📰 Godey Gacalo News</h3>
              <p>Bringing you the latest news from our community</p>
            </div>
            <div className="footer-section">
              <h4>Quick Links</h4>
              <a href="#home">Home</a>
              <a href="#local">Local News</a>
              <a href="#culture">Culture</a>
            </div>
            <div className="footer-section">
              <h4>Connect With Us</h4>
              <div className="social-links">
                <a href="#"><i className="fab fa-facebook"></i></a>
                <a href="#"><i className="fab fa-twitter"></i></a>
                <a href="#"><i className="fab fa-instagram"></i></a>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2024 Godey Gacalo News. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;