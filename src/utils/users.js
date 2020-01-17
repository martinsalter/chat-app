const users = []

const addUser = ({ id, username, room }) => {
    username = username.trim()
    room = room.trim()

    if (!username || !room) return { error: 'Username and room are required' }
    
    // Check for existing user
    const existingUser = users.find(user => user.username.toLowerCase() === username.toLowerCase() && user.room.toLowerCase() === room.toLowerCase())

    // Validate existing user
    if(existingUser) return { error: 'Username already exists in that room' }

    // if room already exists, maintain capitalisation
    const userInSameRoom = users.find(user => user.room.toLowerCase() === room.toLowerCase())
    if(userInSameRoom) room = userInSameRoom.room

    // Store user
    const user = { id, username, room }
    users.push(user)
    return {user}
}

const removeUser = (id) => {
    const index = users.findIndex(user => user.id === id)
    if (index !== -1){
        return users.splice(index, 1)[0]
    }
}

const getUser = (id) => {
    return users.find(user => user.id === id)
}

const getUsersInRoom = (room) => {
    return users.filter(user => user.room.toLowerCase() === room.trim().toLowerCase())
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}