const express = require('express');
const router = express.Router();
const News = require('../models/News');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
const path = require('path');
const fs = require('fs');

// ========== CLOUDINARY CONFIGURATION ==========
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

console.log('📸 Cloudinary configured for:', process.env.CLOUDINARY_CLOUD_NAME);

// ========== CLOUDINARY STORAGE ==========
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'godey-news',
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
        transformation: [{ width: 1200, height: 800, crop: 'limit' }]
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Only images are allowed'));
    }
});

// ========== AUTHENTICATION MIDDLEWARE ==========
const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({
                success: false,
                error: 'No token provided'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        const user = await User.findById(decoded.id);

        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'User not found'
            });
        }

        req.user = user;
        req.token = token;
        next();
    } catch (error) {
        console.error('Auth error:', error);
        res.status(401).json({
            success: false,
            error: 'Please authenticate'
        });
    }
};

// ========== REPORTER MIDDLEWARE ==========
const isReporter = async (req, res, next) => {
    try {
        const allowedRoles = ['reporter', 'admin', 'super_admin'];
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                error: 'Reporter access required'
            });
        }
        next();
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// ========== SUPER ADMIN MIDDLEWARE ==========
const isSuperAdmin = async (req, res, next) => {
    try {
        if (req.user.role !== 'super_admin') {
            return res.status(403).json({
                success: false,
                error: 'Super Admin access required'
            });
        }
        next();
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// ========== ADMIN LOGIN ==========
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'Invalid credentials'
            });
        }

        if (user.role !== 'admin' && user.role !== 'super_admin' && user.role !== 'reporter') {
            return res.status(403).json({
                success: false,
                error: 'Admin/Reporter access required'
            });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                error: 'Invalid credentials'
            });
        }

        const token = jwt.sign(
            { id: user._id, email: user.email, role: user.role },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '7d' }
        );

        res.json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error during login'
        });
    }
});

// ========== CREATE NEWS ==========
// ✅ Reporters, Admins, and Super Admins can create news
router.post('/news', auth, isReporter, upload.array('images', 10), async (req, res) => {
    console.log('📝 POST /api/admin/news');
    console.log('📝 User:', req.user?.email);
    console.log('📝 Role:', req.user?.role);
    console.log('📝 Body:', req.body);
    console.log('📝 Files:', req.files ? req.files.length : 0);

    try {
        const { title, category, summary, content, featured, tags } = req.body;

        if (!title || !category || !summary || !content) {
            return res.status(400).json({
                success: false,
                error: 'Title, category, summary, and content are required'
            });
        }

        // ✅ Get Cloudinary URLs from uploaded files
        let imageUrls = [];
        if (req.files && req.files.length > 0) {
            imageUrls = req.files.map(file => file.path); // Cloudinary secure URL
            console.log('📸 Cloudinary URLs:', imageUrls);
        }

        const authorName = req.user.name || 'Godey Gacalo News';
        const authorId = req.user._id;

        const isFeatured = featured === 'true' || featured === true;

        let tagsArray = [];
        if (tags) {
            tagsArray = typeof tags === 'string' ? tags.split(',').map(t => t.trim()).filter(Boolean) : tags;
        }

        const newNews = new News({
            title: title.trim(),
            category: category,
            summary: summary.trim(),
            content: content.trim(),
            author: authorName,
            authorId: authorId,
            publishedDate: new Date(),
            featured: isFeatured,
            tags: tagsArray,
            images: imageUrls
        });

        await newNews.save();
        console.log('✅ News created:', newNews.title);

        res.status(201).json({
            success: true,
            message: `News created successfully with ${imageUrls.length} images!`,
            data: newNews
        });
    } catch (error) {
        console.error('❌ Error creating news:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// ========== UPDATE NEWS ==========
// ✅ Only Admins and Super Admins can update (and only their own articles)
// ✅ Reporters can update their own articles
router.put('/news/:id', auth, isReporter, upload.array('images', 10), async (req, res) => {
    try {
        const { title, category, summary, content, featured, tags } = req.body;
        const news = await News.findById(req.params.id);

        if (!news) {
            return res.status(404).json({
                success: false,
                error: 'News not found'
            });
        }

        // ✅ Check if user can edit this article
        const isAuthor = news.authorId.toString() === req.user._id.toString();
        const isSuperAdmin = req.user.role === 'super_admin';

        // Super Admin can edit anything
        // Admin/Reporter can only edit their own articles
        if (!isSuperAdmin && !isAuthor) {
            return res.status(403).json({
                success: false,
                error: 'You can only edit your own articles'
            });
        }

        if (title) news.title = title.trim();
        if (category) news.category = category;
        if (summary) news.summary = summary.trim();
        if (content) news.content = content.trim();
        if (featured !== undefined) news.featured = featured === 'true' || featured === true;
        if (tags) {
            news.tags = typeof tags === 'string' ? tags.split(',').map(t => t.trim()).filter(Boolean) : tags;
        }

        // ✅ Add new images from Cloudinary
        if (req.files && req.files.length > 0) {
            const newImages = req.files.map(file => file.path);
            news.images = [...news.images, ...newImages];
            console.log('📸 Added new Cloudinary images:', newImages);
        }

        await news.save();

        res.json({
            success: true,
            message: 'News updated successfully!',
            data: news
        });
    } catch (error) {
        console.error('❌ Error updating news:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// ========== DELETE NEWS ==========
// ✅ Super Admin can delete any article
// ✅ Admin can delete only their own articles
// ✅ Reporter can delete only their own articles
router.delete('/news/:id', auth, isReporter, async (req, res) => {
    try {
        const news = await News.findById(req.params.id);
        
        if (!news) {
            return res.status(404).json({
                success: false,
                error: 'News not found'
            });
        }

        // ✅ Check permissions
        const isAuthor = news.authorId.toString() === req.user._id.toString();
        const isSuperAdmin = req.user.role === 'super_admin';

        // Super Admin can delete anything
        // Admin/Reporter can only delete their own articles
        if (!isSuperAdmin && !isAuthor) {
            return res.status(403).json({
                success: false,
                error: 'You can only delete your own articles'
            });
        }

        // ✅ Delete images from Cloudinary
        if (news.images && news.images.length > 0) {
            for (const imageUrl of news.images) {
                try {
                    // Extract public ID from Cloudinary URL
                    // Example: https://res.cloudinary.com/cloud_name/image/upload/v1234567890/godey-news/filename.jpg
                    const parts = imageUrl.split('/');
                    const filename = parts[parts.length - 1];
                    const publicId = `godey-news/${filename.split('.')[0]}`;
                    await cloudinary.uploader.destroy(publicId);
                    console.log('🗑️ Deleted from Cloudinary:', publicId);
                } catch (err) {
                    console.error('Error deleting image from Cloudinary:', err);
                }
            }
        }

        await News.findByIdAndDelete(req.params.id);
        
        res.json({
            success: true,
            message: 'News deleted successfully'
        });
    } catch (error) {
        console.error('❌ Error deleting news:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// ========== GET ALL NEWS (Admin/Reporter) ==========
// ✅ Super Admin and Admin can see all articles
// ✅ Reporter can only see their own articles
router.get('/news', auth, isReporter, async (req, res) => {
    try {
        let query = {};
        
        // ✅ Reporters only see their own articles
        if (req.user.role === 'reporter') {
            query.authorId = req.user._id;
        }
        // ✅ Admins and Super Admins see all articles (no filter)

        const news = await News.find(query)
            .sort({ publishedDate: -1 })
            .populate('authorId', 'name email username');

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

// ========== GET ALL USERS ==========
router.get('/users', auth, isSuperAdmin, async (req, res) => {
    try {
        const users = await User.find()
            .select('-password -resetPasswordToken -resetPasswordExpires')
            .sort({ createdAt: -1 });
        
        res.json({
            success: true,
            data: users
        });
    } catch (error) {
        console.error('❌ Error fetching users:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// ========== CREATE USER ==========
router.post('/users', auth, isSuperAdmin, async (req, res) => {
    try {
        const { name, username, email, password, mobile, age, sex, role } = req.body;
        
        if (!name || !username || !email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Name, username, email, and password are required'
            });
        }
        
        const existingUser = await User.findOne({
            $or: [{ email: email.toLowerCase() }, { username: username.toLowerCase() }]
        });
        
        if (existingUser) {
            return res.status(400).json({
                success: false,
                error: 'User with this email or username already exists'
            });
        }
        
        const validRoles = ['user', 'reporter', 'admin', 'super_admin'];
        if (role && !validRoles.includes(role)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid role. Must be: user, reporter, admin, or super_admin'
            });
        }
        
        const user = new User({
            name,
            username: username.toLowerCase(),
            email: email.toLowerCase(),
            mobile: mobile || '',
            age: age ? parseInt(age) : undefined,
            sex: sex || 'Male',
            password,
            role: role || 'user'
        });
        
        await user.save();
        
        res.status(201).json({
            success: true,
            message: 'User created successfully',
            data: {
                id: user._id,
                name: user.name,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('❌ Error creating user:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// ========== UPDATE USER ROLE ==========
router.put('/users/:id/role', auth, isSuperAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;
        
        const validRoles = ['user', 'reporter', 'admin', 'super_admin'];
        if (!validRoles.includes(role)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid role. Must be: user, reporter, admin, or super_admin'
            });
        }
        
        if (role !== 'super_admin') {
            const superAdminCount = await User.countDocuments({ role: 'super_admin' });
            const user = await User.findById(id);
            if (user && user.role === 'super_admin' && superAdminCount <= 1) {
                return res.status(400).json({
                    success: false,
                    error: 'Cannot remove the last super_admin'
                });
            }
        }
        
        const user = await User.findByIdAndUpdate(
            id,
            { role },
            { new: true }
        ).select('-password -resetPasswordToken -resetPasswordExpires');
        
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }
        
        res.json({
            success: true,
            message: `User role updated to ${role}`,
            data: user
        });
    } catch (error) {
        console.error('❌ Error updating user role:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// ========== DELETE USER ==========
router.delete('/users/:id', auth, isSuperAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }
        
        if (user.role === 'super_admin') {
            const superAdminCount = await User.countDocuments({ role: 'super_admin' });
            if (superAdminCount <= 1) {
                return res.status(400).json({
                    success: false,
                    error: 'Cannot delete the last super_admin'
                });
            }
        }
        
        await User.findByIdAndDelete(id);
        
        res.json({
            success: true,
            message: 'User deleted successfully'
        });
    } catch (error) {
        console.error('❌ Error deleting user:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// ========== GET ADMIN STATS ==========
router.get('/stats', auth, isReporter, async (req, res) => {
    try {
        let newsQuery = {};
        
        // ✅ Reporters only see stats for their own articles
        if (req.user.role === 'reporter') {
            newsQuery.authorId = req.user._id;
        }
        
        const totalNews = await News.countDocuments(newsQuery);
        const totalUsers = await User.countDocuments();
        const featuredNews = await News.countDocuments({ ...newsQuery, featured: true });

        res.json({
            success: true,
            data: {
                totalNews,
                totalUsers,
                featuredNews,
                role: req.user.role
            }
        });
    } catch (error) {
        console.error('❌ Error fetching stats:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;