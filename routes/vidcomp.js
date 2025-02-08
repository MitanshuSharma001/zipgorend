const express = require('express')
const {io} = require('socket.io-client')
require('dotenv/config')
const fs = require('fs')
const multer = require('multer')
const {v4:uuidv4} = require('uuid')
const path = require('path')
const axios = require('axios')
const date = require('../date.js')
const socket = require('../services/socket.js')
const drive =  require('../services/gconn.js')



// let uniqueSuffix
// let extension
// let name
// let onlyfilename
// let mime;
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); 
    },
    filename: (req, file, cb) => {
        // uniqueSuffix = now.toLocaleString().replaceAll(/[:,/]/g,'_').replaceAll(' ','_') + '-' + Math.round(Math.random() * 1E9);
        let extension = path.extname(file.originalname); 
        console.log(file);
        req.mime1 = file.mimetype
        // mime = file.mimetype
        // onlyfilename = file.fieldname + '-' + uniqueSuffix
        // name = file.fieldname + req.headers['d-custom'] +'-' + uniqueSuffix + extension
        let name =  date() + (file.originalname).split('.')[0] +'_'+ req.headers['e-mail']+'_'+ extension
        req.name1 = name
        cb(null, name);
    },
});

const uploadf = multer({storage:storage})
//---------MULTER HANDLING--------------------
const formdatatomulter = async(req,res)=>{
    await new Promise((resolve,reject)=>{
        uploadf.single('file')(req,res,(err)=>{
            if (err) console.log(err)
            resolve('done')
        })
    })
}
const router = express.Router()

router.post('/',async(req,res)=>{
    let ffbyres = 0
    await socket.emit('filestatus',{status:'Cloud-Based File Processing Engine Running',socket1:req.headers['d-custom'],code:1})
    req.on('data',(chunk)=>{
        ffbyres += chunk.length
        console.log((ffbyres/req.headers['content-length'])*100);
    })
    req.on('aborted',()=>{
        try{
        fs.unlink(`uploads/${req.name1}`,(err)=>{
            if(err) console.log('Error in deleting Aborted file')
            else console.log(`File Deleted: ${req.name1}`)
        })
        }
        catch{
            console.log('Error while abort command')
        }
    })
    req.on('end',()=>console.log('FormData Ended'))
    await formdatatomulter(req,res)
    let name = req.name1
    let mime = req.mime1
    console.log('Uploading Started......');
    let upbye = 0
    let response = await drive.files.create({
            requestBody: {
                name:name,
                mimeType:mime,
                parents: ['1X9JAzZYEqj25ZK04vE2_08WqQZeXrPev']
            },
            media: {
                mimeType:mime,
                body: fs.createReadStream(`uploads/${name}`).on('data',(chunk)=>{ upbye+=chunk.length; console.log((upbye/req.headers['content-length'])*100); }).on('end',()=>{console.log('.....Uploaded')})
            }
        })
        try {
            fs.unlinkSync(`uploads/${name}`)
        } catch (error) {
            console.log(error);
        }
        await socket.emit('vidcomp',{response:response.data,socket:req.headers['d-custom'],size:req.headers['content-length']})
        await res.send('File Under Process')
    })
    socket.on('processedgd',async(data)=>{
            await socket.emit('filestatus',{code:4,socket1:data.socket1})
            async function downloadfile() {
                const st = fs.createWriteStream(`came/${data.data.name}`)
                console.log('Downloading File from Google Drive.....');
                let response2 = await drive.files.get({
                    fileId: data.data.id,
                    fields:'size',
                    alt: 'media'
                },{responseType:'stream'}
            )
                response2.data.pipe(st)
                st.on('unpipe',async()=>{
                    console.log('....Downloaded File from Google Drive')
                    await drive.files.delete({
                        fileId:data.data.id
                    })
                    await socket.emit('downloadfile',{filename:data.data.name,socketid:data.socket1})
                })
            }
            await downloadfile()
            
    })
    module.exports = router