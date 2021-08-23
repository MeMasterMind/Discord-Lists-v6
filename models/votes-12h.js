const mongoose = require('mongoose')

const votes = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    userid:{
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
},{timestamps: true})

module.exports = mongoose.model('votes12hr', votes);