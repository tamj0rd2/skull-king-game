<script>
  import {dispatchGameEvent, game, PlayCardEvent} from "../core/core.js";

  export let playerId
  $: cards = $game.getCards(playerId)
  $: canPlayCards = $game.hasEveryoneBid()

  function handlePlayCard(cardId) {
    if (confirm(`card played ${cardId}`)) {
      dispatchGameEvent(new PlayCardEvent(playerId, cardId))
    }
  }
</script>

<section>
  <h2>Your hand ({playerId})</h2>
  <ul>
    {#each cards as card}
      <li>
        {card}
        {#if canPlayCards}
          <button on:click={() => handlePlayCard(card)}>Play card</button>
        {/if}
      </li>
    {/each}
  </ul>
</section>
