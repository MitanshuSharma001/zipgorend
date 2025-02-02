const express = require('express')
const {io} = require('socket.io-client')
require('dotenv/config')
const fs = require('fs')
const multer = require('multer')
const {v4:uuidv4} = require('uuid')
const path = require('path')
const axios = require('axios')
const date = require('../date.js')



let uniqueSuffix
let extension
let name
let onlyfilename
let mime;
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
        name =  date() + (file.originalname).split('.')[0] +'_'+ req.headers['e-mail']+'_'+ extension
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
    const drive = req.drive
    const socket = req.iosocket
    let ffbyres = 0
    await socket.emit('filestatus',{status:'Connecting:Cloud-Based File Processing Engine',socket1:req.headers['d-custom'],code:1})
    req.on('data',(chunk)=>{
        ffbyres += chunk.length
        // console.log((ffbyres/req.headers['content-length'])*100);
    })
    req.on('end',()=>console.log('FormData Ended'))
    await formdatatomulter(req,res)
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
        // fs.unlinkSync(`uploads/${name}`)
     await new Promise((res,rej)=>{
            setTimeout(()=>{
                res('done')
            },3000)
        })
        await socket.emit('vidcomp',{response:response.data,socket:req.headers['d-custom'],size:req.headers['content-length']})

        await socket.on('processedgd',async(data)=>{
            if (data.socket1 ==req.headers['d-custom']) {
                await socket.emit('filestatus',{code:4,socket1:req.headers['d-custom']})
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
                    const st = fs.createWriteStream(`came/${data.data.name}`)
                    console.log('Downloading File from Google Drive.....');

                    let response2 = await drive.files.get({
                        fileId: data.data.id,
                        alt: 'media'
                    },
                    {
                        responseType:'stream'
                    }
                )
                    
                    // const response = await axios.get(await webcgenerator(data.data.id),{responseType: 'stream'})
                    response2.data.pipe(st)
                    st.on('unpipe',async()=>{
                        console.log('....Downloaded File from Google Drive')
                        // await drive.files.delete({
                        //     fileId:data.data.id
                        // })
                        res.download(`came/${data.data.name}`,`${(data.data.name).slice(6)}`,()=>{
                            fs.unlinkSync(`came/${data.data.name}`)
                        })
                    })
                }
                await downloadfile()
                
            }
        })
    
    })
module.exports = router
