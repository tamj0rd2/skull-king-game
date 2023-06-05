export const SUIT_RED = "red"
export const SUIT_YELLOW = "yellow"
export const SUIT_BLUE = "blue"
export const SUIT_BLACK = "black"

export const SPECIAL_PIRATE = "pirate"
export const SPECIAL_MERMAID = "mermaid"
export const SPECIAL_SKULLKING = "skullking"
export const SPECIAL_SCARYMARY = "scarymary"
export const SPECIAL_FLAG = "flag"

export class Trick {
  constructor(playerCount) {
    this._plays = []
    this._highestPlay = undefined
    this._suit = undefined
    this._playerCount = playerCount
  }

  addCard(playerId, card) {
    const play = {playerId, card}
    this._plays.push(play)

    if (card instanceof NumberedCard && !this._suit) this._suit = card.suit
    const highestCard = this._highestPlay?.card
    if (!highestCard) return this._highestPlay = play

    if (card instanceof NumberedCard) {
      if (!this._suit) this._suit = card.suit
      return this._highestPlay = card._ranksHigherThan(highestCard) ? play : this._highestPlay
    }

    if (highestCard instanceof NumberedCard) return this._highestPlay = play
    if (card.suit === highestCard.suit) return

    switch (card.suit) {
      case SPECIAL_FLAG:
        return
      case SPECIAL_MERMAID:
        if (this._plays.find((p) => p.card.suit === SPECIAL_SKULLKING)) return this._highestPlay = play
        if (this._plays.every((p) => p.card.suit !== SPECIAL_PIRATE)) return this._highestPlay = play
        return
      case SPECIAL_PIRATE:
        if (!this._plays.find((p) => p.card.suit === SPECIAL_SKULLKING)) return this._highestPlay = play
        return
      case SPECIAL_SKULLKING:
        if (!this._plays.find((p) => p.card.suit === SPECIAL_MERMAID)) return this._highestPlay = play
        return
      default:
        throw new Error(`could not compare ${card.id} to highest card ${highestCard.id}`)
    }
  }

  getCards() {
    return [...this._plays]
  }

  getSuit() {
    return this._suit
  }

  getWinner() {
    return this._plays.length === this._playerCount
      ? this._highestPlay.playerId
      : undefined
  }

  getResult() {
    if (this._plays.length !== this._playerCount) return
    const result = {winner: this.getWinner(), skullKingsCaptured: 0, piratesCaptured: 0}

    if (this._highestPlay.card.suit === SPECIAL_MERMAID && !!this._plays.find(({card}) => card.suit === SPECIAL_SKULLKING)) {
      result.skullKingsCaptured = 1
    }

    if (this._highestPlay.card.suit === SPECIAL_SKULLKING) {
      result.piratesCaptured += this._plays.filter(({card}) => card.suit === SPECIAL_PIRATE).length
    }

    return result
  }
}

export class NumberedCard {
  constructor(suit, number) {
    if (![SUIT_YELLOW, SUIT_RED, SUIT_BLACK, SUIT_BLUE].includes(suit)) {
      throw new Error(`${suit} cannot be a numbered card`)
    }

    this.suit = suit
    this.number = number
    this.id = `${suit}${number}`
  }

  _ranksHigherThan(otherCard) {
    if (otherCard instanceof NumberedCard) {
      if (otherCard.suit === this.suit) return this.number > otherCard.number
      return this.suit === SUIT_BLACK
    }

    return otherCard.suit === SPECIAL_FLAG
  }
}

export class SpecialCard {
  constructor(suit, instance) {
    if ([SUIT_YELLOW, SUIT_RED, SUIT_BLACK, SUIT_BLUE].includes(suit)) {
      throw new Error(`${suit} cannot be a special card`)
    }

    this.suit = suit
    this.id = `${suit}${instance}`
  }
}

export class Deck {
  constructor() {
    this.reset()
  }

  reset() {
    this.cards = []
    new Array(13).fill(0).forEach((_, i) => {
      const num = i + 1
      this.cards.push(new NumberedCard(SUIT_RED, num))
      this.cards.push(new NumberedCard(SUIT_YELLOW, num))
      this.cards.push(new NumberedCard(SUIT_BLUE, num))
      this.cards.push(new NumberedCard(SUIT_BLACK, num))
    })

    new Array(5).fill(0).forEach((_, i) => {
      this.cards.push(new SpecialCard(SPECIAL_PIRATE, i + 1))
      this.cards.push(new SpecialCard(SPECIAL_FLAG, i + 1))
    })

    this.cards.push(new SpecialCard(SPECIAL_MERMAID, 1))
    this.cards.push(new SpecialCard(SPECIAL_MERMAID, 2))
    this.cards.push(new SpecialCard(SPECIAL_SKULLKING, 1))
    this.cards.push(new SpecialCard(SPECIAL_SCARYMARY, 1))
  }

  takeRandomCards(count) {
    const cards = []
    for (let i = 0; i < count; i++) {
      cards.push(this._takeSingleRandom())
    }
    return cards
  }

  _takeSingleRandom() {
    const i = Math.floor(Math.random() * this.cards.length);
    const [card] = this.cards.splice(i, 1)
    return card
  }
}
