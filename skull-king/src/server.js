import WebSocket, { WebSocketServer } from 'ws'

import {BidEvent, Game, PlayCardEvent, StartGameEvent, StartNextRoundEvent, StartNextTrickEvent} from "./core/game.js";
import {NumberedCard, SpecialCard} from "./core/cards.js";

let game
const wss = new WebSocketServer({ port: 8080 })

// playerId to ws connection
const playerConnections = {}

function broadcastJSON(data) {
  wss.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data))
    }
  })
}

wss.on('connection', function connection(ws) {
  let playerId = "unknown"

  ws.on('error', console.error)

  ws.on('message', function message(data) {
    const msg = JSON.parse(data)
    console.log(msg)

    switch (msg.type) {
      case "player_joined":
        playerId = msg.playerId
        playerConnections[playerId] = ws
        console.log(playerId, "connected")

        const players = Object.keys(playerConnections)
        if (players.length === 2) {
          console.log("Starting game with", players)
          game = new Game()
          game.handleEvent(new StartGameEvent(players))
          broadcastJSON({type: "game_started", game})
        }

        return
      case PlayCardEvent.type:
        let card = msg.card
        if (card.type === NumberedCard.type) card = new NumberedCard(card.suit, card.number)
        else card = new SpecialCard(card.suit, card.instance)

        game.handleEvent(new PlayCardEvent(msg.playerId, card))
        broadcastJSON({type: "game_update", game})
        return
      case BidEvent.type:
        game.handleEvent(new BidEvent(msg.playerId, msg.bid))
        broadcastJSON({type: "game_update", game})
        return
      case StartNextRoundEvent.type:
        game.handleEvent(new StartNextRoundEvent())
        broadcastJSON({type: "game_update", game})
        return
      case StartNextTrickEvent.type:
        game.handleEvent(new StartNextTrickEvent())
        broadcastJSON({type: "game_update", game})
        return
      default:
        throw new Error(`Unhandled message type ${msg.type}`)
    }
  })

  ws.on("close", function () {
    console.log(`${playerId} disconnected :o`)
    delete playerConnections[playerId]
  })
})

console.log("server started!")
