<script>
  import PlayerBet from "./lib/PlayerBet.svelte";
  import Hand from "./lib/Hand.svelte";
  import {game} from "./core/core.js";
  import PlayerUI from "./lib/PlayerUI.svelte";

</script>

<main>
  <PlayerUI playerId="tam" />
  <hr />
  <PlayerUI playerId="peter" />
</main>

<style>
</style>
