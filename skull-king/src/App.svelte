<script>
  import Hand from "./lib/Hand.svelte";
  import PlayerBet from "./lib/PlayerBet.svelte";

  let playerBid = undefined
  let botBid = 1
  $: allBidsComplete = playerBid !== undefined && botBid !== undefined

  let roundNumber = 1
  let trickNumber = 1

  function handleBidConfirmed(e) {
    playerBid = e.detail.bid
  }

  let cardsInTrick = [{card: "4 Blue", playedBy: "Bot"}]
  let playerCards = ["6 Blue"]

  let hasPlayedCard = false
  function handleCardPlayed(e) {
    console.log(e.detail.card)
    hasPlayedCard = true

    const cardIndex = playerCards.findIndex((v) => v === e.detail.card)
    playerCards = [...playerCards.slice(0, cardIndex), ...playerCards.slice(cardIndex+1)]
    cardsInTrick = [...cardsInTrick, {card: e.detail.card, playedBy: "Player"}]
  }
</script>

<main>
  <h1>Round {roundNumber} - {allBidsComplete ? `Trick ${trickNumber}` : "Bidding Phase"}</h1>
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
    </section>
  {/if}
</main>

<style>
</style>
