<script>
  import Hand from "./lib/Hand.svelte";
  import PlayerBet from "./lib/PlayerBet.svelte";
  import {calculateScore} from "./GameLogic.js";

  const botName = "Bot"
  const playerName = "Player"

  let playerBid = undefined
  let botBid = 1
  $: allBidsComplete = playerBid !== undefined && botBid !== undefined

  const playerCount = 2 // player and the bot
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
  let roundComplete = false

  $: if (cardsInTrick.length === playerCount) {
    console.log("everyone has played their card!")

    // TODO: correctly determine the winner
    roundScores[trickWinner].wins += 1

    console.log(roundScores)

    if (trickNumber === roundNumber) {
      roundComplete = true
    }
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
      {#if trickComplete}
        <p><strong>{trickWinner}</strong> won this time</p>
      {/if}
    </section>

    <section>
      <h2>Scoreboard</h2>
      <table>
        <thead>
          <tr>
            <th>Players</th>
            <th>Round 1</th>
          </tr>
        </thead>
        <tbody>
          {#each Object.entries(roundScores) as [name, scoreThingy]}
            <tr>
              <td>{name}</td>
              <td>
                {#if roundComplete}
                  {calculateScore(roundNumber, scoreThingy)}
                {/if}
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </section>
  {/if}
</main>

<style>
</style>
