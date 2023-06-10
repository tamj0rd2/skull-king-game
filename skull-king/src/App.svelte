<script>
  import PlayerUI from "./lib/PlayerUI.svelte";
  import Admin from "./lib/Admin.svelte";

  const urlParams = new URLSearchParams(window.location.search)
  const playerId = urlParams.get('playerId')

  const ws = new WebSocket('ws://localhost:8080')
</script>

<main>
  <Admin ws={ws} />
  <hr />
  <PlayerUI playerId={playerId} ws={ws} />
</main>

<style>
</style>
