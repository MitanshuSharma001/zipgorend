const express = require('express')
const mongoose = require('mongoose')
const Email = require('../models/enquiry.js')

const router = express.Router()

router.get('/:id',async(req,res)=>{
    const idpass = req.params.id
    if (idpass=='vakshat421@gmail.comsabkamandir001') {
        res.json(await Email.find({}))
    }
    else res.status(404).json({authorize:'You are not authorized'})
})
module.exports = router