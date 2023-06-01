import { writable } from 'svelte/store';

class Game {
  constructor() {
    this._roundIndex = -1
    this._hands = {}
    this._scoreBoard = []
    this._currentTrick = []
    this._startNextRound()
  }

  _startNextRound() {
    this._currentTrick = []
    this._roundIndex += 1
    this._scoreBoard = [...this._scoreBoard, this.getPlayers().reduce((accum, pid) => ({...accum, [pid]: {}}), {})]
    this._hands = this.getPlayers().reduce((accum, pid, i) => {
      const cards = new Array(this.getRoundNumber()).fill(undefined).map((_, i) => `${pid}Card${i + 1}`)
      return {...accum, [pid]: cards}
    }, {})
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

  getCardsInTrick() {
    return this._currentTrick
  }

  _handleBidEvent(e) {
    this._scoreBoard[this._roundIndex][e.playerId].bid = e.bid
  }

  _handlePlayCardEvent(e) {
    const playerCards = this._hands[e.playerId]
    const cardIndex = playerCards.indexOf(e.cardId)
    if (cardIndex < 0) throw new Error(`couldn't find card - ${e}`)

    this._hands[e.playerId] = [...playerCards.slice(0, cardIndex), ...playerCards.slice(cardIndex + 1)]
    this._currentTrick = [...this._currentTrick, {cardId: e.cardId, playerId: e.playerId}]
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
      default:
        throw new Error(`Unhandled event type - ${e.constructor}`)
    }
  })
}
