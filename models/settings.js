const mongoose = require('mongoose')

const settings = new mongoose.Schema({
    banner: {
        type: String,
        required: true
    }

})

module.exports = mongoose.model('settings', settings);