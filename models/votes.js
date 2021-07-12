const mongoose = require('mongoose')

const user = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    botid: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    ms: {
        type: Number,
        required: true
    }
})

module.exports = mongoose.model('votes', user);