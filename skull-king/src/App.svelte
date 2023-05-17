<script>
  import Hand from "./lib/Hand.svelte";
  import Bets from "./lib/Bets.svelte";
  import {gamePhase} from "./stores.js";

  const roundNumber = 1
</script>

<main>
  <h1>Round {roundNumber} - {$gamePhase} Phase</h1>
  <Hand/>
  <Bets />
</main>

<style>
</style>
