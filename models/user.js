const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
     
    name: { 
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    phone: {
        type: String,
        required: true,
        unique: true
    },
    dob: {
        type: Date,
        required: true,
    },
    imageUrl:{
        type: String

    },
    flag:{
        type:Boolean,
        default: false
    },
    password:{
        type: String,
        required: true
      }, 
      isVerified: {  
        type: Boolean,
        default: false
    },
    verificationToken: {  
        type: String
    }, 
    resetToken: String,
    resetTokenExpiration: Date,
    
    createdAt: {
        type: Date,
        required: true,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        required: true,
        default: Date.now
    }
}); 
 
module.exports = mongoose.model('User', userSchema);
