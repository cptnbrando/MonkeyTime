<script lang="ts">
    import { onMount } from "svelte";
    import Stomp from "stompjs";
    // import SockJS from "sockjs-client";
    import { writableArray } from './store.js';

    export let serverURL: string;

    let text: string;
    let stompClient: Stomp.Client;

    onMount(async () => {
        // const ws = new SockJS(`${serverURL}/socket`);
        // stompClient = Stomp.over(ws);
        // initWSConnection();
    });

    // const initWSConnection = () => {
    //     stompClient.connect({}, function (frame: any) {
    //         stompClient.subscribe("/message", (message: any) => {
    //             if (message.body) {
    //                 addToArray(message.body);
    //             }
    //         });
    //     });
    // };

    // const sendMessage = () => {
    //     stompClient.send('/app/send/message', {}, text);
    // };

    // const addToArray = (newMessage: string) => {
	// 	$writableArray = [...$writableArray, newMessage];
	// };
</script>

<article>
    <h2>Chat Test</h2>
    <div class="inline-flex">
        <input type="text" bind:value={text} />
        <button on:click={() => {}}>Send</button>
    </div>
    
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
</style>

