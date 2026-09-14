/* ==========================================================================
   BetaBinary - Authentication Views (authView.js)
   ========================================================================== */

export function renderAuthView(mode = 'login') {
  const container = document.createElement('div');
  container.className = 'auth-page-wrapper';

  const isLogin = mode === 'login';

  container.innerHTML = `
    <div class="auth-card-container">
      <div class="auth-header">
        <a href="#/" class="auth-logo">
          <div class="trade-logo-icon">β</div>
          Beta<span>Binary</span>
        </a>
        <h1 class="auth-title">${isLogin ? 'Welcome Back' : 'Create Your Account'}</h1>
        <p class="auth-subtitle">
          ${isLogin 
            ? 'Sign in to access your portfolio and trade global markets.' 
            : 'Get started in seconds — no initial verification required.'}
        </p>
      </div>

      <form id="auth-form" class="flex flex-col gap-3">
        ${!isLogin ? `
          <div class="form-group" style="margin-bottom:0.25rem;">
            <label class="form-label">Full Name</label>
            <input type="text" class="input-field" placeholder="e.g. Kiprono Mutai" required />
          </div>
        ` : ''}

        <div class="form-group" style="margin-bottom:0.25rem;">
          <label class="form-label">Email Address</label>
          <input type="email" class="input-field" placeholder="trader@betabinary.ke" required />
        </div>

        <div class="form-group" style="margin-bottom:0.25rem;">
          <label class="form-label">
            <span>Password</span>
            ${isLogin ? `<a href="#/login" class="text-xs text-brand" onclick="alert('Password reset link sent to your registered email.')">Forgot password?</a>` : ''}
          </label>
          <input type="password" class="input-field" placeholder="••••••••••••" required />
        </div>

        ${!isLogin ? `
          <div class="form-group" style="margin-bottom:0.25rem;">
            <label class="form-label">Referral Code (Optional)</label>
            <input type="text" id="referral-input" class="input-field mono" placeholder="e.g. BETA9920" />
          </div>
        ` : ''}

        <button type="submit" class="btn btn-primary btn-lg w-full" style="margin-top:0.5rem;">
          ${isLogin ? 'Sign In & Trade &rarr;' : 'Create Free Account &rarr;'}
        </button>
      </form>

      <div class="auth-divider">Or continue with</div>

      <div class="social-login-grid">
        <button class="btn btn-secondary btn-sm" onclick="location.hash='#/trade'">
          <span>🌐</span> Google
        </button>
        <button class="btn btn-secondary btn-sm" onclick="location.hash='#/trade'">
          <span>📱</span> M-Pesa Login
        </button>
      </div>

      <div class="text-center text-xs text-secondary" style="margin-top:0.5rem;">
        ${isLogin 
          ? `Don't have an account? <a href="#/register" class="text-brand font-bold">Sign up free</a>` 
          : `Already have an account? <a href="#/login" class="text-brand font-bold">Log in</a>`}
      </div>

      <div class="text-center">
        <a href="#/trade" class="text-xs text-muted hover:text-brand" style="text-decoration:underline;">
          Skip to $10,000 Demo Terminal &rarr;
        </a>
      </div>
    </div>
  `;

  setTimeout(() => {
    // Check if referral code is in URL (e.g. ?ref=... or #/register?ref=...)
    const urlParams = new URLSearchParams(window.location.search);
    const hashParams = window.location.hash.includes('?') ? new URLSearchParams(window.location.hash.split('?')[1]) : null;
    const refCode = urlParams.get('ref') || (hashParams ? hashParams.get('ref') : '');
    const refInput = container.querySelector('#referral-input');
    if (refInput && refCode) {
      refInput.value = refCode;
      refInput.classList.add('border-brand');
    }

    const form = container.querySelector('#auth-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent('betabinary_toast', {
          detail: { type: 'success', message: `${isLogin ? 'Signed in successfully!' : 'Account registered successfully!'}` }
        }));
        location.hash = '#/trade';
      });
    }
  }, 0);

  return container;
}
