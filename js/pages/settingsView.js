/* ==========================================================================
   BetaBinary - Settings Hub View (settingsView.js)
   ========================================================================== */

import { stateManager } from '../state.js';

export function renderSettingsView(subPage = 'profile') {
  const container = document.createElement('div');
  container.className = 'landing-wrapper';

  const user = stateManager.getState().user;

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
        <a href="#/affiliate">Affiliate</a>
      </nav>

      <div class="flex items-center gap-3">
        <a href="#/trade" class="btn btn-primary btn-sm">&larr; Return to Trading</a>
      </div>
    </header>

    <div class="settings-page-wrapper">
      <div class="settings-header-banner">
        <h1 class="text-3xl font-extrabold">Account Settings</h1>
        <p class="text-secondary text-sm">Manage your security, profile information, and KYC verification.</p>
      </div>

      <div class="settings-layout-grid">
        <!-- Sidebar Navigation -->
        <aside class="settings-sidebar">
          <button class="settings-nav-item ${subPage === 'profile' ? 'active' : ''}" data-sub="profile">
            <span>👤</span> Profile Information
          </button>
          <button class="settings-nav-item ${subPage === 'password' ? 'active' : ''}" data-sub="password">
            <span>🔑</span> Change Password
          </button>
          <button class="settings-nav-item ${subPage === '2fa' ? 'active' : ''}" data-sub="2fa">
            <span>🛡️</span> Two-Factor Auth (2FA)
          </button>
          <button class="settings-nav-item ${subPage === 'verify' ? 'active' : ''}" data-sub="verify">
            <span>📋</span> Identity Verification (KYC)
          </button>
        </aside>

        <!-- Main Tab Content -->
        <main class="settings-card" id="settings-tab-content">
          <!-- Rendered dynamically -->
        </main>
      </div>
    </div>
  `;

  setTimeout(() => {
    initSettingsTabs(container, subPage);
  }, 0);

  return container;
}

function initSettingsTabs(container, initialTab) {
  let activeTab = initialTab;

  function renderTab(tab) {
    activeTab = tab;
    const contentEl = container.querySelector('#settings-tab-content');
    const user = stateManager.getState().user;

    // Update active nav styling
    container.querySelectorAll('.settings-nav-item').forEach(item => {
      if (item.getAttribute('data-sub') === tab) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    if (tab === 'profile') {
      contentEl.innerHTML = `
        <div class="settings-card-header">
          <h2 class="settings-card-title">Profile Settings</h2>
          <p class="settings-card-subtitle">Update your personal and contact details.</p>
        </div>

        <form id="profile-form">
          <div class="form-group">
            <label class="form-label">Display Name</label>
            <input type="text" class="input-field" id="prof-name" value="${user.name}" required />
          </div>

          <div class="form-group">
            <label class="form-label">
              <span>Email Address</span>
              <span class="badge badge-success">Verified</span>
            </label>
            <input type="email" class="input-field text-muted" value="${user.email}" disabled />
            <span class="text-xs text-muted">Email cannot be changed directly. Contact support for assistance.</span>
          </div>

          <div class="form-group">
            <label class="form-label">Phone Number (M-Pesa)</label>
            <input type="tel" class="input-field mono" id="prof-phone" value="${user.phone}" />
          </div>

          <div class="form-group">
            <label class="form-label">Preferred Currency</label>
            <select class="input-field" id="prof-currency">
              <option value="USD" ${user.currency === 'USD' ? 'selected' : ''}>USD ($ - United States Dollar)</option>
              <option value="KES" ${user.currency === 'KES' ? 'selected' : ''}>KES (KSh - Kenyan Shilling)</option>
            </select>
          </div>

          <button type="submit" class="btn btn-primary" style="margin-top:1rem;">Save Profile Changes</button>
        </form>
      `;

      contentEl.querySelector('#profile-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const name = contentEl.querySelector('#prof-name').value;
        const phone = contentEl.querySelector('#prof-phone').value;
        const currency = contentEl.querySelector('#prof-currency').value;

        stateManager.update(s => {
          s.user.name = name;
          s.user.phone = phone;
          s.user.currency = currency;
        });

        window.dispatchEvent(new CustomEvent('betabinary_toast', {
          detail: { type: 'success', message: 'Profile information updated successfully!' }
        }));
      });

    } else if (tab === 'password') {
      contentEl.innerHTML = `
        <div class="settings-card-header">
          <h2 class="settings-card-title">Change Password</h2>
          <p class="settings-card-subtitle">Keep your trading account secure with a strong password.</p>
        </div>

        <form id="password-form">
          <div class="form-group">
            <label class="form-label">Current Password</label>
            <input type="password" class="input-field" placeholder="••••••••••••" required />
          </div>

          <div class="form-group">
            <label class="form-label">New Password</label>
            <input type="password" class="input-field" id="new-pw" placeholder="Enter at least 8 characters" required />
          </div>

          <div class="form-group">
            <label class="form-label">Confirm New Password</label>
            <input type="password" class="input-field" id="confirm-pw" placeholder="Repeat new password" required />
          </div>

          <div style="background:#090e18; padding:1rem; border-radius:var(--radius-md); border:1px solid var(--border-subtle);">
            <div class="text-xs font-bold text-muted" style="text-transform:uppercase; margin-bottom:0.5rem;">Password Requirements:</div>
            <ul class="text-xs text-secondary" style="padding-left:1.2rem; display:flex; flex-direction:column; gap:0.25rem;">
              <li>At least 8 characters long</li>
              <li>Include at least one uppercase letter</li>
              <li>Include at least one number and special character</li>
            </ul>
          </div>

          <button type="submit" class="btn btn-primary" style="margin-top:1rem;">Update Password</button>
        </form>
      `;

      contentEl.querySelector('#password-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const np = contentEl.querySelector('#new-pw').value;
        const cp = contentEl.querySelector('#confirm-pw').value;

        if (np !== cp) {
          window.dispatchEvent(new CustomEvent('betabinary_toast', {
            detail: { type: 'danger', message: 'Passwords do not match. Please try again.' }
          }));
          return;
        }

        window.dispatchEvent(new CustomEvent('betabinary_toast', {
          detail: { type: 'success', message: 'Account password updated successfully!' }
        }));
        contentEl.querySelector('#password-form').reset();
      });

    } else if (tab === '2fa') {
      contentEl.innerHTML = `
        <div class="settings-card-header">
          <h2 class="settings-card-title">Two-Factor Authentication (2FA)</h2>
          <p class="settings-card-subtitle">Protect your account with Google Authenticator, Authy, or Microsoft Authenticator.</p>
        </div>

        <div class="qr-code-box">
          <div class="text-sm font-bold">1. Scan QR Code in Authenticator App</div>
          
          <!-- Mock QR Code with clean SVG -->
          <div class="qr-canvas-mock">
            <svg viewBox="0 0 100 100" width="140" height="140">
              <rect width="100" height="100" fill="#ffffff" />
              <rect x="10" y="10" width="30" height="30" fill="#000000" />
              <rect x="15" y="15" width="20" height="20" fill="#ffffff" />
              <rect x="20" y="20" width="10" height="10" fill="#000000" />
              
              <rect x="60" y="10" width="30" height="30" fill="#000000" />
              <rect x="65" y="15" width="20" height="20" fill="#ffffff" />
              <rect x="70" y="20" width="10" height="10" fill="#000000" />

              <rect x="10" y="60" width="30" height="30" fill="#000000" />
              <rect x="15" y="65" width="20" height="20" fill="#ffffff" />
              <rect x="20" y="70" width="10" height="10" fill="#000000" />

              <rect x="50" y="50" width="10" height="10" fill="#000000" />
              <rect x="65" y="60" width="15" height="10" fill="#000000" />
              <rect x="50" y="75" width="25" height="15" fill="#000000" />
              <rect x="80" y="80" width="10" height="10" fill="#000000" />
            </svg>
          </div>

          <div class="text-xs text-muted">Or enter secret key manually:</div>
          <div class="secret-key-display">
            <span>BETA-9472-X9K1-Q88M</span>
            <button class="btn btn-ghost btn-sm text-xs" onclick="navigator.clipboard.writeText('BETA-9472-X9K1-Q88M'); alert('Key copied to clipboard!');">📋 Copy</button>
          </div>
        </div>

        <form id="twofa-form">
          <div class="form-group">
            <label class="form-label">2. Enter 6-Digit Verification Code</label>
            <input type="text" class="input-field mono font-bold text-center text-xl" maxlength="6" placeholder="000 000" required style="letter-spacing:0.3em;" />
          </div>

          <button type="submit" class="btn btn-primary w-full">Verify & Enable 2FA</button>
        </form>
      `;

      contentEl.querySelector('#twofa-form').addEventListener('submit', (e) => {
        e.preventDefault();
        stateManager.update(s => { s.user.is2FaEnabled = true; });
        window.dispatchEvent(new CustomEvent('betabinary_toast', {
          detail: { type: 'success', message: 'Two-Factor Authentication (2FA) is now ACTIVE!' }
        }));
      });

    } else if (tab === 'verify') {
      contentEl.innerHTML = `
        <div class="settings-card-header">
          <h2 class="settings-card-title">Identity Verification (KYC)</h2>
          <p class="settings-card-subtitle">Verify your identity to unlock unrestricted withdrawals and high-tier limits.</p>
        </div>

        <div class="kyc-status-banner">
          <span style="font-size:1.5rem;">✅</span>
          <div>
            <div class="font-bold">Account Verified (Level 2)</div>
            <div class="text-xs text-secondary">Your identity documents have been approved. You have full access to high-volume trading and instant withdrawals.</div>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Document Type</label>
          <select class="input-field">
            <option>National ID (Kenya)</option>
            <option>International Passport</option>
            <option>Driving License</option>
          </select>
        </div>

        <div class="kyc-upload-dropzone" onclick="alert('Document upload simulated: ID file attached successfully!')">
          <span style="font-size:2rem;">📁</span>
          <div class="font-bold text-sm">Click or Drag & Drop ID Documents</div>
          <div class="text-xs text-muted">Supports JPG, PNG, PDF up to 10MB (Front & Back)</div>
        </div>

        <button class="btn btn-secondary" onclick="alert('Documents re-submitted for compliance review.')">Re-submit Updated KYC</button>
      `;
    }
  }

  // Sidebar navigation bindings
  container.querySelectorAll('.settings-nav-item').forEach(btn => {
    btn.addEventListener('click', () => {
      const sub = btn.getAttribute('data-sub');
      location.hash = `#/settings/${sub}`;
      renderTab(sub);
    });
  });

  renderTab(initialTab);
}
