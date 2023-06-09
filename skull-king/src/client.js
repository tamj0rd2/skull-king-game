import WebSocket from 'ws';
import {BidEvent, Game, PlayCardEvent} from "./core/core.js";

// automated test for playing a 2 player game via ws

function wait(time) {
  return new Promise(resolve => setTimeout(resolve, time));
}

class Player {
  constructor(playerId) {
    this.playerId = playerId
    const ws = new WebSocket('ws://localhost:8080');
    this.ws = ws
    this.game = undefined
    const that = this

    ws.on('error', console.error);

    ws.on('open', function open() {
      console.log("Connecting as", playerId)
      ws.send(JSON.stringify({type: "player_joined", playerId}))
    });

    ws.on('message', function message(data) {
      const msg = JSON.parse(data)
      console.log(`received msg of type ${msg.type}`)

      switch (msg.type) {
        case "game":
          that.game = msg.game
          return
        default:
          throw new Error(`cannot handle message type ${msg.type}`)
      }
    });
  }

  async sendEvent(e) {
    const currentState = JSON.stringify(this.game)
    this.ws.send(JSON.stringify(e))

    for (let i = 0; i < 10; i++) {
      if (JSON.stringify(this.game) !== currentState) {
        return this.game
      }

      await wait(1000)
    }

    throw new Error("the game state didnt change within 10 seconds")
  }
}

const tam = new Player("tam")
const peter = new Player("peter")

setTimeout(async () => {
  let game

  game = await tam.sendEvent(new BidEvent(tam.playerId, 1))
  game = await peter.sendEvent(new BidEvent(peter.playerId, 1))

  console.dir(game._hands)
  game = await tam.sendEvent(new PlayCardEvent(tam.playerId, game._hands[tam.playerId][0]))
}, 1000)
