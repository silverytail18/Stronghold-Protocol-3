// Host-test adapter: exercise the real opening/hex/draft/intent/view code while skipping combat rounds.
// Loaded only through matchHost.matchModule in the browser regression; no production debug intent.
import {Match as RealMatch} from '../../../server/match/Match.js';

export class Match extends RealMatch {
  startRound(round, ...rest) { return super.startRound(round === 1 ? 5 : round, ...rest); }
  enterPrep() {
    super.enterPrep();
    if (this.round === 5) this.startRound(10);
    else if (this.round === 10) this.startRound(15);
  }
}
