const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const hisabSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    filename: {
        type: String,
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
});

module.exports = mongoose.model('Hisab', hisabSchema);
