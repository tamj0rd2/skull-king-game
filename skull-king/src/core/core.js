import { writable } from 'svelte/store';

export class PlayerRoundScoreCard {
  constructor({ bid, wins, score } = {}) {
    this.bid = bid
    this.wins = wins ?? 0
    this.score = score
  }
}

class Game {
  constructor() {
    this._roundIndex = -1
    this._hands = {}
    this._scoreBoard = []
    this._currentTrick = []
    this._currentTrickWinner = undefined
    this._trickIndex = undefined
    this._startNextRound()
  }

  _startNextRound() {
    this._roundIndex += 1
    this._scoreBoard = [...this._scoreBoard, this.getPlayers().reduce((accum, pid) => ({...accum, [pid]: new PlayerRoundScoreCard()}), {})]
    this._hands = this.getPlayers().reduce((accum, pid, i) => {
      const cards = new Array(this.getRoundNumber()).fill(undefined).map((_, i) => `${pid}Card${i + 1}`)
      return {...accum, [pid]: cards}
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

  getScoreBoard() {
    return this._scoreBoard
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

  _handleBidEvent(e) {
    this._scoreBoard[this._roundIndex][e.playerId].bid = e.bid
    if (this.hasEveryoneBid()) {
      // TODO: maybe it shouldn't auto start, and the host should click a button instead? like when starting the next round
      this._startNextTrick()
    }
  }

  _handlePlayCardEvent(e) {
    this._playCard(e)
    if (this._currentTrick.length === this.getPlayers().length) {
      // pretends that tam won
      this._currentTrickWinner = "tam"
      const currentWins = this._scoreBoard[this._roundIndex][this._currentTrickWinner].wins || 0
      this._scoreBoard[this._roundIndex][this._currentTrickWinner].wins = currentWins + 1
    }

    if (this._trickIndex === this._roundIndex) {
      this.getPlayers().forEach((pid) => {
        this._scoreBoard[this._roundIndex][pid].score = this._calculateScore(pid)
      })
    }
  }

  _playCard(e) {
    const playerCards = this._hands[e.playerId]
    const cardIndex = playerCards.indexOf(e.cardId)
    if (cardIndex < 0) throw new Error(`couldn't find card - ${e}`)

    this._hands[e.playerId] = [...playerCards.slice(0, cardIndex), ...playerCards.slice(cardIndex + 1)]
    this._currentTrick = [...this._currentTrick, {cardId: e.cardId, playerId: e.playerId}]
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
  constructor(playerId, cardId) {
    this.playerId = playerId
    this.cardId = cardId
  }
}

export class StartNextRoundEvent {}

export class StartNextTrickEvent {}

export function dispatchGameEvent(e) {
  console.dir(e)
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
