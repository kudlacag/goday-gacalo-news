const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const nodemailer = require('nodemailer');
const fs = require('fs');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 10000;

// ========== CORS MIDDLEWARE ==========
const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5000',
    'https://goday-gacalo-news.onrender.com',
    'https://www.godaygacalo.com',
    'https://godaygacalo.com',
    'https://goday-gacalo-news-1.onrender.com'
];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            console.log('❌ CORS blocked origin:', origin);
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

app.options('*', cors());

app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
        res.header('Access-Control-Allow-Origin', origin);
    }
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Credentials', 'true');
    next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ========== SERVE UPLOADED FILES (FIXED) ==========
// Check multiple possible uploads locations
const uploadPaths = [
    path.join(__dirname, 'uploads'),
    path.join(__dirname, 'backend/uploads'),
    path.join(__dirname, '../uploads')
];

let uploadsPath = null;
for (const testPath of uploadPaths) {
    if (fs.existsSync(testPath)) {
        uploadsPath = testPath;
        console.log(`📁 Uploads folder found at: ${uploadsPath}`);
        break;
    }
}

// If no uploads folder exists, create one
if (!uploadsPath) {
    uploadsPath = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadsPath)) {
        fs.mkdirSync(uploadsPath, { recursive: true });
        console.log(`📁 Created uploads folder at: ${uploadsPath}`);
    }
}

// Serve the uploads folder
app.use('/uploads', express.static(uploadsPath));
console.log(`📸 Serving uploads from: ${uploadsPath}`);

// ========== ROUTES ==========
console.log('📡 Loading routes...');

try {
    const authRoutes = require('./routes/auth');
    const newsRoutes = require('./routes/news');
    const adminRoutes = require('./routes/admin');

    app.use('/api/auth', authRoutes);
    app.use('/api/news', newsRoutes);
    app.use('/api/admin', adminRoutes);
    // server.js - Add this with your other routes
const ogRoutes = require('./routes/og');
app.use('/og', ogRoutes);

    console.log('✅ Routes loaded successfully');
} catch (error) {
    console.error('❌ Error loading routes:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
}

// ========== TEST ROUTE ==========
app.get('/', (req, res) => {
    res.json({
        message: '🚀 Godey Gacalo News API is running!',
        version: '1.0.0',
        status: 'healthy',
        timestamp: new Date().toISOString()
    });
});

// ========== HEALTH CHECK ==========
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// ========== TEST ENVIRONMENT VARIABLES ==========
app.get('/api/test-env', (req, res) => {
    res.json({
        emailUser: process.env.EMAIL_USER ? '✅ Set' : '❌ Not set',
        emailPass: process.env.EMAIL_PASS ? '✅ Set (hidden)' : '❌ Not set',
        clientUrl: process.env.CLIENT_URL || '❌ Not set',
        mongoUri: process.env.MONGODB_URI ? '✅ Set' : '❌ Not set',
        jwtSecret: process.env.JWT_SECRET ? '✅ Set' : '❌ Not set',
        nodeEnv: process.env.NODE_ENV || 'development',
        adminEmail: process.env.ADMIN_EMAIL || 'Not set',
        useEthereal: process.env.USE_ETHEREAL || 'Not set',
        uploadsPath: uploadsPath
    });
});

// ========== TEST EMAIL ROUTE (with Ethereal support) ==========
app.post('/api/test-email', async (req, res) => {
    try {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({ 
                success: false, 
                error: 'Email is required' 
            });
        }

        console.log('📧 Testing email configuration...');
        
        const useEthereal = process.env.USE_ETHEREAL === 'true' || !process.env.EMAIL_USER || !process.env.EMAIL_PASS;
        
        let transporter;
        let mailOptions;
        let isEthereal = false;

        if (useEthereal) {
            console.log('📧 Using Ethereal Email for testing');
            
            const testAccount = await nodemailer.createTestAccount();
            console.log('📧 Ethereal Email:', testAccount.user);
            console.log('🔑 Ethereal Password:', testAccount.pass);
            
            transporter = nodemailer.createTransport({
                host: 'smtp.ethereal.email',
                port: 587,
                secure: false,
                auth: {
                    user: testAccount.user,
                    pass: testAccount.pass
                }
            });
            
            isEthereal = true;
            
            mailOptions = {
                from: `"Godey Gacalo News" <${testAccount.user}>`,
                to: email,
                subject: '✅ Test Email from Godey Gacalo News',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f0f4ff; border-radius: 10px;">
                        <h2 style="color: #1a365d;">✅ Test Email</h2>
                        <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                            <p style="color: #333; font-size: 16px;">If you received this email, your email configuration is working correctly!</p>
                            <p style="color: #555; font-size: 14px;">Time: ${new Date().toISOString()}</p>
                            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                            <p style="color: #999; font-size: 12px; text-align: center;">Godey Gacalo News • Test Email</p>
                            <p style="color: #999; font-size: 11px; text-align: center; margin-top: 10px;">📧 This email was sent via Ethereal (test mode)</p>
                        </div>
                    </div>
                `
            };
        } else {
            console.log('📧 Using Gmail for testing');
            
            if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
                return res.status(500).json({
                    success: false,
                    error: 'Email credentials not configured.'
                });
            }

            transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS
                },
                tls: {
                    rejectUnauthorized: false
                }
            });

            try {
                await transporter.verify();
                console.log('✅ Email transporter verified successfully');
            } catch (verifyError) {
                console.error('❌ Email transporter verification failed:', verifyError.message);
                return res.status(500).json({
                    success: false,
                    error: 'Email authentication failed. Please check your credentials.',
                    details: verifyError.message,
                    code: verifyError.code
                });
            }

            mailOptions = {
                from: `"Godey Gacalo News" <${process.env.EMAIL_USER}>`,
                to: email,
                subject: '✅ Test Email from Godey Gacalo News',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f0f4ff; border-radius: 10px;">
                        <h2 style="color: #1a365d;">✅ Test Email</h2>
                        <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                            <p style="color: #333; font-size: 16px;">If you received this email, your email configuration is working correctly!</p>
                            <p style="color: #555; font-size: 14px;">Time: ${new Date().toISOString()}</p>
                            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                            <p style="color: #999; font-size: 12px; text-align: center;">Godey Gacalo News • Test Email</p>
                        </div>
                    </div>
                `
            };
        }

        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Test email sent successfully!');
        console.log('📧 Message ID:', info.messageId);
        
        let previewUrl = null;
        if (isEthereal) {
            previewUrl = nodemailer.getTestMessageUrl(info);
            console.log('🔗 Preview URL:', previewUrl);
        }
        
        res.json({ 
            success: true, 
            message: isEthereal ? 'Test email sent via Ethereal! Check the preview URL.' : 'Test email sent successfully! Please check your inbox.',
            messageId: info.messageId,
            to: email,
            previewUrl: previewUrl || undefined,
            isEthereal: isEthereal
        });
    } catch (error) {
        console.error('❌ Test email error:', error);
        console.error('Error code:', error.code);
        console.error('Error response:', error.response);
        console.error('Error stack:', error.stack);
        
        let errorMessage = 'Failed to send test email.';
        if (error.code === 'EAUTH') {
            errorMessage = 'Email authentication failed. Please check your EMAIL_USER and EMAIL_PASS.';
        } else if (error.code === 'ECONNECTION') {
            errorMessage = 'Cannot connect to email server. Please check your internet connection.';
        } else if (error.response && error.response.includes('535')) {
            errorMessage = 'Invalid email credentials. Please use an App Password for Gmail.';
        }
        
        res.status(500).json({ 
            success: false, 
            error: errorMessage,
            details: process.env.NODE_ENV === 'development' ? error.message : undefined,
            code: error.code
        });
    }
});

// ========== TEST FORGOT PASSWORD ROUTE (with Ethereal support) ==========
app.post('/api/test-forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({ 
                success: false, 
                error: 'Email is required' 
            });
        }

        console.log('🔐 Test forgot password for:', email);

        const User = require('./models/User');
        const crypto = require('crypto');
        
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(200).json({
                success: true,
                message: 'If an account exists, a reset link has been sent'
            });
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenHash = crypto
            .createHash('sha256')
            .update(resetToken)
            .digest('hex');

        user.resetPasswordToken = resetTokenHash;
        user.resetPasswordExpires = Date.now() + 3600000;
        await user.save();

        const baseUrl = process.env.CLIENT_URL || 'https://goday-gacalo-news.onrender.com';
        const resetUrl = `${baseUrl}/reset-password/${resetToken}`;
        
        console.log('🔗 Reset URL:', resetUrl);

        const useEthereal = process.env.USE_ETHEREAL === 'true' || !process.env.EMAIL_USER || !process.env.EMAIL_PASS;
        
        let transporter;
        let mailOptions;
        let isEthereal = false;

        if (useEthereal) {
            console.log('📧 Using Ethereal Email');
            
            const testAccount = await nodemailer.createTestAccount();
            console.log('📧 Ethereal Email:', testAccount.user);
            
            transporter = nodemailer.createTransport({
                host: 'smtp.ethereal.email',
                port: 587,
                secure: false,
                auth: {
                    user: testAccount.user,
                    pass: testAccount.pass
                }
            });
            
            isEthereal = true;
            
            mailOptions = {
                from: `"Godey Gacalo News" <${testAccount.user}>`,
                to: user.email,
                subject: 'Password Reset - Godey Gacalo News',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f0f4ff; border-radius: 10px;">
                        <h2 style="color: #1a365d;">🔐 Password Reset</h2>
                        <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                            <p style="color: #333; font-size: 16px;">Hello <strong>${user.name}</strong>,</p>
                            <p style="color: #555; font-size: 15px; line-height: 1.6;">
                                You requested to reset your password. Click the link below to reset your password:
                            </p>
                            <div style="text-align: center; margin: 30px 0;">
                                <a href="${resetUrl}" style="background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                                    Reset Password
                                </a>
                            </div>
                            <p style="color: #777; font-size: 13px;">This link will expire in 1 hour.</p>
                            <p style="color: #777; font-size: 13px;">If you didn't request this, please ignore this email.</p>
                            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                            <p style="color: #999; font-size: 12px; text-align: center;">Godey Gacalo News</p>
                            <p style="color: #999; font-size: 11px; text-align: center; margin-top: 10px;">📧 This email was sent via Ethereal (test mode)</p>
                        </div>
                    </div>
                `
            };
        } else {
            if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
                return res.status(500).json({
                    success: false,
                    error: 'Email credentials not configured'
                });
            }

            transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS
                },
                tls: {
                    rejectUnauthorized: false
                }
            });

            mailOptions = {
                from: `"Godey Gacalo News" <${process.env.EMAIL_USER}>`,
                to: user.email,
                subject: 'Password Reset - Godey Gacalo News',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f0f4ff; border-radius: 10px;">
                        <h2 style="color: #1a365d;">🔐 Password Reset</h2>
                        <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                            <p style="color: #333; font-size: 16px;">Hello <strong>${user.name}</strong>,</p>
                            <p style="color: #555; font-size: 15px; line-height: 1.6;">
                                You requested to reset your password. Click the link below to reset your password:
                            </p>
                            <div style="text-align: center; margin: 30px 0;">
                                <a href="${resetUrl}" style="background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                                    Reset Password
                                </a>
                            </div>
                            <p style="color: #777; font-size: 13px;">This link will expire in 1 hour.</p>
                            <p style="color: #777; font-size: 13px;">If you didn't request this, please ignore this email.</p>
                            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                            <p style="color: #999; font-size: 12px; text-align: center;">Godey Gacalo News</p>
                        </div>
                    </div>
                `
            };
        }

        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Test reset email sent to:', user.email);
        
        let previewUrl = null;
        if (isEthereal) {
            previewUrl = nodemailer.getTestMessageUrl(info);
            console.log('🔗 Preview URL:', previewUrl);
        }

        res.json({
            success: true,
            message: 'Password reset email sent!',
            resetUrl: process.env.NODE_ENV === 'development' ? resetUrl : undefined,
            previewUrl: previewUrl || undefined,
            isEthereal: isEthereal
        });
    } catch (error) {
        console.error('❌ Test forgot password error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// ========== DATABASE ==========
console.log('📡 Connecting to MongoDB...');
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('✅ MongoDB connected'))
    .catch(err => {
        console.error('❌ MongoDB connection error:', err.message);
        console.log('⚠️ Continuing without database...');
    });

// ========== START SERVER ==========
app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n🚀 Server running on http://localhost:${PORT}`);
    console.log(`📡 Test: http://localhost:${PORT}/`);
    console.log(`📧 Test Email: POST ${PORT}/api/test-email`);
    console.log(`🔐 Super Admin: ${process.env.ADMIN_EMAIL || 'Not set'}\n`);
});