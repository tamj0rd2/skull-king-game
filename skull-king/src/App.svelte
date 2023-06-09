<script>
  import PlayerUI from "./lib/PlayerUI.svelte";
  import Admin from "./lib/Admin.svelte";
  import {dispatchGameEvent, game, StartGameEvent} from "./core/core.js";

  dispatchGameEvent(new StartGameEvent(["tam", "peter"]))
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
