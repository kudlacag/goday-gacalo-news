import React, { useState, useEffect } from 'react';
import './App.css';
import './components/NewsDashboard.css';

// Sample news data (replace with your CMS integration)
const SAMPLE_NEWS = [
  {
    id: 1,
    title: "Godey Gacalo Celebrates Annual Cultural Festival",
    excerpt: "The city comes alive with traditional music, dance, and food as residents celebrate their rich cultural heritage.",
    category: "Culture",
    date: "2024-01-15",
    author: "Ahmed Hassan",
    image: "https://via.placeholder.com/800x400/1a365d/ffffff?text=Godey+Gacalo+Festival",
    content: "Full article content here..."
  },
  {
    id: 2,
    title: "New Market Opens in Godey Gacalo",
    excerpt: "A modern market facility has opened its doors, providing local businesses with a new space to thrive.",
    category: "Business",
    date: "2024-01-14",
    author: "Fatima Ibrahim",
    image: "https://via.placeholder.com/800x400/2d4a7a/ffffff?text=New+Market",
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
];

function App() {
  const [news, setNews] = useState(SAMPLE_NEWS);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedArticle, setSelectedArticle] = useState(null);

  const categories = ['All', 'Local', 'Culture', 'Business', 'Education', 'Events', 'Sports', 'Politics'];

  const filteredNews = news.filter(item => {
    const matchCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       item.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCategory && matchSearch;
  });

  const sortedNews = [...filteredNews].sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div className="App">
      <Header />
      <Hero />
      
      <main className="main-content">
        <div className="container">
          <div className="news-controls">
            <div className="category-filters">
              {categories.map(cat => (
                <button
                  key={cat}
                  className={`category-btn ${selectedCategory === cat ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
            <div className="search-bar">
              <input
                type="text"
                placeholder="Search news..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <i className="fas fa-search"></i>
            </div>
          </div>

          <div className="featured-news">
            {sortedNews.slice(0, 1).map(article => (
              <FeaturedCard key={article.id} article={article} onReadMore={() => setSelectedArticle(article)} />
            ))}
          </div>

          <div className="news-grid">
            {sortedNews.slice(1).map(article => (
              <NewsCard key={article.id} article={article} onReadMore={() => setSelectedArticle(article)} />
            ))}
          </div>

          {sortedNews.length === 0 && (
            <div className="no-results">
              <h3>No news found</h3>
              <p>Try adjusting your search or filter</p>
            </div>
          )}
        </div>
      </main>

      {selectedArticle && (
        <ArticleModal article={selectedArticle} onClose={() => setSelectedArticle(null)} />
      )}

      <Footer />
    </div>
  );
}

// Header Component
function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="site-header">
      <div className="container">
        <div className="header-content">
          <div className="logo">
            <h1>📰 Godey Gacalo News</h1>
            <span className="tagline">Your Daily Source</span>
          </div>
          
          <button className={`mobile-menu-btn ${menuOpen ? 'active' : ''}`} onClick={() => setMenuOpen(!menuOpen)}>
            <span></span>
            <span></span>
            <span></span>
          </button>

          <nav className={`nav-menu ${menuOpen ? 'open' : ''}`}>
            <a href="#home">Home</a>
            <a href="#local">Local</a>
            <a href="#culture">Culture</a>
            <a href="#business">Business</a>
            <a href="#events">Events</a>
            <a href="#about">About</a>
          </nav>
        </div>
      </div>
    </header>
  );
}

// Hero Component
function Hero() {
  return (
    <section className="hero-section">
      <div className="container">
        <div className="hero-content">
          <h1>Welcome to Godey Gacalo News</h1>
          <p>Your trusted source for local news, events, and stories from our vibrant community</p>
          <div className="hero-stats">
            <div className="stat">
              <span className="number">24/7</span>
              <span className="label">News Coverage</span>
            </div>
            <div className="stat">
              <span className="number">🌍</span>
              <span className="label">Community Focused</span>
            </div>
            <div className="stat">
              <span className="number">📱</span>
              <span className="label">Mobile Ready</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Featured Card Component
function FeaturedCard({ article, onReadMore }) {
  return (
    <div className="featured-card">
      <div className="featured-image">
        <img src={article.image} alt={article.title} />
        <span className="category-badge">{article.category}</span>
      </div>
      <div className="featured-content">
        <h2>{article.title}</h2>
        <p>{article.excerpt}</p>
        <div className="article-meta">
          <span className="date">{new Date(article.date).toLocaleDateString('de-DE')}</span>
          <span className="author">By {article.author}</span>
        </div>
        <button className="read-more-btn" onClick={onReadMore}>
          Read Full Article →
        </button>
      </div>
    </div>
  );
}

// News Card Component
function NewsCard({ article, onReadMore }) {
  return (
    <div className="news-card">
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
        <button className="read-more-btn small" onClick={onReadMore}>
          Read More →
        </button>
      </div>
    </div>
  );
}

// Article Modal Component
function ArticleModal({ article, onClose }) {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>×</button>
        <div className="modal-image">
          <img src={article.image} alt={article.title} />
        </div>
        <div className="modal-body">
          <span className="category-badge">{article.category}</span>
          <h2>{article.title}</h2>
          <div className="article-meta">
            <span className="date">{new Date(article.date).toLocaleDateString('de-DE')}</span>
            <span className="author">By {article.author}</span>
          </div>
          <div className="article-content">
            <p>{article.content}</p>
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
            <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Footer Component
function Footer() {
  return (
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
            <a href="#about">About Us</a>
          </div>
          <div className="footer-section">
            <h4>Connect With Us</h4>
            <div className="social-links">
              <a href="#"><i className="fab fa-facebook"></i></a>
              <a href="#"><i className="fab fa-twitter"></i></a>
              <a href="#"><i className="fab fa-instagram"></i></a>
              <a href="#"><i className="fab fa-telegram"></i></a>
            </div>
            <p className="contact-info">📧 news@godeygacalo.com</p>
            <p className="contact-info">📞 +251 911 234 567</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2024 Godey Gacalo News. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export default App;