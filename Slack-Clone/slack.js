const express = require('express');
const app = express();
const socketio = require('socket.io')

// dados das salas e canais 
let namespaces = require('./data/namespaces');

// servir arquivos estaticos do frontend 
app.use(express.static(__dirname + '/public'));
const expressServer = app.listen(9000);
// vincular servidor de socket 
const io = socketio(expressServer);

// io.on = io.of('/').on = io.sockets.on
// io.emit = io.of('/').emit = io.sockets.emit
io.on('connection',(socket)=>{
    
    // build an array to send back with the img and endpoing for each NS
    // array com a imagem e o path para gerar os canais 
    let nsData = namespaces.map((ns)=>{
        return {
            img: ns.img,
            endpoint: ns.endpoint
        }
    })

    // sned the nsData back to the client. We need to use socket, NOT io, because we want it to 
    // go to just this client.     
    // envio para o cliente os dados 
    socket.emit('nsList', nsData);
})

// conexão de todos os canais/namespaces 
// loop through each namespace and listen for a connection
namespaces.forEach((namespace)=>{

    // const thisNs = io.of(namespace.endpoint)
    // quando alguem se conectar a um dos canal/"namespace" 
    io.of(namespace.endpoint).on('connection',(nsSocket)=>{
        console.log(nsSocket.handshake)
        // informações do usuario conectado com o query params 
        const username = nsSocket.handshake.query.username;
        // console.log(`${nsSocket.id} has join ${namespace.endpoint}`)
        // a socket has connected to one of our chatgroup namespaces.

        // send that ns gorup info back
        // enviar para o front as informações das salas de cada canal 
        nsSocket.emit('nsRoomLoad',namespace.rooms)


// ??????????????????????????????????????????

        // verificar o evento de quando alguem entra na sala 
        nsSocket.on('joinRoom',(roomToJoin,numberOfUsersCallback)=>{
            // deal with history... once we have it
            console.log(nsSocket.rooms);
            const roomToLeave = Object.keys(nsSocket.rooms)[1];
            nsSocket.leave(roomToLeave);
            updateUsersInRoom(namespace, roomToLeave)
            nsSocket.join(roomToJoin)
            // io.of('/wiki').in(roomToJoin).clients((error, clients)=>{
            //     console.log(clients.length)
            //     numberOfUsersCallback(clients.length);
            // })
            const nsRoom = namespace.rooms.find((room)=>{
                return room.roomTitle === roomToJoin;
            })
            nsSocket.emit('historyCatchUp', nsRoom.history)
            updateUsersInRoom(namespace, roomToJoin);
        })
        // ouvir quando uma mensagem numa sala é enviada 
        nsSocket.on('newMessageToServer',(msg)=>{
            // formatar mensagem 
            const fullMsg = {
                text: msg.text,
                time: Date.now(),
                username: username,
                avatar: 'https://via.placeholder.com/30'
            }
            // console.log(fullMsg)
            // Send this message to ALL the sockets that are in the room that THIS socket is in.
            // how can we find out what rooms THIS socket is in?
            // console.log(nsSocket.rooms)
            // the user will be in the 2nd room in the object list
            // this is because the socket ALWAYS joins its own room on connection
            // get the keys
            const roomTitle = Object.keys(nsSocket.rooms)[1];
            // we need to find the Room object for this room
            const nsRoom = namespace.rooms.find((room)=>{
                return room.roomTitle === roomTitle;
            })
            // console.log("The room object that we made that matches this NS room is...")
            // console.log(nsRoom)
            nsRoom.addMessage(fullMsg);
            io.of(namespace.endpoint).to(roomTitle).emit('messageToClients',fullMsg)
        })
    })
})

// atualizar numero de usuarios conectados na sala 
function updateUsersInRoom(namespace, roomToJoin){
    // Send back the number of users in this room to ALL sockets connected to this room
    io.of(namespace.endpoint).in(roomToJoin).clients((error,clients)=>{
        // console.log(`There are ${clients.length} in this room`);
        // emitir a quantidade de usuario 
        io.of(namespace.endpoint).in(roomToJoin).emit('updateMembers',clients.length)
    })
}
