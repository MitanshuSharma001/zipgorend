const {google} = require('googleapis')
const express = require('express')
const {io} = require('socket.io-client')
require('dotenv/config')
const fs = require('fs')
const multer = require('multer')
const {v4:uuidv4} = require('uuid')
const path = require('path')
const { file } = require('googleapis/build/src/apis/file')
const vidcomp = require('./vidcomp.js')
const cors = require('cors')
const axios = require('axios')

const app = express()
const PORT = 3000
app.use(cors({
    origin:'*',
    methods: ['GET','POST']
}))
const socket = io('https://h62jskdt-5000.inc1.devtunnels.ms')
//---------GOOGLE OAUTH CONNECTION--------------
const oauth2 = new google.auth.OAuth2(
    process.env.APNACLIENT_ID,
    process.env.APNACLIENT_SECRET,
    process.env.APNAREDIRECT_URI
)
try {
    oauth2.setCredentials({refresh_token: process.env.APNAREFRESH_TOKEN})
} catch (error) {console.log(error)}



const drive = google.drive({
    version:'v3',
    auth: oauth2
})
app.use(cors({
    origin:'*',
    methods: ['GET','POST']
}))
app.use((req,res,next)=>{
    req.drive = drive
    req.iosocket = socket
    next()
})
app.use('/vidcomp',vidcomp)
//---------GOOGLE OAUTH CONNECTION--------------

app.get('/',async(req,res)=>{
    console.log('Uploading');
    res.json({helo:'kk'})
})
// app.post('/vidcomp',async(req,res)=>{

//     let ffbyres = 0
//     req.on('data',(chunk)=>{
//         ffbyres += chunk.length
//         // console.log((ffbyres/req.headers['content-length'])*100);
//     })
//     req.on('end',()=>{console.log('FormData Ended');
//        console.log(file.originalname)
//     })
    
//     await formdatatomulter(req,res)
//     console.log('Uploading Started......');
    
//     const response = await drive.files.create({
//         requestBody: {
//             name:name,
//             mimeType:mime,
//             parents: ['1X9JAzZYEqj25ZK04vE2_08WqQZeXrPev']
//         },
//         media: {
//             mimeType:mime,
//             body: fs.createReadStream(`uploads/${name}`).on('end',()=>{console.log('.....Uploaded')})
//         }
//     })
//     console.log(response.data); 

//     res.json({helo:'kk'})
// })
app.post('/word-to-pdf',(req,res)=>{
    console.log('hello');
    res.json({helo:'kk'})
})
app.post('/',(req,res)=>{
    console.log('hello');
    res.json({helo:'kk'})
})
app.listen(PORT,()=>{
    console.log(`Listening on PORT: ${PORT}`);
})