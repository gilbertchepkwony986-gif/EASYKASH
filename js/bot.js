/* ==========================================================================
   BetaBinary - Auto-Trading Bot Engine (bot.js)
   ========================================================================== */

import { stateManager } from './state.js';
import { tradeEngine } from './trade.js';

class AutoTradingBot {
  constructor() {
    this.sessionTimer = null;
    this.isExecuting = false;
    this.setupListener();
  }

  setupListener() {
    window.addEventListener('betabinary_trade_settled', (e) => {
      const trade = e.detail;
      const bot = stateManager.getState().bot;
      if (bot.isRunning && this.isExecuting) {
        this.handleBotTradeSettled(trade);
      }
    });
  }

  startBot() {
    const state = stateManager.getState();
    const bot = state.bot;
    if (bot.isRunning) return;

    stateManager.update(s => {
      s.bot.isRunning = true;
      s.bot.totalRuns = 0;
      s.bot.wins = 0;
      s.bot.losses = 0;
      s.bot.netProfit = 0;
      s.bot.currentStake = s.bot.baseStake;
    });

    window.dispatchEvent(new CustomEvent('betabinary_toast', {
      detail: { type: 'success', message: `Auto-Trading Bot Started (${bot.strategy.toUpperCase()})` }
    }));

    // Trigger first trade after small delay
    this.isExecuting = true;
    setTimeout(() => {
      this.executeNextBotTrade();
    }, 1000);
  }

  stopBot(reason = 'Manual Stop') {
    stateManager.update(s => {
      s.bot.isRunning = false;
    });
    this.isExecuting = false;

    if (this.sessionTimer) {
      clearTimeout(this.sessionTimer);
      this.sessionTimer = null;
    }

    window.dispatchEvent(new CustomEvent('betabinary_toast', {
      detail: { type: 'warning', message: `Auto-Trading Bot Stopped: ${reason}` }
    }));
  }

  executeNextBotTrade() {
    const state = stateManager.getState();
    const bot = state.bot;
    if (!bot.isRunning) return;

    // Check Target Profit
    if (bot.netProfit >= bot.targetProfit) {
      this.stopBot(`Target Profit of +$${bot.targetProfit} reached! 🎉`);
      return;
    }

    // Check Stop Loss
    if (bot.netProfit <= -Math.abs(bot.stopLoss)) {
      this.stopBot(`Stop Loss of -$${bot.stopLoss} triggered! ⚠️`);
      return;
    }

    // Check Max Runs
    if (bot.totalRuns >= bot.maxRuns) {
      this.stopBot(`Max Runs limit (${bot.maxRuns}) reached.`);
      return;
    }

    // Set stake
    stateManager.setStake(bot.currentStake);

    // Pick smart direction based on strategy
    let prediction = 'higher';
    if (state.trading.contractType === 'even_odd') {
      prediction = Math.random() > 0.5 ? 'even' : 'odd';
    } else if (state.trading.contractType === 'over_under') {
      prediction = Math.random() > 0.5 ? 'over' : 'under';
    } else {
      // Rise / Fall
      prediction = Math.random() > 0.5 ? 'higher' : 'lower';
    }

    tradeEngine.placeTrade(prediction);
  }

  handleBotTradeSettled(trade) {
    const state = stateManager.getState();
    const bot = state.bot;
    if (!bot.isRunning) return;

    const isWon = trade.status === 'won';

    stateManager.update(s => {
      s.bot.totalRuns++;
      s.bot.netProfit += trade.profit;

      if (isWon) {
        s.bot.wins++;
        // Reset stake on win for Martingale
        s.bot.currentStake = s.bot.baseStake;
      } else {
        s.bot.losses++;
        if (s.bot.strategy === 'martingale') {
          // Multiply stake on loss
          s.bot.currentStake = Number((s.bot.currentStake * s.bot.multiplier).toFixed(2));
        } else if (s.bot.strategy === 'dalembert') {
          s.bot.currentStake = Number((s.bot.currentStake + s.bot.baseStake).toFixed(2));
        }
      }
    });

    // Schedule next trade after a short interval
    this.sessionTimer = setTimeout(() => {
      this.executeNextBotTrade();
    }, 1500);
  }
}

export const autoTradingBot = new AutoTradingBot();
