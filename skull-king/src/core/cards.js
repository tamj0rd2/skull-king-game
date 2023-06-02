export const SUIT_RED = "red"
export const SUIT_YELLOW = "yellow"
export const SUIT_BLUE = "blue"
export const SUIT_BLACK = "black"

export class NumberedCard {
  constructor(suit, number) {
    this.suit = suit
    this.number = number
    this.id = `${suit}${number}`
  }
}

export const SPECIAL_PIRATE = "pirate"
export const SPECIAL_MERMAID = "mermaid"
export const SPECIAL_SKULLKING = "skullking"
export const SPECIAL_SCARYMARY = "scarymary"
export const SPECIAL_FLAG = "flag"

export class SpecialCard {
  constructor(suit, instance) {
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
