<script>
  import {createEventDispatcher} from "svelte";

  let selectedBid = undefined

  const dispatch = createEventDispatcher()
  const possibleBids = new Array(2).fill(0).map((_, i) => i)

  function confirmBid() {
    if (confirm(`Are you sure you want to bid ${selectedBid}?`)) {
      dispatch('bidconfirmed', { bid: selectedBid })
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
