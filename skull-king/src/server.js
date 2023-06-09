import { WebSocketServer } from 'ws'
import {BidEvent, Game, PlayCardEvent, StartGameEvent} from "./core/core.js";

const game = new Game()
const wss = new WebSocketServer({ port: 8080 })

// playerId to ws connection
const playerConnections = {}

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
          game.handleEvent(new StartGameEvent(players))
        }

        return
      case "bid":
        game.handleEvent(new BidEvent(msg.playerId, msg.bid))
        ws.send(JSON.stringify({type: "game", game}))
        return
      case "play_card":
        game.handleEvent(new PlayCardEvent(msg.playerId, msg.card))
        ws.send(JSON.stringify({type: "game", game}))
        return
      default:
        throw new Error(`Unhandled message type ${msg.type}`)
    }
  })

  ws.on("close", function () {
    console.log("someone disconnected :o")
  })
})

console.log("server started!")
