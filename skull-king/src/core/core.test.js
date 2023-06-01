import test from 'node:test'
import assert from 'node:assert'
import {BidEvent, dispatchGameEvent, game as gameStore, PlayCardEvent, StartNextRoundEvent} from "./stores.js";
import { get } from 'svelte/store';

test("smoke test for playing a 2 player game", (t) => {
  const tam = "tam"
  const peter = "peter"

  // tam and peter both start with 1 card for the first round
  testHelper.assertRoundNumber(1)
  testHelper.assertCards(tam, ["tamCard1"])
  testHelper.assertCards(peter, ["peterCard1"])

  // round 1 bids take place
  dispatchGameEvent(new BidEvent(tam, 1))
  dispatchGameEvent(new BidEvent(peter, 0))

  // the scoreboard shows the bids for round 1
  testHelper.assertPlayerRoundScore(1, tam, {bid: 1})
  testHelper.assertPlayerRoundScore(1, peter, {bid: 0})

  // the current trick is empty since no cards have been played yet
  testHelper.assertCurrentTrick([])

  // tam plays a card which goes into the current trick
  dispatchGameEvent(new PlayCardEvent(tam, "tamCard1"))
  testHelper.assertCards(tam, [])
  testHelper.assertCurrentTrick([{cardId: "tamCard1", playerId: tam}])

  // peter plays a card which goes into the current trick
  dispatchGameEvent(new PlayCardEvent(peter, "peterCard1"))
  testHelper.assertCards(peter, [])
  testHelper.assertCurrentTrick([{cardId: "tamCard1", playerId: tam}, {cardId: "peterCard1", playerId: peter}])

  // TODO: the scores should be calculated. assume it's always tam for now :p

  // the next round can be started
  dispatchGameEvent(new StartNextRoundEvent())
  testHelper.assertRoundNumber(2)

  //=======ROUND 2========
  // 2 cards are dealt, there are no bids and there are no cards in the current trick
  testHelper.assertAllPlayersHaveCards(2)
  testHelper.assertAllPlayersHaveEmptyBidsAndScore()
  testHelper.assertCurrentTrick([])

  // players bid
  dispatchGameEvent(new BidEvent(tam, 0))
  dispatchGameEvent(new BidEvent(peter, 2))

  // tam plays a card which goes into the current trick
  dispatchGameEvent(new PlayCardEvent(tam, "tamCard1"))
  testHelper.assertCards(tam, ["tamCard2"])
  testHelper.assertCurrentTrick([{cardId: "tamCard1", playerId: tam}])

  // peter plays a card which goes into the current trick
  dispatchGameEvent(new PlayCardEvent(peter, "peterCard2"))
  testHelper.assertCards(peter, ["peterCard1"])
  testHelper.assertCurrentTrick([{cardId: "tamCard1", playerId: tam}, {cardId: "peterCard2", playerId: peter}])

  // TODO: Tam wins that trick
  // TODO: start the next trick and both play 1 card
  // TODO: cehck the scores after that
})

function gameState() {
  return get(gameStore)
}

const testHelper = {
  assertCards: function (playerId, expectedCards) {
    assert.deepStrictEqual(gameState().getCards(playerId), expectedCards)
  },
  assertPlayerRoundScore(roundNumber, playerId, expected) {
    assert.deepStrictEqual(gameState().getScoreBoard()[roundNumber - 1][playerId], expected)
  },
  assertCurrentTrick(expectedCards) {
    assert.deepStrictEqual(gameState().getCardsInTrick(), expectedCards)
  },
  assertRoundNumber(expected) {
    assert.equal(gameState().getRoundNumber(), expected)
  },
  assertAllPlayersHaveCards(expectedCount) {
    const g = gameState()
    g.getPlayers().forEach((pid) => {
      assert.deepStrictEqual(g.getCards(pid).length, expectedCount, `${pid} has the wrong amount of cards`)
    })
  },
  assertAllPlayersHaveEmptyBidsAndScore() {
    const g = gameState()
    const roundNumber = g.getRoundNumber()
    g.getPlayers().forEach((pid) => {
      assert.deepStrictEqual(g.getScoreBoard()[roundNumber - 1][pid], {})
    })
  }
}
