<script>
  import {
    BidEvent,
    dispatchGameEvent,
    game,
    PlayCardEvent,
    StartNextRoundEvent,
    StartNextTrickEvent
  } from "../core/core.js";

  function skipBids() {
    $game.getPlayers().forEach((pid) => {dispatchGameEvent(new BidEvent(pid, 0))})
  }

  function playCardEach() {
    $game.getPlayers().forEach((pid) => {dispatchGameEvent(new PlayCardEvent(pid, $game.getCards(pid)[0]))})
  }

  function skipRound() {
    skipBids()

    while ($game.getCurrentTrickNumber() < $game.getRoundNumber()) {
      playCardEach()
      dispatchGameEvent(new StartNextTrickEvent())
    }

    playCardEach()
    dispatchGameEvent(new StartNextRoundEvent())
  }
</script>

<section>
  <button on:click={skipRound}>Skip round</button>
  <button on:click={skipBids}>Skip bids</button>
  <button on:click={playCardEach}>Play card each</button>
</section>
