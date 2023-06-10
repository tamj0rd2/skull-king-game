<script>
  import PlayerBet from "./PlayerBet.svelte";
  import Hand from "./Hand.svelte";
  import {game, updateGameJSON} from "../core/core.js";
  import {BidEvent, PlayCardEvent, StartNextRoundEvent, StartNextTrickEvent} from "../core/game.js";
  import {onMount} from "svelte";

  export let playerId
  export let ws

  let gameStarted = false

  onMount(() => {
    ws.onerror = console.error

    ws.onopen = function open() {
      console.log("Connecting as", playerId)
      ws.send(JSON.stringify({type: "player_joined", playerId}))
    }

    ws.onmessage = function message({data}) {
      const msg = JSON.parse(data)
      console.log(`${playerId} received`, msg)

      switch (msg.type) {
        case "game_started":
          gameStarted = true
          updateGameJSON(msg.game)
          return
        case "game_update":
          updateGameJSON(msg.game)
          return
        default:
          throw new Error(`cannot handle message type ${msg.type}`)
      }
    }

    ws.onclose = function () {
      console.log("disconnected")
    }

    return () => ws.close()
  })

  function sendEvent(e) {
    ws.send(JSON.stringify(e))
  }

  function totalScore(rounds) {
    return rounds.reduce((tot, {score}) => tot + (score ?? 0), 0)
  }
</script>

<section>
  <p>{playerId}'s area</p>
  {#if gameStarted}
  <div>
    <h1>Round {$game.getRoundNumber()}</h1>
    <Hand playerId={playerId} onCardPlayed={sendEvent}/>

    {#if $game.getRoundScoreBoard()[playerId].bid === undefined}
      <PlayerBet playerId={playerId} onBidConfirmed={sendEvent} />
    {/if}

    {#if $game.hasEveryoneBid()}
      <section>
        <h2>Bids</h2>
        <ul>
          {#each Object.entries($game.getRoundScoreBoard()) as [pid, {bid, wins}] (pid)}
            <li><strong>{pid}</strong> | Bid: {bid} | Wins: {wins}</li>
          {/each}
        </ul>

        {#if $game.isCurrentTrickComplete()}
          <p><strong>{$game.getCurrentTrickWinner()}</strong> won trick {$game.getCurrentTrickNumber()}</p>
        {/if}

        {#if $game.isCurrentTrickComplete()}
          {#if $game.isCurrentRoundComplete() && $game.getRoundNumber() !== 10}
            <button on:click={() => sendEvent(new StartNextRoundEvent())}>Start next round</button>
          {/if}

          {#if !$game.isCurrentRoundComplete()}
            <button on:click={() => sendEvent(new StartNextTrickEvent())}>Start next trick</button>
          {/if}
        {/if}
      </section>
      <section>
        <h2>Cards in trick</h2>
        <ul>
          {#each $game.getCardsInTrick() as {card, playerId} (card)}
            <li>{playerId}: {card.id}</li>
          {/each}
        </ul>
      </section>
    {/if}

    <section>
      <h2>Scoreboard</h2>
      <table>
        <thead>
        <tr>
          <th>Players</th>
          {#each new Array(10) as _, i}
            <th>R{i + 1}</th>
          {/each}
          <th>Total</th>
        </tr>
        </thead>
        <tbody>
        {#each Object.entries($game.getScoreBoardByCompletedPlayerRounds()) as [playerId, rounds] (playerId)}
          <tr>
            <td>{playerId}</td>
            {#each rounds as {score}}
              <td>{score ?? ""}</td>
            {/each}
            <td>{totalScore(rounds)}</td>
          </tr>
        {/each}
        </tbody>
      </table>
    </section>
  </div>
  {:else}
    <strong>Connecting...</strong>
  {/if}
</section>

<style>
</style>
