const { name } = require('ejs');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    name : {
        type: String,
        required: true
    },
    email : {
        type: String,
        required: true
    },
    password : {
        type: String,
        required: true
    },
    hisabs: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Hisab',
        },
    ],
  
})

module.exports = mongoose.model('User', userSchema);