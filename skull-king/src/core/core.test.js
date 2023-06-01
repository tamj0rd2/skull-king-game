import test from 'node:test'
import assert from 'node:assert'
import {BidEvent, dispatchGameEvent, game as gameStore, PlayCardEvent, StartNextRoundEvent} from "./stores.js";
import { get } from 'svelte/store';
import exp from "constants";

test("smoke test for playing a 2 player game", (t) => {
  const tam = "tam"
  const peter = "peter"

  // tam and peter both start with 1 card for the first round
  testHelper.assertRoundNumber(1)
  testHelper.assertCards(tam, ["Card1"])
  testHelper.assertCards(peter, ["Card2"])

  // round 1 bids take place
  dispatchGameEvent(new BidEvent(tam, 1))
  dispatchGameEvent(new BidEvent(peter, 0))

  // the scoreboard shows the bids for round 1
  testHelper.assertPlayerRoundScore(1, tam, {bid: 1})
  testHelper.assertPlayerRoundScore(1, peter, {bid: 0})

  // the current trick is empty since no cards have been played yet
  testHelper.assertCurrentTrick([])

  // tam plays a card which goes into the current trick
  dispatchGameEvent(new PlayCardEvent(tam, "Card1"))
  testHelper.assertNoCards(tam)
  testHelper.assertCurrentTrick([{cardId: "Card1", playerId: tam}])

  // peter plays a card which goes into the current trick
  dispatchGameEvent(new PlayCardEvent(peter, "Card2"))
  testHelper.assertNoCards(peter)
  testHelper.assertCurrentTrick([{cardId: "Card1", playerId: tam}, {cardId: "Card2", playerId: peter}])

  // the next round can be started
  dispatchGameEvent(new StartNextRoundEvent())
  testHelper.assertRoundNumber(2)

  // each player is dealt 2 cards
  // there are no cards in the current trick
  // ther are no bids

})

function gameState() {
  return get(gameStore)
}

const testHelper = {
  assertCards: function (playerId, expectedCards) {
    assert.deepStrictEqual(gameState().getCards(playerId), expectedCards)
  },
  assertNoCards: function (playerId) {
    assert.deepStrictEqual(gameState().getCards(playerId), [])
  },
  assertPlayerRoundScore(roundNumber, playerId, expected) {
    assert.deepStrictEqual(gameState().getScoreBoard()[roundNumber - 1][playerId], expected)
  },
  assertCurrentTrick(expectedCards) {
    assert.deepStrictEqual(gameState().getCardsInTrick(), expectedCards)
  },
  assertRoundNumber(expected) {
    assert.equal(gameState().getRoundNumber(), expected)
  }
}
