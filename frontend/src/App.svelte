<script lang="ts">
  import { onMount } from "svelte";
  import Chat from "./lib/Chat.svelte";
  import { Web5 } from "@web5/api";
  import { Peer } from 'peerjs';

  const serverURL = "http://localhost:8080";

  let web5;
  let myDid;

  let peer;

  onMount(async () => {
    ({ web5, did: myDid } = await Web5.connect());

    console.log("web5 connected");
    console.log(myDid);

    peer = new Peer(myDid);

    peer.on('open', function(id) {
      console.log('My peer ID is: ' + id);
    });
  });
  

</script>

<main>
  <Chat {serverURL} />
</main>

<style>
</style>
