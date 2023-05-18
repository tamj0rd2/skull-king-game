<script>
  import Hand from "./Hand.svelte";
  import PlayerBet from "./PlayerBet.svelte";
  import {botName, playerCount, playerName} from "../GameLogic.js";
  import {createEventDispatcher} from "svelte";

  const dispatch = createEventDispatcher()

  let playerBid = undefined
  let botBid = 1
  $: allBidsComplete = playerBid !== undefined && botBid !== undefined

  let roundNumber = 1
  let trickNumber = 1

  function handleBidConfirmed(e) {
    playerBid = e.detail.bid
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

  $: roundScores = {
    [playerName]: {bid: playerBid, wins: 0},
    [botName]: {bid: botBid, wins: 0},
  }

  $: trickComplete = cardsInTrick.length === playerCount
  let trickWinner = playerName

  $: if (cardsInTrick.length === playerCount) {
    console.log("everyone has played their card!")

    // TODO: correctly determine the winner
    roundScores[trickWinner].wins += 1

    if (trickNumber === roundNumber) {
      dispatch("roundcomplete", roundScores)
    }
  }
</script>

<main>
  <Hand cards={playerCards} canPlayCards={allBidsComplete && !hasPlayedCard} on:cardplayed={handleCardPlayed}/>
  {#if playerBid === undefined}
    <PlayerBet on:bidconfirmed={handleBidConfirmed}/>
  {/if}

  {#if allBidsComplete}
    <section>
      <h2>Bids</h2>
      <ul>
        <li>Player: {playerBid}</li>
        <li>Bot: {botBid}</li>
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
