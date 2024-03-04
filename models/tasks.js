const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    id: {
        type: Number,
        unique: true,
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    due_date: {
        type: Date,
        required: true,
    },
    status: {
        type: String,
        enum: ["TODO", "DONE","IN_PROGRESS"],
        default: 'TODO',
    },
    deleted_at: {
        type: Date,
        default: null,
    },
    priority: {
        type: Number,
        enum: [0, 1, 2, 3],
    },
    user_id: {
        type: Number,
        required: true,
    }
});

const task = mongoose.model('task', taskSchema);

module.exports = task;
