const username = prompt("What is your username?")
// const socket = io('http://localhost:9000'); // the / namespace/endpoint
const socket = io('http://localhost:9000',{
    // passar usuario para indicar no servidor 
    query: {
        username
    }
});

let nsSocket = "";

// listen for nsList, which is a list of all the namespaces.
// receber infomações das namespaces/canais 
socket.on('nsList',(nsData)=>{

    console.log("The list of .rooms has arrived!!")
    // console.log(nsData)
    // renderizar canais 
    let namespacesDiv = document.querySelector('.namespaces');
    namespacesDiv.innerHTML = "";
    nsData.forEach((ns)=>{
        namespacesDiv.innerHTML += `<div class="namespace" ns=${ns.endpoint} ><img src="${ns.img}" /></div>`
    })

    // Add a clicklistener for each NS
    // adicionar evento para identificar o canal que o usuario está acessando 
    Array.from(document.getElementsByClassName('namespace')).forEach((elem)=>{
        // console.log(elem)
        elem.addEventListener('click',(e)=>{
            const nsEndpoint = elem.getAttribute('ns');
            // console.log(`${nsEndpoint} I should go to now`)
            joinNs(nsEndpoint)
        })
    })

    // já entra inicialmente nessa namespace/canal 
    joinNs('/wiki');
})


