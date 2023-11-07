import express from 'express';
import cors from 'cors';
import path from 'path';
import { ExpressPeerServer } from 'peer';

const app = express();
const port = process.env.PORT || 9000;

const publicPath = path.join(path.resolve(), "dist");
app.use("/", express.static(publicPath));

const server = app.listen(port, () => {
   console.log(`Server is up at port ${port}`);
   console.log(`Visit http://localhost:9000 for site`);
   console.log(`PeerJS server at http://127.0.0.1:9000/peerjs`);
});

const peerServer = ExpressPeerServer(server, {
	path: "/monkeys",
   allow_discovery: true
});

peerServer.on('connection', (client) => { 
   console.log("New connection");
   console.log(client);
});

peerServer.on('disconnect', (client) => { 
   console.log("client disconnected");
   console.log(client);
});

app.use(cors());
app.use(express.static('public'));
app.use("/peerjs", peerServer);