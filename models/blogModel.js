const mongoose = require("mongoose")
const ObjectId = mongoose.Schema.Types.ObjectId;

const blogSchema = new mongoose.Schema({
    title: {
        type:String,
        trim: true,
        required:true
    },
    body:{
        type:String,
        trim: true,
        required:true
    },
    authorId: {
        required: true,
        trim: true,
        type: ObjectId,
        ref: 'Author'
    },
    tags: {
        type: [String]
        
    },
    category: {
        type: String,
        trim: true,
        required: true,   
    },
    subcategory: {
        type:[String],

    },

    deletedAt: String,

    isDeleted: { 
        type: Boolean, 
        default: false
    },


    publishedAt: String,

    isPublished: {
        type:Boolean,
        default:true,
    },
    
    
    
    
},{timestamps:true})


module.exports = mongoose.model("Blog", blogSchema)