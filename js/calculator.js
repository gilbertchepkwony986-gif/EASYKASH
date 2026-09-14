// Loan Calculator Logic
window.EasyKashCalculator = {
    init: function() {
        const amountSlider = document.getElementById('calc-amount-slider');
        const durationSlider = document.getElementById('calc-duration-slider');
        const amountDisplay = document.getElementById('calc-amount-display');
        const durationDisplay = document.getElementById('calc-duration-display');
        
        const monthlyDisplay = document.getElementById('calc-monthly-repayment');
        const totalInterestDisplay = document.getElementById('calc-total-interest');
        const totalRepayDisplay = document.getElementById('calc-total-repayment');
        const aprDisplay = document.getElementById('calc-apr-rate');

        function updateCalculations() {
            if (!amountSlider || !durationSlider) return;
            
            const principal = parseFloat(amountSlider.value);
            const months = parseInt(durationSlider.value, 10);
            
            // Monthly interest rate around 3.5%
            const monthlyRate = 0.035; 
            const totalInterest = principal * monthlyRate * months;
            const totalRepayment = principal + totalInterest;
            const monthlyPayment = totalRepayment / months;
            const apr = (monthlyRate * 12 * 100).toFixed(1);

            if (amountDisplay) amountDisplay.textContent = `Ksh ${principal.toLocaleString()}`;
            if (durationDisplay) durationDisplay.textContent = `${months} ${months === 1 ? 'Month (30 Days)' : 'Months'}`;
            
            if (monthlyDisplay) monthlyDisplay.textContent = `Ksh ${Math.round(monthlyPayment).toLocaleString()}`;
            if (totalInterestDisplay) totalInterestDisplay.textContent = `Ksh ${Math.round(totalInterest).toLocaleString()}`;
            if (totalRepayDisplay) totalRepayDisplay.textContent = `Ksh ${Math.round(totalRepayment).toLocaleString()}`;
            if (aprDisplay) aprDisplay.textContent = `${apr}%`;
        }

        if (amountSlider) amountSlider.addEventListener('input', updateCalculations);
        if (durationSlider) durationSlider.addEventListener('input', updateCalculations);

        updateCalculations();
    }
};
