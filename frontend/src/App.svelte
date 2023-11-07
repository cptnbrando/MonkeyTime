<script lang="ts">
  import { onMount } from "svelte";
  import Chat from "./lib/Chat.svelte";
  import { Web5 } from "@web5/api";
  import { Peer } from "peerjs";

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

    // If there's an ID for this DiD already on the server
    // We get back that ID and set it for the Peer connection
    if (checkRes.status === 300) {
      const body = await checkRes.json();
      peerID = body.peerID;
    }

    // If there's no ID for this DiD on the server
    // We get a new PeerID, so that way its populated for later checks
    if (peerID === "") {
      await fetch("/peerjs/monkeys/peerjs/id")
        .then((res) => res.text())
        .then((data) => {
          peerID = data;
        });
    }

    peer = new Peer(peerID, {
      host: "/",
      port: 9000,
      path: "/peerjs/monkeys",
    });

    const setIDs = await fetch("/setIDs", {
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
      // After opening the connection, we retrieve the list of IDs of all active Peers on the server
      // Then we connect to all peerIDs except our own peerID
      // fetch("/peerjs/monkeys/peerjs/peers")
      //   .then(response => console.log(response));
      // .then(data => {
      //   console.log(data);
      //   // data.forEach((element: any) => {
      //   //   console.log("Attempting to connect to: " + element);
      //   //   if(element !== peerID) {
      //   //     peer.connect(element, {
      //   //       metadata: {
      //   //         did: myDid
      //   //       }
      //   //     });
      //   //   }
      //   // });
      // });
    });

    peer.on("connection", function (c) {
      console.log("Connected to: " + c.peer);
    });

    peer.on("disconnected", function () {
      console.log("Connection lost. Please reconnect");

      peer.reconnect();
    });

    peer.on("close", function () {
      console.log("Connection destroyed");
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
          peer.connect(element, {
            metadata: {
              did: myDid,
            },
          });
        }
      });
    });
  });
</script>

<main>
  <Chat {peer} {myDid} />
</main>

<style>
</style>
