<script>
  import {confirmedPlayerBid} from "../stores.js";

  let selectedBid = undefined

  const possibleBids = new Array(2).fill(0).map((_, i) => i)

  function confirmBid() {
    if (confirm(`Are you sure you want to bid ${selectedBid}?`)) {
      $confirmedPlayerBid = selectedBid
    }
  }
</script>

<section>
  {#if $confirmedPlayerBid === undefined}
    <h2>Choose your bid:</h2>
    {#each possibleBids as possibleBid}
      <label>
        <input type="radio" bind:group={selectedBid} name="bid" value={possibleBid}>
        {possibleBid}
      </label>
    {/each}

    {#if selectedBid !== undefined && $confirmedPlayerBid === undefined}
      <button on:click={confirmBid}>Confirm bid</button>
    {/if}
  {:else}
    <h2>You bid {$confirmedPlayerBid}</h2>
  {/if}
</section>
