import test from 'node:test'
import assert from 'node:assert'
import {
  BidEvent,
  dispatchGameEvent,
  game as gameStore,
  PlayCardEvent,
  PlayerRoundScoreCard,
  StartNextRoundEvent, StartNextTrickEvent
} from "./core.js";
import { get } from 'svelte/store';

test("smoke test for playing a 2 player game", (t) => {
  const tam = "tam"
  const peter = "peter"

  // tam and peter both start with 1 card for the first round
  testHelper.assertRoundNumber(1)
  testHelper.assertCards(tam, ["tamCard1"])
  testHelper.assertCards(peter, ["peterCard1"])

  // round 1 bids take place
  testHelper.assertCurrentTrickNumber(undefined) // trick taking doesn't begin until bids are complete
  dispatchGameEvent(new BidEvent(tam, 1))
  dispatchGameEvent(new BidEvent(peter, 0))

  // the scoreboard shows the bids for round 1
  testHelper.assertPlayerRoundScore(1, tam, new PlayerRoundScoreCard({bid: 1}))
  testHelper.assertPlayerRoundScore(1, peter, new PlayerRoundScoreCard({bid: 0}))

  // the current trick is empty since no cards have been played yet
  testHelper.assertCurrentTrickNumber(1)
  testHelper.assertCurrentTrick([])

  // tam plays a card which goes into the current trick
  dispatchGameEvent(new PlayCardEvent(tam, "tamCard1"))
  testHelper.assertCards(tam, [])
  testHelper.assertCurrentTrick([{cardId: "tamCard1", playerId: tam}])

  // peter plays a card which goes into the current trick
  dispatchGameEvent(new PlayCardEvent(peter, "peterCard1"))
  testHelper.assertCards(peter, [])
  testHelper.assertCurrentTrick([{cardId: "tamCard1", playerId: tam}, {cardId: "peterCard1", playerId: peter}])

  // the scores are calculated, assuming that tam won
  testHelper.assertCurrentTrickWinner(tam)
  testHelper.assertPlayerRoundScore(1, tam, new PlayerRoundScoreCard({bid: 1, wins: 1, score: 20}))
  testHelper.assertPlayerRoundScore(1, peter, new PlayerRoundScoreCard({bid: 0, wins: 0, score: 10}))

  // the next round can be started


  //=======ROUND 2========
  dispatchGameEvent(new StartNextRoundEvent())
  testHelper.assertRoundNumber(2)
  testHelper.assertCurrentTrickNumber(undefined)
  testHelper.assertAllPlayersHaveCards(2)
  testHelper.assertAllPlayersHaveEmptyBidsAndScore()
  testHelper.assertCurrentTrick([])

  // players bid
  dispatchGameEvent(new BidEvent(tam, 0))
  dispatchGameEvent(new BidEvent(peter, 1))
  testHelper.assertCurrentTrickNumber(1)

  // tam plays a card which goes into the current trick
  dispatchGameEvent(new PlayCardEvent(tam, "tamCard1"))
  testHelper.assertCards(tam, ["tamCard2"])
  testHelper.assertCurrentTrick([{cardId: "tamCard1", playerId: tam}])

  // peter plays a card which goes into the current trick
  dispatchGameEvent(new PlayCardEvent(peter, "peterCard2"))
  testHelper.assertCards(peter, ["peterCard1"])
  testHelper.assertCurrentTrick([{cardId: "tamCard1", playerId: tam}, {cardId: "peterCard2", playerId: peter}])

  // assume that tam won the first trick
  testHelper.assertCurrentTrickNumber(1)
  testHelper.assertCurrentTrickWinner(tam)

  // play the second trick
  dispatchGameEvent(new StartNextTrickEvent())
  testHelper.assertCurrentTrickNumber(2)
  dispatchGameEvent(new PlayCardEvent(tam, "tamCard2"))
  dispatchGameEvent(new PlayCardEvent(peter, "peterCard1"))
  testHelper.assertCards(tam, [])
  testHelper.assertCards(peter, [])
  testHelper.assertCurrentTrick([{cardId: "tamCard2", playerId: tam}, {cardId: "peterCard1", playerId: peter}])

  // the scores reflect that tam won both tricks
  testHelper.assertCurrentTrickNumber(2)
  testHelper.assertCurrentTrickWinner(tam)
  testHelper.assertPlayerRoundScore(2, tam, new PlayerRoundScoreCard({bid: 0, wins: 2, score: -20}))
  testHelper.assertPlayerRoundScore(2, peter, new PlayerRoundScoreCard({bid: 1, wins: 0, score: -10}))

  // and the next round can be started and initiated
  dispatchGameEvent(new StartNextRoundEvent())
  testHelper.assertRoundNumber(3)
  testHelper.assertAllPlayersHaveCards(3)
  testHelper.assertAllPlayersHaveEmptyBidsAndScore()
  testHelper.assertCurrentTrick([])
})

function gameState() {
  return get(gameStore)
}

const testHelper = {
  assertCards: function (pid, expectedCards) {
    assert.deepStrictEqual(gameState().getCards(pid), expectedCards)
  },
  assertPlayerRoundScore(roundNumber, pid, expected) {
    assert.deepStrictEqual(gameState().getScoreBoard()[gameState().getRoundNumber() - 1][pid], expected)
  },
  assertCurrentTrick(expectedCards) {
    assert.deepStrictEqual(gameState().getCardsInTrick(), expectedCards)
  },
  assertRoundNumber(expected) {
    assert.deepStrictEqual(gameState().getRoundNumber(), expected)
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
      assert.deepStrictEqual(g.getScoreBoard()[roundNumber - 1][pid], new PlayerRoundScoreCard())
    })
  },
  assertCurrentTrickWinner(expectedWinnerPid) {
    assert.deepStrictEqual(gameState().getCurrentTrickWinner(), expectedWinnerPid)
  },
  assertCurrentTrickNumber(expectedTrickNo) {
    assert.deepStrictEqual(gameState().getCurrentTrickNumber(), expectedTrickNo)
  }
}
