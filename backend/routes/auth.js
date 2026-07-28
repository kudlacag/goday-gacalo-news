const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { auth } = require('../middleware/auth');
const sgMail = require('@sendgrid/mail');

// ========== EMAIL SETUP (SendGrid Web API) ==========
console.log('📧 Configuring SendGrid Web API...');

// ✅ Get API key from environment variables
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;

if (!SENDGRID_API_KEY) {
    console.error('❌ SENDGRID_API_KEY is not set in environment variables!');
    console.log('⚠️ Please add SENDGRID_API_KEY to Render environment variables');
} else {
    sgMail.setApiKey(SENDGRID_API_KEY);
    console.log('✅ SendGrid Web API configured');
}

console.log('📧 FROM_EMAIL:', process.env.FROM_EMAIL || '❌ Not set');

// ========== REGISTER ==========
router.post('/register', async (req, res) => {
    try {
        const { name, username, email, mobile, age, sex, password } = req.body;

        if (!name || !username || !email || !mobile || !age || !sex || !password) {
            return res.status(400).json({
                success: false,
                error: 'All fields are required'
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

        const isSuperAdmin = email.toLowerCase() === process.env.ADMIN_EMAIL?.toLowerCase();
        const isFirstUser = (await User.countDocuments()) === 0;

        const user = new User({
            name,
            username: username.toLowerCase(),
            email: email.toLowerCase(),
            mobile,
            age: parseInt(age),
            sex,
            password,
            role: isSuperAdmin ? 'super_admin' : isFirstUser ? 'super_admin' : 'user'
        });

        await user.save();

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '7d' }
        );

        res.status(201).json({
            success: true,
            message: 'User registered successfully!',
            token,
            user: {
                id: user._id,
                name: user.name,
                username: user.username,
                email: user.email,
                role: user.role,
                createdAt: user.createdAt
            }
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ========== LOGIN ==========
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Email and password are required'
            });
        }

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'Invalid email or password'
            });
        }

        if (!user.isActive) {
            return res.status(403).json({
                success: false,
                error: 'Account has been deactivated'
            });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                error: 'Invalid email or password'
            });
        }

        user.lastLogin = new Date();
        await user.save();

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '7d' }
        );

        res.json({
            success: true,
            message: 'Login successful!',
            token,
            user: {
                id: user._id,
                name: user.name,
                username: user.username,
                email: user.email,
                mobile: user.mobile,
                age: user.age,
                sex: user.sex,
                role: user.role,
                createdAt: user.createdAt,
                lastLogin: user.lastLogin
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ========== ADMIN LOGIN ==========
router.post('/admin-login', async (req, res) => {
    try {
        const { password } = req.body;

        if (!password) {
            return res.status(400).json({
                success: false,
                error: 'Password is required'
            });
        }

        const admin = await User.findOne({
            role: { $in: ['super_admin', 'admin'] }
        });

        if (!admin) {
            return res.status(404).json({
                success: false,
                error: 'Admin account not found. Please register first.'
            });
        }

        if (!admin.isActive) {
            return res.status(403).json({
                success: false,
                error: 'Admin account has been deactivated'
            });
        }

        const isMatch = await admin.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                error: 'Invalid admin password'
            });
        }

        admin.lastLogin = new Date();
        await admin.save();

        const token = jwt.sign(
            { id: admin._id, role: admin.role },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '7d' }
        );

        res.json({
            success: true,
            message: 'Admin login successful!',
            token,
            user: {
                id: admin._id,
                name: admin.name,
                username: admin.username,
                email: admin.email,
                role: admin.role,
                createdAt: admin.createdAt,
                lastLogin: admin.lastLogin
            }
        });
    } catch (error) {
        console.error('Admin login error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// ========== FORGOT PASSWORD ==========
router.post('/forgot-password', async (req, res) => {
    try {
        console.log('🔐 Forgot password request received:', req.body);
        
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                error: 'Email is required'
            });
        }

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            console.log('❌ User not found:', email);
            return res.status(200).json({
                success: true,
                message: 'If an account exists, a reset link has been sent'
            });
        }

        console.log('✅ User found:', user.email);

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenHash = crypto
            .createHash('sha256')
            .update(resetToken)
            .digest('hex');

        user.resetPasswordToken = resetTokenHash;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
        await user.save();

        console.log('✅ Reset token saved for user:', user.email);

        // ✅ FIX: Use frontend URL for reset link
        const baseUrl = process.env.CLIENT_URL || 'https://www.godaygacalo.com/#';
        const resetUrl = `${baseUrl}/reset-password/${resetToken}`;
        
        console.log('🔗 Reset URL:', resetUrl);

        // Check if FROM_EMAIL is set
        const fromEmail = process.env.FROM_EMAIL;
        
        if (!fromEmail) {
            console.error('❌ FROM_EMAIL not set');
            return res.status(500).json({
                success: false,
                error: 'Email sender not configured. Please contact support.'
            });
        }

        const msg = {
            to: user.email,
            from: fromEmail,
            subject: 'Password Reset - Godey Gacalo News',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f5f5f5; border-radius: 10px;">
                    <div style="text-align: center; margin-bottom: 20px;">
                        <h1 style="color: #1a365d; font-size: 24px;">📰 Godey Gacalo News</h1>
                    </div>
                    <div style="background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                        <h2 style="color: #1a365d; text-align: center;">🔐 Password Reset</h2>
                        <p style="color: #333; font-size: 16px;">Hello <strong>${user.name}</strong>,</p>
                        <p style="color: #555; font-size: 15px; line-height: 1.6;">
                            You requested to reset your password for <strong>Godey Gacalo News</strong>.
                            Click the button below to reset your password. This link is valid for <strong>1 hour</strong>.
                        </p>
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${resetUrl}" style="background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                                Reset Password
                            </a>
                        </div>
                        <p style="color: #777; font-size: 13px;">If you didn't request this, please ignore this email.</p>
                        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                        <p style="color: #999; font-size: 12px; text-align: center;">Godey Gacalo News • Your trusted source for local news</p>
                        <p style="color: #999; font-size: 11px; text-align: center;">© ${new Date().getFullYear()} Godey Gacalo News. All rights reserved.</p>
                    </div>
                </div>
            `
        };

        try {
            const [response] = await sgMail.send(msg);
            console.log('✅ Reset email sent successfully to:', user.email);
            console.log('📧 SendGrid status:', response.statusCode);
            console.log('📧 Message ID:', response.headers['x-message-id']);
            
            res.json({
                success: true,
                message: 'Password reset email sent! Please check your inbox.'
            });
        } catch (emailError) {
            console.error('❌ SendGrid error:', emailError);
            if (emailError.response) {
                console.error('❌ SendGrid response:', JSON.stringify(emailError.response.body, null, 2));
            }
            
            // Remove token if email fails
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;
            await user.save();
            
            let errorMessage = 'Failed to send reset email. Please try again later.';
            if (emailError.response && emailError.response.body) {
                const errors = emailError.response.body.errors;
                if (errors && errors.length > 0) {
                    errorMessage = errors[0].message || errorMessage;
                }
            }
            
            res.status(500).json({
                success: false,
                error: errorMessage,
                details: process.env.NODE_ENV === 'development' ? emailError.message : undefined
            });
        }
    } catch (error) {
        console.error('❌ Forgot password error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error. Please try again later.'
        });
    }
});

// ========== RESET PASSWORD ==========
router.post('/reset-password/:token', async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        console.log('🔐 Reset password attempt');

        if (!password || password.length < 6) {
            return res.status(400).json({
                success: false,
                error: 'Password must be at least 6 characters'
            });
        }

        const resetTokenHash = crypto
            .createHash('sha256')
            .update(token)
            .digest('hex');

        const user = await User.findOne({
            resetPasswordToken: resetTokenHash,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            console.log('❌ Invalid or expired token');
            return res.status(400).json({
                success: false,
                error: 'Invalid or expired reset token'
            });
        }

        console.log('✅ Valid token found for user:', user.email);

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user.password = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        console.log('✅ Password reset successful for user:', user.email);

        res.json({
            success: true,
            message: 'Password reset successfully! Please login with your new password.'
        });
    } catch (error) {
        console.error('❌ Reset password error:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// ========== CHANGE PASSWORD ==========
router.post('/change-password', auth, async (req, res) => {
    try {
        const userId = req.user?.id || req.user?._id;
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                error: 'Current password and new password are required'
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                error: 'New password must be at least 6 characters'
            });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                error: 'Current password is incorrect'
            });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        user.password = hashedPassword;
        await user.save();

        console.log('✅ Password changed for user:', user.email);

        res.json({
            success: true,
            message: 'Password changed successfully!'
        });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// ========== GET CURRENT USER ==========
router.get('/me', auth, async (req, res) => {
    try {
        const userId = req.user?.id || req.user?._id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                error: 'User ID not found in token'
            });
        }

        const user = await User.findById(userId)
            .select('-password -resetPasswordToken -resetPasswordExpires');

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        res.json({
            success: true,
            user: {
                id: user._id,
                name: user.name,
                username: user.username,
                email: user.email,
                mobile: user.mobile,
                age: user.age,
                sex: user.sex,
                role: user.role,
                createdAt: user.createdAt,
                lastLogin: user.lastLogin,
                isActive: user.isActive
            }
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// ========== UPDATE PROFILE ==========
router.put('/profile', auth, async (req, res) => {
    try {
        const userId = req.user?.id || req.user?._id;
        const { name, mobile, age, sex } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        if (name) user.name = name;
        if (mobile) user.mobile = mobile;
        if (age) user.age = parseInt(age);
        if (sex) user.sex = sex;

        await user.save();

        res.json({
            success: true,
            message: 'Profile updated successfully!',
            user: {
                id: user._id,
                name: user.name,
                username: user.username,
                email: user.email,
                mobile: user.mobile,
                age: user.age,
                sex: user.sex,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// ========== GET ALL USERS (Admin only) ==========
router.get('/users', auth, async (req, res) => {
    try {
        const userId = req.user?.id || req.user?._id;
        const currentUser = await User.findById(userId);
        
        if (!currentUser || (currentUser.role !== 'super_admin' && currentUser.role !== 'admin')) {
            return res.status(403).json({
                success: false,
                error: 'Access denied. Admin only.'
            });
        }

        const users = await User.find()
            .select('-password -resetPasswordToken -resetPasswordExpires')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            users
        });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// ========== UPDATE USER ROLE (Admin only) ==========
router.put('/users/:id/role', auth, async (req, res) => {
    try {
        const userId = req.user?.id || req.user?._id;
        const { id } = req.params;
        const { role } = req.body;

        const currentUser = await User.findById(userId);
        if (!currentUser || (currentUser.role !== 'super_admin' && currentUser.role !== 'admin')) {
            return res.status(403).json({
                success: false,
                error: 'Access denied. Admin only.'
            });
        }

        if (role === 'super_admin' && currentUser.role !== 'super_admin') {
            return res.status(403).json({
                success: false,
                error: 'Only super admin can assign super admin role.'
            });
        }

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        if (user._id.toString() === userId) {
            return res.status(400).json({
                success: false,
                error: 'Cannot change your own role'
            });
        }

        user.role = role;
        await user.save();

        res.json({
            success: true,
            message: 'User role updated successfully!',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Update user role error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// ========== DELETE USER (Admin only) ==========
router.delete('/users/:id', auth, async (req, res) => {
    try {
        const userId = req.user?.id || req.user?._id;
        const { id } = req.params;

        const currentUser = await User.findById(userId);
        if (!currentUser || (currentUser.role !== 'super_admin' && currentUser.role !== 'admin')) {
            return res.status(403).json({
                success: false,
                error: 'Access denied. Admin only.'
            });
        }

        if (id === userId) {
            return res.status(400).json({
                success: false,
                error: 'Cannot delete your own account'
            });
        }

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        await user.deleteOne();

        res.json({
            success: true,
            message: 'User deleted successfully!'
        });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;