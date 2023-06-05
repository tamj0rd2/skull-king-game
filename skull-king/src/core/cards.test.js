import test from "node:test";
import assert from "node:assert";
import {
  NumberedCard,
  SPECIAL_FLAG, SPECIAL_MERMAID,
  SPECIAL_PIRATE,
  SPECIAL_SCARYMARY, SPECIAL_SKULLKING,
  SpecialCard, SUIT_BLACK,
  SUIT_BLUE,
  SUIT_RED,
  SUIT_YELLOW, Trick
} from "./cards.js";

const tam = "tam"
const peter = "peter"
const shad = "shad"
const players = [tam, peter, shad]

// lower meaning red, yellow and blue. excludes black
test("when all cards are lower numbered and of the same suit, the higher valued card wins", () => {
  const trick = new Trick(players.length)
  trick.addCard(tam, new NumberedCard(SUIT_BLUE, 5))
  trick.addCard(peter, new NumberedCard(SUIT_BLUE, 6))
  trick.addCard(shad, new NumberedCard(SUIT_BLUE, 4))
  assert.equal(trick.getWinner(), peter)
})

test("when all cards are lower numbered and of different suits, the first suit wins", () => {
  const trick = new Trick(players.length)
  trick.addCard(tam, new NumberedCard(SUIT_BLUE, 5))
  trick.addCard(peter, new NumberedCard(SUIT_YELLOW, 6))
  trick.addCard(shad, new NumberedCard(SUIT_RED, 7))
  assert.equal(trick.getWinner(), tam)
})

test("when the suit is a lower numbered card, black wins", () => {
  const trick = new Trick(players.length)
  trick.addCard(tam, new NumberedCard(SUIT_BLUE, 5))
  assert.equal(trick.getSuit(), SUIT_BLUE)
  trick.addCard(peter, new NumberedCard(SUIT_BLACK, 6))
  trick.addCard(shad, new NumberedCard(SUIT_BLUE, 7))
  assert.equal(trick.getWinner(), peter)
})

test("when the suit is black, the highest black wins", () => {
  const trick = new Trick(players.length)
  trick.addCard(tam, new NumberedCard(SUIT_BLACK, 6))
  assert.equal(trick.getSuit(), SUIT_BLACK)
  trick.addCard(peter, new NumberedCard(SUIT_BLACK, 2))
  trick.addCard(shad, new NumberedCard(SUIT_RED, 13))
  assert.equal(trick.getWinner(), tam)
})

test("when all other cards are numbered", async (t) => {
  for (const specialType of [SPECIAL_PIRATE, SPECIAL_SKULLKING, SPECIAL_MERMAID]) {
    await t.test(`${specialType} wins`, () => {
      const trick = new Trick(players.length)
      trick.addCard(tam, new NumberedCard(SUIT_RED, 8))
      trick.addCard(peter, new SpecialCard(specialType))
      trick.addCard(shad, new NumberedCard(SUIT_BLACK, 13))
      assert.equal(trick.getWinner(), peter)
    })
  }
})

test("the first player to play a pirate wins", () => {
  const trick = new Trick(players.length)
  trick.addCard(tam, new SpecialCard(SPECIAL_PIRATE, 1))
  trick.addCard(peter, new SpecialCard(SPECIAL_PIRATE, 2))
  trick.addCard(shad, new NumberedCard(SUIT_BLACK, 13))
  assert.equal(trick.getWinner(), tam)
})

test("pirates beat mermaids", () => {
  const trick = new Trick(players.length)
  trick.addCard(tam, new NumberedCard(SUIT_BLACK, 1))
  trick.addCard(peter, new SpecialCard(SPECIAL_PIRATE, 1))
  trick.addCard(shad, new SpecialCard(SPECIAL_MERMAID, 1))
  assert.equal(trick.getWinner(), peter)
})

test("mermaid beats skull king", () => {
  const trick = new Trick(players.length)
  trick.addCard(tam, new NumberedCard(SUIT_BLACK, 1))
  trick.addCard(peter, new SpecialCard(SPECIAL_SKULLKING, 1))
  trick.addCard(shad, new SpecialCard(SPECIAL_MERMAID, 1))
  assert.equal(trick.getWinner(), shad)
})

test("skull king beats pirate", () => {
  const trick = new Trick(players.length)
  trick.addCard(tam, new NumberedCard(SUIT_BLACK, 1))
  trick.addCard(peter, new SpecialCard(SPECIAL_SKULLKING, 1))
  trick.addCard(shad, new SpecialCard(SPECIAL_PIRATE, 1))
  assert.equal(trick.getWinner(), peter)
})

test("skull king beats pirate, except when there is a mermaid", () => {
  const trick = new Trick(players.length)
  trick.addCard(tam, new SpecialCard(SPECIAL_PIRATE, 1))
  trick.addCard(peter, new SpecialCard(SPECIAL_SKULLKING, 1))
  trick.addCard(shad, new SpecialCard(SPECIAL_MERMAID, 1))
  assert.equal(trick.getWinner(), shad)
})

test("the first player to play a mermaid wins when there are no pirates", () => {
  const trick = new Trick(players.length)
  trick.addCard(tam, new NumberedCard(SUIT_BLACK, 1))
  trick.addCard(peter, new SpecialCard(SPECIAL_MERMAID, 1))
  trick.addCard(shad, new NumberedCard(SUIT_BLACK, 5))
  assert.equal(trick.getWinner(), peter)
})

test("if the first player plays a flag, the suit is the first numbered card", () => {
  const trick = new Trick(players.length)
  trick.addCard(tam, new SpecialCard(SPECIAL_FLAG, 1))
  trick.addCard(peter, new NumberedCard(SUIT_YELLOW, 8))
  assert.equal(trick.getSuit(), SUIT_YELLOW)
  trick.addCard(shad, new NumberedCard(SUIT_YELLOW, 13))
  assert.equal(trick.getWinner(), shad)
})

test("when everyone plays a flag, the first player to play it wins", () => {
  const trick = new Trick(players.length)
  trick.addCard(tam, new SpecialCard(SPECIAL_FLAG, 1))
  trick.addCard(peter, new SpecialCard(SPECIAL_FLAG, 2))
  trick.addCard(shad, new SpecialCard(SPECIAL_FLAG, 3))
  assert.equal(trick.getWinner(), tam)
})


test("flags lose to", async (t) => {
  for (const specialSuit of [SPECIAL_PIRATE, SPECIAL_SKULLKING, SPECIAL_MERMAID]) {
    await t.test(specialSuit, () => {
      const trick = new Trick(2)
      trick.addCard(tam, new SpecialCard(specialSuit, 1))
      trick.addCard(peter, new SpecialCard(SPECIAL_FLAG, 2))
      assert.equal(trick.getWinner(), tam)
    })
  }
})

// TODO: need a test around scary mary
