import { writable } from "svelte/store";

export const confirmedPlayerBid = writable(undefined)

export const gamePhase = writable("Bidding")
