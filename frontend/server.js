// Run with npm run build
// Then node server.js
import express from 'express';
import cors from 'cors';
import path from 'path';
import { ExpressPeerServer } from 'peer';

const app = express();
const port = process.env.PORT || 9000;

const publicPath = path.join(path.resolve(), "dist");
app.use("/", express.static(publicPath));

// We need a way to store DiDs and peer.js IDs
// Two maps that get populated on connect / disconnect
// We need two because when disconnecting, we only know the client's peer.js ID
// We manipulate both maps on client connects / disconnects
const didsToPeers = new Map();
const peersToDids = new Map();

const server = app.listen(port, () => {
   console.log(`Server is up at port ${port}`);
   console.log(`Visit http://localhost:9000 for site`);
   console.log(`PeerJS server at http://127.0.0.1:9000/peerjs`);
});

const peerServer = ExpressPeerServer(server, {
	path: "/monkeys",
   allow_discovery: true
});

// Needed, otherwise body in requests is undefined
app.use(express.json());

/**
 * Called initially to see if DiD is already active on the server
 * If so, return the associated peerID and use that for connections
 */
app.put('/check', (req, res) => {
   const did = req.body.did;

   if(did && didsToPeers.has(did)) {
      res.status(300).send({"peerID": didsToPeers.get(did)});
   } else {
      res.status(200).send({"status": "OK"});
   }
});

/**
 * Called after we've checked that the user does not have any concurrent connections / tabs open
 * We pass the DiD and the PeerID, and store them in Map objects to retrieve later
 */
app.post('/setIDs', (req, res) => {
   const did = req.body.did;
   const peerID = req.body.peerID;

   if(!did) {
      res.status(400).send("Bad DID recieved");
      return;
   }
   if(!peerID) {
      res.status(400).send("Bad peerID recieved");
      return;
   }

   didsToPeers.set(did, peerID);
   peersToDids.set(peerID, did);

   res.status(200).send({
      did: did,
      peerID: peerID
   });
});

/**
 * Called once a new PeerJS connection is established
 * Only if the ID is new
 */
peerServer.on('connection', (client) => { 
   console.log("New connection");
   // console.log(client);
   // if(peersToDids.has(client.getId())) {
      
   // }
});

/**
 * Called once the user closes the tab or disconnects otherwise
 * We remove the DiD and the PeerID from the Map objects
 */
peerServer.on('disconnect', (client) => { 
   console.log("client disconnected");
   const peerID = client.getId();
   const did = peersToDids.get(peerID);
   didsToPeers.delete(did);
   peersToDids.delete(peerID);
});

app.use(cors());
app.use(express.static('public'));
app.use("/peerjs", peerServer);