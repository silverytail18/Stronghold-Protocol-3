// Ranking participation includes abandonments; competitive win rate excludes them.
export function rankedSummary({games=0,wins=0,abandoned=0}={}) {
  const total=Math.max(0,Math.trunc(games)),left=Math.min(total,Math.max(0,Math.trunc(abandoned)));
  const completed=total-left,won=Math.min(completed,Math.max(0,Math.trunc(wins)));
  return {abandonedGames:left,completedGames:completed,losses:completed-won,winRate:completed?won/completed:null};
}
