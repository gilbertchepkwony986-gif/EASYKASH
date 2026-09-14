/* ==========================================================================
   BetaBinary - Affiliate & Referral Program View (affiliate.js)
   ========================================================================== */

import { stateManager } from '../state.js';

export function renderAffiliateView() {
  const container = document.createElement('div');
  container.className = 'landing-wrapper';

  const user = stateManager.getState().user;
  const referralLink = `${window.location.origin}/#/register?ref=${user.referralCode}`;

  container.innerHTML = `
    <!-- Top Nav Header -->
    <header class="landing-nav">
      <a href="#/" class="trade-logo">
        <div class="trade-logo-icon">β</div>
        Beta<span>Binary</span>
      </a>

      <nav class="landing-nav-links">
        <a href="#/trade">Trading Terminal</a>
        <a href="#/leaderboard">Leaderboard</a>
        <a href="#/affiliate" style="color:var(--color-brand);">Affiliate</a>
        <a href="#/settings">Settings</a>
      </nav>

      <div class="flex items-center gap-3">
        <a href="#/trade" class="btn btn-primary btn-sm">Trade Now &rarr;</a>
      </div>
    </header>

    <div class="settings-page-wrapper">
      <div class="settings-header-banner">
        <h1 class="text-3xl font-extrabold">BetaBinary Affiliate Program</h1>
        <p class="text-secondary text-sm">Earn up to 40% lifetime revenue share on every trade executed by your referrals.</p>
      </div>

      <!-- Affiliate Stats Overview -->
      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:1.25rem; margin-bottom:2rem;">
        <div class="feature-card" style="padding:1.5rem;">
          <div class="text-xs text-muted font-bold uppercase">Total Referrals</div>
          <div class="font-mono text-3xl font-extrabold text-brand" style="margin-top:0.35rem;">${user.referralCount} Traders</div>
          <div class="text-xs text-success" style="margin-top:0.25rem;">+2 this week</div>
        </div>

        <div class="feature-card" style="padding:1.5rem;">
          <div class="text-xs text-muted font-bold uppercase">Available Earnings</div>
          <div class="font-mono text-3xl font-extrabold text-success" style="margin-top:0.35rem;">$${user.referralEarnings.toFixed(2)}</div>
          <div class="text-xs text-muted" style="margin-top:0.25rem;">KES ${(user.referralEarnings * user.exchangeRate).toLocaleString()}</div>
        </div>

        <div class="feature-card" style="padding:1.5rem;">
          <div class="text-xs text-muted font-bold uppercase">Commission Rate</div>
          <div class="font-mono text-3xl font-extrabold text-warning" style="margin-top:0.35rem;">40%</div>
          <div class="text-xs text-muted" style="margin-top:0.25rem;">Tier 3 VIP Partner</div>
        </div>

        <div class="feature-card" style="padding:1.5rem; display:flex; flex-direction:column; justify-content:center;">
          <button class="btn btn-success w-full" onclick="alert('Withdrawal of $${user.referralEarnings.toFixed(2)} affiliate earnings initiated to your Real M-Pesa balance!')">
            Claim Earnings to Real Wallet
          </button>
        </div>
      </div>

      <!-- Referral Link Box -->
      <div class="settings-card" style="margin-bottom:2rem;">
        <div class="settings-card-header">
          <h2 class="settings-card-title">Your Unique Referral Link</h2>
          <p class="settings-card-subtitle">Share this link across WhatsApp, Telegram, YouTube, and social media to start earning.</p>
        </div>

        <div class="flex gap-2 items-center flex-wrap">
          <input type="text" class="input-field mono font-semibold flex-1" value="${referralLink}" readonly />
          <button class="btn btn-primary" onclick="navigator.clipboard.writeText('${referralLink}'); alert('Affiliate referral link copied to clipboard!');">
            📋 Copy Link
          </button>
        </div>
      </div>

      <!-- Commission Tiers Breakdown -->
      <div class="settings-card">
        <div class="settings-card-header">
          <h2 class="settings-card-title">Partnership Tiers</h2>
          <p class="settings-card-subtitle">Unlock higher commissions as your referral trading volume grows.</p>
        </div>

        <div class="grid" style="grid-template-columns:repeat(auto-fit, minmax(240px, 1fr)); gap:1rem;">
          <div style="background:#090e18; padding:1.25rem; border-radius:var(--radius-md); border:1px solid var(--border-subtle);">
            <span class="badge badge-brand">Tier 1 • Starter</span>
            <div class="font-bold text-xl text-primary" style="margin:0.5rem 0;">25% Revenue Share</div>
            <div class="text-xs text-secondary">1 to 5 Active Traders</div>
          </div>

          <div style="background:#090e18; padding:1.25rem; border-radius:var(--radius-md); border:1px solid var(--border-subtle);">
            <span class="badge badge-info">Tier 2 • Pro</span>
            <div class="font-bold text-xl text-primary" style="margin:0.5rem 0;">32% Revenue Share</div>
            <div class="text-xs text-secondary">6 to 20 Active Traders</div>
          </div>

          <div style="background:#090e18; padding:1.25rem; border-radius:var(--radius-md); border:1px solid rgba(16, 185, 129, 0.4);">
            <span class="badge badge-success">Tier 3 • VIP Elite</span>
            <div class="font-bold text-xl text-success" style="margin:0.5rem 0;">40% Revenue Share</div>
            <div class="text-xs text-secondary">21+ Active Traders + Instant Payouts</div>
          </div>
        </div>
      </div>
    </div>
  `;

  return container;
}
