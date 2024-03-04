const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    user_id: {
        type: Number,
        unique: true,
        required: true,
    },
    phone: {
        type: Number,
        required: true,
        unique: true,
    },
    priority: {
        type: Number,
        enum: [0, 1, 2],
        required: true,
    }
});

const user = mongoose.model('user', userSchema);

module.exports = user;