const mongoose = require('mongoose')

const authorSchema = new mongoose.Schema ( {
    fname: {
        type: String,
        trim: true,
        required: true
    },
    lname: {
        type: String,
        trim: true,
        required: true,
    },
    title: {
        type: String,
        trim: true,
        enum :['Mr', 'Mrs', 'Miss'],
        required: true,
    },
    email: {
        type: String,
        unique: true,
        trim: true,
        lowercase: true,
        required: true,
    },

    password: {
        type: String,
        required: true,
        trim : true
    }
} , { timestamps : true})

module.exports = mongoose.model("Author", authorSchema);