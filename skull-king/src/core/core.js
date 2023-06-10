import {writable} from 'svelte/store';
import {Game} from "./game.js";

export const game = writable(new Game());

export function dispatchGameEvent(e) {
  game.update((g) => {
    g.handleEvent(e)
    return g
  })
}

export function updateGameJSON(json) {
  game.update((g) => {
    g.matchState(json)
    return g
  })
}
