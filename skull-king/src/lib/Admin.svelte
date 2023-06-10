<script>
  import {game} from "../core/core.js";
  import {BidEvent, PlayCardEvent, StartNextRoundEvent, StartNextTrickEvent} from "../core/game.js";

  export let ws

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  async function sendEvent(evt) {
    ws.send(JSON.stringify(evt))
    await sleep(100)
  }

  async function broadcastEvent(makeEvt) {
    for (let pid of $game.getPlayers()) {
      await sendEvent(makeEvt(pid))
    }
  }

  const skipBids = () => broadcastEvent((pid) => new BidEvent(pid, 0));
  const playCardEach = () =>
    broadcastEvent((pid) => {
      const cardToPlay = $game.getCards(pid).find((c) => $game.canPlayCard(pid, c))
      return new PlayCardEvent(pid, cardToPlay);
    })

  async function skipRound() {
    console.log("players>>", $game.getPlayers())

    await skipBids()

    let stopper = 0

    while ($game.getCurrentTrickNumber() < $game.getRoundNumber()) {
      if (stopper > 11) throw new Error("oops, stuck in a while loop...")

      await playCardEach()
      await sendEvent(new StartNextTrickEvent())
      console.log("in while loop...")
      stopper++
    }

    await playCardEach()
    if ($game.getRoundNumber() < 10) await sendEvent(new StartNextRoundEvent())
  }
</script>

<section>
  <button on:click={skipRound}>Skip round</button>
  <button on:click={skipBids}>Skip bids</button>
  <button on:click={playCardEach}>Play card each</button>
</section>
