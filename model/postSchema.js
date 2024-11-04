const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    title : String,
    description : String,
    postImage : String,
    user : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "user"
    },
    postReel : String,
    
    likesData : [{
        type : mongoose.Schema.Types.ObjectId,
        ref : "user"
    }],
    comments : [{
        type : mongoose.Schema.Types.ObjectId,
        ref : "comment"
    }],
    shares : Number,
    createdAt : {
        type : Date,
        default : Date.now()
    },
    updatedAt : {
        type : Date,
        default : Date.now()
    },
    isDeleted : {
        type : Boolean,
        default : false
    },
});

module.exports = mongoose.model('post', postSchema)