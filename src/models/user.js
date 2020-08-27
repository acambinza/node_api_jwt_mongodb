const mongoose = require('../database/index');
const crypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    name: {
        type : String,
        require: true,
    },
    email: {
        type: String,
        unique: true,
        required: true,
        lowecase: true,
    },
    password : {
        type: String,
        required: true,
        select: false,
    },
    createAt: {
        type: Date,
        default: Date.now,
    },
});


UserSchema.pre('save', async function(next){
    const hash = await crypt.hash(this.password, 10);
    this.password = hash;
    next();
});

const User = mongoose.model('User', UserSchema);

module.exports = User;