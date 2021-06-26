const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);


const { v4: uuidv4 } = require('uuid');

let roomIds = {};

app.set('view engine', 'ejs');

app.use(express.static('public'));

app.get('/', (req, res)=>{
  res.render('homepage');
});
 
let url='http://localhost:9000/engage/';




app.get('/newmeet', (req,res) => {
  let id = uuidv4();
  res.redirect(`/engage/${id}`);
  roomIds[url+id] = 1;
});

app.get('/engage/:room' ,(req, res) => {
   if(roomIds[url+req.params.room]) {
    res.render('room', {roomId: req.params.room});
  }else{
    res.send("<h2>Entered Room Id is inactive, check it again or start a new meeting</h2>");
  }
  
});

app.get('/endPage', (req, res)=>{
  res.render('endpage');
})
io.on('connection', socket => {
  socket.on('join-room', (roomId, peerId,name) => {
    socket.join(roomId);
    socket.to(roomId).emit('user-connected', peerId, name)
    socket.on('disconnect', () => {
      socket.to(roomId).emit('user-disconnected', peerId, name);
    })
  })
})

server.listen(9000, () => console.log('Server is running at 9000'));