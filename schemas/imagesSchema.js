const mongoose = require('mongoose');
const imageSchema = mongoose.Schema({
    imageUrls: {
        type: Array,
        required: true,
    },
    createdAt: {
        type: String,
    },
});
module.exports = mongoose.model('Images', imageSchema);
