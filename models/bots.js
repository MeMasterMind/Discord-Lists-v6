const mongoose = require('mongoose')

const bot = new mongoose.Schema({
    botname: {
        type: String,
        required: true
    },
    botid: {
        type: String,
        required: true
    },
    botavatar: {
        type: String,
        required: true
    },
    shortdes: {
        type: String,
        required: true
    },
    longdes: {
        type: String,
        required: true
    },
    botprefix: {
        type: String,
        required: true
    },
    bottoken: {
        type: String,
        required: true
    },
    botowner: {
        type: String,
        required: true
    },
    ownerid: {
        type: String,
        required: true
    },
    invite: {
        type: String,
        required: true
    },
    support: {
        type: String,
        required: true
    },
    site: {
        type: String,
        required: true
    },
    github: {
        type: String,
        required: true
    },
    state: {
        type: String,
        required: true
    },
    certification: {
        type: String,
        required: true
    },
    servercount: {
        type: String,
        required: true
    },
    ownerid: {
        type: String,
        required: true
    },
    vanity: {
        type: String,
        required: true
    },
    votes: {
        type: Number,
        required: true
    },
		tags: {
			type: Array,
			required: true
		}
})

module.exports = mongoose.model('bots', bot);