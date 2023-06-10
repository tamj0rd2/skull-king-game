import {Deck, NumberedCard, SpecialCard, Trick} from "./cards.js";

export class PlayerRoundScoreCard {
  constructor({bid, wins, score, skullKingsCaptured, piratesCaptured} = {}) {
    this.bid = bid
    this.wins = wins ?? 0
    this.score = score
    this.skullKingsCaptured = skullKingsCaptured ?? 0
    this.piratesCaptured = piratesCaptured ?? 0
  }
}

export class Game {
  constructor() {
    this.reset()
  }

  matchState(json) {
    for (const key in json) {
      if (json.hasOwnProperty(key)) {
        this[key] = json[key]
      }
    }

    if (!!json._currentTrick) {
      this._currentTrick = Trick.fromJSON(json._currentTrick)
    }

    if (!!json._hands) {
      for (const pid in json._hands) {
        json._hands[pid] = json._hands[pid].map((c) => {
          if (c.type === NumberedCard.type) {
            return new NumberedCard(c.suit, c.number)
          }
          return new SpecialCard(c.suit, c.instance)
        })
      }
    }
  }

  reset() {
    this._roundIndex = -1
    this._hands = {}
    this._currentTrick = undefined
    this._currentTrickWinner = undefined
    this._trickIndex = undefined
  }

  _start({players, deck}) {
    this._deck = deck ?? new Deck()
    this._players = players
    this._scoreBoard = new Array(10).fill(0).map((_, i) => {
      return players.reduce((accum, pid) => ({...accum, [pid]: new PlayerRoundScoreCard()}), {})
    })
    this._startNextRound()
  }

  _startNextRound() {
    this._roundIndex += 1
    this._deck.reset()
    this._hands = this._players.reduce((accum, pid, i) => {
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
    return [...this._players]
  }

  getScoreBoardByRounds() {
    return this._scoreBoard
  }

  getScoreBoardByCompletedPlayerRounds() {
    const initial = this._players.reduce((accum, pid) => ({...accum, [pid]: []}), {})
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
    return this._currentTrick.getCards()
  }

  getCurrentTrickWinner() {
    return this._currentTrickWinner
  }

  isCurrentRoundComplete() {
    return Object.values(this.getRoundScoreBoard()).reduce((tot, {wins}) => tot + wins, 0) === this.getRoundNumber()
  }

  isCurrentTrickComplete() {
    return !!this._currentTrick.getWinner()
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

    const {winner, skullKingsCaptured, piratesCaptured} = this._currentTrick.getResult()
    this._currentTrickWinner = winner
    const playerScoreCard = this._scoreBoard[this._roundIndex][this._currentTrickWinner]
    playerScoreCard.wins = (playerScoreCard.wins ?? 0) + 1
    playerScoreCard.skullKingsCaptured += skullKingsCaptured
    playerScoreCard.piratesCaptured += piratesCaptured

    const isRoundDone = this._trickIndex === this._roundIndex
    if (!isRoundDone) return

    this._players.forEach((pid) => {
      this._scoreBoard[this._roundIndex][pid].score = this._calculateScore(pid)
    })
  }

  _playCard({playerId, card}) {
    if (!this.canPlayCard(playerId, card)) {
      throw new Error(ERROR_CARD_DOES_NOT_MATCH_SUIT)
    }

    const playerCards = this._hands[playerId]
    const cardIndex = playerCards.findIndex((c) => c.id === card.id)
    if (cardIndex < 0) throw new Error(ERROR_CARD_NOT_IN_HAND)

    this._hands[playerId] = [...playerCards.slice(0, cardIndex), ...playerCards.slice(cardIndex + 1)]
    this._currentTrick.addCard(playerId, card)
  }

  _calculateScore(playerId) {
    const {bid, wins, skullKingsCaptured, piratesCaptured} = this._scoreBoard[this._roundIndex][playerId]
    const roundNumber = this.getRoundNumber()
    if (bid === 0) return wins === 0 ? 10 * roundNumber : -10 * roundNumber

    if (bid === wins) {
      return (wins * 20) + (skullKingsCaptured * 50) + (piratesCaptured * 30)
    }
    return Math.abs(bid - wins) * -10
  }

  _startNextTrick() {
    this._clearTrick()
    if (this._trickIndex === undefined) this._trickIndex = 0
    else this._trickIndex += 1
  }

  _clearTrick() {
    this._currentTrick = new Trick(this._players.length)
    this._currentTrickWinner = undefined
  }

  getCurrentTrickNumber() {
    if (this._trickIndex !== undefined) return this._trickIndex + 1
    return undefined
  }

  // TODO: this should probably live on the Trick type
  canPlayCard(playerId, card) {
    if (card instanceof SpecialCard) return true

    const suit = this._currentTrick.getSuit()
    if (!suit) return true

    return card.suit === suit || !this.getCards(playerId).some((c) => c.suit === suit)
  }

  handleEvent(e) {
    switch (true) {
      case e instanceof StartGameEvent:
        return this._start(e)
      case e instanceof BidEvent:
        return this._handleBidEvent(e)
      case e instanceof PlayCardEvent:
        return this._handlePlayCardEvent(e)
      case e instanceof StartNextRoundEvent:
        return this._startNextRound(e)
      case e instanceof StartNextTrickEvent:
        return this._startNextTrick(e)
      default:
        throw new Error(`Unhandled event type - ${e.constructor}`)
    }
  }
}

export class BidEvent {
  static type = "bid"
  type = BidEvent.type

  constructor(playerId, bid) {
    this.playerId = playerId
    this.bid = bid
  }
}

export class StartGameEvent {
  static type = "start_game"
  type = StartGameEvent.type

  constructor(players, deck = new Deck()) {
    this.players = players
    this.deck = deck
  }
}

export class PlayCardEvent {
  static type = "play_card"
  type = PlayCardEvent.type

  constructor(playerId, card) {
    this.playerId = playerId
    this.card = card
  }
}

export class StartNextRoundEvent {
  static type = "start_next_round"
  type = StartNextRoundEvent.type
}

export class StartNextTrickEvent {
  static type = "start_next_trick"
  type = StartNextTrickEvent.type
}

export const ERROR_CARD_NOT_IN_HAND = "cannot play a card that is not in your hand"
export const ERROR_CARD_DOES_NOT_MATCH_SUIT = "suit rule..."
