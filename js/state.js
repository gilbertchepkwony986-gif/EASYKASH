/* ==========================================================================
   BetaBinary - Global State Management (state.js)
   ========================================================================== */

const STORAGE_KEY = 'betabinary_app_state_v1';

// Available Assets Database
export const MARKETS_DATA = [
  // Synthetics (Continuous 24/7 Volatility Indices)
  { id: 'vol_10', symbol: '1HZ10V', name: 'Volatility 10 (1s) Index', category: 'synthetics', payout: 95, basePrice: 6245.20, volatility: 0.8, precision: 2 },
  { id: 'vol_25', symbol: '1HZ25V', name: 'Volatility 25 (1s) Index', category: 'synthetics', payout: 95, basePrice: 1845.80, volatility: 1.5, precision: 2 },
  { id: 'vol_50', symbol: '1HZ50V', name: 'Volatility 50 (1s) Index', category: 'synthetics', payout: 95, basePrice: 432.15, volatility: 2.5, precision: 2 },
  { id: 'vol_75', symbol: '1HZ75V', name: 'Volatility 75 (1s) Index', category: 'synthetics', payout: 95, basePrice: 8740.90, volatility: 3.5, precision: 2 },
  { id: 'vol_100', symbol: '1HZ100V', name: 'Volatility 100 (1s) Index', category: 'synthetics', payout: 95, basePrice: 1250.45, volatility: 4.5, precision: 2 },
  { id: 'boom_500', symbol: 'BOOM500', name: 'Boom 500 Index', category: 'synthetics', payout: 95, basePrice: 3410.60, volatility: 2.0, precision: 2, spikeType: 'boom' },
  { id: 'crash_500', symbol: 'CRASH500', name: 'Crash 500 Index', category: 'synthetics', payout: 95, basePrice: 5120.30, volatility: 2.0, precision: 2, spikeType: 'crash' },
  { id: 'step_index', symbol: 'STEP', name: 'Step Index', category: 'synthetics', payout: 95, basePrice: 7850.10, volatility: 1.2, precision: 1 },

  // Forex
  { id: 'eur_usd', symbol: 'EUR/USD', name: 'Euro / US Dollar', category: 'forex', payout: 92, basePrice: 1.08450, volatility: 0.00015, precision: 5 },
  { id: 'gbp_usd', symbol: 'GBP/USD', name: 'British Pound / US Dollar', category: 'forex', payout: 90, basePrice: 1.26820, volatility: 0.00020, precision: 5 },
  { id: 'usd_jpy', symbol: 'USD/JPY', name: 'US Dollar / Japanese Yen', category: 'forex', payout: 91, basePrice: 154.620, volatility: 0.025, precision: 3 },
  { id: 'aud_usd', symbol: 'AUD/USD', name: 'Australian Dollar / USD', category: 'forex', payout: 88, basePrice: 0.65410, volatility: 0.00018, precision: 5 },
  { id: 'usd_cad', symbol: 'USD/CAD', name: 'US Dollar / Canadian Dollar', category: 'forex', payout: 89, basePrice: 1.37120, volatility: 0.00018, precision: 5 },

  // Crypto
  { id: 'btc_usd', symbol: 'BTC/USD', name: 'Bitcoin', category: 'crypto', payout: 95, basePrice: 67420.50, volatility: 18.5, precision: 2 },
  { id: 'eth_usd', symbol: 'ETH/USD', name: 'Ethereum', category: 'crypto', payout: 94, basePrice: 3520.80, volatility: 2.2, precision: 2 },
  { id: 'sol_usd', symbol: 'SOL/USD', name: 'Solana', category: 'crypto', payout: 92, basePrice: 158.40, volatility: 0.45, precision: 2 },
  { id: 'xrp_usd', symbol: 'XRP/USD', name: 'XRP', category: 'crypto', payout: 90, basePrice: 0.5840, volatility: 0.002, precision: 4 },

  // Commodities & Indices
  { id: 'gold', symbol: 'XAU/USD', name: 'Gold Spot', category: 'commodities', payout: 93, basePrice: 2385.60, volatility: 0.9, precision: 2 },
  { id: 'oil', symbol: 'USOIL', name: 'Crude Oil WTI', category: 'commodities', payout: 88, basePrice: 78.45, volatility: 0.08, precision: 2 },
  { id: 'nasdaq', symbol: 'NAS100', name: 'US Tech 100 Index', category: 'indices', payout: 91, basePrice: 18650.00, volatility: 6.0, precision: 2 }
];

const DEFAULT_STATE = {
  user: {
    isLoggedIn: true,
    name: 'Kenyan Pro Trader',
    email: 'trader@betabinary.ke',
    phone: '+254 712 345 678',
    country: 'Kenya',
    accountType: 'demo', // 'demo' or 'real'
    currency: 'USD', // 'USD' or 'KES'
    exchangeRate: 130.0, // 1 USD = 130 KES
    demoBalance: 10000.00,
    realBalance: 350.00,
    isKycVerified: true,
    is2FaEnabled: false,
    referralCode: 'BETA9920',
    referralEarnings: 84.50,
    referralCount: 7
  },
  trading: {
    selectedAssetId: 'vol_10',
    contractType: 'rise_fall', // 'rise_fall', 'even_odd', 'over_under', 'matches_differs'
    selectedDigit: 5,
    durationType: 'ticks', // 'ticks' or 'seconds'
    durationValue: 5,
    stake: 10,
    soundEnabled: true
  },
  bot: {
    isRunning: false,
    strategy: 'martingale', // 'martingale', 'dalembert', 'scalper'
    baseStake: 5,
    currentStake: 5,
    targetProfit: 50,
    stopLoss: 100,
    multiplier: 2.0,
    maxRuns: 50,
    totalRuns: 0,
    wins: 0,
    losses: 0,
    netProfit: 0
  },
  openPositions: [],
  tradeHistory: [
    {
      id: 'CNT-98124',
      assetId: 'vol_10',
      assetName: 'Volatility 10 (1s) Index',
      contractType: 'rise_fall',
      prediction: 'higher',
      entryPrice: 6241.10,
      exitPrice: 6244.50,
      entryTime: Date.now() - 600000,
      exitTime: Date.now() - 595000,
      stake: 10,
      payout: 19.50,
      profit: 9.50,
      status: 'won',
      accountType: 'demo'
    },
    {
      id: 'CNT-98125',
      assetId: 'vol_50',
      assetName: 'Volatility 50 (1s) Index',
      contractType: 'even_odd',
      prediction: 'even',
      entryPrice: 432.10,
      exitPrice: 432.18,
      entryTime: Date.now() - 360000,
      exitTime: Date.now() - 355000,
      stake: 20,
      payout: 39.00,
      profit: 19.00,
      status: 'won',
      accountType: 'demo'
    },
    {
      id: 'CNT-98126',
      assetId: 'btc_usd',
      assetName: 'Bitcoin',
      contractType: 'rise_fall',
      prediction: 'lower',
      entryPrice: 67410.00,
      exitPrice: 67425.00,
      entryTime: Date.now() - 120000,
      exitTime: Date.now() - 115000,
      stake: 15,
      payout: 0,
      profit: -15.00,
      status: 'lost',
      accountType: 'demo'
    }
  ],
  transactions: [
    { id: 'TXN-8841', type: 'deposit', method: 'M-Pesa STK Push', amount: 150.00, currency: 'USD', date: Date.now() - 86400000, status: 'completed' },
    { id: 'TXN-8842', type: 'deposit', method: 'M-Pesa STK Push', amount: 200.00, currency: 'USD', date: Date.now() - 43200000, status: 'completed' }
  ],
  chat: {
    isOpen: false,
    unread: 0,
    messages: [
      { id: 1, sender: 'bot', text: 'Hello! Welcome to BetaBinary Support. How can we help you today?', time: 'Just now' }
    ]
  }
};

class StateManager {
  constructor() {
    this.subscribers = new Set();
    this.state = this.loadState();
  }

  loadState() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return { ...DEFAULT_STATE, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.warn('Could not load stored state:', e);
    }
    return JSON.parse(JSON.stringify(DEFAULT_STATE));
  }

  saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch (e) {
      console.warn('Could not save state to localStorage:', e);
    }
  }

  getState() {
    return this.state;
  }

  update(updater) {
    if (typeof updater === 'function') {
      updater(this.state);
    } else {
      Object.assign(this.state, updater);
    }
    this.saveState();
    this.notify();
  }

  subscribe(callback) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  notify() {
    for (const callback of this.subscribers) {
      try {
        callback(this.state);
      } catch (e) {
        console.error('State subscriber error:', e);
      }
    }
  }

  // Helper actions
  switchAccount(type) {
    this.update(s => {
      s.user.accountType = type;
    });
  }

  resetDemoBalance() {
    this.update(s => {
      s.user.demoBalance = 10000.00;
    });
  }

  setSelectedAsset(assetId) {
    this.update(s => {
      s.trading.selectedAssetId = assetId;
    });
  }

  setContractType(type) {
    this.update(s => {
      s.trading.contractType = type;
    });
  }

  setStake(amount) {
    this.update(s => {
      s.trading.stake = Math.max(1, Number(amount));
    });
  }

  setDuration(type, value) {
    this.update(s => {
      s.trading.durationType = type;
      s.trading.durationValue = Number(value);
    });
  }
}

export const stateManager = new StateManager();
