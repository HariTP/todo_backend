const mongoose = require('mongoose');
//const updateDateMiddleware = require('../middleware/updateDate');

const subTaskSchema = new mongoose.Schema({
    id: {
        type: Number,
        unique: true,
        required: true,
    },
    task_id: {
        type: Number,
        required: true
    },
    status: {
        type: Number,
        enum: [0, 1],
        default: 0,
    },
    created_at: {
        type: Date,
        default: Date.now,
    },
    updated_at: {
        type: Date,
        default: null,
    },
    deleted_at: {
        type: Date,
        default: null,
    }
});

//subTaskSchema.plugin(updateDateMiddleware);
const subTask = mongoose.model('SubTask', subTaskSchema);

module.exports = subTask;