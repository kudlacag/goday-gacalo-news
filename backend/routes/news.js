const express = require('express');
const router = express.Router();
const News = require('../models/News');

// ========== GET ALL NEWS ==========
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 15;
        const skip = (page - 1) * limit;
        const category = req.query.category;

        const filter = {};
        if (category && category !== 'All') {
            filter.category = category;
        }

        const news = await News.find(filter)
            .sort({ publishedDate: -1, createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await News.countDocuments(filter);

        res.json({
            success: true,
            data: news,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('❌ Error fetching news:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// ========== GET FEATURED NEWS ==========
router.get('/featured', async (req, res) => {
    try {
        const featured = await News.find({ featured: true })
            .sort({ publishedDate: -1 })
            .limit(5);

        res.json({
            success: true,
            data: featured
        });
    } catch (error) {
        console.error('❌ Error fetching featured news:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// ========== GET SINGLE NEWS ==========
router.get('/:id', async (req, res) => {
    try {
        const news = await News.findById(req.params.id);

        if (!news) {
            return res.status(404).json({
                success: false,
                error: 'News not found'
            });
        }

        news.views = (news.views || 0) + 1;
        await news.save();

        res.json({
            success: true,
            data: news
        });
    } catch (error) {
        console.error('❌ Error fetching news:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// ========== SEARCH NEWS ==========
router.get('/search', async (req, res) => {
    try {
        const query = req.query.q;
        if (!query) {
            return res.status(400).json({
                success: false,
                error: 'Search query is required'
            });
        }

        const news = await News.find({
            $or: [
                { title: { $regex: query, $options: 'i' } },
                { content: { $regex: query, $options: 'i' } },
                { summary: { $regex: query, $options: 'i' } },
                { tags: { $regex: query, $options: 'i' } }
            ]
        }).sort({ publishedDate: -1 });

        res.json({
            success: true,
            data: news,
            total: news.length
        });
    } catch (error) {
        console.error('❌ Error searching news:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// ========== INCREMENT VIEW COUNT ==========
router.post('/:id/view', async (req, res) => {
    try {
        const news = await News.findByIdAndUpdate(
            req.params.id,
            { $inc: { views: 1 } },
            { new: true }
        );

        if (!news) {
            return res.status(404).json({
                success: false,
                error: 'News not found'
            });
        }

        res.json({
            success: true,
            data: news
        });
    } catch (error) {
        console.error('❌ Error incrementing view:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// ========== ADD COMMENT ==========
router.post('/:id/comments', async (req, res) => {
    try {
        const { text, username, userId } = req.body;

        if (!text || !username) {
            return res.status(400).json({
                success: false,
                error: 'Text and username are required'
            });
        }

        const news = await News.findByIdAndUpdate(
            req.params.id,
            {
                $push: {
                    comments: {
                        user: userId || null,
                        username: username,
                        text: text,
                        createdAt: new Date()
                    }
                }
            },
            { new: true }
        );

        if (!news) {
            return res.status(404).json({
                success: false,
                error: 'News not found'
            });
        }

        const newComment = news.comments[news.comments.length - 1];
        res.json({
            success: true,
            comment: newComment
        });
    } catch (error) {
        console.error('❌ Error adding comment:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// ========== DELETE COMMENT ==========
router.delete('/:id/comments/:commentId', async (req, res) => {
    try {
        const news = await News.findByIdAndUpdate(
            req.params.id,
            {
                $pull: {
                    comments: { _id: req.params.commentId }
                }
            },
            { new: true }
        );

        if (!news) {
            return res.status(404).json({
                success: false,
                error: 'News not found'
            });
        }

        res.json({
            success: true,
            message: 'Comment deleted successfully'
        });
    } catch (error) {
        console.error('❌ Error deleting comment:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;