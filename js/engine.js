/* ==========================================================================
   BetaBinary - Real-Time Market Price Engine (engine.js)
   ========================================================================== */

import { MARKETS_DATA } from './state.js';

class PriceEngine {
  constructor() {
    this.prices = new Map();
    this.tickHistory = new Map(); // assetId -> Array of ticks { time, price, lastDigit }
    this.subscribers = new Set();
    this.timer = null;
    this.initPrices();
  }

  initPrices() {
    const now = Date.now();
    for (const market of MARKETS_DATA) {
      let current = market.basePrice;
      const history = [];
      
      // Pre-generate 120 historic ticks so chart is full immediately
      for (let i = 120; i >= 0; i--) {
        const time = now - (i * 1000);
        const noise = (Math.random() - 0.5) * market.volatility;
        current = Math.max(0.00001, current + noise);
        const formattedPrice = Number(current.toFixed(market.precision));
        const lastDigit = this.extractLastDigit(formattedPrice, market.precision);
        history.push({ time, price: formattedPrice, lastDigit });
      }

      this.prices.set(market.id, current);
      this.tickHistory.set(market.id, history);
    }
  }

  extractLastDigit(price, precision) {
    const str = price.toFixed(precision);
    const lastChar = str.charAt(str.length - 1);
    return parseInt(lastChar, 10) || 0;
  }

  start() {
    if (this.timer) return;
    // Ticks generate every 750ms for realistic high-frequency binary options
    this.timer = setInterval(() => {
      this.step();
    }, 750);
  }

  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  step() {
    const now = Date.now();
    const tickUpdates = [];

    for (const market of MARKETS_DATA) {
      let current = this.prices.get(market.id);
      
      // Realistic simulation: Random walk with mean-reversion drift
      const meanDrift = (market.basePrice - current) * 0.02;
      let shock = (Math.random() - 0.5) * market.volatility;

      // Handle synthetic boom/crash spikes
      if (market.spikeType === 'boom' && Math.random() < 0.05) {
        shock += market.volatility * (4 + Math.random() * 6);
      } else if (market.spikeType === 'crash' && Math.random() < 0.05) {
        shock -= market.volatility * (4 + Math.random() * 6);
      }

      current = Math.max(0.00001, current + meanDrift + shock);
      this.prices.set(market.id, current);

      const formattedPrice = Number(current.toFixed(market.precision));
      const lastDigit = this.extractLastDigit(formattedPrice, market.precision);

      const history = this.tickHistory.get(market.id);
      const tick = { time: now, price: formattedPrice, lastDigit };
      history.push(tick);

      // Keep up to 300 ticks in buffer
      if (history.length > 300) {
        history.shift();
      }

      tickUpdates.push({
        assetId: market.id,
        price: formattedPrice,
        lastDigit,
        tick
      });
    }

    this.notify(tickUpdates);
  }

  getLatestPrice(assetId) {
    const history = this.tickHistory.get(assetId);
    if (history && history.length > 0) {
      return history[history.length - 1];
    }
    const market = MARKETS_DATA.find(m => m.id === assetId);
    return { time: Date.now(), price: market ? market.basePrice : 100, lastDigit: 0 };
  }

  getTickHistory(assetId) {
    return this.tickHistory.get(assetId) || [];
  }

  // Get Last Digit Frequency Stats (0 - 9)
  getDigitStats(assetId, count = 100) {
    const history = this.tickHistory.get(assetId) || [];
    const sample = history.slice(-count);
    const frequencies = new Array(10).fill(0);

    for (const tick of sample) {
      if (tick.lastDigit >= 0 && tick.lastDigit <= 9) {
        frequencies[tick.lastDigit]++;
      }
    }

    const total = sample.length || 1;
    const stats = frequencies.map((freq, digit) => ({
      digit,
      count: freq,
      percentage: Math.round((freq / total) * 100)
    }));

    // Find hot (most frequent) and cold (least frequent)
    let maxFreq = -1;
    let minFreq = Infinity;
    for (const s of stats) {
      if (s.count > maxFreq) maxFreq = s.count;
      if (s.count < minFreq) minFreq = s.count;
    }

    return stats.map(s => ({
      ...s,
      isHot: s.count === maxFreq && maxFreq > 0,
      isCold: s.count === minFreq && minFreq < maxFreq
    }));
  }

  // Aggregate Candlestick Data
  getCandles(assetId, timeframeSeconds = 5) {
    const history = this.tickHistory.get(assetId) || [];
    if (history.length === 0) return [];

    const timeframeMs = timeframeSeconds * 1000;
    const candles = [];
    let currentCandle = null;

    for (const tick of history) {
      const candleBucket = Math.floor(tick.time / timeframeMs) * timeframeMs;

      if (!currentCandle || currentCandle.time !== candleBucket) {
        if (currentCandle) {
          candles.push(currentCandle);
        }
        currentCandle = {
          time: candleBucket,
          open: tick.price,
          high: tick.price,
          low: tick.price,
          close: tick.price
        };
      } else {
        currentCandle.high = Math.max(currentCandle.high, tick.price);
        currentCandle.low = Math.min(currentCandle.low, tick.price);
        currentCandle.close = tick.price;
      }
    }

    if (currentCandle) {
      candles.push(currentCandle);
    }

    return candles;
  }

  subscribe(callback) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  notify(updates) {
    for (const cb of this.subscribers) {
      try {
        cb(updates);
      } catch (e) {
        console.error('PriceEngine subscriber error:', e);
      }
    }
  }
}

export const priceEngine = new PriceEngine();
