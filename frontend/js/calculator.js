/**
 * CryptoKindOnly Calculator JavaScript
 * Handles cryptocurrency to INR conversions and vice versa
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize mobile menu functionality
    initMobileMenu();
    
    // Initialize the calculator functionality
    initCalculator();
    
    // Initialize the chart
    initRateChart();
});

/**
 * Initialize mobile menu toggle functionality
 */
function initMobileMenu() {
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (mobileMenuButton && mobileMenu) {
        mobileMenuButton.addEventListener('click', function() {
            mobileMenu.classList.toggle('hidden');
        });
    }
}

/**
 * Initialize calculator functionality
 */
function initCalculator() {
    // Crypto to INR elements
    const cryptoSelect = document.getElementById('crypto-select');
    const cryptoAmount = document.getElementById('crypto-amount');
    const cryptoSymbol = document.getElementById('crypto-symbol');
    const rateCryptoSymbol = document.getElementById('rate-crypto-symbol');
    const cryptoRate = document.getElementById('crypto-rate');
    const cryptoResult = document.getElementById('crypto-result');
    
    // INR to Crypto elements
    const inrCryptoSelect = document.getElementById('inr-crypto-select');
    const inrAmount = document.getElementById('inr-amount');
    const inrRate = document.getElementById('inr-rate');
    const inrRateCryptoSymbol = document.getElementById('inr-rate-crypto-symbol');
    const inrResult = document.getElementById('inr-result');
    const inrResultSymbol = document.getElementById('inr-result-symbol');
    
    // Crypto data (simulated)
    const cryptoData = {
        bitcoin: { symbol: 'BTC', rate: 3456789.00 },
        ethereum: { symbol: 'ETH', rate: 245678.90 },
        binance: { symbol: 'BNB', rate: 34567.89 },
        cardano: { symbol: 'ADA', rate: 123.45 },
        solana: { symbol: 'SOL', rate: 8765.43 },
        ripple: { symbol: 'XRP', rate: 87.65 },
        polkadot: { symbol: 'DOT', rate: 2345.67 },
        dogecoin: { symbol: 'DOGE', rate: 12.34 }
    };
    
    // Update crypto symbol and rate when crypto is selected
    cryptoSelect.addEventListener('change', function() {
        const selectedCrypto = cryptoData[this.value];
        cryptoSymbol.textContent = selectedCrypto.symbol;
        rateCryptoSymbol.textContent = selectedCrypto.symbol;
        cryptoRate.textContent = formatNumber(selectedCrypto.rate);
        calculateCryptoToInr();
    });
    
    // Update INR to crypto rate when crypto is selected
    inrCryptoSelect.addEventListener('change', function() {
        const selectedCrypto = cryptoData[this.value];
        inrRateCryptoSymbol.textContent = selectedCrypto.symbol;
        inrResultSymbol.textContent = selectedCrypto.symbol;
        inrRate.textContent = formatNumber(1 / selectedCrypto.rate, 8);
        calculateInrToCrypto();
    });
    
    // Calculate crypto to INR when amount changes
    cryptoAmount.addEventListener('input', calculateCryptoToInr);
    
    // Calculate INR to crypto when amount changes
    inrAmount.addEventListener('input', calculateInrToCrypto);
    
    // Initial calculations
    calculateCryptoToInr();
    calculateInrToCrypto();
    
    /**
     * Calculate crypto to INR conversion
     */
    function calculateCryptoToInr() {
        const selectedCrypto = cryptoData[cryptoSelect.value];
        const amount = parseFloat(cryptoAmount.value) || 0;
        const result = amount * selectedCrypto.rate;
        cryptoResult.textContent = formatNumber(result);
        
        // Add pulse animation to result
        const resultContainer = cryptoResult.parentElement.parentElement;
        resultContainer.classList.add('pulse-animation');
        setTimeout(() => {
            resultContainer.classList.remove('pulse-animation');
        }, 500);
    }
    
    /**
     * Calculate INR to crypto conversion
     */
    function calculateInrToCrypto() {
        const selectedCrypto = cryptoData[inrCryptoSelect.value];
        const amount = parseFloat(inrAmount.value) || 0;
        const result = amount / selectedCrypto.rate;
        inrResult.textContent = formatNumber(result, 8);
        
        // Add pulse animation to result
        const resultContainer = inrResult.parentElement.parentElement;
        resultContainer.classList.add('pulse-animation');
        setTimeout(() => {
            resultContainer.classList.remove('pulse-animation');
        }, 500);
    }
}

/**
 * Initialize the historical rate chart
 */
function initRateChart() {
    const ctx = document.getElementById('rate-chart').getContext('2d');
    
    // Generate random data for the chart (simulated historical data)
    const dates = [];
    const rates = [];
    
    const today = new Date();
    for (let i = 30; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        dates.push(formatDate(date));
        
        // Generate a random rate between 3,300,000 and 3,600,000
        const baseRate = 3450000;
        const variance = 150000;
        const randomRate = baseRate + (Math.random() * variance * 2 - variance);
        rates.push(randomRate);
    }
    
    // Create the chart
    const chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: dates,
            datasets: [{
                label: 'BTC to INR Rate',
                data: rates,
                borderColor: '#10B981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                borderWidth: 2,
                pointRadius: 3,
                pointBackgroundColor: '#10B981',
                pointBorderColor: '#10B981',
                pointHoverRadius: 5,
                pointHoverBackgroundColor: '#10B981',
                pointHoverBorderColor: '#fff',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        color: '#D1D5DB'
                    }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    backgroundColor: 'rgba(17, 24, 39, 0.9)',
                    titleColor: '#fff',
                    bodyColor: '#D1D5DB',
                    borderColor: '#374151',
                    borderWidth: 1,
                    padding: 10,
                    displayColors: false,
                    callbacks: {
                        label: function(context) {
                            return '₹' + formatNumber(context.raw);
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        color: 'rgba(75, 85, 99, 0.2)'
                    },
                    ticks: {
                        color: '#9CA3AF',
                        maxRotation: 45,
                        minRotation: 45
                    }
                },
                y: {
                    grid: {
                        color: 'rgba(75, 85, 99, 0.2)'
                    },
                    ticks: {
                        color: '#9CA3AF',
                        callback: function(value) {
                            return '₹' + formatNumber(value, 0);
                        }
                    }
                }
            }
        }
    });
    
    // Update chart when crypto selection changes
    document.getElementById('crypto-select').addEventListener('change', function() {
        const selectedCrypto = this.value;
        const symbol = document.getElementById('crypto-symbol').textContent;
        
        // Generate new random data based on the selected crypto
        const newRates = [];
        let baseRate;
        
        switch(selectedCrypto) {
            case 'ethereum':
                baseRate = 245000;
                break;
            case 'binance':
                baseRate = 34500;
                break;
            case 'cardano':
                baseRate = 120;
                break;
            case 'solana':
                baseRate = 8700;
                break;
            case 'ripple':
                baseRate = 85;
                break;
            case 'polkadot':
                baseRate = 2300;
                break;
            case 'dogecoin':
                baseRate = 12;
                break;
            default: // bitcoin
                baseRate = 3450000;
        }
        
        const variance = baseRate * 0.05; // 5% variance
        
        for (let i = 0; i < dates.length; i++) {
            const randomRate = baseRate + (Math.random() * variance * 2 - variance);
            newRates.push(randomRate);
        }
        
        // Update chart data and title
        chart.data.datasets[0].data = newRates;
        chart.data.datasets[0].label = `${symbol} to INR Rate`;
        chart.update();
    });
}

/**
 * Format a number with commas and specified decimal places
 * @param {number} number - The number to format
 * @param {number} decimals - Number of decimal places (default: 2)
 * @returns {string} Formatted number string
 */
function formatNumber(number, decimals = 2) {
    return number.toLocaleString('en-IN', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    });
}

/**
 * Format a date as DD MMM
 * @param {Date} date - The date to format
 * @returns {string} Formatted date string
 */
function formatDate(date) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${date.getDate()} ${months[date.getMonth()]}`;
}

/**
 * Simulate API call to get crypto data
 * In a real application, this would fetch data from the backend
 * @param {string} endpoint - API endpoint
 * @returns {Promise} Promise that resolves with crypto data
 */
function fetchCryptoData(endpoint) {
    return new Promise((resolve) => {
        // Simulate API delay
        setTimeout(() => {
            // Simulated data
            const data = {
                bitcoin: { symbol: 'BTC', rate: 3456789.00 + (Math.random() * 10000) },
                ethereum: { symbol: 'ETH', rate: 245678.90 + (Math.random() * 1000) },
                binance: { symbol: 'BNB', rate: 34567.89 + (Math.random() * 100) },
                cardano: { symbol: 'ADA', rate: 123.45 + (Math.random() * 1) },
                solana: { symbol: 'SOL', rate: 8765.43 + (Math.random() * 10) },
                ripple: { symbol: 'XRP', rate: 87.65 + (Math.random() * 0.5) },
                polkadot: { symbol: 'DOT', rate: 2345.67 + (Math.random() * 5) },
                dogecoin: { symbol: 'DOGE', rate: 12.34 + (Math.random() * 0.1) }
            };
            resolve(data);
        }, 500);
    });
}

/**
 * Display error message
 * @param {string} message - Error message to display
 */
function showError(message) {
    // Create error element
    const errorDiv = document.createElement('div');
    errorDiv.className = 'fixed top-20 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 error-animation';
    errorDiv.textContent = message;
    
    // Add to document
    document.body.appendChild(errorDiv);
    
    // Remove after 5 seconds
    setTimeout(() => {
        errorDiv.classList.add('fade-out');
        setTimeout(() => {
            document.body.removeChild(errorDiv);
        }, 300);
    }, 5000);
}