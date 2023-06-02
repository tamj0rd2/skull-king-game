<script>
  import PlayerBet from "./PlayerBet.svelte";
  import Hand from "./Hand.svelte";
  import {game} from "../core/core.js";

  export let playerId

  function totalScore(rounds) {
    return 0
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
        {#each $game.getCardsInTrick() as {cardId, playerId} (cardId)}
          <li>{playerId}: {cardId}</li>
        {/each}
      </ul>
      {#if !!$game.getCurrentTrickWinner()}
        <p><strong>{$game.getCurrentTrickWinner()}</strong> won trick {$game.getCurrentTrickNumber()}</p>
      {/if}
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
      {#each Object.entries({}) as [playerName, rounds] (playerName)}
        <tr>
          <td>{playerName}</td>
          {#each rounds as round (round.number)}
            <td>
              {round.score}
            </td>
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
