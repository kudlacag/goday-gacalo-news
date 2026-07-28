const mongoose = require('mongoose');

const newsSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    category: {
        type: String,
        required: true,
        enum: ['Politics', 'Business', 'Sports', 'Entertainment', 'Health', 'Tech']
    },
    content: {
        type: String,
        required: true
    },
    summary: {
        type: String,
        required: true,
        maxLength: 200
    },
    images: [String],
    author: {
        type: String,
        default: 'Godey Gacalo News'
    },
    authorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    publishedDate: {
        type: Date,
        default: Date.now
    },
    featured: {
        type: Boolean,
        default: false
    },
    views: {
        type: Number,
        default: 0
    },
    lastViewed: {           // ← ADD THIS FIELD
        type: Date,
        default: null
    },
    tags: [String],
    comments: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        username: {
            type: String,
            required: true
        },
        text: {
            type: String,
            required: true,
            maxLength: 500
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('News', newsSchema);