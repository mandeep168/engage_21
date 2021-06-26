const socket = io('/')
const videoGrid = document.getElementById('video-grid')
let name=getUsername()

let myPeer = null

const container = document.createElement('div')
container.className += 'container'
const myVideo = document.createElement('video')
const div2 = document.createElement('div')
div2.className += 'overlay'
const p = document.createElement('p')
p.innerHTML = name
div2.append(p);

myVideo.muted = true
let PEER_ID;
let peers = {}
navigator.mediaDevices.getUserMedia(
{
	video: true,
	audio: true
}

).then(stream => {
	myPeer = new Peer()
	console.log("peer connection started!")
	addVideoStream(myVideo,container,div2, stream)
		myPeer.on('open', peerId=> {
		socket.emit('join-room', ROOM_ID, peerId,name)
		PEER_ID = peerId;
		console.log(`peer Id: ${peerId}`)
		peers[peerId]={'call':myPeer,'username':name}
	})
		//data connection
	myPeer.on('connection', (conn) => {
		conn.on('open', function() {
		  // Receive messages
		  conn.on('data', function(data) {
	  		peers[conn.peer]={'call':conn,'username':data}
	   		 console.log('Received', data);
	 	  });

		  // Send messages
		  conn.send('Hello!');
		});
	})
	myPeer.on('call', (call) => { 	

		//2nd person
		console.log(call)
		call.answer(stream)
		console.log('call answered')
		console.log(call.peer)
		console.log(peers[call.peer].username)
		const video = document.createElement('video')

		const container1 = document.createElement('div')
		container1.className += 'container'
		const div3 = document.createElement('div')
		div3.className += 'overlay'
		const p1 = document.createElement('p')
		p1.innerHTML = peers[call.peer].username
		div3.append(p1);
		call.on('stream', userVideoStream => {
			addVideoStream(video,container1, div3,userVideoStream)
		})

	})

	socket.on('user-connected', (peerId,name) => {
		console.log("new user connected", peerId, name)
		connectToNewUser(peerId, stream,name)

	})
}).catch(error=>{
	console.log("Error: ",error)
})

socket.on('user-disconnected', (peerId,name) => {
	if (peers[peerId].call) peers[peerId].call.close()
	console.log(`user disconnected: ${peerId}  ${name}`)
})


function connectToNewUser(peerId, stream, username) {  
	//data connection
	const conn = myPeer.connect(peerId);
	conn.on('open', () => {
		conn.send(name)
	})


	//calling
	setTimeout(function(){ const call = myPeer.call(peerId, stream);
	

	const video = document.createElement('video')
		
		const container1 = document.createElement('div')
		container1.className += 'container'
		const div3 = document.createElement('div')
		div3.className += 'overlay'
		const p1 = document.createElement('p')
		p1.innerHTML = username
		div3.append(p1);
	call.on('stream', userVideoStream => {
		console.log("answered user added!")
		addVideoStream(video,container1,div3, userVideoStream)
	})
	call.on('close', () => {
		video.remove()
	})

	peers[peerId]={'call':call,'username':username}; }, 3000);
}


function addVideoStream(video,container,div,stream) {
	video.srcObject = stream
	video.addEventListener('loadedmetadata', () => {
		video.play()
	})
	console.log("add video stream")
	container.append(video)
	container.append(div)
	videoGrid.append(container)
}

function endCall(){
	socket.emit('user-disconnected', PEER_ID)
	window.location = 'http://localhost:9000/endPage';
}


function copyId(){
        var input = document.body.appendChild(document.createElement("input"));
        input.value = window.location.href;
        input.focus();
        input.select();
        document.execCommand('copy');
        input.parentNode.removeChild(input);
}


function getUsername() { 
     var username = prompt("Please enter your name");
     while(username == "") {
       username = prompt("Please enter your name again");
      }sessionStorage.setItem("username", username);

      return username;
}

