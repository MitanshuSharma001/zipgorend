const mongoose = require('mongoose')

const emailSchema = new mongoose.Schema({
    email: { type: String, required: true, match: [/.+@.+\..+/, 'Please enter a valid email address']},
    subject: { type: String, required: true, minlength: [3, 'Subject must be at least 3 characters long']},
    message: { type: String, required: true, minlength: [5, 'Message must be at least 5 characters long']},
    createdAt: { type: Date, default: (new Date()).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}
 });

 const Email = mongoose.model('CONTACTS', emailSchema);

 module.exports = Email
