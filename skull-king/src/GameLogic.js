export function calculateRoundScore(roundNumber, { bid, wins }) {
  if (bid === 0) {
    return wins === 0 ? roundNumber * 10 : roundNumber * -10
  }

  if (bid === wins) {
    const bonusPoints = 0
    return (bid * 20) + bonusPoints
  }

  const diff = Math.abs(bid - wins)
  return diff * -10
}

export const playerCount = 2 // player and the bot
export const botName = "Bot"
export const playerName = "Player"
