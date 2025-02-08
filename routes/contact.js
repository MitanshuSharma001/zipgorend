const express = require('express')
const mongoose = require('mongoose')
const Email = require('../models/enquiry.js')
require('dotenv/config')

const router = express.Router()
mongoose.connect(`mongodb+srv://${process.env.MONGO_ID}:${process.env.MONGO_PASSWORD}@cluster0.dm7s3.mongodb.net/ZIPNFILE`)
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.error('MongoDB connection error:', err));


  router.post('/',async(req,res)=>{
    try {
        const {email,subject,message} = req.body
        console.log(req.body);
        
         const newEmail = new Email({ email, subject, message});
          await newEmail.save().then((val)=>{ console.log('Enquiry Saved to database'); res.status(200).json({...req.body, status:'Enquiry Saved',code:200})})
    } catch (error) {
        res.status(400).json({ status:400,code:error})
    }



})
module.exports  = router