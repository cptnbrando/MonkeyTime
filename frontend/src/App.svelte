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
    console.log(myDid.substring(8));

    peer = new Peer("", {
      host: "/",
      port: 9000,
      path: "/peerjs/monkeys",
    });

    // This opens up a connection to the peerjs server
    // We need to use the did to see if it's already connected in another session/tab/window
    // If so, we can use that same id, or avoid a connection...
    peer.on("open", function (id) {
      console.log("ID: " + peer.id);
      const response = fetch("/peerjs/monkeys/peerjs/peers")
        .then(function (response) {
          return response.json();
        })
        .then(function (data) {
          // `data` is the parsed version of the JSON returned from the above endpoint.
          console.log(data); // { "userId": 1, "id": 1, "title": "...", "body": "..." }

          data.forEach((element: any) => {
            peer.connect(element, {
              metadata: {
                did: myDid
              }
            });
          });
        });
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
  });
</script>

<main>
  <Chat {peer} {myDid} />
</main>

<style>
</style>
