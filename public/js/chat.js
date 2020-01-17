const socket = io()

// elements
const $msgForm = document.querySelector('#message-form')
const $msgFormInput = $msgForm.message
const $msgFormButton = $msgForm.querySelector('button')
const $locationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')
const $sidebar = document.querySelector('#sidebar')

// templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const linkMessageTemplate = document.querySelector('#link-message-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

// options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

const autoscroll = () => {
    const $newMessage = $messages.lastElementChild
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    const visibleHeight = $messages.offsetHeight
    const containerHeight = $messages.scrollHeight
    const scrollOffset = $messages.scrollTop + visibleHeight

    if(containerHeight - newMessageHeight <= scrollOffset){
        $messages.scrollTop = containerHeight
    }

    console.log(newMessageHeight)
}

$msgForm.addEventListener('submit', (e)=>{
    e.preventDefault()
    $msgFormButton.setAttribute('disabled', 'disabled')
    const message = e.target.elements.message.value
    socket.emit('sendMessage', message, (error)=>{
        $msgFormButton.removeAttribute('disabled')
        if(error) return console.log(error, cbMsg)
        console.log('Delivered!')
    })
    $msgFormInput.value = ''
    $msgFormInput.focus()
})

socket.on('message', ({ username, text, createdAt}) => {
    const html = Mustache.render(messageTemplate, {
        username,
        text,
        createdAt: moment(createdAt).format('HH:mm')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('linkMessage', ({url, username, text, createdAt}) => {
    const html = Mustache.render(linkMessageTemplate, {
        url,
        username,
        text,
        createdAt: moment(createdAt).format('HH:mm')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

document.querySelector('#send-location').addEventListener('click', e=>{
    e.preventDefault()
    $locationButton.setAttribute('disabled', 'disabled')
    if(!navigator.geolocation) return alert('No browser support for geolocation')
    navigator.geolocation.getCurrentPosition((position)=>{
        console.log(position.coords);
        
        socket.emit('sendLocation', {
            // just send position.coords
            latitude: position.coords.latitude, 
            longitude: position.coords.longitude
        }, (error)=>{
            $locationButton.removeAttribute('disabled')
            if(error) return console.log(error)
            console.log('Location shared!')
        })
    })
})

socket.emit('join', { username, room }, (error)=>{
    if(error){
        alert(error)
        location.href = '/'
    }
})

socket.on('roomData', ({ room, users })=>{
    const html = Mustache.render(sidebarTemplate, { room, users })
    $sidebar.innerHTML = html
})