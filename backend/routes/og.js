// routes/og.js
const express = require('express');
const router = express.Router();
const News = require('../models/News');

// ✅ Get article for social media sharing
router.get('/news/:id', async (req, res) => {
    try {
        const news = await News.findById(req.params.id);
        
        if (!news) {
            // If no article found, redirect to homepage
            return res.redirect('https://www.godaygacalo.com');
        }

        // Get the first image or use default
        let imageUrl = 'https://www.godaygacalo.com/images/og-default.jpg';
        if (news.images && news.images.length > 0) {
            // If image is stored as /uploads/filename.jpg
            if (news.images[0].startsWith('/uploads')) {
                imageUrl = `https://goday-gacalo-news.onrender.com${news.images[0]}`;
            } else {
                imageUrl = news.images[0];
            }
        }

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
        body { 
            font-family: Arial, sans-serif; 
            max-width: 800px; 
            margin: 50px auto; 
            padding: 20px;
            text-align: center;
        }
        img { max-width: 100%; border-radius: 10px; }
        .card { 
            background: #f0f4ff; 
            padding: 30px; 
            border-radius: 16px;
            box-shadow: 0 4px 20px rgba(37, 99, 235, 0.1);
        }
        .meta { color: #718096; font-size: 0.9rem; }
        .read-more { 
            display: inline-block; 
            background: #2563eb; 
            color: white; 
            padding: 12px 24px; 
            border-radius: 8px; 
            text-decoration: none;
            margin-top: 15px;
        }
    </style>
</head>
<body>
    <div class="card">
        <img src="${imageUrl}" alt="${escapeHtml(news.title)}" />
        <h1>${escapeHtml(news.title)}</h1>
        <p>${escapeHtml(description)}</p>
        <div class="meta">
            📅 ${new Date(news.publishedDate).toLocaleDateString()} 
            • 📝 ${escapeHtml(news.author || 'Godey Gacalo News')}
        </div>
        <a href="https://www.godaygacalo.com/#/news/${news._id}" class="read-more">
            📰 Read Full Article
        </a>
        <p style="margin-top: 20px; color: #a0aec0; font-size: 0.8rem;">
            Godey Gacalo News • Your trusted source
        </p>
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

// Helper function to escape HTML
function escapeHtml(text) {
    if (!text) return '';
    const div = document?.createElement?.('div') || { textContent: '' };
    if (div.textContent !== undefined) {
        div.textContent = text;
        return div.innerHTML;
    }
    // Fallback for Node.js
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// Simple escape for Node.js
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