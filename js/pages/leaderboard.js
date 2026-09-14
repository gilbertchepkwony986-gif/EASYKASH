/* ==========================================================================
   BetaBinary - Leaderboard & Tournaments View (leaderboard.js)
   ========================================================================== */

export function renderLeaderboardView() {
  const container = document.createElement('div');
  container.className = 'landing-wrapper';

  const LEADERBOARD_DATA = [
    { rank: 1, name: 'Dennis K. (Nairobi)', profit: 14850.20, trades: 312, winRate: 84, badge: '👑 Master' },
    { rank: 2, name: 'Kiprono M. (Eldoret)', profit: 11240.50, trades: 240, winRate: 81, badge: '⚡ Pro' },
    { rank: 3, name: 'Faith W. (Nakuru)', profit: 9840.00, trades: 198, winRate: 79, badge: '⚡ Pro' },
    { rank: 4, name: 'Hassan A. (Mombasa)', profit: 8450.10, trades: 184, winRate: 77, badge: '🎯 Scalper' },
    { rank: 5, name: 'John O. (Kisumu)', profit: 7120.00, trades: 160, winRate: 76, badge: '🎯 Scalper' },
    { rank: 6, name: 'Sarah K. (Nairobi)', profit: 6420.80, trades: 145, winRate: 74, badge: 'Trader' },
    { rank: 7, name: 'Emmanuel T. (Kampala)', profit: 5310.00, trades: 120, winRate: 72, badge: 'Trader' },
    { rank: 8, name: 'David B. (Dar es Salaam)', profit: 4890.50, trades: 110, winRate: 71, badge: 'Trader' }
  ];

  container.innerHTML = `
    <!-- Top Nav Header -->
    <header class="landing-nav">
      <a href="#/" class="trade-logo">
        <div class="trade-logo-icon">β</div>
        Beta<span>Binary</span>
      </a>

      <nav class="landing-nav-links">
        <a href="#/trade">Trading Terminal</a>
        <a href="#/leaderboard" style="color:var(--color-brand);">Leaderboard</a>
        <a href="#/affiliate">Affiliate</a>
        <a href="#/settings">Settings</a>
      </nav>

      <div class="flex items-center gap-3">
        <a href="#/trade" class="btn btn-primary btn-sm">Trade Now &rarr;</a>
      </div>
    </header>

    <div class="settings-page-wrapper">
      <div class="settings-header-banner flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 class="text-3xl font-extrabold">Traders Leaderboard</h1>
          <p class="text-secondary text-sm">Top performers across synthetic volatility indices and forex pairs.</p>
        </div>
        <div class="badge badge-success text-sm" style="padding:0.5rem 1rem;">
          🏆 Weekly Prize Pool: $5,000 USD (KES 650,000)
        </div>
      </div>

      <!-- Top 3 Podium Cards -->
      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(260px, 1fr)); gap:1.25rem; margin-bottom:2rem;">
        <div class="feature-card" style="border-color:rgba(245, 158, 11, 0.4); text-align:center; padding:1.5rem;">
          <div style="font-size:2.5rem;">🥇</div>
          <div class="badge badge-warning" style="margin:0.5rem auto;">RANK #1</div>
          <h3 class="font-bold text-lg">${LEADERBOARD_DATA[0].name}</h3>
          <div class="font-mono text-2xl font-extrabold text-success" style="margin:0.5rem 0;">+$${LEADERBOARD_DATA[0].profit.toLocaleString()}</div>
          <div class="text-xs text-muted">Win Rate: ${LEADERBOARD_DATA[0].winRate}% • ${LEADERBOARD_DATA[0].trades} Trades</div>
        </div>

        <div class="feature-card" style="border-color:rgba(148, 163, 184, 0.4); text-align:center; padding:1.5rem;">
          <div style="font-size:2.5rem;">🥈</div>
          <div class="badge badge-info" style="margin:0.5rem auto;">RANK #2</div>
          <h3 class="font-bold text-lg">${LEADERBOARD_DATA[1].name}</h3>
          <div class="font-mono text-2xl font-extrabold text-success" style="margin:0.5rem 0;">+$${LEADERBOARD_DATA[1].profit.toLocaleString()}</div>
          <div class="text-xs text-muted">Win Rate: ${LEADERBOARD_DATA[1].winRate}% • ${LEADERBOARD_DATA[1].trades} Trades</div>
        </div>

        <div class="feature-card" style="border-color:rgba(180, 83, 9, 0.4); text-align:center; padding:1.5rem;">
          <div style="font-size:2.5rem;">🥉</div>
          <div class="badge badge-brand" style="margin:0.5rem auto;">RANK #3</div>
          <h3 class="font-bold text-lg">${LEADERBOARD_DATA[2].name}</h3>
          <div class="font-mono text-2xl font-extrabold text-success" style="margin:0.5rem 0;">+$${LEADERBOARD_DATA[2].profit.toLocaleString()}</div>
          <div class="text-xs text-muted">Win Rate: ${LEADERBOARD_DATA[2].winRate}% • ${LEADERBOARD_DATA[2].trades} Trades</div>
        </div>
      </div>

      <!-- Rankings Table -->
      <div class="settings-card" style="padding:1rem;">
        <table class="trade-history-table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Trader</th>
              <th>Status Badge</th>
              <th>Win Rate</th>
              <th>Total Trades</th>
              <th>Net Profit</th>
            </tr>
          </thead>
          <tbody>
            ${LEADERBOARD_DATA.map(tr => `
              <tr>
                <td class="font-bold ${tr.rank === 1 ? 'text-warning' : (tr.rank === 2 ? 'text-primary' : (tr.rank === 3 ? 'text-brand' : 'text-muted'))}">
                  #${tr.rank}
                </td>
                <td class="font-semibold text-primary">${tr.name}</td>
                <td><span class="badge badge-brand">${tr.badge}</span></td>
                <td class="font-bold text-success">${tr.winRate}%</td>
                <td class="text-muted">${tr.trades}</td>
                <td class="font-bold text-success">+$${tr.profit.toLocaleString()}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;

  return container;
}
