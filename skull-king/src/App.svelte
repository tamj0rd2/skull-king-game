<script>
  import PlayerUI from "./lib/PlayerUI.svelte";
  import Admin from "./lib/Admin.svelte";
</script>

<main>
  <Admin />
  <hr />
  <PlayerUI playerId="tam" isHost />
  <hr />
  <PlayerUI playerId="peter" />
</main>

<style>
</style>
