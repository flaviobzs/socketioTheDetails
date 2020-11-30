
// estrutura de criação de um canal 
class Namespace{
    constructor(id, nsTitle, img, endpoint){
        this.id = id;
        this.img = img;
        this.nsTitle = nsTitle;
        this.endpoint = endpoint;
        // salas vinculadas 
        this.rooms = [];
    }

    addRoom(roomObj){
        this.rooms.push(roomObj);
    }

}

module.exports = Namespace;