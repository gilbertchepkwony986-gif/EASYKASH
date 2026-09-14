/* ==========================================================================
   BetaBinary - Exact Pixel-Perfect Trading Terminal View (tradeView.js)
   Replicating original betabinary.ke/trade design
   ========================================================================== */

import { stateManager, MARKETS_DATA } from '../state.js';
import { priceEngine } from '../engine.js';
import { ChartRenderer } from '../chart.js';
import { tradeEngine, calculatePayout } from '../trade.js';
import { autoTradingBot } from '../bot.js';

export function renderTradeView() {
  const container = document.createElement('div');
  container.className = 'trade-container';

  const state = stateManager.getState();
  const currentMarket = MARKETS_DATA.find(m => m.id === state.trading.selectedAssetId) || MARKETS_DATA[0];
  const user = state.user;
  const isReal = user.accountType === 'real';
  const balance = isReal ? user.realBalance : user.demoBalance;

  container.innerHTML = `
    <!-- Top Header Bar -->
    <header class="trade-top-header">
      <div class="trade-header-left">
        <!-- [B] Logo -->
        <a href="#/" class="trade-app-logo" title="BetaBinary Home">B</a>

        <!-- Header Nav Links -->
        <nav class="trade-header-nav">
          <a href="#/trade" class="trade-nav-item active">
            <span class="icon">🏠</span> Trader's Hub
          </a>
          <button class="trade-nav-item" id="hdr-nav-deposit">
            <span class="icon">⬇</span> Deposit
          </button>
          <button class="trade-nav-item" id="hdr-nav-withdraw">
            <span class="icon">⬆</span> Withdraw
          </button>
          <button class="trade-nav-item" id="hdr-nav-history">
            <span class="icon">🕒</span> History
          </button>
          <button class="trade-nav-item" id="hdr-nav-chat">
            <span class="icon">💬</span> Chat
          </button>
        </nav>

        <!-- [BB] BetaBinary Trader Pill -->
        <div class="trade-platform-pill" id="hdr-platform-pill">
          <span class="trade-platform-badge">BB</span>
          <span>BetaBinary Trader</span>
          <span style="font-size:0.65rem; opacity:0.7;">▼</span>
        </div>
      </div>

      <div class="trade-header-right">
        <!-- Theme Toggle -->
        <button class="trade-theme-btn" id="hdr-theme-btn" title="Toggle Light/Dark Theme">
          ☀️
        </button>

        <!-- Account Pill [R] / [D] Balance -->
        <div class="relative">
          <div class="trade-balance-pill" id="hdr-account-pill">
            <div class="trade-account-type-badge ${isReal ? 'real' : 'demo'}" id="hdr-acc-badge">
              ${isReal ? 'R' : 'D'}
            </div>
            <div class="trade-balance-amount" id="hdr-balance-text">
              $${balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <span style="font-size:0.65rem; color:var(--trade-text-muted);">▼</span>
          </div>

          <!-- Account Dropdown Menu -->
          <div class="account-dropdown-menu hidden" id="account-dropdown-menu">
            <div style="font-size:0.75rem; font-weight:700; color:var(--trade-text-muted); text-transform:uppercase; margin-bottom:0.5rem;">
              Select Trading Account
            </div>
            <div class="account-card-opt ${!isReal ? 'selected' : ''}" data-acctype="demo">
              <div>
                <div style="font-weight:700; color:var(--trade-yellow);">Demo Account</div>
                <div style="font-size:0.75rem; color:var(--trade-text-muted);">$10,000 virtual balance</div>
              </div>
              <div style="text-align:right;">
                <div class="mono font-bold" id="menu-demo-bal">$${user.demoBalance.toFixed(2)}</div>
                <button class="btn-ghost" id="btn-reset-demo-bal" style="font-size:0.7rem; color:var(--trade-teal); padding:0;">Reset</button>
              </div>
            </div>

            <div class="account-card-opt ${isReal ? 'selected' : ''}" data-acctype="real">
              <div>
                <div style="font-weight:700; color:var(--trade-teal);">Real Account (KES)</div>
                <div style="font-size:0.75rem; color:var(--trade-text-muted);">KES ${(user.realBalance * user.exchangeRate).toLocaleString()}</div>
              </div>
              <div style="text-align:right;">
                <div class="mono font-bold" style="color:var(--trade-teal);" id="menu-real-bal">$${user.realBalance.toFixed(2)}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Big Green Deposit Button -->
        <button class="trade-btn-deposit-header" id="btn-header-deposit">
          Deposit
        </button>

        <!-- Notification Bell -->
        <button class="trade-icon-btn" id="btn-header-notif" title="Notifications">
          🔔
        </button>

        <!-- Profile Avatar -->
        <button class="trade-user-avatar" id="btn-header-profile" title="Settings & Profile" onclick="location.hash='#/settings/profile'">
          👤
        </button>
      </div>
    </header>

    <!-- 3-Column Main Workspace -->
    <div class="trade-main-layout">
      <!-- --------------------------------------------------------------------
           COLUMN 1: LEFT SIDEBAR (Positions & Activity)
           -------------------------------------------------------------------- -->
      <aside class="trade-left-sidebar">
        <div class="trade-sidebar-tabs">
          <button class="trade-sidebar-tab-btn active" data-sidebartab="open" id="tab-open-pos">
            Open (<span id="count-open-pos">${state.openPositions.length}</span>)
          </button>
          <button class="trade-sidebar-tab-btn" data-sidebartab="closed" id="tab-closed-pos">
            Closed (<span id="count-closed-pos">${state.tradeHistory.length}</span>)
          </button>
          <button class="trade-sidebar-tab-btn" data-sidebartab="transactions" id="tab-trans-pos">
            Transactions
          </button>
        </div>

        <div class="trade-sidebar-content" id="sidebar-positions-container">
          <!-- Populated dynamically: empty state or trade cards -->
        </div>

        <div class="trade-sidebar-footer" id="sidebar-footer-text">
          <span id="footer-open-count">${state.openPositions.length}</span> open positions
        </div>
      </aside>

      <!-- --------------------------------------------------------------------
           COLUMN 2: CENTER CHART VIEWPORT
           -------------------------------------------------------------------- -->
      <main class="trade-center-viewport">
        <!-- Floating Asset Badge (Top-Left of Chart) -->
        <div class="trade-floating-asset-card" id="floating-asset-btn">
          <div class="trade-asset-icon-badge">📊</div>
          <div class="trade-asset-text-block">
            <div class="trade-asset-title-row">
              <span id="asset-name-label">${currentMarket.name}</span>
              <span style="font-size:0.7rem; color:var(--trade-text-muted);">▼</span>
            </div>
            <div class="trade-asset-price-row">
              <span class="trade-asset-live-price" id="asset-live-price">---</span>
              <span class="trade-asset-price-delta up" id="asset-live-change">+0.00% 📈</span>
            </div>
          </div>
        </div>

        <!-- Asset Picker Modal Dropdown (Hidden by default) -->
        <div class="trade-asset-picker-modal hidden" id="asset-picker-modal">
          <div class="asset-search-box">
            <input type="text" class="input-field text-xs" id="asset-search-input" placeholder="Search markets (Volatility, Boom, Forex)..." />
          </div>
          <div class="asset-categories-tabs" id="asset-cat-tabs">
            <button class="asset-cat-btn active" data-cat="all">All</button>
            <button class="asset-cat-btn" data-cat="synthetics">Synthetics</button>
            <button class="asset-cat-btn" data-cat="forex">Forex</button>
            <button class="asset-cat-btn" data-cat="crypto">Crypto</button>
          </div>
          <div class="asset-list-scroll" id="asset-list-scroll">
            <!-- Populated by JS -->
          </div>
        </div>

        <!-- Left Vertical Chart Tools -->
        <div class="trade-chart-left-tools">
          <button class="trade-chart-tool-btn active" id="tool-tf" title="Timeframe (1T / 1s)">1T</button>
          <button class="trade-chart-tool-btn" id="tool-chart-type" title="Chart Style (Line / Candles)">📈</button>
          <button class="trade-chart-tool-btn" id="tool-indicators" title="Indicators (SMA, Bollinger)">📊</button>
          <button class="trade-chart-tool-btn" id="tool-crosshair" title="Crosshairs">🎯</button>
          <button class="trade-chart-tool-btn" id="tool-snapshot" title="Snapshot Chart">📥</button>
        </div>

        <!-- Bottom-Left Zoom Controls -->
        <div class="trade-chart-zoom-tools">
          <button class="trade-zoom-btn" id="btn-zoom-in" title="Zoom In">+</button>
          <button class="trade-zoom-btn" id="btn-zoom-reset" title="Reset Zoom">⊙</button>
          <button class="trade-zoom-btn" id="btn-zoom-out" title="Zoom Out">-</button>
        </div>

        <!-- Canvas Container -->
        <div class="trade-chart-canvas-container">
          <canvas id="trading-canvas"></canvas>
        </div>

        <!-- Bottom Floating Digit Frequency Analyzer Bar (0 - 9) -->
        <div class="trade-chart-digit-bar" id="digit-analyzer-bar">
          <!-- 10 circular digit cards rendered by JS -->
        </div>
      </main>

      <!-- --------------------------------------------------------------------
           COLUMN 3: RIGHT ORDER PAD / TRADE CONTROLS
           -------------------------------------------------------------------- -->
      <aside class="trade-right-panel">
        <!-- Learn Link -->
        <a href="#/" class="trade-learn-link" id="btn-learn-trade">
          <span>ⓘ</span> Learn about this trade type
        </a>

        <!-- Contract Selector Button -->
        <div class="relative">
          <div class="trade-contract-selector-row" id="btn-contract-selector">
            <div class="trade-contract-icons">
              <span style="font-size:0.75rem; color:var(--trade-text-muted);">▼</span>
              <div class="trade-contract-icon-box" style="background:rgba(0,208,156,0.15); color:var(--trade-teal);" id="contract-icon-box">▦ △</div>
              <span class="trade-contract-name-text" id="contract-name-label">Even/Odd</span>
            </div>
            <span style="font-size:0.75rem; color:var(--trade-text-muted);">›</span>
          </div>

          <!-- Contract Type Modal Popup -->
          <div class="trade-contract-picker-modal hidden" id="contract-picker-modal">
            <div class="trade-contract-opt-item ${state.trading.contractType === 'even_odd' ? 'active' : ''}" data-ctype="even_odd">
              <span style="color:var(--trade-teal);">▦ △</span>
              <div>
                <div style="font-weight:700; font-size:0.88rem;">Even / Odd</div>
                <div style="font-size:0.72rem; color:var(--trade-text-muted);">Payout: 95.22%</div>
              </div>
            </div>
            <div class="trade-contract-opt-item ${state.trading.contractType === 'rise_fall' ? 'active' : ''}" data-ctype="rise_fall">
              <span style="color:var(--trade-teal);">▲ ▼</span>
              <div>
                <div style="font-weight:700; font-size:0.88rem;">Rise / Fall</div>
                <div style="font-size:0.72rem; color:var(--trade-text-muted);">Payout: 95.00%</div>
              </div>
            </div>
            <div class="trade-contract-opt-item ${state.trading.contractType === 'over_under' ? 'active' : ''}" data-ctype="over_under">
              <span style="color:var(--trade-yellow);">📈 📉</span>
              <div>
                <div style="font-weight:700; font-size:0.88rem;">Over / Under</div>
                <div style="font-size:0.72rem; color:var(--trade-text-muted);">Digit target prediction</div>
              </div>
            </div>
            <div class="trade-contract-opt-item ${state.trading.contractType === 'matches_differs' ? 'active' : ''}" data-ctype="matches_differs">
              <span style="color:var(--trade-blue);">= ≠</span>
              <div>
                <div style="font-weight:700; font-size:0.88rem;">Matches / Differs</div>
                <div style="font-size:0.72rem; color:var(--trade-text-muted);">Payout: up to 950%</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Trade Mode (Auto / Manual) -->
        <div class="trade-mode-section">
          <div class="trade-mode-header">
            <span class="trade-mode-title">Trade Mode</span>
            <span class="trade-mode-subtitle" id="trade-mode-hint">Runs until target hit</span>
          </div>

          <div class="trade-mode-toggle-pill">
            <button class="trade-mode-btn ${state.trading.tradeMode === 'auto' ? 'active' : ''}" id="btn-mode-auto">
              Auto
            </button>
            <button class="trade-mode-btn ${state.trading.tradeMode === 'manual' ? 'active' : ''}" id="btn-mode-manual">
              Manual
            </button>
          </div>
        </div>

        <!-- Auto Parameters Rows (Target Profit, Target Loss, Loss Multiple) -->
        <div class="trade-auto-params ${state.trading.tradeMode === 'manual' ? 'hidden' : ''}" id="auto-params-box">
          <!-- Target Profit -->
          <div class="trade-param-row">
            <div class="trade-param-label profit">
              <span class="icon">🎯</span> Target Profit
            </div>
            <div class="trade-param-input-box">
              <span>$</span>
              <input type="number" id="input-target-profit" value="${state.botConfig.targetProfit || 200}" min="1" />
            </div>
          </div>

          <!-- Target Loss -->
          <div class="trade-param-row">
            <div class="trade-param-label loss">
              <span class="icon">⚠️</span> Target Loss
            </div>
            <div class="trade-param-input-box">
              <span>$</span>
              <input type="number" id="input-target-loss" value="${state.botConfig.stopLoss || 999}" min="1" />
            </div>
          </div>

          <!-- Loss Multiple -->
          <div class="trade-param-row">
            <div class="trade-param-label multiple">
              <span class="icon">📉</span> Loss Multiple
            </div>
            <div class="trade-param-input-box">
              <span>×</span>
              <input type="number" id="input-loss-multiple" value="${state.botConfig.multiplier || 2}" min="1" step="0.1" />
            </div>
          </div>
        </div>

        <!-- Manual Parameters Rows (Duration, Stake) -->
        <div class="trade-manual-params ${state.trading.tradeMode === 'auto' ? 'hidden' : ''}" id="manual-params-box">
          <!-- Duration -->
          <div>
            <div class="trade-mode-header" style="margin-bottom:0.35rem;">
              <span class="trade-mode-title">Duration</span>
              <span class="trade-mode-subtitle" id="lbl-duration-val">${state.trading.durationValue} Ticks</span>
            </div>
            <div class="duration-presets">
              ${[1, 2, 3, 5, 10].map(t => `
                <button class="duration-preset-btn ${state.trading.durationValue === t ? 'active' : ''}" data-tickval="${t}">${t} T</button>
              `).join('')}
            </div>
          </div>

          <!-- Stake Amount Input -->
          <div style="margin-top:0.35rem;">
            <div class="trade-mode-header" style="margin-bottom:0.35rem;">
              <span class="trade-mode-title">Stake Amount</span>
              <span class="trade-mode-subtitle">Min $1</span>
            </div>
            <div class="trade-param-row" style="background:var(--trade-bg-input);">
              <div class="trade-param-label">
                <span style="color:var(--trade-teal); font-weight:800;">$</span> Stake
              </div>
              <input type="number" id="input-manual-stake" value="${state.trading.stake || 10}" min="1" step="1" 
                style="background:transparent; border:none; color:#fff; font-family:'JetBrains Mono',monospace; font-weight:800; font-size:1rem; text-align:right; outline:none; width:90px;" />
            </div>
            <div class="stake-quick-chips" style="margin-top:0.4rem;">
              <button class="stake-chip" data-addstake="5">+$5</button>
              <button class="stake-chip" data-addstake="10">+$10</button>
              <button class="stake-chip" data-addstake="25">+$25</button>
              <button class="stake-chip" data-addstake="50">+$50</button>
              <button class="stake-chip" data-addstake="100">+$100</button>
            </div>
          </div>

          <!-- Prediction Target Digit Picker for Over/Under / Matches/Differs -->
          <div id="manual-digit-picker" class="${state.trading.contractType === 'over_under' || state.trading.contractType === 'matches_differs' ? '' : 'hidden'}" style="margin-top:0.35rem;">
            <div class="trade-mode-header" style="margin-bottom:0.35rem;">
              <span class="trade-mode-title">Prediction Digit</span>
              <span class="trade-mode-subtitle" id="lbl-selected-digit">${state.trading.selectedDigit}</span>
            </div>
            <div style="display:grid; grid-template-columns:repeat(5, 1fr); gap:4px;">
              ${[0,1,2,3,4,5,6,7,8,9].map(d => `
                <button class="digit-pick-btn ${state.trading.selectedDigit === d ? 'active' : ''}" data-targetdigit="${d}" style="padding:6px; font-weight:bold; font-size:0.85rem;">${d}</button>
              `).join('')}
            </div>
          </div>
        </div>

        <!-- Big Action Buttons Stack -->
        <div class="trade-action-buttons-stack" id="trade-buttons-stack">
          <!-- Button 1: Even / Higher / Over / Matches -->
          <button class="trade-btn-action-primary" id="btn-action-call">
            <div class="trade-btn-action-label" id="lbl-btn-call">
              <span>▦</span> Even
            </div>
            <div class="trade-btn-action-metric">
              <div class="trade-prob-bar-track">
                <div class="trade-prob-bar-fill-teal"></div>
              </div>
              <span class="trade-prob-pct-teal" id="pct-btn-call">95.22%</span>
            </div>
          </button>

          <!-- Payout Info Row -->
          <div class="trade-payout-info-row">
            <span>Payout</span>
            <span class="trade-payout-info-val" id="lbl-payout-amount">19.52 USD ⓘ</span>
          </div>

          <!-- Button 2: Odd / Lower / Under / Differs -->
          <button class="trade-btn-action-danger" id="btn-action-put">
            <div class="trade-btn-action-label" id="lbl-btn-put">
              <span>△</span> Odd
            </div>
            <div class="trade-btn-action-metric">
              <div class="trade-prob-bar-track">
                <div class="trade-prob-bar-fill-red"></div>
              </div>
              <span class="trade-prob-pct-red" id="pct-btn-put">95.22%</span>
            </div>
          </button>
        </div>
      </aside>
    </div>
  `;

  // Attach dynamic controllers after DOM render
  setTimeout(() => {
    initTradeViewControllers(container);
  }, 0);

  return container;
}

/* ==========================================================================
   INTERACTIVE CONTROLLERS
   ========================================================================== */
function initTradeViewControllers(container) {
  const state = stateManager.getState();

  // 1. Initialize Canvas Chart
  const canvas = container.querySelector('#trading-canvas');
  let chartRenderer = null;
  if (canvas) {
    chartRenderer = new ChartRenderer(canvas);
  }

  // 2. Real-Time Price Listener & Digit Stats Renderer
  const onPriceUpdate = (e) => {
    const { assetId, price, change, tick, lastDigit, stats } = e.detail;
    const currentState = stateManager.getState();
    if (assetId !== currentState.trading.selectedAssetId) return;

    // Update Floating Asset Card
    const livePriceEl = container.querySelector('#asset-live-price');
    const liveChangeEl = container.querySelector('#asset-live-change');
    if (livePriceEl) {
      livePriceEl.textContent = price.toFixed(currentState.markets[assetId]?.decimals || 2);
    }
    if (liveChangeEl) {
      const isUp = change >= 0;
      liveChangeEl.className = `trade-asset-price-delta ${isUp ? 'up' : 'down'}`;
      liveChangeEl.textContent = `${isUp ? '+' : ''}${change.toFixed(2)}% ${isUp ? '📈' : '📉'}`;
    }

    // Render Canvas
    if (chartRenderer) {
      chartRenderer.render(assetId, currentState.openPositions);
    }

    // Render Bottom 10 Digit Chips (0-9)
    renderDigitAnalyzer(container, stats, lastDigit);

    // Refresh Left Sidebar Position Cards & Count
    renderSidebarPositions(container);
  };

  window.addEventListener('betabinary_tick', onPriceUpdate);

  // 3. Trade Mode Switcher (Auto / Manual)
  const btnAuto = container.querySelector('#btn-mode-auto');
  const btnManual = container.querySelector('#btn-mode-manual');
  const autoBox = container.querySelector('#auto-params-box');
  const manualBox = container.querySelector('#manual-params-box');
  const modeHint = container.querySelector('#trade-mode-hint');

  if (btnAuto && btnManual) {
    btnAuto.addEventListener('click', () => {
      btnAuto.classList.add('active');
      btnManual.classList.remove('active');
      autoBox.classList.remove('hidden');
      manualBox.classList.add('hidden');
      modeHint.textContent = 'Runs until target hit';
      stateManager.update(s => { s.trading.tradeMode = 'auto'; });
    });

    btnManual.addEventListener('click', () => {
      btnManual.classList.add('active');
      btnAuto.classList.remove('active');
      manualBox.classList.remove('hidden');
      autoBox.classList.add('hidden');
      modeHint.textContent = 'Single contract trade';
      stateManager.update(s => { s.trading.tradeMode = 'manual'; });
    });
  }

  // 4. Contract Type Selector Dropdown Modal
  const btnContract = container.querySelector('#btn-contract-selector');
  const contractModal = container.querySelector('#contract-picker-modal');

  if (btnContract && contractModal) {
    btnContract.addEventListener('click', (e) => {
      e.stopPropagation();
      contractModal.classList.toggle('hidden');
    });

    container.querySelectorAll('.trade-contract-opt-item').forEach(opt => {
      opt.addEventListener('click', () => {
        const ctype = opt.getAttribute('data-ctype');
        stateManager.update(s => { s.trading.contractType = ctype; });
        updateContractUI(container, ctype);
        contractModal.classList.add('hidden');
      });
    });
  }

  // 5. Asset Selector Modal
  const assetBtn = container.querySelector('#floating-asset-btn');
  const assetModal = container.querySelector('#asset-picker-modal');
  const assetScroll = container.querySelector('#asset-list-scroll');

  if (assetBtn && assetModal && assetScroll) {
    assetBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      assetModal.classList.toggle('hidden');
      renderAssetList(assetScroll, 'all');
    });

    // Asset Category Tabs
    container.querySelectorAll('.asset-cat-btn').forEach(tab => {
      tab.addEventListener('click', (e) => {
        e.stopPropagation();
        container.querySelectorAll('.asset-cat-btn').forEach(b => b.classList.remove('active'));
        tab.classList.add('active');
        renderAssetList(assetScroll, tab.getAttribute('data-cat'));
      });
    });

    // Asset Search Input
    const searchInput = container.querySelector('#asset-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        const q = e.target.value.toLowerCase();
        renderAssetList(assetScroll, 'all', q);
      });
    }
  }

  // 6. Header Navigation Buttons
  container.querySelector('#btn-header-deposit')?.addEventListener('click', () => {
    window.dispatchEvent(new CustomEvent('betabinary_open_modal', { detail: { modal: 'deposit' } }));
  });
  container.querySelector('#hdr-nav-deposit')?.addEventListener('click', () => {
    window.dispatchEvent(new CustomEvent('betabinary_open_modal', { detail: { modal: 'deposit' } }));
  });
  container.querySelector('#hdr-nav-withdraw')?.addEventListener('click', () => {
    window.dispatchEvent(new CustomEvent('betabinary_open_modal', { detail: { modal: 'withdraw' } }));
  });
  container.querySelector('#hdr-nav-chat')?.addEventListener('click', () => {
    window.dispatchEvent(new CustomEvent('betabinary_open_modal', { detail: { modal: 'chat' } }));
  });
  container.querySelector('#hdr-nav-history')?.addEventListener('click', () => {
    const closedTab = container.querySelector('#tab-closed-pos');
    if (closedTab) closedTab.click();
  });

  // 7. Account Switcher (Real / Demo)
  const accPill = container.querySelector('#hdr-account-pill');
  const accMenu = container.querySelector('#account-dropdown-menu');
  if (accPill && accMenu) {
    accPill.addEventListener('click', (e) => {
      e.stopPropagation();
      accMenu.classList.toggle('hidden');
    });

    accMenu.querySelectorAll('.account-card-opt').forEach(opt => {
      opt.addEventListener('click', () => {
        const type = opt.getAttribute('data-acctype');
        stateManager.update(s => { s.user.accountType = type; });
        updateAccountUI(container);
        accMenu.classList.add('hidden');
        window.dispatchEvent(new CustomEvent('betabinary_toast', {
          detail: { type: 'info', message: `Switched to ${type.toUpperCase()} trading account.` }
        }));
      });
    });

    container.querySelector('#btn-reset-demo-bal')?.addEventListener('click', (e) => {
      e.stopPropagation();
      stateManager.update(s => { s.user.demoBalance = 10000; });
      updateAccountUI(container);
      window.dispatchEvent(new CustomEvent('betabinary_toast', {
        detail: { type: 'success', message: 'Demo account balance reset to $10,000.00' }
      }));
    });
  }

  // 8. Close dropdowns on outside click
  document.addEventListener('click', () => {
    if (contractModal) contractModal.classList.add('hidden');
    if (assetModal) assetModal.classList.add('hidden');
    if (accMenu) accMenu.classList.add('hidden');
  });

  // 9. Left Sidebar Tabs (Open / Closed / Transactions)
  container.querySelectorAll('.trade-sidebar-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      container.querySelectorAll('.trade-sidebar-tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderSidebarPositions(container, btn.getAttribute('data-sidebartab'));
    });
  });

  // 10. Manual Controls (Duration & Stake Quick Chips)
  container.querySelectorAll('.duration-preset-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const val = Number(btn.getAttribute('data-tickval'));
      container.querySelectorAll('.duration-preset-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      container.querySelector('#lbl-duration-val').textContent = `${val} Ticks`;
      stateManager.update(s => { s.trading.durationValue = val; });
      recalcPayoutDisplay(container);
    });
  });

  container.querySelectorAll('.stake-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const add = Number(chip.getAttribute('data-addstake'));
      const input = container.querySelector('#input-manual-stake');
      if (input) {
        input.value = (Number(input.value) || 0) + add;
        stateManager.update(s => { s.trading.stake = Number(input.value); });
        recalcPayoutDisplay(container);
      }
    });
  });

  const stakeInput = container.querySelector('#input-manual-stake');
  if (stakeInput) {
    stakeInput.addEventListener('input', () => {
      stateManager.update(s => { s.trading.stake = Math.max(1, Number(stakeInput.value) || 1); });
      recalcPayoutDisplay(container);
    });
  }

  // 11. Target Digit Buttons
  container.querySelectorAll('.digit-pick-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const d = Number(btn.getAttribute('data-targetdigit'));
      container.querySelectorAll('.digit-pick-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const lbl = container.querySelector('#lbl-selected-digit');
      if (lbl) lbl.textContent = d;
      stateManager.update(s => { s.trading.selectedDigit = d; });
      recalcPayoutDisplay(container);
    });
  });

  // 12. Execution Action Buttons (Even/Odd, Call/Put, etc.)
  const btnCall = container.querySelector('#btn-action-call');
  const btnPut = container.querySelector('#btn-action-put');

  if (btnCall && btnPut) {
    btnCall.addEventListener('click', () => handleTradeClick(container, 'CALL'));
    btnPut.addEventListener('click', () => handleTradeClick(container, 'PUT'));
  }

  // Initial State Rendering
  updateContractUI(container, state.trading.contractType);
  renderSidebarPositions(container, 'open');
  recalcPayoutDisplay(container);
}

/* --------------------------------------------------------------------------
   Helper: Trade Execution Handler
   -------------------------------------------------------------------------- */
function handleTradeClick(container, actionDirection) {
  const state = stateManager.getState();
  const ctype = state.trading.contractType;
  let direction = actionDirection;

  if (ctype === 'even_odd') {
    direction = actionDirection === 'CALL' ? 'EVEN' : 'ODD';
  } else if (ctype === 'over_under') {
    direction = actionDirection === 'CALL' ? 'OVER' : 'UNDER';
  } else if (ctype === 'matches_differs') {
    direction = actionDirection === 'CALL' ? 'MATCHES' : 'DIFFERS';
  }

  if (state.trading.tradeMode === 'auto') {
    // Read auto parameters and trigger Auto Trading Bot
    const targetProfit = Number(container.querySelector('#input-target-profit')?.value) || 200;
    const targetLoss = Number(container.querySelector('#input-target-loss')?.value) || 999;
    const multiplier = Number(container.querySelector('#input-loss-multiple')?.value) || 2;

    stateManager.update(s => {
      s.botConfig.targetProfit = targetProfit;
      s.botConfig.stopLoss = targetLoss;
      s.botConfig.multiplier = multiplier;
      s.botConfig.preferredDirection = direction;
    });

    if (autoTradingBot.isRunning) {
      autoTradingBot.stop();
      window.dispatchEvent(new CustomEvent('betabinary_toast', {
        detail: { type: 'warning', message: 'Auto-Trading Bot Stopped.' }
      }));
    } else {
      autoTradingBot.start();
      window.dispatchEvent(new CustomEvent('betabinary_toast', {
        detail: { type: 'success', message: `Auto Bot Started on ${direction}! Target Profit: $${targetProfit}` }
      }));
    }
  } else {
    // Manual Trade Execution
    const trade = tradeEngine.placeTrade({
      direction,
      stake: state.trading.stake || 10,
      contractType: ctype,
      durationTicks: state.trading.durationValue || 5,
      targetDigit: state.trading.selectedDigit || 0
    });

    if (trade) {
      renderSidebarPositions(container, 'open');
      updateAccountUI(container);
    }
  }
}

/* --------------------------------------------------------------------------
   Helper: Render Bottom 10 Digit Chips (0-9)
   -------------------------------------------------------------------------- */
function renderDigitAnalyzer(container, stats, lastDigit) {
  const bar = container.querySelector('#digit-analyzer-bar');
  if (!bar || !stats) return;

  // Find max and min percentages
  let maxPct = -1;
  let minPct = 999;
  for (let i = 0; i <= 9; i++) {
    const pct = stats.percentages[i] || 0;
    if (pct > maxPct) maxPct = pct;
    if (pct < minPct) minPct = pct;
  }

  let html = '';
  for (let d = 0; d <= 9; d++) {
    const pct = stats.percentages[d] || 0;
    const isHot = pct === maxPct;
    const isCold = pct === minPct;
    const isCurrent = d === lastDigit;

    html += `
      <div class="trade-digit-chip ${isHot ? 'hot' : ''} ${isCold ? 'cold' : ''}" data-digit="${d}">
        <div class="trade-digit-chip-num">${d}</div>
        <div class="trade-digit-chip-pct">${pct.toFixed(1)}%</div>
        ${isCurrent ? '<div class="trade-digit-pointer">▼</div>' : ''}
      </div>
    `;
  }
  bar.innerHTML = html;
}

/* --------------------------------------------------------------------------
   Helper: Render Left Sidebar Positions
   -------------------------------------------------------------------------- */
function renderSidebarPositions(container, tab = 'open') {
  const wrapper = container.querySelector('#sidebar-positions-container');
  const countEl = container.querySelector('#count-open-pos');
  const closedCountEl = container.querySelector('#count-closed-pos');
  const footerCountEl = container.querySelector('#footer-open-count');
  if (!wrapper) return;

  const state = stateManager.getState();
  if (countEl) countEl.textContent = state.openPositions.length;
  if (closedCountEl) closedCountEl.textContent = state.tradeHistory.length;
  if (footerCountEl) footerCountEl.textContent = state.openPositions.length;

  if (tab === 'open') {
    if (state.openPositions.length === 0) {
      wrapper.innerHTML = `
        <div class="trade-empty-circle">◎</div>
        <div class="trade-empty-title">No open positions</div>
        <div class="trade-empty-desc">Your active trades will appear here</div>
      `;
    } else {
      wrapper.innerHTML = state.openPositions.map(pos => `
        <div class="trade-pos-item-card">
          <div class="trade-pos-item-header">
            <span class="font-bold text-xs" style="color:var(--trade-teal);">${pos.assetName || 'Volatility 10'}</span>
            <span class="badge badge-brand" style="font-size:0.65rem;">${pos.direction}</span>
          </div>
          <div style="display:flex; justify-content:space-between; font-size:0.75rem; color:var(--trade-text-muted);">
            <span>Stake: <b style="color:#fff;">$${pos.stake.toFixed(2)}</b></span>
            <span>Ticks: <b style="color:var(--trade-teal);">${pos.ticksLeft || 1}</b></span>
          </div>
        </div>
      `).join('');
    }
  } else if (tab === 'closed') {
    if (state.tradeHistory.length === 0) {
      wrapper.innerHTML = `
        <div class="trade-empty-circle">🕒</div>
        <div class="trade-empty-title">No trade history</div>
        <div class="trade-empty-desc">Closed trades will be logged here</div>
      `;
    } else {
      wrapper.innerHTML = state.tradeHistory.slice(0, 15).map(t => {
        const isWin = t.status === 'WON';
        return `
          <div class="trade-pos-item-card" style="border-left:3px solid ${isWin ? 'var(--trade-teal)' : 'var(--trade-red)'};">
            <div class="trade-pos-item-header">
              <span class="font-bold text-xs">${t.direction}</span>
              <span class="font-bold text-xs" style="color:${isWin ? 'var(--trade-teal)' : 'var(--trade-red)'};">
                ${isWin ? `+$${t.profit.toFixed(2)}` : `-$${t.stake.toFixed(2)}`}
              </span>
            </div>
            <div style="font-size:0.7rem; color:var(--trade-text-muted);">
              ${new Date(t.date).toLocaleTimeString()} • ${t.contractType}
            </div>
          </div>
        `;
      }).join('');
    }
  } else {
    // Transactions
    wrapper.innerHTML = state.transactions.slice(0, 10).map(tx => `
      <div class="trade-pos-item-card">
        <div class="trade-pos-item-header">
          <span class="font-bold text-xs">${tx.method}</span>
          <span class="font-bold text-xs text-brand">$${tx.amount.toFixed(2)}</span>
        </div>
        <div style="font-size:0.7rem; color:var(--trade-text-muted);">${tx.type.toUpperCase()} • ${new Date(tx.date).toLocaleDateString()}</div>
      </div>
    `).join('') || '<div class="trade-empty-desc">No transactions yet</div>';
  }
}

/* --------------------------------------------------------------------------
   Helper: Update UI for Selected Contract
   -------------------------------------------------------------------------- */
function updateContractUI(container, ctype) {
  const iconBox = container.querySelector('#contract-icon-box');
  const nameLabel = container.querySelector('#contract-name-label');
  const btnCallLabel = container.querySelector('#lbl-btn-call');
  const btnPutLabel = container.querySelector('#lbl-btn-put');
  const pctCall = container.querySelector('#pct-btn-call');
  const pctPut = container.querySelector('#pct-btn-put');
  const digitPicker = container.querySelector('#manual-digit-picker');

  if (ctype === 'even_odd') {
    if (iconBox) iconBox.innerHTML = '▦ △';
    if (nameLabel) nameLabel.textContent = 'Even/Odd';
    if (btnCallLabel) btnCallLabel.innerHTML = '<span>▦</span> Even';
    if (btnPutLabel) btnPutLabel.innerHTML = '<span>△</span> Odd';
    if (pctCall) pctCall.textContent = '95.22%';
    if (pctPut) pctPut.textContent = '95.22%';
    if (digitPicker) digitPicker.classList.add('hidden');
  } else if (ctype === 'rise_fall') {
    if (iconBox) iconBox.innerHTML = '▲ ▼';
    if (nameLabel) nameLabel.textContent = 'Rise/Fall';
    if (btnCallLabel) btnCallLabel.innerHTML = '<span>▲</span> Higher';
    if (btnPutLabel) btnPutLabel.innerHTML = '<span>▼</span> Lower';
    if (pctCall) pctCall.textContent = '95.00%';
    if (pctPut) pctPut.textContent = '95.00%';
    if (digitPicker) digitPicker.classList.add('hidden');
  } else if (ctype === 'over_under') {
    if (iconBox) iconBox.innerHTML = '📈 📉';
    if (nameLabel) nameLabel.textContent = 'Over/Under';
    if (btnCallLabel) btnCallLabel.innerHTML = '<span>▲</span> Over';
    if (btnPutLabel) btnPutLabel.innerHTML = '<span>▼</span> Under';
    if (pctCall) pctCall.textContent = '120.0%';
    if (pctPut) pctPut.textContent = '120.0%';
    if (digitPicker) digitPicker.classList.remove('hidden');
  } else if (ctype === 'matches_differs') {
    if (iconBox) iconBox.innerHTML = '= ≠';
    if (nameLabel) nameLabel.textContent = 'Matches/Differs';
    if (btnCallLabel) btnCallLabel.innerHTML = '<span>=</span> Matches';
    if (btnPutLabel) btnPutLabel.innerHTML = '<span>≠</span> Differs';
    if (pctCall) pctCall.textContent = '950.0%';
    if (pctPut) pctPut.textContent = '10.50%';
    if (digitPicker) digitPicker.classList.remove('hidden');
  }

  recalcPayoutDisplay(container);
}

/* --------------------------------------------------------------------------
   Helper: Recalculate Payout Display
   -------------------------------------------------------------------------- */
function recalcPayoutDisplay(container) {
  const state = stateManager.getState();
  const stake = state.trading.stake || 10;
  const ctype = state.trading.contractType;
  const payout = calculatePayout(ctype, stake, state.trading.selectedDigit);

  const payoutEl = container.querySelector('#lbl-payout-amount');
  if (payoutEl) {
    payoutEl.textContent = `${payout.totalPayout.toFixed(2)} USD ⓘ`;
  }
}

/* --------------------------------------------------------------------------
   Helper: Update Header Account Balances
   -------------------------------------------------------------------------- */
function updateAccountUI(container) {
  const user = stateManager.getState().user;
  const isReal = user.accountType === 'real';
  const balance = isReal ? user.realBalance : user.demoBalance;

  const badge = container.querySelector('#hdr-acc-badge');
  const balText = container.querySelector('#hdr-balance-text');
  const menuDemo = container.querySelector('#menu-demo-bal');
  const menuReal = container.querySelector('#menu-real-bal');

  if (badge) {
    badge.textContent = isReal ? 'R' : 'D';
    badge.className = `trade-account-type-badge ${isReal ? 'real' : 'demo'}`;
  }
  if (balText) {
    balText.textContent = `$${balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  if (menuDemo) menuDemo.textContent = `$${user.demoBalance.toFixed(2)}`;
  if (menuReal) menuReal.textContent = `$${user.realBalance.toFixed(2)}`;
}

/* --------------------------------------------------------------------------
   Helper: Populate Asset Picker List
   -------------------------------------------------------------------------- */
function renderAssetList(container, category = 'all', query = '') {
  let list = MARKETS_DATA;
  if (category !== 'all') {
    list = list.filter(m => m.category === category);
  }
  if (query) {
    list = list.filter(m => m.name.toLowerCase().includes(query) || m.symbol.toLowerCase().includes(query));
  }

  container.innerHTML = list.map(m => `
    <div class="asset-list-item" data-assetid="${m.id}" style="padding:0.6rem 0.75rem; display:flex; justify-content:space-between; align-items:center; cursor:pointer; border-radius:6px;">
      <div>
        <div style="font-weight:700; font-size:0.85rem; color:#fff;">${m.name}</div>
        <div style="font-size:0.7rem; color:var(--trade-text-muted);">${m.category.toUpperCase()} • ${m.symbol}</div>
      </div>
      <div style="text-align:right;">
        <div class="mono font-bold text-xs" style="color:var(--trade-teal);">95% Payout</div>
      </div>
    </div>
  `).join('');

  container.querySelectorAll('.asset-list-item').forEach(item => {
    item.addEventListener('click', () => {
      const assetId = item.getAttribute('data-assetid');
      stateManager.update(s => { s.trading.selectedAssetId = assetId; });
      const assetModal = document.querySelector('#asset-picker-modal');
      if (assetModal) assetModal.classList.add('hidden');
      const nameEl = document.querySelector('#asset-name-label');
      const selected = MARKETS_DATA.find(m => m.id === assetId);
      if (nameEl && selected) nameEl.textContent = selected.name;
    });
  });
}
