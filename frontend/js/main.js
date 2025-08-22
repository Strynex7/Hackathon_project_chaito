// Main JavaScript for CryptoKindOnly

document.addEventListener('DOMContentLoaded', function() {
    // Initialize mobile menu functionality
    initMobileMenu();
    
    // Initialize crypto charts
    initCryptoCharts();
    
    // Initialize hover effects for crypto cards
    initCryptoCardHoverEffects();
    
    // Simulate API data (in a real app, this would be fetched from the backend)
    simulateApiData();
});

// Mobile Menu Toggle
function initMobileMenu() {
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (mobileMenuButton && mobileMenu) {
        mobileMenuButton.addEventListener('click', function() {
            mobileMenu.classList.toggle('hidden');
        });
    }
}

// Initialize Charts for Crypto Cards
function initCryptoCharts() {
    const chartElements = document.querySelectorAll('.crypto-chart');
    
    chartElements.forEach(function(chartElement) {
        const ctx = chartElement.getContext('2d');
        
        // Generate random data for demo purposes
        const data = generateRandomChartData();
        const isPositive = Math.random() > 0.3; // 70% chance of positive trend
        
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['', '', '', '', '', '', ''],
                datasets: [{
                    data: data,
                    borderColor: isPositive ? '#10B981' : '#EF4444',
                    borderWidth: 2,
                    pointRadius: 0,
                    tension: 0.4,
                    fill: true,
                    backgroundColor: function(context) {
                        const chart = context.chart;
                        const {ctx, chartArea} = chart;
                        if (!chartArea) {
                            return null;
                        }
                        const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
                        if (isPositive) {
                            gradient.addColorStop(0, 'rgba(16, 185, 129, 0)');
                            gradient.addColorStop(1, 'rgba(16, 185, 129, 0.1)');
                        } else {
                            gradient.addColorStop(0, 'rgba(239, 68, 68, 0)');
                            gradient.addColorStop(1, 'rgba(239, 68, 68, 0.1)');
                        }
                        return gradient;
                    }
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        enabled: false
                    }
                },
                scales: {
                    x: {
                        display: false
                    },
                    y: {
                        display: false
                    }
                },
                elements: {
                    line: {
                        tension: 0.4
                    }
                }
            }
        });
    });
}

// Generate random chart data
function generateRandomChartData() {
    const data = [];
    let value = Math.random() * 100;
    
    for (let i = 0; i < 7; i++) {
        value += Math.random() * 10 - 5;
        value = Math.max(0, value);
        data.push(value);
    }
    
    return data;
}

// Initialize hover effects for crypto cards
function initCryptoCardHoverEffects() {
    const cryptoCards = document.querySelectorAll('.crypto-card');
    
    cryptoCards.forEach(function(card, index) {
        // Remove existing popup if any
        const existingPopup = card.querySelector('.crypto-popup');
        if (existingPopup) {
            existingPopup.remove();
        }
        
        // Create popup element
        const popup = document.createElement('div');
        popup.className = 'crypto-popup';
        
        // Get coin data from the card
        const coinName = card.querySelector('h3') ? card.querySelector('h3').textContent : 'Bitcoin';
        const coinSymbol = card.querySelector('p.text-gray-400') ? card.querySelector('p.text-gray-400').textContent : 'BTC';
        const priceElement = card.querySelector('.text-2xl.font-bold');
        const price = priceElement ? priceElement.textContent : '$0.00';
        const changeElement = card.querySelector('.text-green-400, .text-red-400');
        const priceChange = changeElement ? changeElement.textContent : '0%';
        
        // Fetch additional data from the API for this specific coin
        fetch(`http://localhost:3000/api/crypto/top-fifty`)
            .then(response => response.json())
            .then(result => {
                if (result.success && result.data && result.data.length > index) {
                    const coinData = result.data[index];
                    
                    // Format market cap and volume
                    const marketCap = formatLargeNumber(coinData.market_cap);
                    const volume = formatLargeNumber(coinData.volume_24h);
                    const supply = formatLargeNumber(coinData.circulating_supply);
                    
                    // Populate popup with real data
                    popup.innerHTML = `
                        <h3 class="text-xl font-bold mb-4">${coinName} Details</h3>
                        <div class="space-y-3">
                            <div class="flex justify-between">
                                <span class="text-gray-400">Market Cap:</span>
                                <span class="font-medium">$${marketCap}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-400">24h Volume:</span>
                                <span class="font-medium">$${volume}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-400">Circulating Supply:</span>
                                <span class="font-medium">${supply} ${coinSymbol}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-400">24h Change:</span>
                                <span class="font-medium ${coinData.percent_change_24h >= 0 ? 'text-green-400' : 'text-red-400'}">
                                    ${coinData.percent_change_24h >= 0 ? '+' : ''}${coinData.percent_change_24h.toFixed(2)}%
                                </span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-400">Price (INR):</span>
                                <span class="font-medium">₹${coinData.price_inr.toLocaleString(undefined, {maximumFractionDigits: 2})}</span>
                            </div>
                        </div>
                        <div class="mt-4 h-32">
                            <canvas class="popup-chart"></canvas>
                        </div>
                        <a href="explore.html?coin=${coinSymbol}" class="mt-4 block bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300 text-center">
                            View More
                        </a>
                    `;
                    
                    // Append popup to card
                    card.appendChild(popup);
                    
                    // Initialize chart in the popup
                    const chartCanvas = popup.querySelector('.popup-chart');
                    if (chartCanvas) {
                        const ctx = chartCanvas.getContext('2d');
                        const data = generateRandomChartData();
                        const isPositive = coinData.percent_change_24h >= 0;
                        
                        new Chart(ctx, {
                            type: 'line',
                            data: {
                                labels: ['1d', '2d', '3d', '4d', '5d', '6d', '7d'],
                                datasets: [{
                                    data: data,
                                    borderColor: isPositive ? '#10B981' : '#EF4444',
                                    borderWidth: 2,
                                    pointRadius: 2,
                                    tension: 0.4,
                                    fill: true,
                                    backgroundColor: function(context) {
                                        const chart = context.chart;
                                        const {ctx, chartArea} = chart;
                                        if (!chartArea) {
                                            return null;
                                        }
                                        const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
                                        if (isPositive) {
                                            gradient.addColorStop(0, 'rgba(16, 185, 129, 0)');
                                            gradient.addColorStop(1, 'rgba(16, 185, 129, 0.2)');
                                        } else {
                                            gradient.addColorStop(0, 'rgba(239, 68, 68, 0)');
                                            gradient.addColorStop(1, 'rgba(239, 68, 68, 0.2)');
                                        }
                                        return gradient;
                                    }
                                }]
                            },
                            options: {
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: {
                                    legend: {
                                        display: false
                                    },
                                    tooltip: {
                                        enabled: true,
                                        mode: 'index',
                                        intersect: false,
                                        callbacks: {
                                            label: function(context) {
                                                return `$${context.raw.toFixed(2)}`;
                                            }
                                        }
                                    }
                                },
                                scales: {
                                    x: {
                                        display: true,
                                        grid: {
                                            display: false
                                        },
                                        ticks: {
                                            color: '#9CA3AF'
                                        }
                                    },
                                    y: {
                                        display: true,
                                        grid: {
                                            color: 'rgba(156, 163, 175, 0.1)'
                                        },
                                        ticks: {
                                            color: '#9CA3AF',
                                            callback: function(value) {
                                                return '$' + value.toFixed(0);
                                            }
                                        }
                                    }
                                },
                                elements: {
                                    line: {
                                        tension: 0.4
                                    }
                                }
                            }
                        });
                    }
                }
            })
            .catch(error => {
                console.error('Error fetching coin details for popup:', error);
                
                // Fallback to basic popup if API fails
                popup.innerHTML = `
                    <h3 class="text-xl font-bold mb-4">${coinName} Details</h3>
                    <p class="text-gray-300 mb-4">Current Price: ${price}</p>
                    <p class="text-gray-300 mb-4">24h Change: ${priceChange}</p>
                    <a href="explore.html?coin=${coinSymbol}" class="mt-4 block bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300 text-center">
                        View More
                    </a>
                `;
                
                // Append popup to card
                card.appendChild(popup);
            });
        
        card.style.position = 'relative';
    });
}

// Helper function to format large numbers
function formatLargeNumber(num) {
    if (!num) return '0';
    
    if (num >= 1e12) {
        return (num / 1e12).toFixed(2) + 'T';
    } else if (num >= 1e9) {
        return (num / 1e9).toFixed(2) + 'B';
    } else if (num >= 1e6) {
        return (num / 1e6).toFixed(2) + 'M';
    } else if (num >= 1e3) {
        return (num / 1e3).toFixed(2) + 'K';
    } else {
        return num.toFixed(2);
    }
}

// Fetch live cryptocurrency data from the backend API
function simulateApiData() {
    console.log('Fetching live cryptocurrency data...');
    
    // Fetch data from the backend API
    fetch('http://localhost:3000/api/crypto/top-fifty')
        .then(response => response.json())
        .then(result => {
            if (result.success) {
                updateCryptoCards(result.data.slice(0, 3)); // Get top 3 cryptocurrencies
            } else {
                console.error('API returned error:', result.message);
                showErrorMessage('Failed to load cryptocurrency data. Please try again later.');
            }
        })
        .catch(error => {
            console.error('Error fetching crypto data:', error);
            showErrorMessage('Failed to load cryptocurrency data. Please try again later.');
        });
    
    // Set up polling to refresh data every 5 minutes
    setTimeout(simulateApiData, 5 * 60 * 1000);
}

// Update crypto cards with real data
function updateCryptoCards(data) {
    const container = document.getElementById('top-crypto-container');
    
    if (!container) return;
    
    // Clear existing cards
    container.innerHTML = '';
    
    // Add new cards based on data
    data.forEach(crypto => {
        const card = document.createElement('div');
        card.className = 'bg-gray-700 rounded-xl p-6 shadow-lg transform hover:scale-105 transition duration-300 crypto-card';
        
        const priceChangeClass = crypto.percent_change_24h >= 0 ? 'text-green-400' : 'text-red-400';
        const priceChangeSymbol = crypto.percent_change_24h >= 0 ? '+' : '';
        
        // Get currency symbol based on coin
        let currencySymbol = '₿';
        if (crypto.symbol === 'ETH') currencySymbol = 'Ξ';
        else if (crypto.symbol === 'BNB') currencySymbol = 'B';
        else if (crypto.symbol === 'XRP') currencySymbol = 'X';
        else if (crypto.symbol === 'SOL') currencySymbol = 'S';
        
        card.innerHTML = `
            <div class="flex items-center mb-4">
                <div class="w-12 h-12 bg-gray-600 rounded-full mr-4 flex items-center justify-center">
                    <span class="text-2xl">${currencySymbol}</span>
                </div>
                <div>
                    <h3 class="text-xl font-bold">${crypto.name}</h3>
                    <p class="text-gray-400">${crypto.symbol}</p>
                </div>
            </div>
            <div class="mb-4">
                <p class="text-2xl font-bold">$${crypto.price_usd.toLocaleString(undefined, {maximumFractionDigits: 2})}</p>
                <p class="${priceChangeClass}">${priceChangeSymbol}${crypto.percent_change_24h.toFixed(2)}%</p>
            </div>
            <div class="h-24">
                <canvas class="crypto-chart"></canvas>
            </div>
        `;
        
        container.appendChild(card);
    });
    
    // Reinitialize charts and hover effects
    initCryptoCharts();
    initCryptoCardHoverEffects();
}

// Show error message
function showErrorMessage(message) {
    const errorContainer = document.createElement('div');
    errorContainer.className = 'fixed top-20 right-4 bg-red-500 text-white p-4 rounded-lg shadow-lg error-message';
    errorContainer.textContent = message;
    
    document.body.appendChild(errorContainer);
    
    // Remove after 5 seconds
    setTimeout(() => {
        errorContainer.remove();
    }, 5000);
}