/* ==========================================================================
   BetaBinary - Trade Execution & Contract Settlement Engine (trade.js)
   ========================================================================== */

import { stateManager, MARKETS_DATA } from './state.js';
import { priceEngine } from './engine.js';

// Web Audio API Sound Synthesizer (zero external audio file dependency)
class AudioSynth {
  constructor() {
    this.ctx = null;
  }

  ensureContext() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playTradePlaced() {
    if (!stateManager.getState().trading.soundEnabled) return;
    try {
      this.ensureContext();
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, this.ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880.00, this.ctx.currentTime + 0.1); // A5
      gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.15);
    } catch (e) {}
  }

  playWin() {
    if (!stateManager.getState().trading.soundEnabled) return;
    try {
      this.ensureContext();
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 Fanfare
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const startTime = this.ctx.currentTime + (idx * 0.08);
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, startTime);
        gain.gain.setValueAtTime(0.25, startTime);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.25);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(startTime);
        osc.stop(startTime + 0.25);
      });
    } catch (e) {}
  }

  playLoss() {
    if (!stateManager.getState().trading.soundEnabled) return;
    try {
      this.ensureContext();
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(300, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(150, this.ctx.currentTime + 0.25);
      gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.3);
    } catch (e) {}
  }
}

export const audioSynth = new AudioSynth();

// Calculate Payout & Multiplier for various contract types
export function calculatePayout(contractType, prediction, selectedDigit, stake, assetPayout = 95) {
  stake = Number(stake) || 10;
  let multiplier = 1.95;

  if (contractType === 'rise_fall' || contractType === 'even_odd') {
    multiplier = 1 + (assetPayout / 100);
  } else if (contractType === 'over_under') {
    const digit = Number(selectedDigit);
    if (prediction === 'over') {
      // Over digit: numbers > digit. e.g. Over 5 => 6,7,8,9 (4 outcomes out of 10 -> ~235%)
      const winningOutcomes = 9 - digit;
      if (winningOutcomes <= 0) multiplier = 1.0;
      else multiplier = (9.5 / winningOutcomes);
    } else {
      // Under digit: numbers < digit. e.g. Under 5 => 0,1,2,3,4 (5 outcomes out of 10 -> ~190%)
      const winningOutcomes = digit;
      if (winningOutcomes <= 0) multiplier = 1.0;
      else multiplier = (9.5 / winningOutcomes);
    }
  } else if (contractType === 'matches_differs') {
    if (prediction === 'matches') {
      multiplier = 9.5; // 950% massive payout on exact digit match!
    } else {
      multiplier = 1.09; // 9% return on differs (90% probability)
    }
  }

  const payout = Number((stake * multiplier).toFixed(2));
  const profit = Number((payout - stake).toFixed(2));
  const returnPct = Math.round(((multiplier - 1) * 100));

  return { payout, profit, multiplier: Number(multiplier.toFixed(2)), returnPct };
}

export class TradeEngine {
  constructor() {
    this.initTickListener();
  }

  initTickListener() {
    priceEngine.subscribe((updates) => {
      this.handlePriceTicks(updates);
    });
  }

  placeTrade(prediction) {
    const state = stateManager.getState();
    const user = state.user;
    const trading = state.trading;
    const stake = Number(trading.stake);

    // Balance check
    const currentBalance = user.accountType === 'demo' ? user.demoBalance : user.realBalance;
    if (currentBalance < stake) {
      window.dispatchEvent(new CustomEvent('betabinary_toast', {
        detail: { type: 'danger', message: `Insufficient ${user.accountType.toUpperCase()} balance. Please deposit or reset demo.` }
      }));
      return null;
    }

    // Deduct stake from account
    stateManager.update(s => {
      if (s.user.accountType === 'demo') {
        s.user.demoBalance = Math.max(0, s.user.demoBalance - stake);
      } else {
        s.user.realBalance = Math.max(0, s.user.realBalance - stake);
      }
    });

    const market = MARKETS_DATA.find(m => m.id === trading.selectedAssetId) || MARKETS_DATA[0];
    const latestTick = priceEngine.getLatestPrice(market.id);

    const calc = calculatePayout(
      trading.contractType,
      prediction,
      trading.selectedDigit,
      stake,
      market.payout
    );

    const newPosition = {
      id: `CNT-${Math.floor(10000 + Math.random() * 90000)}`,
      assetId: market.id,
      assetName: market.name,
      contractType: trading.contractType,
      prediction,
      targetDigit: trading.selectedDigit,
      entryPrice: latestTick.price,
      entryDigit: latestTick.lastDigit,
      currentPrice: latestTick.price,
      currentDigit: latestTick.lastDigit,
      entryTime: Date.now(),
      durationType: trading.durationType,
      durationValue: trading.durationValue,
      ticksRemaining: trading.durationType === 'ticks' ? trading.durationValue : null,
      expiryTime: trading.durationType === 'seconds' ? Date.now() + (trading.durationValue * 1000) : null,
      stake,
      potentialPayout: calc.payout,
      accountType: user.accountType,
      status: 'active'
    };

    stateManager.update(s => {
      s.openPositions.unshift(newPosition);
    });

    audioSynth.playTradePlaced();

    window.dispatchEvent(new CustomEvent('betabinary_toast', {
      detail: { type: 'info', message: `Trade Placed: ${prediction.toUpperCase()} $${stake} on ${market.symbol}` }
    }));

    return newPosition;
  }

  handlePriceTicks(updates) {
    const state = stateManager.getState();
    const activePositions = state.openPositions;
    if (activePositions.length === 0) return;

    const completedPositions = [];
    const remainingPositions = [];

    for (const pos of activePositions) {
      const update = updates.find(u => u.assetId === pos.assetId);
      if (!update) {
        remainingPositions.push(pos);
        continue;
      }

      pos.currentPrice = update.price;
      pos.currentDigit = update.lastDigit;

      let isFinished = false;

      if (pos.durationType === 'ticks') {
        pos.ticksRemaining--;
        if (pos.ticksRemaining <= 0) {
          isFinished = true;
        }
      } else {
        if (Date.now() >= pos.expiryTime) {
          isFinished = true;
        }
      }

      if (isFinished) {
        completedPositions.push(pos);
      } else {
        remainingPositions.push(pos);
      }
    }

    if (completedPositions.length > 0) {
      this.settlePositions(completedPositions, remainingPositions);
    } else {
      // Just update current prices
      stateManager.update(s => {
        s.openPositions = remainingPositions;
      });
    }
  }

  settlePositions(completed, remaining) {
    const state = stateManager.getState();

    for (const pos of completed) {
      const isWon = this.evaluateContract(pos);
      const profit = isWon ? (pos.potentialPayout - pos.stake) : -pos.stake;
      const payout = isWon ? pos.potentialPayout : 0;

      const settledTrade = {
        id: pos.id,
        assetId: pos.assetId,
        assetName: pos.assetName,
        contractType: pos.contractType,
        prediction: pos.prediction,
        entryPrice: pos.entryPrice,
        exitPrice: pos.currentPrice,
        entryDigit: pos.entryDigit,
        exitDigit: pos.currentDigit,
        entryTime: pos.entryTime,
        exitTime: Date.now(),
        stake: pos.stake,
        payout,
        profit,
        status: isWon ? 'won' : 'lost',
        accountType: pos.accountType
      };

      // Credit balance if won
      if (isWon) {
        stateManager.update(s => {
          if (pos.accountType === 'demo') {
            s.user.demoBalance += payout;
          } else {
            s.user.realBalance += payout;
          }
        });
        audioSynth.playWin();
        window.dispatchEvent(new CustomEvent('betabinary_toast', {
          detail: { type: 'success', message: `Contract Won! +$${payout.toFixed(2)} (${pos.id})` }
        }));
      } else {
        audioSynth.playLoss();
        window.dispatchEvent(new CustomEvent('betabinary_toast', {
          detail: { type: 'danger', message: `Contract Lost: -$${pos.stake.toFixed(2)} (${pos.id})` }
        }));
      }

      // Add to history
      stateManager.update(s => {
        s.tradeHistory.unshift(settledTrade);
        // Keep last 100 trades
        if (s.tradeHistory.length > 100) s.tradeHistory.pop();
      });

      // Notify bot if running
      window.dispatchEvent(new CustomEvent('betabinary_trade_settled', {
        detail: settledTrade
      }));
    }

    stateManager.update(s => {
      s.openPositions = remaining;
    });
  }

  evaluateContract(pos) {
    const entryPrice = pos.entryPrice;
    const exitPrice = pos.currentPrice;
    const exitDigit = pos.currentDigit;

    switch (pos.contractType) {
      case 'rise_fall':
        if (pos.prediction === 'higher') return exitPrice > entryPrice;
        if (pos.prediction === 'lower') return exitPrice < entryPrice;
        return false;

      case 'even_odd':
        const isEven = exitDigit % 2 === 0;
        if (pos.prediction === 'even') return isEven;
        if (pos.prediction === 'odd') return !isEven;
        return false;

      case 'over_under':
        const target = Number(pos.targetDigit);
        if (pos.prediction === 'over') return exitDigit > target;
        if (pos.prediction === 'under') return exitDigit < target;
        return false;

      case 'matches_differs':
        const matchTarget = Number(pos.targetDigit);
        if (pos.prediction === 'matches') return exitDigit === matchTarget;
        if (pos.prediction === 'differs') return exitDigit !== matchTarget;
        return false;

      default:
        return false;
    }
  }
}

export const tradeEngine = new TradeEngine();
