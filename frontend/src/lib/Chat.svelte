<script lang="ts">
    import { onMount } from "svelte";
    import Stomp from "stompjs";
    // import SockJS from "sockjs-client";
    import { writableArray } from "./store.js";
    import type Peer from "peerjs";
    import type { DataConnection } from "peerjs";

    export let peer: Peer;
    export let myDid: string;

    let text: string;
    let stompClient: Stomp.Client;

    let clientConn: string;

    let firstConn: DataConnection;

    // onMount(async () => {
    //     // const ws = new SockJS(`${serverURL}/socket`);
    //     // stompClient = Stomp.over(ws);
    //     // initWSConnection();
    // });

    function connectToClient() {
        firstConn = peer.connect(clientConn, {
            metadata: {
                did: `${myDid}`
            }
        });

        firstConn.on("open", () => {
            // Receive messages
            firstConn.on("data", (data: any) => {
                console.log("Received", data);
                addToArray(data.body);
            });
        });

        peer.on("connection", (conn) => {
            console.log("Connected");
            console.log(conn);
        });
    }

    // const initWSConnection = () => {
    //     stompClient.connect({}, function (frame: any) {
    //         stompClient.subscribe("/message", (message: any) => {
    //             if (message.body) {
    //                 addToArray(message.body);
    //             }
    //         });
    //     });
    // };

    const sendMessage = () => {
        firstConn.send(text);
    };

    const addToArray = (newMessage: string) => {
    	$writableArray = [...$writableArray, newMessage];
    };
</script>

<article>
    <h2>Chat Test</h2>
    <div class="inline-flex">
        <input type="text" bind:value={clientConn} />
        <button on:click={connectToClient}>Connect to ID</button>
    </div>
    <div>
        <span id="did">{myDid}</span>
    </div>
    <div class="inline-flex">
        <input type="text" bind:value={text} />
        <button on:click={sendMessage}>Send</button>
    </div>

    <button on:click={() => {console.log(peer)}}>Check Peer</button>

    <div class="col-flex">
        {#each $writableArray as m}
            <span>- {m}</span>
        {/each}
    </div>
</article>

<style>
    .inline-flex {
        display: flex;
    }

    .col-flex {
        display: flex;
        flex-direction: column;
    }

    #did {
        word-wrap: break-word;
    }
</style>
