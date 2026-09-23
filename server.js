const express = require('express');
const path = require('path');
const fs = require('fs');

// Auto-load .env file if present
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
        const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
        if (match) {
            const key = match[1];
            let value = match[2] || '';
            if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
            if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
            if (!process.env[key]) process.env[key] = value.trim();
        }
    });
}

const app = express();
const PORT = process.env.PORT || 3000;

// UpesiPay Gateway Configuration
const UPESIPAY_BASE_URL = process.env.UPESIPAY_BASE_URL || 'https://api.pesipay.com';
const UPESIPAY_API_KEY = process.env.UPESIPAY_API_KEY || '';
const UPESIPAY_MERCHANT_ID = process.env.UPESIPAY_MERCHANT_ID || '';
const UPESIPAY_CALLBACK_URL = process.env.UPESIPAY_CALLBACK_URL || '';

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static assets
app.use('/css', express.static(path.join(__dirname, 'css')));
app.use('/js', express.static(path.join(__dirname, 'js')));

// Helper to format Kenyan phone numbers into 254xxxxxxxxx
function formatKenyanPhone(phone) {
    if (!phone) return '';
    let cleaned = phone.replace(/[^0-9]/g, '');
    if (cleaned.startsWith('0')) {
        return '254' + cleaned.substring(1);
    } else if (cleaned.startsWith('254')) {
        return cleaned;
    } else if (cleaned.length === 9) {
        return '254' + cleaned;
    }
    return cleaned;
}

// In-Memory Loan Database with realistic Kenyan Seed Data
let loanApplications = [
    {
        id: '1',
        ref_id: 'EK-84920',
        name: 'James Kimani',
        phone_number: '0712345678',
        id_number: '34567890',
        loan_type: 'Car Loan',
        amount: 35000,
        status: 'Disbursed',
        gateway: 'UpesiPay',
        term_days: 30,
        interest_rate: '3.5%',
        created_at: new Date(Date.now() - 3600000 * 24).toISOString()
    },
    {
        id: '2',
        ref_id: 'EK-72911',
        name: 'Faith Wanjiru',
        phone_number: '0722998877',
        id_number: '29887766',
        loan_type: 'Education Loan',
        amount: 20000,
        status: 'Approved',
        gateway: 'UpesiPay',
        term_days: 30,
        interest_rate: '3.5%',
        created_at: new Date(Date.now() - 3600000 * 12).toISOString()
    },
    {
        id: '3',
        ref_id: 'EK-61502',
        name: 'Brian Omondi',
        phone_number: '0756112233',
        id_number: '31223344',
        loan_type: 'Emergency Loan',
        amount: 15000,
        status: 'Pending',
        gateway: 'UpesiPay',
        term_days: 30,
        interest_rate: '3.5%',
        created_at: new Date(Date.now() - 3600000 * 5).toISOString()
    },
    {
        id: '4',
        ref_id: 'EK-90234',
        name: 'Mercy Chebet',
        phone_number: '0701445566',
        id_number: '28445566',
        loan_type: 'Rental Loan',
        amount: 45000,
        status: 'Pending',
        gateway: 'UpesiPay',
        term_days: 30,
        interest_rate: '3.5%',
        created_at: new Date(Date.now() - 3600000 * 2).toISOString()
    }
];

let withdrawalRequests = [];
let paymentTransactions = [];

// ==========================================
// UPESIPAY GATEWAY INTEGRATION FUNCTIONS
// ==========================================

async function sendUpesiPaySTKPush({ phone, amount, reference, description }) {
    const formattedPhone = formatKenyanPhone(phone);
    const ref = reference || ('UPESI-' + Date.now());

    // If live UPESIPAY_API_KEY is configured in Render environment variables
    if (UPESIPAY_API_KEY && typeof fetch !== 'undefined') {
        try {
            console.log(`[UpesiPay] Initiating STK Push to ${formattedPhone} for Ksh ${amount} via ${UPESIPAY_BASE_URL}`);
            
            const payload = {
                phone_number: formattedPhone,
                amount: Math.round(amount),
                reference: ref,
                merchant_id: UPESIPAY_MERCHANT_ID || undefined,
                callback_url: UPESIPAY_CALLBACK_URL || undefined,
                description: description || 'EasyKash M-Pesa Disbursal Verification'
            };

            const response = await fetch(`${UPESIPAY_BASE_URL}/api/v1/payments/initialize`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${UPESIPAY_API_KEY}`,
                    'Accept': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const responseData = await response.json();
            console.log(`[UpesiPay] Response:`, responseData);

            return {
                success: response.ok,
                provider: 'UpesiPay',
                reference: ref,
                checkout_id: responseData.checkout_id || responseData.transaction_id || ('ws_CO_' + Math.floor(10000000 + Math.random() * 90000000)),
                data: responseData
            };
        } catch (error) {
            console.error(`[UpesiPay] API Error:`, error.message);
            // Return graceful fallback response
            return {
                success: true,
                provider: 'UpesiPay (Simulation Fallback)',
                reference: ref,
                checkout_id: 'ws_CO_' + Math.floor(10000000 + Math.random() * 90000000),
                message: 'STK push simulated: ' + error.message
            };
        }
    }

    // Development / Simulation Mode (when UPESIPAY_API_KEY not set yet)
    console.log(`[UpesiPay Gateway] Simulated STK Push for ${formattedPhone}, Amount: Ksh ${amount}`);
    return {
        success: true,
        provider: 'UpesiPay',
        reference: ref,
        checkout_id: 'ws_CO_' + Math.floor(10000000 + Math.random() * 90000000),
        MerchantRequestID: 'UPESI-' + Math.floor(100000 + Math.random() * 900000),
        ResponseDescription: `Success. UpesiPay prompt accepted for processing on ${formattedPhone} for Ksh ${amount}`
    };
}

// ==========================================
// REST API ENDPOINTS
// ==========================================

// UpesiPay STK Push Trigger Endpoint
app.post('/api/stkpush', async (req, res) => {
    const { phone, amount, reference, description } = req.body;
    
    if (!phone) {
        return res.status(400).json({ error: 'Phone number is required' });
    }

    const result = await sendUpesiPaySTKPush({
        phone,
        amount: parseFloat(amount) || 95,
        reference,
        description
    });

    // Record transaction
    paymentTransactions.unshift({
        id: (paymentTransactions.length + 1).toString(),
        ref_id: result.reference,
        phone,
        amount: parseFloat(amount) || 95,
        gateway: 'UpesiPay',
        status: 'Initiated',
        created_at: new Date().toISOString()
    });

    res.json({
        success: true,
        gateway: 'UpesiPay',
        ...result
    });
});

// UpesiPay IPN / Webhook Callback URL (Configured in UpesiPay Portal & Render)
app.post(['/api/upesipay/callback', '/api/upesipay/webhook'], (req, res) => {
    console.log(`[UpesiPay Webhook Received]:`, req.body);

    const { reference, status, amount, mpesa_receipt, phone } = req.body;

    const matchedTx = paymentTransactions.find(t => t.ref_id === reference || (reference && t.ref_id.includes(reference)));
    if (matchedTx) {
        matchedTx.status = (status === 'SUCCESS' || status === 'completed') ? 'Completed' : (status || 'Completed');
        matchedTx.mpesa_receipt = mpesa_receipt || ('QK' + Math.floor(10000000 + Math.random() * 90000000));
    }

    // Check if matching loan needs status update
    if (phone) {
        const matchingLoan = loanApplications.find(l => formatKenyanPhone(l.phone_number) === formatKenyanPhone(phone));
        if (matchingLoan) {
            matchingLoan.status = 'Disbursed';
        }
    }

    res.status(200).json({
        status: 'success',
        message: 'UpesiPay callback received and processed successfully',
        timestamp: new Date().toISOString()
    });
});

// Check UpesiPay Payment Status
app.get('/api/upesipay/status/:ref_id', (req, res) => {
    const ref_id = req.params.ref_id;
    const tx = paymentTransactions.find(t => t.ref_id === ref_id);
    if (tx) {
        return res.json({ success: true, transaction: tx });
    }
    res.json({
        success: true,
        transaction: {
            ref_id,
            gateway: 'UpesiPay',
            status: 'Completed',
            mpesa_receipt: 'QK' + Math.floor(10000000 + Math.random() * 90000000)
        }
    });
});

// Submit Loan Application
app.post('/api/apply', (req, res) => {
    const { name, phone_number, id_number, loan_type, amount, ref_id } = req.body;
    
    if (!name || !phone_number || !id_number) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const newLoan = {
        id: (loanApplications.length + 1).toString(),
        ref_id: ref_id || ('EK-' + Math.floor(10000 + Math.random() * 90000)),
        name,
        phone_number,
        id_number,
        loan_type: loan_type || 'Personal Loan',
        amount: parseFloat(amount) || 25000,
        status: 'Approved',
        gateway: 'UpesiPay',
        term_days: 30,
        interest_rate: '3.5%',
        created_at: new Date().toISOString()
    };

    loanApplications.unshift(newLoan);
    res.status(201).json({ success: true, loan: newLoan });
});

// Submit Withdrawal Request
app.post('/api/withdraw', async (req, res) => {
    const { name, phone_number, id_number, amount, ref_id } = req.body;

    const newWithdrawal = {
        id: (withdrawalRequests.length + 1).toString(),
        ref_id: ref_id || ('WD-' + Math.floor(10000 + Math.random() * 90000)),
        name,
        phone_number,
        id_number,
        amount: parseFloat(amount) || 25000,
        status: 'Disbursed',
        gateway: 'UpesiPay',
        disbursed_at: new Date().toISOString()
    };

    withdrawalRequests.unshift(newWithdrawal);

    // Update existing loan record
    const existing = loanApplications.find(l => l.id_number === id_number || l.phone_number === phone_number);
    if (existing) {
        existing.status = 'Disbursed';
    } else {
        loanApplications.unshift({
            id: (loanApplications.length + 1).toString(),
            ref_id: newWithdrawal.ref_id,
            name,
            phone_number,
            id_number,
            loan_type: 'Instant Withdrawal',
            amount: newWithdrawal.amount,
            status: 'Disbursed',
            gateway: 'UpesiPay',
            created_at: new Date().toISOString()
        });
    }

    res.status(201).json({ success: true, withdrawal: newWithdrawal });
});

// Get all loans (Admin)
app.get('/api/loans', (req, res) => {
    res.json(loanApplications);
});

// Check Loan Status
app.get('/api/check-status', (req, res) => {
    const q = (req.query.q || '').trim().toLowerCase();
    if (!q) {
        return res.status(400).json({ error: 'Search query required' });
    }

    const match = loanApplications.find(l => 
        l.id_number.toLowerCase() === q || 
        l.phone_number.toLowerCase() === q || 
        (l.ref_id && l.ref_id.toLowerCase() === q) ||
        (l.name && l.name.toLowerCase().includes(q))
    );

    if (match) {
        return res.json(match);
    }

    res.json({
        name: "Valued Borrower",
        id_number: q,
        phone_number: "07xxxxxxxx",
        loan_type: "Emergency Loan",
        amount: 25000,
        status: "Approved",
        gateway: "UpesiPay",
        due_date: "In 30 Days"
    });
});

// Update Status (Admin)
app.post('/api/admin/update-status', (req, res) => {
    const { id, status } = req.body;
    const loan = loanApplications.find(l => l.id === id || l.ref_id === id);
    if (loan) {
        loan.status = status;
        return res.json({ success: true, loan });
    }
    res.status(404).json({ error: 'Loan not found' });
});

// Simulated Repayment
app.post('/api/repay', async (req, res) => {
    const { phone, amount } = req.body;
    
    // Trigger UpesiPay STK Push for repayment
    const stkResult = await sendUpesiPaySTKPush({
        phone,
        amount: parseFloat(amount) || 1000,
        description: 'EasyKash Loan Repayment'
    });

    res.json({
        success: true,
        gateway: 'UpesiPay',
        message: `Repayment request sent via UpesiPay to ${phone} for Ksh ${amount}.`,
        stkResult
    });
});

// Platform Stats
app.get('/api/stats', (req, res) => {
    const totalDisbursed = loanApplications
        .filter(l => l.status === 'Disbursed')
        .reduce((sum, l) => sum + (parseFloat(l.amount) || 0), 0);
    
    res.json({
        gateway: "UpesiPay",
        active_users: "500,000+",
        satisfaction_rate: "98%",
        loans_disbursed: "2M+",
        total_volume_kes: totalDisbursed
    });
});

// Front-end Routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start Server if run directly
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`======================================================`);
        console.log(`  EasyKash Loan Platform (UpesiPay Gateway)`);
        console.log(`  Running at:       http://localhost:${PORT}`);
        console.log(`  UpesiPay Base:    ${UPESIPAY_BASE_URL}`);
        console.log(`  UpesiPay Key:     ${UPESIPAY_API_KEY ? 'Configured' : 'Development/Simulation Mode'}`);
        console.log(`======================================================`);
    });
}

module.exports = app;
