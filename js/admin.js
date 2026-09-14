// Admin Portal Logic
window.EasyKashAdmin = {
    loans: [],

    init: function() {
        this.fetchLoans();
        const searchInput = document.getElementById('admin-search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.renderTable(e.target.value.toLowerCase());
            });
        }
    },

    fetchLoans: async function() {
        try {
            const res = await fetch('/api/loans');
            if (res.ok) {
                this.loans = await res.json();
            } else {
                this.loans = this.getSampleLoans();
            }
        } catch (e) {
            this.loans = this.getSampleLoans();
        }
        this.updateStats();
        this.renderTable();
    },

    updateStats: function() {
        const totalCount = this.loans.length;
        const totalDisbursed = this.loans
            .filter(l => l.status === 'Disbursed')
            .reduce((acc, curr) => acc + parseFloat(curr.amount || 0), 0);
        const pendingCount = this.loans.filter(l => l.status === 'Pending').length;
        const approvedCount = this.loans.filter(l => l.status === 'Approved' || l.status === 'Disbursed').length;

        const elTotal = document.getElementById('admin-stat-total');
        const elDisbursed = document.getElementById('admin-stat-disbursed');
        const elPending = document.getElementById('admin-stat-pending');
        const elApproved = document.getElementById('admin-stat-approved');

        if (elTotal) elTotal.textContent = totalCount;
        if (elDisbursed) elDisbursed.textContent = `Ksh ${totalDisbursed.toLocaleString()}`;
        if (elPending) elPending.textContent = pendingCount;
        if (elApproved) elApproved.textContent = approvedCount;
    },

    renderTable: function(searchTerm = '') {
        const tbody = document.getElementById('admin-loans-tbody');
        if (!tbody) return;

        const filtered = this.loans.filter(l => {
            if (!searchTerm) return true;
            return (
                (l.name && l.name.toLowerCase().includes(searchTerm)) ||
                (l.phone_number && l.phone_number.includes(searchTerm)) ||
                (l.id_number && l.id_number.includes(searchTerm)) ||
                (l.loan_type && l.loan_type.toLowerCase().includes(searchTerm)) ||
                (l.ref_id && l.ref_id.toLowerCase().includes(searchTerm))
            );
        });

        if (filtered.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" class="text-center py-4 text-muted">No loan applications found.</td></tr>`;
            return;
        }

        tbody.innerHTML = filtered.map(loan => {
            const statusClass = (loan.status || 'Pending').toLowerCase();
            return `
                <tr>
                    <td><strong>#${loan.ref_id || 'EK-' + Math.floor(10000 + Math.random() * 90000)}</strong></td>
                    <td>
                        <div class="fw-bold">${loan.name}</div>
                        <small class="text-muted">ID: ${loan.id_number}</small>
                    </td>
                    <td>${loan.phone_number}</td>
                    <td><span class="badge bg-light text-dark">${loan.loan_type || 'Personal Loan'}</span></td>
                    <td class="fw-bold text-primary">Ksh ${parseFloat(loan.amount || 25000).toLocaleString()}</td>
                    <td>
                        <span class="badge-status ${statusClass}">${loan.status || 'Pending'}</span>
                    </td>
                    <td>
                        <div class="btn-group btn-group-sm">
                            ${loan.status !== 'Disbursed' ? `
                                <button class="btn btn-outline-success btn-sm" onclick="EasyKashAdmin.updateStatus('${loan.id || loan.ref_id}', 'Disbursed')">
                                    <i class="fa fa-paper-plane"></i> Disburse
                                </button>
                            ` : ''}
                            ${loan.status === 'Pending' ? `
                                <button class="btn btn-outline-primary btn-sm" onclick="EasyKashAdmin.updateStatus('${loan.id || loan.ref_id}', 'Approved')">
                                    <i class="fa fa-check"></i> Approve
                                </button>
                                <button class="btn btn-outline-danger btn-sm" onclick="EasyKashAdmin.updateStatus('${loan.id || loan.ref_id}', 'Rejected')">
                                    <i class="fa fa-times"></i>
                                </button>
                            ` : ''}
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    },

    updateStatus: async function(loanId, newStatus) {
        const item = this.loans.find(l => (l.id === loanId || l.ref_id === loanId));
        if (item) {
            item.status = newStatus;
            try {
                await fetch('/api/admin/update-status', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: loanId, status: newStatus })
                });
            } catch(e) {}
            this.updateStats();
            this.renderTable();
        }
    },

    getSampleLoans: function() {
        return [
            { id: '1', ref_id: 'EK-84920', name: 'James Kimani', phone_number: '0712345678', id_number: '34567890', loan_type: 'Car Loan', amount: 35000, status: 'Disbursed', date: '2026-09-14' },
            { id: '2', ref_id: 'EK-72911', name: 'Faith Wanjiru', phone_number: '0722998877', id_number: '29887766', loan_type: 'Education Loan', amount: 20000, status: 'Approved', date: '2026-09-14' },
            { id: '3', ref_id: 'EK-61502', name: 'Brian Omondi', phone_number: '0756112233', id_number: '31223344', loan_type: 'Emergency Loan', amount: 15000, status: 'Pending', date: '2026-09-14' },
            { id: '4', ref_id: 'EK-90234', name: 'Mercy Chebet', phone_number: '0701445566', id_number: '28445566', loan_type: 'Rental Loan', amount: 45000, status: 'Pending', date: '2026-09-14' }
        ];
    }
};
