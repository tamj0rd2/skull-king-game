<script>
  import {dispatchGameEvent, game, PlayCardEvent} from "../core/core.js";

  export let playerId
  $: cards = $game.getCards(playerId)
  $: canPlayCards = $game.hasEveryoneBid() && $game.getCards(playerId).length > ($game.getRoundNumber() - $game.getCurrentTrickNumber())

  function handlePlayCard(card) {
    if (confirm(`card played ${card}`)) {
      dispatchGameEvent(new PlayCardEvent(playerId, card))
    }
  }
</script>

<section>
  <h2>Your hand ({playerId})</h2>
  <ul>
    {#each cards as card}
      <li>
        {card.suit} {card.number ?? ""}
        {#if canPlayCards}
          <button on:click={() => handlePlayCard(card)}>Play card</button>
        {/if}
      </li>
    {/each}
  </ul>
</section>
