const mongoose = require('mongoose')

const user = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    userid: {
        type: String,
        required: true
    },
    userbots: {
        type: Array,
        required: true
    },
    vote: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    votebot: {
        type: String,
        required: true
    },
    useravatar: {
        type: String,
        required: true
    }
})

module.exports = mongoose.model('users', user);