const express = require('express')
const fs = require('fs')

const router = express.Router()

router.post('/',async(req,res)=>{
    const filename = req.headers['file-name']
    res.download(`came/${filename}`,filename,()=>{
        try {
            fs.unlinkSync(`came/${filename}`)  
        } catch (error) {
            console.log(error);
        }
    })
})
module.exports = router