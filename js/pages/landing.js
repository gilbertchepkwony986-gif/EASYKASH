/* ==========================================================================
   BetaBinary - Landing Page View (landing.js)
   ========================================================================== */

import { MARKETS_DATA } from '../state.js';
import { priceEngine } from '../engine.js';

export function renderLandingView() {
  const container = document.createElement('div');
  container.className = 'landing-wrapper';

  container.innerHTML = `
    <!-- Top Landing Header -->
    <header class="landing-nav">
      <a href="#/" class="trade-logo">
        <div class="trade-logo-icon">β</div>
        Beta<span>Binary</span>
      </a>

      <nav class="landing-nav-links">
        <a href="#/trade">Trading Terminal</a>
        <a href="#/markets">Markets</a>
        <a href="#/leaderboard">Leaderboard</a>
        <a href="#/affiliate">Affiliate (40%)</a>
        <a href="#/settings">Settings</a>
      </nav>

      <div class="flex items-center gap-3">
        <a href="#/login" class="btn btn-ghost">Log In</a>
        <a href="#/trade" class="btn btn-primary">Start Trading &rarr;</a>
      </div>
    </header>

    <!-- Hero Section -->
    <section class="hero-section">
      <div class="hero-pill-badge">
        <span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:#10b981;"></span>
        NEW: Instant M-Pesa STK Push & 950% Payouts
      </div>

      <h1 class="hero-headline">
        Trade Smarter. <span>Profit Faster.</span>
      </h1>

      <p class="hero-subheadline">
        Access 100+ global markets with lightning-fast execution. Trade forex, volatility synthetics, crypto & commodities with payouts up to 950%.
      </p>

      <div class="hero-actions">
        <a href="#/trade" class="btn btn-primary btn-lg">Trade on $10,000 Demo</a>
        <a href="#/register" class="btn btn-secondary btn-lg">Create Real Account</a>
      </div>

      <!-- Quick Stats Card Grid -->
      <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem; max-width: 900px; width:100%;">
        <div class="feature-card" style="padding: 1.25rem; text-align:center;">
          <div class="font-extrabold text-2xl text-brand mono">950%</div>
          <div class="text-xs text-secondary font-medium">MAX PAYOUT</div>
        </div>
        <div class="feature-card" style="padding: 1.25rem; text-align:center;">
          <div class="font-extrabold text-2xl text-success mono">&lt; 100ms</div>
          <div class="text-xs text-secondary font-medium">EXECUTION SPEED</div>
        </div>
        <div class="feature-card" style="padding: 1.25rem; text-align:center;">
          <div class="font-extrabold text-2xl text-warning mono">Instant</div>
          <div class="text-xs text-secondary font-medium">M-PESA WITHDRAWALS</div>
        </div>
        <div class="feature-card" style="padding: 1.25rem; text-align:center;">
          <div class="font-extrabold text-2xl text-primary mono">100+</div>
          <div class="text-xs text-secondary font-medium">GLOBAL MARKETS</div>
        </div>
      </div>
    </section>

    <!-- Live Market Ticker Ribbon -->
    <div class="market-ticker-ribbon">
      <div class="ticker-track" id="landing-ticker-track">
        ${MARKETS_DATA.map(m => `
          <div class="ticker-item" id="ticker-${m.id}">
            <span class="ticker-symbol">${m.symbol}</span>
            <span class="ticker-price text-brand" id="ticker-price-${m.id}">$${m.basePrice.toFixed(m.precision)}</span>
            <span class="badge badge-success">+${m.payout}%</span>
          </div>
        `).join('')}
      </div>
    </div>

    <!-- Features Section -->
    <section class="features-section">
      <div class="section-header">
        <h2 class="section-title">Built for Serious Traders</h2>
        <p class="section-subtitle">Everything you need to trade high-frequency binary options with confidence and precision.</p>
      </div>

      <div class="features-grid">
        <div class="feature-card">
          <div class="feature-icon-box">⚡</div>
          <h3 class="feature-card-title">Continuous Synthetic Indices</h3>
          <p class="feature-card-desc">Trade Volatility, Boom, Crash, and Step indices 24/7/365 without weekend market closures or bank holidays.</p>
        </div>

        <div class="feature-card">
          <div class="feature-icon-box">📱</div>
          <h3 class="feature-card-title">M-Pesa STK Push Express</h3>
          <p class="feature-card-desc">Deposit and cash out directly using your Safaricom or Airtel mobile phone in Kenyan Shillings or USD instantly.</p>
        </div>

        <div class="feature-card">
          <div class="feature-icon-box">🤖</div>
          <h3 class="feature-card-title">Automated Trading Bots</h3>
          <p class="feature-card-desc">Deploy Martingale, D'Alembert, and algorithmic bots with automated risk guards, target profits, and stop-losses.</p>
        </div>

        <div class="feature-card">
          <div class="feature-icon-box">🎯</div>
          <h3 class="feature-card-title">High-Payout Digit Contracts</h3>
          <p class="feature-card-desc">Trade Even/Odd, Over/Under, and exact Matches/Differs contracts with mathematically superior payouts up to 950%.</p>
        </div>

        <div class="feature-card">
          <div class="feature-icon-box">📊</div>
          <h3 class="feature-card-title">Real-Time Frequency Analyzer</h3>
          <p class="feature-card-desc">Inspect live digit frequency distributions and tick patterns directly within the trading terminal viewport.</p>
        </div>

        <div class="feature-card">
          <div class="feature-icon-box">🛡️</div>
          <h3 class="feature-card-title">Bank-Grade Security & 2FA</h3>
          <p class="feature-card-desc">Full 2FA authenticator app integration, SSL end-to-end encryption, and automated KYC verification.</p>
        </div>
      </div>
    </section>

    <!-- Three Step Guide -->
    <section class="steps-section">
      <div class="section-header">
        <h2 class="section-title">Three Steps to Your First Trade</h2>
        <p class="section-subtitle">Get up and running in under 60 seconds.</p>
      </div>

      <div class="steps-grid">
        <div class="step-card">
          <div class="step-num-badge">1</div>
          <h3 class="font-bold text-lg">Create Free Account</h3>
          <p class="text-secondary text-sm">Sign up with your email. Instant access to your reloadable $10,000 demo account.</p>
        </div>

        <div class="step-card">
          <div class="step-num-badge">2</div>
          <h3 class="font-bold text-lg">Deposit via M-Pesa or Crypto</h3>
          <p class="text-secondary text-sm">Fund with as little as $5 via M-Pesa STK Push or USDT with zero deposit fees.</p>
        </div>

        <div class="step-card">
          <div class="step-num-badge">3</div>
          <h3 class="font-bold text-lg">Execute & Cash Out</h3>
          <p class="text-secondary text-sm">Predict price movements in ticks or seconds, collect profits, and withdraw instantly.</p>
        </div>
      </div>
    </section>

    <!-- Testimonials -->
    <section class="testimonials-section">
      <div class="section-header">
        <h2 class="section-title">Trusted by Traders Across Africa</h2>
        <p class="section-subtitle">See what our community members have to say.</p>
      </div>

      <div class="testimonials-grid">
        <div class="testimonial-card">
          <p class="text-secondary text-sm italic">"The M-Pesa STK push integration makes depositing and withdrawing effortless in Nairobi. Execution on Volatility 75 is instantaneous!"</p>
          <div class="testimonial-user">
            <div class="user-avatar-circle">EK</div>
            <div>
              <div class="font-bold text-sm">Evans Kiprop</div>
              <div class="text-xs text-muted">Nairobi, Kenya • Verified Trader</div>
            </div>
          </div>
        </div>

        <div class="testimonial-card">
          <p class="text-secondary text-sm italic">"The automated Martingale bot helped me scale my synthetic index trades consistently. The 950% payout on digit matching is unmatched."</p>
          <div class="testimonial-user">
            <div class="user-avatar-circle">BO</div>
            <div>
              <div class="font-bold text-sm">Brian Omwamba</div>
              <div class="text-xs text-muted">Mombasa, Kenya • Pro Trader</div>
            </div>
          </div>
        </div>

        <div class="testimonial-card">
          <p class="text-secondary text-sm italic">"Smooth candlestick charts and the live digit frequency analyzer make technical analysis a breeze. Truly best binary terminal in the region."</p>
          <div class="testimonial-user">
            <div class="user-avatar-circle">WM</div>
            <div>
              <div class="font-bold text-sm">Wanjiku Mwangi</div>
              <div class="text-xs text-muted">Nakuru, Kenya • Scalper</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Banner -->
    <section class="cta-banner-section">
      <div class="cta-card">
        <h2 class="text-3xl font-extrabold">Ready to Start Trading?</h2>
        <p class="text-secondary max-w-md">Practice risk-free with $10,000 virtual funds or start trading real markets today.</p>
        <div class="flex gap-4">
          <a href="#/trade" class="btn btn-primary btn-lg">Launch Terminal</a>
          <a href="#/register" class="btn btn-outline btn-lg">Sign Up Now</a>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="landing-footer">
      <div class="footer-container">
        <div>
          <a href="#/" class="trade-logo" style="margin-bottom: 1rem; display:inline-flex;">
            <div class="trade-logo-icon">β</div>
            Beta<span>Binary</span>
          </a>
          <p class="text-xs text-muted" style="line-height: 1.6; max-width: 320px;">
            BetaBinary is an advanced digital contracts and binary options trading platform providing next-generation charting, high-frequency execution, and automated bot strategies.
          </p>
        </div>

        <div>
          <h4 class="footer-col-title">Platform</h4>
          <div class="footer-links-list">
            <a href="#/trade">Trading Terminal</a>
            <a href="#/leaderboard">Top Traders</a>
            <a href="#/affiliate">Affiliate Program</a>
            <a href="#/trade">Auto-Trading Bots</a>
          </div>
        </div>

        <div>
          <h4 class="footer-col-title">Markets</h4>
          <div class="footer-links-list">
            <a href="#/trade">Volatility Indices</a>
            <a href="#/trade">Boom & Crash</a>
            <a href="#/trade">Forex Pairs</a>
            <a href="#/trade">Cryptocurrency</a>
          </div>
        </div>

        <div>
          <h4 class="footer-col-title">Account</h4>
          <div class="footer-links-list">
            <a href="#/settings/profile">Profile Settings</a>
            <a href="#/settings/2fa">Security & 2FA</a>
            <a href="#/settings/verify">KYC Verification</a>
            <a href="#/login">Client Sign In</a>
          </div>
        </div>
      </div>

      <div class="footer-disclaimer">
        <p>
          <strong>Risk Disclaimer:</strong> Trading digital contracts and high-frequency binary options carries a high level of risk and may not be suitable for all investors. You should ensure that you fully understand the risks involved and take into consideration your level of experience before trading.
        </p>
        <p style="margin-top: 0.5rem; text-align: center; color: var(--text-muted);">
          &copy; ${new Date().getFullYear()} BetaBinary. All rights reserved.
        </p>
      </div>
    </footer>
  `;

  return container;
}
