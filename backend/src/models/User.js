// Modèle MongoDB (avec Mongoose)
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    email: { type: String, unique: true },
    password: String,
    friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
});

module.exports = mongoose.model('User', UserSchema);