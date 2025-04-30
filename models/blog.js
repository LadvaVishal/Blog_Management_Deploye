const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const blogSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true 
    },
    userReference: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    imageUrl:{
        type: String
    },
    flag:{
        type:Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    totalLike: {
        type: Number,
        default: 0
    }, 

    comments: [{
        type: Schema.Types.ObjectId,
        ref: 'Comment'
    }],
    likes:[{type: Schema.Types.ObjectId}]
});

module.exports = mongoose.model('Blog', blogSchema);