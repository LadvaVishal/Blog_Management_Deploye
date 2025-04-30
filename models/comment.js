const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const commentSchema = new Schema({
    blogReference: {
        type: Schema.Types.ObjectId
       
    },
    userReference: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    commentContent: {
        type: String,
        required:true
    }, 
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Comment', commentSchema);