const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import User model
const User = require('../models/User');

const createAdmin = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Check if admin exists
        const existingAdmin = await User.findOne({ email: 'achmed.ram@gmail.com' });
        
        if (existingAdmin) {
            console.log('✅ Admin already exists!');
            console.log(`📧 Email: ${existingAdmin.email}`);
            console.log(`👑 Role: ${existingAdmin.role}`);
            console.log('🔑 You can login with your password.');
            process.exit(0);
        }

        // Create admin
        const admin = new User({
            name: 'Achmed Ram',
            username: 'achmedram',
            email: 'achmed.ram@gmail.com',
            mobile: '1234567890',
            age: 30,
            sex: 'Male',
            password: 'Admin123!',
            role: 'super_admin'
        });

        await admin.save();
        console.log('✅ Super Admin created successfully!');
        console.log(`📧 Email: ${admin.email}`);
        console.log(`🔑 Password: Admin123!`);
        console.log('⚠️  Please change your password after login.');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
};

createAdmin();