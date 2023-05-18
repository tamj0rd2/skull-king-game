<script>
  import Hand from "./Hand.svelte";
  import PlayerBet from "./PlayerBet.svelte";
  import {botName, playerCount, playerName} from "../GameLogic.js";
  import {createEventDispatcher} from "svelte";

  const dispatch = createEventDispatcher()
  export let roundNumber

  let round = {
    [playerName]: {bid: undefined, wins: 0},
    [botName]: {bid: 1, wins: 0},
  }

  $: allBidsComplete = Object.values(round).every(s => s.bid !== undefined)

  let trickNumber = 1

  function handlePlayerBidConfirmed(e) {
    round[playerName].bid = e.detail.bid
  }

  let cardsInTrick = [{card: "4 Blue", playedBy: botName}]
  let playerCards = ["6 Blue"]

  let hasPlayedCard = false
  function handleCardPlayed(e) {
    console.log(e.detail.card)
    hasPlayedCard = true

    const cardIndex = playerCards.findIndex((v) => v === e.detail.card)
    playerCards = [...playerCards.slice(0, cardIndex), ...playerCards.slice(cardIndex+1)]
    cardsInTrick = [...cardsInTrick, {card: e.detail.card, playedBy: playerName}]
  }

  $: trickComplete = cardsInTrick.length === playerCount
  // TODO: determine winner correctly
  let trickWinner = playerName

  $: if (cardsInTrick.length === playerCount) {
    console.log("everyone has played their card!")

    // TODO: correctly determine the winner
    round[trickWinner].wins += 1

    if (trickNumber === roundNumber) {
      dispatch("roundcomplete", round)
    }
  }
</script>

<main>
  <Hand cards={playerCards} canPlayCards={allBidsComplete && !hasPlayedCard} on:cardplayed={handleCardPlayed}/>
  {#if round[playerName].bid === undefined}
    <PlayerBet on:bidconfirmed={handlePlayerBidConfirmed}/>
  {/if}

  {#if allBidsComplete}
    <section>
      <h2>Bids</h2>
      <ul>
        {#each Object.entries(round) as [playerName, {bid}] (playerName)}
          <li>{playerName}: {bid}</li>
        {/each}
      </ul>
    </section>

    <section>
      <h2>Cards in trick</h2>
      <ul>
        {#each cardsInTrick as {card, playedBy}}
          <li>{playedBy}: {card}</li>
        {/each}
      </ul>
      {#if trickComplete}
        <p><strong>{trickWinner}</strong> won trick {trickNumber}</p>
      {/if}
    </section>
  {/if}
</main>

<style>
</style>
