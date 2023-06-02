<script>
  import PlayerBet from "./PlayerBet.svelte";
  import Hand from "./Hand.svelte";
  import {
    BidEvent,
    dispatchGameEvent,
    game,
    PlayCardEvent,
    StartNextRoundEvent,
    StartNextTrickEvent
  } from "../core/core.js";

  export let playerId
  export let isHost = false

  function totalScore(rounds) {
    return rounds.reduce((tot, {score}) => tot + (score ?? 0), 0)
  }

  $: alreadyBid = $game.getRoundScoreBoard()[playerId].bid !== undefined

</script>

<div>
  <h1>Round {$game.getRoundNumber()}</h1>
  <Hand playerId={playerId}/>

  {#if !alreadyBid}
    <PlayerBet playerId={playerId} />
  {/if}

  {#if $game.hasEveryoneBid()}
    <section>
      <h2>Bids</h2>
      <ul>
        {#each Object.entries($game.getRoundScoreBoard()) as [pid, {bid}] (pid)}
          <li>{pid}: {bid}</li>
        {/each}
      </ul>
    </section>

    <section>
      <h2>Cards in trick</h2>
      <ul>
        <!--        TODO: I need a way to play as peter. Maybe split screen and show the UI twice? left tam, right p?-->
        {#each $game.getCardsInTrick() as {card, playerId} (card)}
          <li>{playerId}: {card}</li>
        {/each}
      </ul>
      {#if $game.isCurrentTrickComplete()}
        <p><strong>{$game.getCurrentTrickWinner()}</strong> won trick {$game.getCurrentTrickNumber()}</p>
      {/if}
    </section>

    {#if isHost && $game.isCurrentTrickComplete()}
      {#if $game.isCurrentRoundComplete() && $game.getRoundNumber() !== 10}
        <button on:click={() => dispatchGameEvent(new StartNextRoundEvent())}>Start next round</button>
      {/if}

      {#if !$game.isCurrentRoundComplete()}
        <button on:click={() => dispatchGameEvent(new StartNextTrickEvent())}>Start next trick</button>
      {/if}
    {/if}
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

<style>
</style>
