const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')
const { generateMessage } = require('./utils/messages')
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users')

const app = express()
const server = http.createServer(app) // Create manually in order to pass it to socket.io below
const io = socketio(server)

const port = process.env.PORT || 3000
const publicDirPath = path.join(__dirname,'../public')

app.use(express.static(publicDirPath))

io.on('connection', (socket) => {
    
    socket.on('join', ({ username, room }, callback) => {
        const { error, user } = addUser({ id: socket.id, username, room })
        if(error) return callback(error)

        socket.join(user.room)
        socket.emit('message', generateMessage('Admin', `Welcome to ${user.room}!`));
        socket.broadcast.to(user.room).emit('message', generateMessage('Admin', `${user.username} has joined ${user.room}`))

        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })

        callback()
    })

    socket.on('sendMessage', (message, callback)=>{
        const filter = new Filter()
        if (filter.isProfane(message)) return callback('Profanity is not allowed')

        const user = getUser(socket.id)
        io.to(user.room).emit('message', generateMessage(user.username, message))
        callback()
    })

    socket.on('sendLocation', (location, callback)=>{
        const user = getUser(socket.id)
        io.to(user.room).emit('linkMessage', {
            url: `https://google.com/maps?q=${location.latitude},${location.longitude}`,
            ...generateMessage(user.username, 'My location')
        })
        callback()
    })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id)
        if (user) {
            io.to(user.room).emit('message', generateMessage('Admin', `${user.username} has left the room`))             
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
    })

})

server.listen(port, () => {
    console.log('Server is listening on port ' + port)
})