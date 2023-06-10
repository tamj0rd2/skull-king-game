<script>
  import {dispatchGameEvent, game} from "../core/core.js";
  import {PlayCardEvent} from "../core/game.js";

  export let playerId
  export let onCardPlayed

  $: cards = $game.getCards(playerId)
  $: canPlayCards = $game.hasEveryoneBid() && $game.getCards(playerId).length > ($game.getRoundNumber() - $game.getCurrentTrickNumber())

  function handlePlayCard(card) {
    onCardPlayed(new PlayCardEvent(playerId, card))
  }
</script>

<section>
  <h2>Your hand ({playerId})</h2>
  <ul>
    {#each cards as card}
      <li>
        {card.suit} {card.number ?? ""}
        {#if canPlayCards && $game.canPlayCard(playerId, card)}
          <button on:click={() => handlePlayCard(card)}>Play card</button>
        {/if}
      </li>
    {/each}
  </ul>
</section>
