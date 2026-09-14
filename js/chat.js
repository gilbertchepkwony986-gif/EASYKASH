/* ==========================================================================
   BetaBinary - Live Support Chat Widget (chat.js)
   ========================================================================== */

import { stateManager } from './state.js';

const QUICK_RESPONSES = {
  mpesa: 'To deposit via M-Pesa: Click the green Deposit button, select M-Pesa, enter your phone number and USD/KES amount, then confirm the STK PIN prompt on your phone. Deposits reflect in seconds!',
  withdraw: 'Withdrawals are processed automatically. M-Pesa withdrawals typically arrive within 5 to 15 minutes. USDT withdrawals take 1-3 network confirmations.',
  bot: 'You can automate your trading using our built-in Auto-Trading Bot! Select Martingale or D\'Alembert, set your Base Stake and Target Profit, and start the bot.',
  digits: 'Digit trading lets you predict the last digit of the exit tick price! Options include Even/Odd (95% return), Over/Under, and Matches (up to 950% payout).',
  kyc: 'To verify your identity, head to Settings > Verification and submit your National ID or Passport. Verification takes less than 24 hours.'
};

export class LiveChatManager {
  constructor() {
    this.isOpen = false;
  }

  toggle() {
    this.isOpen = !this.isOpen;
    const windowEl = document.getElementById('live-chat-modal');
    if (windowEl) {
      if (this.isOpen) {
        windowEl.classList.remove('hidden');
        this.scrollToBottom();
      } else {
        windowEl.classList.add('hidden');
      }
    }
  }

  sendMessage(text) {
    if (!text || !text.trim()) return;

    const trimmed = text.trim();
    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: trimmed,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    stateManager.update(s => {
      s.chat.messages.push(userMsg);
    });

    this.renderMessages();

    // Generate smart response
    setTimeout(() => {
      let replyText = "Thank you for reaching out! Our team is reviewing your message. In the meantime, you can explore our automated bots or test strategies on your $10,000 demo account.";
      const lower = trimmed.toLowerCase();

      if (lower.includes('mpesa') || lower.includes('m-pesa') || lower.includes('deposit') || lower.includes('pay')) {
        replyText = QUICK_RESPONSES.mpesa;
      } else if (lower.includes('withdraw') || lower.includes('payout') || lower.includes('cash out')) {
        replyText = QUICK_RESPONSES.withdraw;
      } else if (lower.includes('bot') || lower.includes('auto') || lower.includes('martingale')) {
        replyText = QUICK_RESPONSES.bot;
      } else if (lower.includes('digit') || lower.includes('even') || lower.includes('odd') || lower.includes('matches')) {
        replyText = QUICK_RESPONSES.digits;
      } else if (lower.includes('verify') || lower.includes('kyc') || lower.includes('id')) {
        replyText = QUICK_RESPONSES.kyc;
      }

      const botMsg = {
        id: Date.now() + 1,
        sender: 'bot',
        text: replyText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      stateManager.update(s => {
        s.chat.messages.push(botMsg);
      });

      this.renderMessages();
    }, 800);
  }

  renderMessages() {
    const listEl = document.getElementById('chat-messages-container');
    if (!listEl) return;

    const messages = stateManager.getState().chat.messages;
    listEl.innerHTML = messages.map(msg => `
      <div class="chat-msg-bubble ${msg.sender === 'user' ? 'chat-msg-user' : 'chat-msg-bot'}">
        <p>${msg.text}</p>
        <span style="font-size: 0.65rem; opacity: 0.6; display: block; text-align: right; margin-top: 0.2rem;">${msg.time}</span>
      </div>
    `).join('');

    this.scrollToBottom();
  }

  scrollToBottom() {
    const listEl = document.getElementById('chat-messages-container');
    if (listEl) {
      listEl.scrollTop = listEl.scrollHeight;
    }
  }
}

export const liveChat = new LiveChatManager();
