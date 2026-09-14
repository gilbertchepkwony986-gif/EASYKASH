# EasyKash — Instant Mobile Loans Platform (UpesiPay Gateway)

A complete, feature-packed digital lending platform inspired by `https://easykash.co.ke/` and `easykash.co.ke/withdraw-loan`, featuring all pages, real-time M-PESA loan application workflows, automated qualification checks, **UpesiPay** payment gateway integration, STK push simulations, loan tracking, loan calculator, and an admin console.

---

## 🚀 UpesiPay Gateway on Render

This application is ready for 1-click deployment on [Render](https://render.com) using `render.yaml`.

### Render Environment Variables

When deploying to Render, configure the following Environment Variables in your Web Service dashboard:

| Variable | Description | Example / Default |
|---|---|---|
| `UPESIPAY_BASE_URL` | UpesiPay API base endpoint | `https://api.pesipay.com` |
| `UPESIPAY_API_KEY` | Your UpesiPay secret API Key / Bearer Token | `upesi_live_sk_xxxxxxxx` |
| `UPESIPAY_MERCHANT_ID` | Your UpesiPay Merchant Shortcode / Account ID | `400200` |
| `UPESIPAY_CALLBACK_URL` | Webhook URL for transaction confirmations | `https://<your-app>.onrender.com/api/upesipay/callback` |
| `NODE_VERSION` | Node.js Runtime Version | `20` |

### UpesiPay Webhook Setup
In your UpesiPay merchant dashboard, set your Instant Payment Notification (IPN) / Webhook URL to:
```
https://<your-render-service-name>.onrender.com/api/upesipay/callback
```

---

## Key Features & Included Pages

### 1. Home / Loan Application (`/#apply` or `/`)
- **Brand & Hero Copy**: "Let us help you sort your expenses — top up a loan, rental loan, car loan, educational or emergencies directly to M-PESA."
- **Trust Highlights**: *No CRB Check*, *No Guarantors*, *Disbursed to M-PESA*, *100% Paperless*.
- **Application Form**:
  - Full Name, M-Pesa Phone Number, National ID Number, Loan Type Selection (*Car Loan, Education Loan, Emergency Loan, Rental Loan, Business Growth Loan, Salary Advance*).
  - Instant Loan Qualification modal: dynamically assesses credit limits (Ksh 5,000 to Ksh 50,000) with detailed repayment breakdown.
  - Direct "Claim & Withdraw to M-Pesa" action.
- **Dynamic Kenyan Social Proof Notification**: Floating toast cycling recent loan disbursements in real-time (*e.g. "Titus 0756xxx322 Received Ksh. 5,000 for Car Loan topup 20s Ago"*).
- **Live Statistics**: 500K+ Active Users, 98% Satisfaction, 24/7 Support, 2M+ Loans Disbursed.
- **Legal Modals**: Terms and Conditions & Loan Privacy Policy modals.

### 2. Withdraw Loan (`/#withdraw-loan` or `/withdraw-loan`)
- Dedicated withdrawal interface matching `https://easykash.co.ke/withdraw-loan`.
- Fields: Full Name, National ID, Amount to Withdraw, M-PESA Phone Number.
- **Interactive UpesiPay M-Pesa STK Push Integration**:
  - Realistic smartphone modal with official Safaricom M-Pesa prompt.
  - 4-digit PIN pad entry.
  - Live trigger to `/api/stkpush` backed by UpesiPay.
  - Success disbursal receipt with transaction code and status.

### 3. Track Loan Status (`/#check-status` or `/check-status`)
- Real-time loan lookup by National ID or registered M-Pesa Phone Number.
- Displays active loan amount, interest, due date, and direct repayment action.

### 4. Loan Repayment (`/#repay` or `/repay`)
- M-PESA Paybill `400200` automated clearance instructions.
- Instant 1-click UpesiPay STK Push repayment trigger.

### 5. Interactive Loan Calculator (`/#calculator` or `/calculator`)
- Dynamic sliders for Loan Amount (*Ksh 5,000 to Ksh 100,000*) and Repayment Period (*1 to 6 Months*).
- Real-time calculations for Monthly Repayment, Total Interest, and APR Rate.

### 6. Admin Management Console (`/#admin` or `/admin`)
- Overview metrics: Total Applications, Total Disbursed (KES), Pending Reviews, Approved Loans.
- Applications Table with real-time search, filter, Disburse, and Approve/Reject controls.

### 7. 24/7 Customer Support Assistant
- Floating bottom-right chat widget with automated responses to frequently asked loan questions.

---

## How to Run Locally

### Option 1: Using Node.js (Recommended)
```bash
npm start
```
Then open: **[http://localhost:3000](http://localhost:3000)**

### Option 2: Using PowerShell
```powershell
powershell -ExecutionPolicy Bypass -File .\server.ps1
```
Then open: **[http://localhost:3000](http://localhost:3000)**

---

## REST API Endpoints

- `POST /api/apply` — Submit loan application and qualify applicant.
- `POST /api/withdraw` — Submit withdrawal and schedule M-Pesa disbursal via UpesiPay.
- `POST /api/stkpush` — Trigger UpesiPay M-PESA STK push.
- `POST /api/upesipay/callback` — Webhook IPN receiver for UpesiPay transaction callbacks.
- `GET /api/upesipay/status/:ref_id` — Verify UpesiPay transaction status.
- `GET /api/loans` — List all loan applications (Admin).
- `GET /api/check-status?q={id_or_phone}` — Query loan status by ID or Phone.
- `POST /api/repay` — Trigger UpesiPay STK push for loan repayment.
- `POST /api/admin/update-status` — Update application status.
- `GET /api/stats` — Live platform performance metrics.
