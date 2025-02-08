const express = require('express')
const {io} = require('socket.io-client')
require('dotenv/config')
const fs = require('fs')
const multer = require('multer')
const {v4:uuidv4} = require('uuid')
const path = require('path')
const axios = require('axios')
const time = require('../date.js')
const socket = require('../services/socket.js')
const drive =  require('../services/gconn.js')

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); 
    },
    filename: (req, file, cb) => {
        let extension = path.extname(file.originalname); 
        console.log(file);
        req.mime = file.mimetype
        let name = time() +(file.originalname).split('.')[0] +'_'+ req.headers['e-mail']+'_'+ extension
        req.name = name
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
    await socket.emit('filestatus',{status:'Processing File on Cloud',socket1:req.headers['d-custom']})
    req.on('data',(chunk)=>{
        ffbyres += chunk.length
        // console.log((ffbyres/req.headers['content-length'])*100);
    })
    req.on('end',()=>console.log('FormData Ended'))
    await formdatatomulter(req,res)
    let name = req.name
    let mime = req.mime
    console.log('Uploading Started......');
    
    const response = await drive.files.create({
            requestBody: {
                name:name,
                mimeType:mime,
                parents: ['1X9JAzZYEqj25ZK04vE2_08WqQZeXrPev']
            },
            media: {
                mimeType:mime,
                body: fs.createReadStream(`uploads/${name}`).on('end',()=>{console.log('.....Uploaded')})
            }
        })
        fs.unlinkSync(`uploads/${name}`)
        await socket.emit('xlsxtopdf',{response:response.data,socket:req.headers['d-custom'],name})
        let tries = true
        await socket.on('processedxlsx',async(data)=>{
            if (data.socket1 == req.headers['d-custom']&& tries) {
                tries = false
                async function downloadfile() {
                    let st = fs.createWriteStream(`came/${data.data.name}`)
                    console.log('Downloading File from Google Drive.....');
                    
                    let response2 = await drive.files.get({
                        fileId: data.data.id,
                        alt: 'media'
                    },
                    {
                        responseType: 'stream'
                    }
                )
    
                    response2.data.pipe(st)
                    st.on('finish',async()=>{
                        console.log('....Downloaded File from Google Drive')
                        res.download(`came/${data.name}`,`${(data.name).slice(6)}`,async()=>{
                            fs.unlinkSync(`came/${data.name}`)
                            try {
                                await drive.files.delete({
                                    fileId:data.id
                                })
                            } catch (error) {
                                console.log(error.message);
                            }
                        })
                    })
                }
                await downloadfile()
            }
        })
    
    })
module.exports = router