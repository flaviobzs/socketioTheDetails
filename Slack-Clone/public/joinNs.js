function joinNs(endpoint){
    // vericar se ja existe uma conexão em algum canal 
    if(nsSocket){
        // check to see if nsSocket is actually a socket
        // remover a conexão 
        nsSocket.close();
        // remove the eventListener before it's added again
        // desabilitar campo para não possibilitar envio de mensagens no canal desconectado 
        document.querySelector('#user-input').removeEventListener('submit',formSubmission)
    }
    // criar uma conexão 
    nsSocket = io(`http://localhost:9000${endpoint}`)
    nsSocket.on('nsRoomLoad',(nsRooms)=>{
        // console.log(nsRooms)
        // renderizar salas do canal selecionado 
        let roomList = document.querySelector('.room-list');
        roomList.innerHTML = "";
        nsRooms.forEach((room)=>{
            let glyph;
            if(room.privateRoom){
                glyph = 'lock'
            }else{
                glyph = 'globe'
            }
            roomList.innerHTML += `<li class="room"><span class="glyphicon glyphicon-${glyph}"></span>${room.roomTitle}</li>`
        })
        // add click listener to each room
         // adicionar evento para identificar a sala que o usuario está acessando 
        let roomNodes = document.getElementsByClassName('room');
        Array.from(roomNodes).forEach((elem)=>{
            elem.addEventListener('click',(e)=>{
                // console.log("Somone clicked on ",e.target.innerText);
                joinRoom(e.target.innerText)
            })
        })
        // iniciar e imprimir a primeira sala da lista do canal 
        // add room automatically... first time here
        const topRoom = document.querySelector('.room')
        const topRoomName = topRoom.innerText;
        // console.log(topRoomName);
        // iniciar acessando a primeira sala da lista do canal selecionado 
        joinRoom(topRoomName)
        
    }) 
    // ouvir as mensagens que vem formadata do servidor e gerar HTLM   
    nsSocket.on('messageToClients',(msg)=>{
        console.log(msg)
        const newMsg = buildHTML(msg);
        document.querySelector('#messages').innerHTML += newMsg
    })
    // habilitar formulario de mensagens 
    document.querySelector('.message-form').addEventListener('submit',formSubmission)
}

// eviar a mensagem para o serivor 
function formSubmission(event){
    event.preventDefault();
    const newMessage = document.querySelector('#user-message').value;
    nsSocket.emit('newMessageToServer',{text: newMessage})
}

// construir html com a mensagem que vem do servidor 
function buildHTML(msg){
    const convertedDate = new Date(msg.time).toLocaleString();
    const newHTML = `
    <li>
        <div class="user-image">
            <img src="${msg.avatar}" />
        </div>
        <div class="user-message">
            <div class="user-name-time">${msg.username} <span>${convertedDate}</span></div>
            <div class="message-text">${msg.text}</div>
        </div>
    </li>    
    `
    return newHTML;
}