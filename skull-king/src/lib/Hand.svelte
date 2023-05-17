<script>
  import {createEventDispatcher} from "svelte";

  const dispatch = createEventDispatcher()

  export let cards
  export let canPlayCards
</script>

<section>
  <h2>Your hand</h2>
  <ul>
    {#each cards as card}
      <li>
        {card}
        {#if canPlayCards}
          <button on:click={() => dispatch("cardplayed", {card})}>Play card</button>
        {/if}
      </li>
    {/each}
  </ul>
</section>
