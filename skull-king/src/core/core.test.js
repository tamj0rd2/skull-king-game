import test, {afterEach, beforeEach} from 'node:test'
import assert from 'node:assert'
import {
  BidEvent,
  dispatchGameEvent, ERROR_CARD_DOES_NOT_MATCH_SUIT, ERROR_CARD_NOT_IN_HAND,
  game as gameStore,
  PlayCardEvent,
  PlayerRoundScoreCard,
  StartNextRoundEvent, StartNextTrickEvent
} from "./core.js";
import { get } from 'svelte/store';
import {
  Deck,
  NumberedCard,
  SPECIAL_MERMAID,
  SPECIAL_PIRATE, SPECIAL_SKULLKING,
  SpecialCard,
  SUIT_BLACK,
  SUIT_BLUE,
  SUIT_RED
} from "./cards.js";

class DeckDouble {
  _deals = []

  queueDeals(...deals) {
    this._deals.push(...deals)
  }

  setupRandomDeals(count) {
    const deck = new Deck()
    const tamCards = deck.takeRandomCards(count)
    const peterCards = deck.takeRandomCards(count)
    this.queueDeals(tamCards, peterCards)
    return [tamCards, peterCards]
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
  const tamCards = [new NumberedCard(SUIT_BLUE, 5)]
  const peterCards = [new NumberedCard(SUIT_BLUE, 4)]
  deckDouble.queueDeals(tamCards, peterCards)
  gameState().start([tam, peter], deckDouble)

  dispatchGameEvent(new BidEvent(tam, 0))
  dispatchGameEvent(new BidEvent(peter, 0))
  assert.throws(
    () => dispatchGameEvent(new PlayCardEvent(tam, peterCards[0])),
    {message: ERROR_CARD_NOT_IN_HAND}
  )
})

test("suit rules", async () => {
  await test("when tam plays red and peter has a red, peter is allowed to play it", (t) => {
    const petersRed = new NumberedCard(SUIT_RED, 6)

    const tamCards = [new NumberedCard(SUIT_BLUE, 5), new NumberedCard(SUIT_RED, 2)]
    const peterCards = [petersRed, new SpecialCard(SPECIAL_PIRATE, 1)]
    testHelper.startAtRound(2, tamCards, peterCards)
    dispatchGameEvent(new BidEvent(tam, 0))
    dispatchGameEvent(new BidEvent(peter, 0))

    dispatchGameEvent(new PlayCardEvent(tam, tamCards[1]))
    assert.equal(gameState().canPlayCard(peter, petersRed), true)
    assert.doesNotThrow(() => dispatchGameEvent(new PlayCardEvent(peter, petersRed)))
  })

  await test("when tam plays red and peter has a red, peter can play a special card", (t) => {
    const specialCard = new SpecialCard(SPECIAL_PIRATE, 1)

    const tamCards = [new NumberedCard(SUIT_BLUE, 5), new NumberedCard(SUIT_RED, 2)]
    const peterCards = [new NumberedCard(SUIT_RED, 6), specialCard]
    testHelper.startAtRound(2, tamCards, peterCards)
    dispatchGameEvent(new BidEvent(tam, 0))
    dispatchGameEvent(new BidEvent(peter, 0))

    dispatchGameEvent(new PlayCardEvent(tam, tamCards[1]))
    assert.equal(gameState().canPlayCard(peter, specialCard), true)
    assert.doesNotThrow(() => dispatchGameEvent(new PlayCardEvent(peter, specialCard)))
  })

  await test("when tam plays red and peter has a red, peter cannot play any other numbered suit", () => {
    const differentNumberedSuit = new NumberedCard(SUIT_BLACK, 6)

    const tamCards = [new NumberedCard(SUIT_BLUE, 5), new NumberedCard(SUIT_RED, 2)]
    const peterCards = [differentNumberedSuit, new NumberedCard(SUIT_RED, 8)]
    testHelper.startAtRound(2, tamCards, peterCards)
    dispatchGameEvent(new BidEvent(tam, 0))
    dispatchGameEvent(new BidEvent(peter, 0))

    dispatchGameEvent(new PlayCardEvent(tam, tamCards[1]))
    assert.equal(gameState().canPlayCard(peter, differentNumberedSuit), false)
    assert.throws(
      () => dispatchGameEvent(new PlayCardEvent(peter, differentNumberedSuit)),
      {message: ERROR_CARD_DOES_NOT_MATCH_SUIT}
    )
  })

  await test("when tam plays red and peter doesn't have a red, peter can play a different numbered suit", (t) => {
    const differentNumberedSuit = new NumberedCard(SUIT_BLACK, 6)

    const tamCards = [new NumberedCard(SUIT_BLUE, 5), new NumberedCard(SUIT_RED, 2)]
    const peterCards = [differentNumberedSuit, new SpecialCard(SPECIAL_PIRATE, 1)]
    testHelper.startAtRound(2, tamCards, peterCards)
    dispatchGameEvent(new BidEvent(tam, 0))
    dispatchGameEvent(new BidEvent(peter, 0))

    dispatchGameEvent(new PlayCardEvent(tam, tamCards[1]))
    assert.equal(gameState().canPlayCard(peter, differentNumberedSuit), true)
    assert.doesNotThrow(() => dispatchGameEvent(new PlayCardEvent(peter, differentNumberedSuit)))
  })

  await test("when tam plays red and peter doesn't have a red, peter can play a special card", (t) => {
    const specialCard = new SpecialCard(SPECIAL_PIRATE, 1)

    const tamCards = [new NumberedCard(SUIT_BLUE, 5), new NumberedCard(SUIT_RED, 2)]
    const peterCards = [new NumberedCard(SUIT_BLACK, 6), specialCard]
    testHelper.startAtRound(2, tamCards, peterCards)
    dispatchGameEvent(new BidEvent(tam, 0))
    dispatchGameEvent(new BidEvent(peter, 0))

    dispatchGameEvent(new PlayCardEvent(tam, tamCards[1]))
    assert.equal(gameState().canPlayCard(peter, specialCard), true)
    assert.doesNotThrow(() => dispatchGameEvent(new PlayCardEvent(peter, specialCard)))
  })
})

test("capturing", async (t) => {
  const cases = [
    {
      captor: SPECIAL_MERMAID,
      captive: SPECIAL_SKULLKING,
      successScore: {bid: 1, wins: 1, score: 70, skullKingsCaptured: 1},
      failureScore: {bid: 2, wins: 1, score: -10, skullKingsCaptured: 1},
    },
    {
      captor: SPECIAL_SKULLKING,
      captive: SPECIAL_PIRATE,
      successScore: {bid: 1, wins: 1, score: 50, piratesCaptured: 1},
      failureScore: {bid: 2, wins: 1, score: -10, piratesCaptured: 1},
    },
  ]

  for (const {captor, captive, successScore, failureScore} of cases) {
    await t.test(`tam receives bonus points for capturing ${captive} with ${captor} AND meeting her bid`, () => {
      const tamCards = [new NumberedCard(SUIT_BLUE, 5), new SpecialCard(captor, 1)]
      const peterCards = [new NumberedCard(SUIT_BLUE, 6), new SpecialCard(captive, 1)]
      testHelper.startAtRound(2, tamCards, peterCards)

      dispatchGameEvent(new BidEvent(tam, 1))
      dispatchGameEvent(new BidEvent(peter, 1))

      dispatchGameEvent(new PlayCardEvent(peter, peterCards[1]))
      dispatchGameEvent(new PlayCardEvent(tam, tamCards[1]))
      testHelper.assertCurrentTrickWinner(tam)

      dispatchGameEvent(new StartNextTrickEvent())
      dispatchGameEvent(new PlayCardEvent(tam, tamCards[0]))
      dispatchGameEvent(new PlayCardEvent(peter, peterCards[0]))
      testHelper.assertCurrentTrickWinner(peter)

      testHelper.assertPlayerRoundScore(2, tam, new PlayerRoundScoreCard(successScore))
    })

    await t.test(`tam doesn't receive bonus points for capturing ${captive} with ${captor} if her bid is not met`, () => {
      const tamCards = [new NumberedCard(SUIT_BLUE, 5), new SpecialCard(captor, 1)]
      const peterCards = [new NumberedCard(SUIT_BLUE, 6), new SpecialCard(captive, 1)]
      testHelper.startAtRound(2, tamCards, peterCards)

      dispatchGameEvent(new BidEvent(tam, 2))
      dispatchGameEvent(new BidEvent(peter, 1))

      dispatchGameEvent(new PlayCardEvent(peter, peterCards[1]))
      dispatchGameEvent(new PlayCardEvent(tam, tamCards[1]))
      testHelper.assertCurrentTrickWinner(tam)

      dispatchGameEvent(new StartNextTrickEvent())
      dispatchGameEvent(new PlayCardEvent(tam, tamCards[0]))
      dispatchGameEvent(new PlayCardEvent(peter, peterCards[0]))
      testHelper.assertCurrentTrickWinner(peter)

      testHelper.assertPlayerRoundScore(2, tam, new PlayerRoundScoreCard(failureScore))
    })
  }
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
  },
  startAtRound(targetRoundNum, ...deals) {
    deckDouble.setupRandomDeals(1)
    gameState().start([tam, peter], deckDouble)

    gameState().getPlayers().forEach((pid) => dispatchGameEvent(new BidEvent(pid, 0)))

    while (gameState().getCurrentTrickNumber() < gameState().getRoundNumber()) {
      gameState().getPlayers().forEach((pid) => dispatchGameEvent(new PlayCardEvent(pid, gameState().getCards(pid)[0])))
      dispatchGameEvent(new StartNextTrickEvent())
    }

    gameState().getPlayers().forEach((pid) => dispatchGameEvent(new PlayCardEvent(pid, gameState().getCards(pid)[0])))
    deckDouble.queueDeals(...deals)
    dispatchGameEvent(new StartNextRoundEvent())

    testHelper.assertRoundNumber(targetRoundNum)
  }
}
