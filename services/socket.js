const {io} = require('socket.io-client')


const socket = io('https://h62jskdt-5001.inc1.devtunnels.ms')
socket.on('connect',()=>{
    console.log(`SocketId: ${socket.id}`); 
})
module.exports = socket