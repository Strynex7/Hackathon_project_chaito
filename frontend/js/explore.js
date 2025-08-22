// JavaScript for Explore Page

document.addEventListener('DOMContentLoaded', function() {
    // Initialize mobile menu functionality
    initMobileMenu();
    
    // Initialize mini charts in the crypto table
    initMiniCharts();
    
    // Initialize search functionality
    initSearch();
    
    // Initialize filter buttons
    initFilterButtons();
    
    // Initialize sorting
    initSorting();
    
    // Simulate API data (in a real app, this would be fetched from the backend)
    simulateApiData();
});

// Initialize mini charts in the crypto table
function initMiniCharts() {
    const chartElements = document.querySelectorAll('.crypto-mini-chart');
    
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
                    borderWidth: 1.5,
                    pointRadius: 0,
                    tension: 0.4,
                    fill: false
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

// Initialize search functionality
function initSearch() {
    const searchInput = document.getElementById('crypto-search');
    
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase().trim();
            const tableRows = document.querySelectorAll('#crypto-table-body tr');
            
            tableRows.forEach(function(row) {
                const nameCell = row.querySelector('td:nth-child(2)');
                if (nameCell) {
                    const coinName = nameCell.textContent.toLowerCase();
                    
                    if (coinName.includes(searchTerm)) {
                        row.style.display = '';
                    } else {
                        row.style.display = 'none';
                    }
                }
            });
            
            // Add animation to the search results
            animateSearchResults();
        });
    }
}

// Animate search results
function animateSearchResults() {
    const visibleRows = document.querySelectorAll('#crypto-table-body tr:not([style*="display: none"])');
    
    visibleRows.forEach(function(row, index) {
        row.classList.add('animate-slide-in');
        row.style.animationDelay = (index * 0.05) + 's';
        
        // Remove animation class after animation completes
        setTimeout(function() {
            row.classList.remove('animate-slide-in');
            row.style.animationDelay = '';
        }, 500 + (index * 50));
    });
}

// Initialize filter buttons
function initFilterButtons() {
    const filterButtons = document.querySelectorAll('.bg-gray-800.px-4.py-2.rounded-lg');
    
    filterButtons.forEach(function(button) {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            filterButtons.forEach(function(btn) {
                btn.classList.remove('active-filter');
                btn.classList.remove('bg-green-500');
                btn.classList.add('bg-gray-800');
            });
            
            // Add active class to clicked button
            this.classList.add('active-filter');
            this.classList.remove('bg-gray-800');
            this.classList.add('bg-green-500');
            
            // Apply filter based on button text
            const filterType = this.textContent.trim();
            applyFilter(filterType);
        });
    });
}

// Apply filter to crypto table
function applyFilter(filterType) {
    const tableRows = document.querySelectorAll('#crypto-table-body tr');
    
    tableRows.forEach(function(row) {
        // Show all rows by default
        row.style.display = '';
        
        if (filterType === 'Top 100') {
            // Already showing top 100, no need to filter
        } else if (filterType === 'Gainers') {
            const changeCell = row.querySelector('td:nth-child(4)');
            if (changeCell) {
                const changeText = changeCell.textContent;
                if (!changeText.includes('+')) {
                    row.style.display = 'none';
                }
            }
        } else if (filterType === 'Losers') {
            const changeCell = row.querySelector('td:nth-child(4)');
            if (changeCell) {
                const changeText = changeCell.textContent;
                if (!changeText.includes('-')) {
                    row.style.display = 'none';
                }
            }
        }
    });
    
    // Animate the filtered results
    animateSearchResults();
}

// Initialize sorting
function initSorting() {
    const sortSelect = document.getElementById('sort-select');
    
    if (sortSelect) {
        sortSelect.addEventListener('change', function() {
            const sortBy = this.value;
            sortTable(sortBy);
        });
    }
}

// Sort the crypto table
function sortTable(sortBy) {
    const tableBody = document.getElementById('crypto-table-body');
    const rows = Array.from(tableBody.querySelectorAll('tr'));
    
    rows.sort(function(a, b) {
        let aValue, bValue;
        
        if (sortBy === 'market_cap') {
            aValue = parseFloat(a.querySelector('td:nth-child(5)').textContent.replace(/[^0-9.-]+/g, ''));
            bValue = parseFloat(b.querySelector('td:nth-child(5)').textContent.replace(/[^0-9.-]+/g, ''));
        } else if (sortBy === 'price') {
            aValue = parseFloat(a.querySelector('td:nth-child(3)').textContent.replace(/[^0-9.-]+/g, ''));
            bValue = parseFloat(b.querySelector('td:nth-child(3)').textContent.replace(/[^0-9.-]+/g, ''));
        } else if (sortBy === 'change') {
            aValue = parseFloat(a.querySelector('td:nth-child(4)').textContent.replace(/[^0-9.-]+/g, ''));
            bValue = parseFloat(b.querySelector('td:nth-child(4)').textContent.replace(/[^0-9.-]+/g, ''));
        } else if (sortBy === 'volume') {
            aValue = parseFloat(a.querySelector('td:nth-child(6)').textContent.replace(/[^0-9.-]+/g, ''));
            bValue = parseFloat(b.querySelector('td:nth-child(6)').textContent.replace(/[^0-9.-]+/g, ''));
        }
        
        return bValue - aValue; // Sort in descending order
    });
    
    // Clear the table
    while (tableBody.firstChild) {
        tableBody.removeChild(tableBody.firstChild);
    }
    
    // Add sorted rows back to the table
    rows.forEach(function(row, index) {
        // Update the rank
        row.querySelector('td:first-child').textContent = index + 1;
        tableBody.appendChild(row);
    });
    
    // Animate the sorted results
    animateSearchResults();
}

// Simulate API data (in a real app, this would be fetched from the backend)
function simulateApiData() {
    // This function would be replaced with actual API calls in a real implementation
    console.log('Simulating API data fetch for explore page...');
    
    // In a real app, we would fetch data from the backend API
    // For example:
    /*
    fetch('/api/crypto/all')
        .then(response => response.json())
        .then(data => {
            updateCryptoTable(data);
        })
        .catch(error => {
            console.error('Error fetching crypto data:', error);
            showErrorMessage('Failed to load cryptocurrency data. Please try again later.');
        });
    */
}

// Update crypto table with real data
function updateCryptoTable(data) {
    const tableBody = document.getElementById('crypto-table-body');
    
    if (!tableBody) return;
    
    // Clear existing rows
    tableBody.innerHTML = '';
    
    // Add new rows based on data
    data.forEach((crypto, index) => {
        const row = document.createElement('tr');
        row.className = 'hover:bg-gray-700 transition duration-300';
        
        const priceChangeClass = crypto.priceChange >= 0 ? 'text-green-400' : 'text-red-400';
        const priceChangeSymbol = crypto.priceChange >= 0 ? '+' : '';
        
        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-300">${index + 1}</td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                    <div class="flex-shrink-0 h-8 w-8 mr-3">
                        <img src="${crypto.icon}" alt="${crypto.name}" class="h-8 w-8 rounded-full">
                    </div>
                    <div>
                        <div class="text-sm font-medium text-white">${crypto.name}</div>
                        <div class="text-sm text-gray-400">${crypto.symbol}</div>
                    </div>
                </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-right text-white font-medium">$${crypto.price.toLocaleString()}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-right ${priceChangeClass}">${priceChangeSymbol}${crypto.priceChange}%</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-300">$${crypto.marketCap.toLocaleString()}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-300">$${crypto.volume.toLocaleString()}</td>
            <td class="px-6 py-4 whitespace-nowrap text-right">
                <div class="h-10 w-24 ml-auto">
                    <canvas class="crypto-mini-chart"></canvas>
                </div>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // Reinitialize mini charts
    initMiniCharts();
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