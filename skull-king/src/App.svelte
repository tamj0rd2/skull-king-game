<script>
  import {botName, calculateRoundScore, playerName} from "./GameLogic.js";
  import Round from "./lib/Round.svelte";

  let roundNumber = 1

  let scores = {
    [playerName]: new Array(10).fill(0).map((_, i) => ({number: i +1, score: 0 })),
    [botName]: new Array(10).fill(0).map((_, i) => ({number: i +1, score: 0 })),
  }

  function handleRoundComplete(e) {
    Object.entries(e.detail).forEach(([name, currentRound]) => {
      scores[name][roundNumber - 1].score = calculateRoundScore(roundNumber, currentRound)
    })
  }

  function totalScore(rounds) {
    const total = rounds.reduce((total, round) => total + round.score, 0)
    return isNaN(total) ? '' : total
  }
</script>

<main>
  <h1>Round {roundNumber}</h1>
  <Round
    on:roundcomplete={handleRoundComplete}
    roundNumber={roundNumber}
  />
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
        {#each Object.entries(scores) as [playerName, rounds] (playerName)}
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
</main>

<style>
</style>
