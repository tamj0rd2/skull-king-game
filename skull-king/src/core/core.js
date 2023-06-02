import { writable } from 'svelte/store';
import {Deck} from "./cards.js";

export class PlayerRoundScoreCard {
  constructor({ bid, wins, score } = {}) {
    this.bid = bid
    this.wins = wins ?? 0
    this.score = score
  }
}

class Game {
  constructor() {
    this.reset()
  }

  reset() {
    this._roundIndex = -1
    this._hands = {}
    this._currentTrick = []
    this._currentTrickWinner = undefined
    this._trickIndex = undefined
  }

  start(players, deck) {
    this._deck = deck ?? new Deck()
    this._scoreBoard = new Array(10).fill(0).map((_, i) => {
      return this.getPlayers().reduce((accum, pid) => ({...accum, [pid]: new PlayerRoundScoreCard()}), {})
    })
    this._startNextRound()
  }

  _startNextRound() {
    this._roundIndex += 1
    this._deck.reset()
    this._hands = this.getPlayers().reduce((accum, pid, i) => {
      return {...accum, [pid]: this._deck.takeRandomCards(this.getRoundNumber())}
    }, {})
    this._trickIndex = undefined
    this._clearTrick()
  }

  getRoundNumber() {
    return this._roundIndex + 1
  }

  getCards(playerId) {
    return this._hands[playerId]
  }

  getPlayers() {
    return ["tam", "peter"]
  }

  getScoreBoardByRounds() {
    return this._scoreBoard
  }

  getScoreBoardByCompletedPlayerRounds() {
    const initial = this.getPlayers().reduce((accum, pid) => ({...accum, [pid]: []}), {})
    return this._scoreBoard.reduce((accum, round) => {
      Object.entries(round).forEach(([pid, roundPlayerScoreCard]) => {
        accum[pid] = [...accum[pid], roundPlayerScoreCard]
      })
      return accum
    }, initial)
  }

  getRoundScoreBoard() {
    return this._scoreBoard[this._roundIndex]
  }

  hasEveryoneBid() {
    return Object.values(this.getRoundScoreBoard()).every(s => s.bid !== undefined)
  }

  getCardsInTrick() {
    return this._currentTrick
  }

  getCurrentTrickWinner() {
    return this._currentTrickWinner
  }

  isCurrentRoundComplete() {
    return Object.values(this.getRoundScoreBoard()).reduce((tot, {wins}) => tot + wins, 0) === this.getRoundNumber()
  }

  isCurrentTrickComplete() {
    return this._currentTrick.length === this.getPlayers().length
  }

  _handleBidEvent(e) {
    this._scoreBoard[this._roundIndex][e.playerId].bid = e.bid
    if (this.hasEveryoneBid()) {
      // TODO: maybe it shouldn't auto start, and the host should click a button instead? like when starting the next round
      this._startNextTrick()
    }
  }

  _handlePlayCardEvent(e) {
    this._playCard(e)

    if (!this.isCurrentTrickComplete()) return

    // pretend that tam won
    this._currentTrickWinner = "tam"
    const currentWins = this._scoreBoard[this._roundIndex][this._currentTrickWinner].wins || 0
    this._scoreBoard[this._roundIndex][this._currentTrickWinner].wins = currentWins + 1

    const isRoundDone = this._trickIndex === this._roundIndex
    if (!isRoundDone) return

    this.getPlayers().forEach((pid) => {
      this._scoreBoard[this._roundIndex][pid].score = this._calculateScore(pid)
    })
  }

  _playCard(e) {
    const playerCards = this._hands[e.playerId]
    const cardIndex = playerCards.indexOf(e.card)
    if (cardIndex < 0) throw new Error(ERROR_CARD_NOT_IN_HAND)

    this._hands[e.playerId] = [...playerCards.slice(0, cardIndex), ...playerCards.slice(cardIndex + 1)]
    this._currentTrick = [...this._currentTrick, {card: e.card, playerId: e.playerId}]
  }

  _calculateScore(playerId) {
    const { bid, wins } = this._scoreBoard[this._roundIndex][playerId]
    const roundNumber = this.getRoundNumber()
    if (bid === 0) return wins === 0 ? 10 * roundNumber : -10 * roundNumber
    if (bid === wins) return wins * 20
    return Math.abs(bid - wins) * -10
  }

  _startNextTrick() {
    this._clearTrick()
    if (this._trickIndex === undefined) this._trickIndex = 0
    else this._trickIndex += 1
  }

  _clearTrick() {
    this._currentTrick = []
    this._currentTrickWinner = undefined
  }

  getCurrentTrickNumber() {
    if (this._trickIndex !== undefined) return this._trickIndex + 1
    return undefined
  }
}

export const game = writable(new Game());

export class BidEvent {
  constructor(playerId, bid) {
    this.playerId = playerId
    this.bid = bid
  }
}

export class PlayCardEvent {
  constructor(playerId, card) {
    this.playerId = playerId
    this.card = card
  }
}

export class StartNextRoundEvent {}

export class StartNextTrickEvent {}

export function dispatchGameEvent(e) {
  game.update((g) => {
    switch(true) {
      case e instanceof BidEvent:
        g._handleBidEvent(e)
        return g
      case e instanceof PlayCardEvent:
        g._handlePlayCardEvent(e)
        return g
      case e instanceof StartNextRoundEvent:
        g._startNextRound(e)
        return g
      case e instanceof StartNextTrickEvent:
        g._startNextTrick(e)
        return g
      default:
        throw new Error(`Unhandled event type - ${e.constructor}`)
    }
  })
}

export const ERROR_CARD_NOT_IN_HAND = "cannot play a card that is not in your hand"
