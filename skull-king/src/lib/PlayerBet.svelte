<script>
  import {game} from "../core/core.js";
  import {BidEvent} from "../core/game.js";

  export let playerId
  export let onBidConfirmed

  let selectedBid = undefined
  let hasConfirmedBid = false


  $: roundNumber = $game.getRoundNumber()
  $: possibleBids = new Array(roundNumber + 1).fill(0).map((_, i) => i)

  function confirmBid() {
    onBidConfirmed(new BidEvent(playerId, selectedBid))
    hasConfirmedBid = true
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

  {#if selectedBid !== undefined && !hasConfirmedBid}
    <button on:click={confirmBid}>Confirm bid</button>
  {/if}
</section>
