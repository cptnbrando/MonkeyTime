<script lang="ts">
  import Chat from "./lib/Chat.svelte";

  const serverURL = "http://localhost:8080";
</script>

<main>
  <Chat {serverURL} />
</main>

<style>
</style>
