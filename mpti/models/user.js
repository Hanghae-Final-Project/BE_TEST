const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
    },
    password: {
        type: String,
    },
    passwordCheck: {
        type: String,
    },
    salt: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    // birthday: {
    //     type: String,
    // },
    // gender: {
    //     type: String,
    // },
    userImage: {
        type: String,
    },
    nickname: {
        type: String,
    },
    mbti: {
        type: String,
    },
    introduction: {
        type: String,
    },
    mannerScore: {
        type: Number,
    },
    point : {
        type: Number,
    }
});



module.exports = mongoose.model('User', UserSchema);
