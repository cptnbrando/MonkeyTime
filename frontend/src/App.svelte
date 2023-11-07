<script lang="ts">
  import { onMount } from "svelte";
  import Chat from "./lib/Chat.svelte";
  import { Web5 } from "@web5/api";
  import { DataConnection, Peer } from "peerjs";

  let web5: Web5;
  let myDid: string;

  let peer: Peer;

  onMount(async () => {
    ({ web5, did: myDid } = await Web5.connect());

    console.log("web5 connected");
    console.log(myDid);

    const checkRes = await fetch("/check", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        did: myDid,
      }),
    });

    let peerID = "";
    let reconnected: boolean = false;

    // If there's an ID for this DiD already on the server
    // We get back that ID and set it for the Peer connection
    if (checkRes.status === 300) {
      const body = await checkRes.json();
      peerID = body.peerID;
    }

    // If there's no ID for this DiD on the server
    // We get a new PeerID, so that way its populated for later checks
    // Otherwise, a PeerID exists on the server (user might have opened 2 tabs)
    // So we set reconnected flag to true
    if (peerID === "") {
      await fetch("/peerjs/monkeys/peerjs/id")
        .then((res) => res.text())
        .then((data) => {
          peerID = data;
        });
    } else {
      reconnected = true;
    }

    peer = new Peer(peerID, {
      host: "/",
      port: 9000,
      path: "/peerjs/monkeys",
    });

    await fetch("/setIDs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        did: myDid,
        peerID: peerID,
      }),
    });

    // This opens up a connection to the peerjs server
    // We need to use the did to see if it's already connected in another session/tab/window
    // If so, we can use that same id, or avoid a connection...
    peer.on("open", function (id) {
      console.log("ID: " + id);
    });

    peer.on("connection", function (c) {
      console.log("Connected to: " + c.peer);
      c.on("iceStateChanged", (state) => {
        disconnectFromPeer(state, c);
      });
    });

    peer.on("disconnected", function () {
      console.log("Connection lost. Please reconnect");

      peer.reconnect();
    });

    peer.on("close", function () {
      console.log("Connection destroyed");
      peer.destroy();
    });

    peer.on("error", function (err) {
      console.log(err);
      alert("" + err);
    });

    // Once the event handlers have been set, we connect to all peers found on the server
    fetch("/peerjs/monkeys/peerjs/peers")
      .then((response) => response.json())
      .then((data) => {
        data.forEach((element: any) => {
          if (element !== peerID) {
            console.log("Attempting to connect to: " + element);
            const newConnection = connectToPeer(element);
            newConnection.on("iceStateChanged", (state) => {
              disconnectFromPeer(state, newConnection);
            });
          }
        });
      });
  });

  /**
   * This if for a iceStateChanged callback, as the other events aren't working right now
   * This is slow, but in the future we can change the callbacks to use the faster events
   * For now, this removes the connection from the connections map, but keeps the id
   * This could be used to reconnect easily in the future, and I can't get it to remove it completely
   * For now, this works
   * @param state an RTCIceConnectionState
   * @param connection a DataConnection to close
   */
  function disconnectFromPeer(state: RTCIceConnectionState, connection: DataConnection) {
    if (state !== "disconnected") return;

    console.log("peer disconnected");
    console.log(connection);

    connection.close({
      flush: true
    });
    peer._removeConnection(connection);
    // const all = peer.connections as Map<string, Array<DataConnection>>;
    // console.log(all);
    // all.delete(connection.peer);
  }

  /**
   * Connect to a peer, and supply the DiD as metadata
   * The metadata can be changed to use our DwN monkey data
   * @param peerID a peerID string to connect to
   */
  function connectToPeer(peerID: string): DataConnection {
    return peer.connect(peerID, {
      metadata: {
        did: myDid,
      },
    });
  }
</script>

<main>
  <Chat {peer} {myDid} />
</main>

<style>
</style>
