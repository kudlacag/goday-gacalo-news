const express = require('express');
const router = express.Router();
const News = require('../models/News');

// ✅ Test route to verify OG routes are working
router.get('/test', (req, res) => {
    res.json({ 
        success: true, 
        message: '✅ OG routes are working!',
        timestamp: new Date().toISOString()
    });
});

// ✅ Get article for social media sharing
router.get('/news/:id', async (req, res) => {
    try {
        const news = await News.findById(req.params.id);
        
        if (!news) {
            // If no article found, show a 404 page with OG tags
            return res.status(404).send(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Article Not Found - Godey Gacalo News</title>
                    <meta property="og:title" content="Article Not Found" />
                    <meta property="og:description" content="The article you're looking for doesn't exist." />
                    <meta property="og:image" content="https://www.godaygacalo.com/images/og-default.jpg" />
                    <meta property="og:url" content="https://www.godaygacalo.com/" />
                    <meta name="twitter:card" content="summary_large_image" />
                </head>
                <body>
                    <h1>Article Not Found</h1>
                    <p>The article you're looking for doesn't exist.</p>
                    <a href="https://www.godaygacalo.com">Go to Homepage</a>
                </body>
                </html>
            `);
        }

        // ✅ Get the first image or use default
        let imageUrl = 'https://www.godaygacalo.com/images/og-default.jpg';
        
        if (news.images && news.images.length > 0) {
            let img = news.images[0];
            
            // If image is stored as /uploads/filename.jpg
            if (img.startsWith('/uploads')) {
                imageUrl = `https://goday-gacalo-news.onrender.com${img}`;
            }
            // If it's already a full URL
            else if (img.startsWith('http')) {
                // Replace localhost with production URL and ensure HTTPS
                imageUrl = img.replace('http://localhost:5000', 'https://goday-gacalo-news.onrender.com');
                imageUrl = imageUrl.replace('http://', 'https://');
            }
            // If it's just a filename
            else {
                imageUrl = `https://goday-gacalo-news.onrender.com/uploads/${img}`;
            }
        }

        // ✅ Log for debugging
        console.log('📸 OG Image URL:', imageUrl);
        console.log('📰 OG Article:', news.title);

        // Clean up content for description
        const description = news.summary || news.content.substring(0, 150) + '...';

        // Generate the HTML with OG tags
        const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(news.title)} - Godey Gacalo News</title>
    
    <!-- ✅ Open Graph / Facebook -->
    <meta property="og:type" content="article" />
    <meta property="og:url" content="https://www.godaygacalo.com/news/${news._id}" />
    <meta property="og:title" content="${escapeHtml(news.title)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:image" content="${imageUrl}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:type" content="image/jpeg" />
    <meta property="og:site_name" content="Godey Gacalo News" />
    <meta property="article:published_time" content="${news.publishedDate}" />
    <meta property="article:author" content="${escapeHtml(news.author || 'Godey Gacalo News')}" />
    
    <!-- ✅ Twitter Card -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:url" content="https://www.godaygacalo.com/news/${news._id}" />
    <meta name="twitter:title" content="${escapeHtml(news.title)}" />
    <meta name="twitter:description" content="${escapeHtml(description)}" />
    <meta name="twitter:image" content="${imageUrl}" />
    
    <!-- ✅ WhatsApp specific -->
    <meta property="og:image:secure_url" content="${imageUrl}" />
    
    <!-- Redirect to the actual article page -->
    <meta http-equiv="refresh" content="0; url=https://www.godaygacalo.com/#/news/${news._id}" />
    
    <!-- Fallback if redirect doesn't work -->
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
            background: #f0f4ff;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        .card { 
            background: white;
            max-width: 800px;
            width: 100%;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 4px 20px rgba(37, 99, 235, 0.15);
        }
        .card-image {
            width: 100%;
            height: 400px;
            object-fit: cover;
            background: #e2e8f0;
        }
        .card-content {
            padding: 30px;
        }
        .card-title {
            font-size: 1.8rem;
            color: #1a365d;
            margin-bottom: 12px;
            line-height: 1.3;
        }
        .card-description {
            color: #4a5568;
            font-size: 1.1rem;
            line-height: 1.6;
            margin-bottom: 16px;
        }
        .card-meta {
            color: #718096;
            font-size: 0.9rem;
            margin-bottom: 20px;
        }
        .card-button {
            display: inline-block;
            background: #2563eb;
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            text-decoration: none;
            font-weight: 600;
            transition: background 0.3s;
        }
        .card-button:hover {
            background: #1a365d;
        }
        .card-footer {
            margin-top: 20px;
            padding-top: 20px;
            border-top: 1px solid #e2e8f0;
            color: #a0aec0;
            font-size: 0.85rem;
            text-align: center;
        }
        @media (max-width: 640px) {
            .card-image { height: 250px; }
            .card-title { font-size: 1.4rem; }
            .card-content { padding: 20px; }
        }
    </style>
</head>
<body>
    <div class="card">
        <img src="${imageUrl}" alt="${escapeHtml(news.title)}" class="card-image" />
        <div class="card-content">
            <h1 class="card-title">${escapeHtml(news.title)}</h1>
            <p class="card-description">${escapeHtml(description)}</p>
            <div class="card-meta">
                📅 ${new Date(news.publishedDate).toLocaleDateString()} 
                • 📝 ${escapeHtml(news.author || 'Godey Gacalo News')}
                • 📂 ${escapeHtml(news.category)}
            </div>
            <a href="https://www.godaygacalo.com/#/news/${news._id}" class="card-button">
                📰 Read Full Article
            </a>
            <div class="card-footer">
                Godey Gacalo News • Your trusted source
            </div>
        </div>
    </div>
</body>
</html>
        `;

        res.send(html);
        
    } catch (error) {
        console.error('❌ OG generation error:', error);
        // On error, redirect to homepage
        res.redirect('https://www.godaygacalo.com');
    }
});

// ✅ Helper function to escape HTML (defined ONCE)
function escapeHtml(text) {
    if (!text) return '';
    return String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

module.exports = router;