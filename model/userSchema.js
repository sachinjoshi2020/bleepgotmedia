const mongoose = require('mongoose');
const plm = require('passport-local-mongoose');
const userSchema = new mongoose.Schema({
    username : String,
    name : String,
    email : String,
    password : String,
    profileImage : String,
    posts : [
        {
            type : mongoose.Schema.Types.ObjectId,
            ref : "post"
        }
    ],
    followers : [{
        type : mongoose.Schema.Types.ObjectId,
        ref : "user"
    }],
    following : [{
        type : mongoose.Schema.Types.ObjectId,
        ref : "user"
    }],
    likes : [{
        type : mongoose.Schema.Types.ObjectId,
        ref : "post"
    }]
})


userSchema.plugin(plm)

module.exports = mongoose.model('user', userSchema);