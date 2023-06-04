import test, {afterEach, beforeEach} from 'node:test'
import assert from 'node:assert'
import {
  BidEvent,
  dispatchGameEvent, ERROR_CARD_NOT_IN_HAND,
  game as gameStore,
  PlayCardEvent,
  PlayerRoundScoreCard,
  StartNextRoundEvent, StartNextTrickEvent
} from "./core.js";
import { get } from 'svelte/store';
import {Deck, NumberedCard, SUIT_BLUE} from "./cards.js";

class DeckDouble {
  _deals = []

  queueDeals(...deals) {
    this._deals.push(...deals)
  }

  takeRandomCards(count) {
    const cards = this._deals.shift()
    if (cards === undefined) throw new Error("did you forget to use queueDeals?")
    return cards
  }

  reset() {
  }
}

const tam = "tam"
const peter = "peter"
const deckDouble = new DeckDouble()

afterEach(() => {
  deckDouble._deals = []
  gameState().reset()
})

test("smoke test for playing a 2 player game", (t) => {
  let tamCards = [new NumberedCard(SUIT_BLUE, 5)]
  let peterCards = [new NumberedCard(SUIT_BLUE, 4)]
  deckDouble.queueDeals(tamCards, peterCards)
  gameState().start([tam, peter], deckDouble)

  // tam and peter both start with 1 card for the first round
  testHelper.assertRoundNumber(1)

  testHelper.assertCardsInHand(tam, tamCards)
  testHelper.assertCardsInHand(peter, peterCards)

  // round 1 bids take place
  testHelper.assertCurrentRoundIncomplete()
  testHelper.assertCurrentTrickNumber(undefined) // trick taking doesn't begin until bids are complete
  dispatchGameEvent(new BidEvent(tam, 1))
  dispatchGameEvent(new BidEvent(peter, 0))

  // the scoreboard shows the bids for round 1
  testHelper.assertPlayerRoundScore(1, tam, new PlayerRoundScoreCard({bid: 1}))
  testHelper.assertPlayerRoundScore(1, peter, new PlayerRoundScoreCard({bid: 0}))

  // the current trick is empty since no cards have been played yet
  testHelper.assertCurrentTrickIncomplete()
  testHelper.assertCurrentTrickNumber(1)
  testHelper.assertCurrentTrick([])

  // tam plays a card which goes into the current trick
  dispatchGameEvent(new PlayCardEvent(tam, tamCards[0]))
  testHelper.assertCardsInHand(tam, [])
  testHelper.assertCurrentTrick([{card: tamCards[0], playerId: tam}])

  // peter plays a card which goes into the current trick
  dispatchGameEvent(new PlayCardEvent(peter, peterCards[0]))
  testHelper.assertCardsInHand(peter, [])
  testHelper.assertCurrentTrick([{card: tamCards[0], playerId: tam}, {card: peterCards[0], playerId: peter}])

  // the scores are calculated, assuming that tam won
  testHelper.assertCurrentTrickComplete()
  testHelper.assertCurrentTrickWinner(tam)
  testHelper.assertPlayerRoundScore(1, tam, new PlayerRoundScoreCard({bid: 1, wins: 1, score: 20}))
  testHelper.assertPlayerRoundScore(1, peter, new PlayerRoundScoreCard({bid: 0, wins: 0, score: 10}))
  testHelper.assertCurrentRoundComplete()

  //=======ROUND 2========
  tamCards = [new NumberedCard(SUIT_BLUE, 5), new NumberedCard(SUIT_BLUE, 6)]
  peterCards = [new NumberedCard(SUIT_BLUE, 4), new NumberedCard(SUIT_BLUE, 3)]
  deckDouble.queueDeals(tamCards, peterCards)

  dispatchGameEvent(new StartNextRoundEvent())
  testHelper.assertRoundNumber(2)
  testHelper.assertCurrentRoundIncomplete()
  testHelper.assertCurrentTrickNumber(undefined)
  testHelper.assertAllPlayersHaveCards(2)
  testHelper.assertAllPlayersHaveEmptyBidsAndScore()
  testHelper.assertCurrentTrick([])

  // players bid
  dispatchGameEvent(new BidEvent(tam, 0))
  dispatchGameEvent(new BidEvent(peter, 1))
  testHelper.assertCurrentTrickNumber(1)
  testHelper.assertCurrentTrickIncomplete()

  // tam plays a card which goes into the current trick
  dispatchGameEvent(new PlayCardEvent(tam, tamCards[0]))
  testHelper.assertCardsInHand(tam, [tamCards[1]])
  testHelper.assertCurrentTrick([{card: tamCards[0], playerId: tam}])

  // peter plays a card which goes into the current trick
  dispatchGameEvent(new PlayCardEvent(peter, peterCards[1]))
  testHelper.assertCardsInHand(peter, [peterCards[0]])
  testHelper.assertCurrentTrick([{card: tamCards[0], playerId: tam}, {card: peterCards[1], playerId: peter}])

  // assume that tam won the first trick
  testHelper.assertCurrentTrickComplete()
  testHelper.assertCurrentTrickNumber(1)
  testHelper.assertCurrentTrickWinner(tam)
  testHelper.assertCurrentRoundIncomplete()

  // play the second trick
  dispatchGameEvent(new StartNextTrickEvent())
  testHelper.assertCurrentTrickNumber(2)
  testHelper.assertCurrentTrickIncomplete()
  dispatchGameEvent(new PlayCardEvent(tam, tamCards[1]))
  dispatchGameEvent(new PlayCardEvent(peter, peterCards[0]))
  testHelper.assertCardsInHand(tam, [])
  testHelper.assertCardsInHand(peter, [])
  testHelper.assertCurrentTrick([{card: tamCards[1], playerId: tam}, {card: peterCards[0], playerId: peter}])

  // the scores reflect that tam won both tricks
  testHelper.assertCurrentTrickComplete()
  testHelper.assertCurrentTrickNumber(2)
  testHelper.assertCurrentTrickWinner(tam)
  testHelper.assertPlayerRoundScore(2, tam, new PlayerRoundScoreCard({bid: 0, wins: 2, score: -20}))
  testHelper.assertPlayerRoundScore(2, peter, new PlayerRoundScoreCard({bid: 1, wins: 0, score: -10}))
  testHelper.assertCurrentRoundComplete()

  // and the next round can be started and initiated
  tamCards = [new NumberedCard(SUIT_BLUE, 5), new NumberedCard(SUIT_BLUE, 6), new NumberedCard(SUIT_BLUE, 7)]
  peterCards = [new NumberedCard(SUIT_BLUE, 4), new NumberedCard(SUIT_BLUE, 3), new NumberedCard(SUIT_BLUE, 2)]
  deckDouble.queueDeals(tamCards, peterCards)

  dispatchGameEvent(new StartNextRoundEvent())
  testHelper.assertRoundNumber(3)
  testHelper.assertAllPlayersHaveCards(3)
  testHelper.assertAllPlayersHaveEmptyBidsAndScore()
  testHelper.assertCurrentTrick([])
})

test("a player cannot play a card that isn't in their hand", () => {
  const tamCards = [new NumberedCard(SUIT_BLUE, 5), new NumberedCard(SUIT_BLUE, 6), new NumberedCard(SUIT_BLUE, 7)]
  const peterCards = [new NumberedCard(SUIT_BLUE, 4), new NumberedCard(SUIT_BLUE, 3), new NumberedCard(SUIT_BLUE, 2)]
  deckDouble.queueDeals(tamCards, peterCards)
  gameState().start([tam, peter], deckDouble)

  dispatchGameEvent(new BidEvent(tam, 0))
  dispatchGameEvent(new BidEvent(peter, 0))
  assert.throws(
    () => dispatchGameEvent(new PlayCardEvent(tam, peterCards[0])),
    {message: ERROR_CARD_NOT_IN_HAND}
  )
})

function gameState() {
  return get(gameStore)
}

const testHelper = {
  assertCardsInHand: function (pid, expectedCards) {
    assert.deepStrictEqual(gameState().getCards(pid), expectedCards)
  },
  assertPlayerRoundScore(roundNumber, pid, expected) {
    assert.deepStrictEqual(gameState().getScoreBoardByRounds()[gameState().getRoundNumber() - 1][pid], expected)
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
      assert.deepStrictEqual(g.getScoreBoardByRounds()[roundNumber - 1][pid], new PlayerRoundScoreCard())
    })
  },
  assertCurrentTrickIncomplete() {
    assert.deepStrictEqual(gameState().isCurrentTrickComplete(), false)
  },
  assertCurrentTrickComplete() {
    assert.deepStrictEqual(gameState().isCurrentTrickComplete(), true)
  },
  assertCurrentTrickWinner(expectedWinnerPid) {
    assert.deepStrictEqual(gameState().getCurrentTrickWinner(), expectedWinnerPid)
  },
  assertCurrentTrickNumber(expectedTrickNo) {
    assert.deepStrictEqual(gameState().getCurrentTrickNumber(), expectedTrickNo)
  },
  assertCurrentRoundIncomplete() {
    assert.equal(gameState().isCurrentRoundComplete(), false)
  },
  assertCurrentRoundComplete() {
    assert.equal(gameState().isCurrentRoundComplete(), true)
  }
}
