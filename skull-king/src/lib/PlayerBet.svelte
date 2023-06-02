<script>
  import {BidEvent, dispatchGameEvent, game} from "../core/core.js";

  export let playerId
  let selectedBid = undefined

  $: roundNumber = $game.getRoundNumber()
  $: possibleBids = new Array(roundNumber + 1).fill(0).map((_, i) => i)

  function confirmBid() {
    if (confirm(`Are you sure you want to bid ${selectedBid}?`)) {
      dispatchGameEvent(new BidEvent(playerId, selectedBid))
    }
  }
</script>

<section>
  <h2>Choose your bid:</h2>
  {#each possibleBids as possibleBid}
    <label>
      <input type="radio" bind:group={selectedBid} name="bid" value={possibleBid}>
      {possibleBid}
    </label>
  {/each}

  {#if selectedBid !== undefined}
    <button on:click={confirmBid}>Confirm bid</button>
  {/if}
</section>
