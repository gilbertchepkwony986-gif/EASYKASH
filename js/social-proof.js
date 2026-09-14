// Social Proof Toaster for EasyKash
(function() {
    const names = [
        "Titus", "Mutua", "Kip", "Wesonga", "Oloo", "Mwanaisha", 
        "Fred", "Wanjiku", "Brian", "Faith", "Emmanuel", "Mercy", 
        "Kevin", "Achieng", "Hassan", "Cheruiyot", "Njeri", "Mwangi", "Otieno"
    ];
    
    const amounts = [
        "5,000", "7,500", "10,000", "12,000", "15,000", 
        "20,000", "25,000", "30,000", "35,000", "45,000", "50,000"
    ];
    
    const prefixes = ["0720", "0719", "0110", "0756", "0718", "0722", "0727", "0725", "0740", "0792", "0701", "0768"];
    
    const loanTypes = [
        "Car Loan topup", "Emergency Loan", "Education Loan", 
        "Rental Loan", "Business Growth Loan", "Instant Salary Advance"
    ];

    function getRandomItem(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    }

    function triggerSocialProof() {
        const toast = document.getElementById('social-proof');
        if (!toast) return;

        const name = getRandomItem(names);
        const prefix = getRandomItem(prefixes);
        const suffix = Math.floor(100 + Math.random() * 900);
        const phone = `${prefix}xxx${suffix}`;
        const amount = getRandomItem(amounts);
        const loanType = getRandomItem(loanTypes);
        const secondsAgo = Math.floor(5 + Math.random() * 45);

        const nameEl = toast.querySelector('.name');
        const objectEl = toast.querySelector('.object');
        const addressEl = toast.querySelector('.address');
        const courseEl = toast.querySelector('.course');
        const timeEl = toast.querySelector('.time-counter');

        if (nameEl) nameEl.textContent = name;
        if (objectEl) objectEl.textContent = phone;
        if (addressEl) addressEl.textContent = amount;
        if (courseEl) courseEl.textContent = loanType;
        if (timeEl) timeEl.textContent = secondsAgo;

        toast.classList.add('show');

        setTimeout(() => {
            toast.classList.remove('show');
            const nextDelay = Math.floor(4000 + Math.random() * 8000);
            setTimeout(triggerSocialProof, nextDelay);
        }, 5000);
    }

    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(triggerSocialProof, 2000);
    });
})();
