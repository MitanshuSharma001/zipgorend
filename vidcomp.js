const express = require('express')
const {io} = require('socket.io-client')
require('dotenv/config')
const fs = require('fs')
const multer = require('multer')
const {v4:uuidv4} = require('uuid')
const path = require('path')
const axios = require('axios')


let uniqueSuffix
let extension
let name
let onlyfilename
let mime;
let now = new Date()
setInterval(()=>{
  now = new Date()
},1000)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); 
    },
    filename: (req, file, cb) => {
        // uniqueSuffix = now.toLocaleString().replaceAll(/[:,/]/g,'_').replaceAll(' ','_') + '-' + Math.round(Math.random() * 1E9);
        extension = path.extname(file.originalname); 
        console.log(file);
        mime = file.mimetype
        // onlyfilename = file.fieldname + '-' + uniqueSuffix
        // name = file.fieldname + req.headers['d-custom'] +'-' + uniqueSuffix + extension
        name = (file.originalname).split('.')[0] +req.headers['d-custom'] + extension
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
    req.on('data',(chunk)=>{
        ffbyres += chunk.length
        // console.log((ffbyres/req.headers['content-length'])*100);
    })
    req.on('end',()=>console.log('FormData Ended'))
    await formdatatomulter(req,res)
    console.log('Uploading Started......');
    
    const drive = req.drive
    const socket = req.iosocket
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
        await socket.emit('uploadedrawgd',{response:response.data,socket:req.headers['d-custom']})

        await socket.on('processedgd',async(data)=>{
            async function webcgenerator(id) {
                console.log('Generating Content Link....')
                try {
                    await drive.permissions.create({
                        fileId:id,
                        requestBody:{
                            role:'reader',
                            type:'anyone'
                        }
                    })
                    const result = await drive.files.get({
                        fileId:id,
                        fields:'webViewLink,webContentLink'
                    })
                    console.log('.....Content Link Generated');
                    // console.log(result.data);
                    return result.data.webContentLink
                } catch (error) {
                    console.log(error.message);
                }
            }


            async function downloadfile() {
                const st = fs.createWriteStream(`came/${data.name}`)
                console.log('Downloading File from Google Drive.....');
                
                const response = await axios.get(await webcgenerator(data.id),{responseType: 'stream'})
                response.data.pipe(st)
                st.on('unpipe',async()=>{
                    console.log('....Downloaded File from Google Drive')
                    res.download(`came/${data.name}`,`${data.name}`)
                })
            }
            await downloadfile()
        })
    
    })
module.exports = router