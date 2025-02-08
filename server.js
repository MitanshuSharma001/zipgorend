const {google} = require('googleapis')
const express = require('express')
// const {io} = require('socket.io-client')
require('dotenv/config')
const fs = require('fs')
const multer = require('multer')
const {v4:uuidv4} = require('uuid')
const path = require('path')
const vidcomp = require('./routes/vidcomp.js')
const wordtopdf = require('./routes/wordtopdf.js')
const pptxtopdf = require('./routes/pptxtopdf.js')
const xlsxtopdf = require('./routes/xlsxtopdf.js')
const downloadfile = require('./routes/downloadFile.js')
const contact = require('./routes/contact.js')
const retrieve = require('./routes/retrieveenq.js')
const imagetopdf =  require('./routes/imagetopdf.js')
const pdftoimage = require('./routes/pdftoimage.js')
const cors = require('cors')


const app = express()
const PORT = 5000
app.use(cors({
    origin:'https://zipnfile.netlify.app',
    methods: ['GET','POST'],
    credentials: true
}))
app.use((req,res,next)=>{
    console.log(req.headers)
    console.log(req.headers['d-custom']+'-------------');
    
    next()
})

app.use(express.json())
app.use('/vidcomp',vidcomp)
app.use('/word-to-pdf',wordtopdf)
app.use('/pptx-to-pdf',pptxtopdf)
app.use('/xlsx-to-pdf',xlsxtopdf)
app.use('/contact',contact)
app.use('/retrieve',retrieve)
app.use('/downloadfile',downloadfile)
app.use('/imagetopdf',imagetopdf)
app.use('/pdftoimage',pdftoimage)

app.get('/',async(req,res)=>{
    console.log('Client connected to Render-Backend');
    res.json({helo:'kk'})
})
app.listen(PORT,()=>{
    console.log(`Listening on PORT: ${PORT}`);
})
