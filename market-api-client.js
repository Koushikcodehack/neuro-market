/**
 * Market Data API Client
 * Handles all API calls to the Flask backend
 */

const API_BASE_URL = 'http://localhost:5000/api';

class MarketDataClient {
    
    /**
     * Generic fetch method with error handling
     */
    static async fetch(endpoint, options = {}) {
        try {
            const url = `${API_BASE_URL}${endpoint}`;
            console.log(`📡 Fetching: ${url}`);
            
            const response = await fetch(url, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...options
            });
            
            if (!response.ok) {
                throw new Error(`API Error: ${response.status} ${response.statusText}`);
            }
            
            const data = await response.json();
            console.log(`✓ Success:`, data);
            return data;
        } catch (error) {
            console.error(`✗ API Error (${endpoint}):`, error.message);
            throw error;
        }
    }

    /**
     * Get market indices (NIFTY, SENSEX, etc.)
     */
    static async getIndices() {
        return this.fetch('/indices');
    }

    /**
     * Get top gaining stocks
     */
    static async getTopGainers() {
        return this.fetch('/top-gainers');
    }

    /**
     * Get top losing stocks
     */
    static async getTopLosers() {
        return this.fetch('/top-losers');
    }

    /**
     * Get most active stocks by volume
     */
    static async getMostActive() {
        return this.fetch('/most-active');
    }

    /**
     * Get quote for a specific stock
     */
    static async getStockQuote(symbol) {
        return this.fetch(`/quote/${symbol}`);
    }

    /**
     * Get intraday data for chart
     */
    static async getIntradayData(symbol) {
        return this.fetch(`/intraday/${symbol}`);
    }

    /**
     * Search for stocks
     */
    static async searchStocks(keywords) {
        return this.fetch(`/search?keywords=${encodeURIComponent(keywords)}`);
    }

    /**
     * Health check
     */
    static async healthCheck() {
        return this.fetch('/health');
    }
}

/**
 * UI Updater Functions
 */

/**
 * Show error message in container
 */
function showError(selector, message) {
    const container = document.querySelector(selector);
    if (container) {
        container.innerHTML = `
            <div style="padding: 20px; text-align: center; color: #e74c3c; grid-column: 1/-1;">
                ❌ ${message}<br>
                <small style="color: #7f8c8d;">Check browser console (F12) for details</small>
            </div>
        `;
    }
}

/**
 * Update indices section with live data
 */
async function updateIndices() {
    try {
        const result = await MarketDataClient.getIndices();
        if (result.status === 'success') {
            const indicesContainer = document.querySelector('[data-indices-container]');
            if (indicesContainer) {
                updateIndicesUI(result.data);
                console.log('✓ Indices updated');
            }
        }
    } catch (error) {
        console.error('Failed to update indices:', error);
        showError('[data-indices-container]', 'Failed to load indices');
    }
}

/**
 * Update top gainers section
 */
async function updateTopGainers() {
    try {
        const result = await MarketDataClient.getTopGainers();
        if (result.status === 'success') {
            updateTopGainersUI(result.data);
            console.log('✓ Top gainers updated');
        }
    } catch (error) {
        console.error('Failed to update top gainers:', error);
        showError('[data-gainers-container]', 'Failed to load top gainers');
    }
}

/**
 * Update top losers section
 */
async function updateTopLosers() {
    try {
        const result = await MarketDataClient.getTopLosers();
        if (result.status === 'success') {
            updateTopLosersUI(result.data);
            console.log('✓ Top losers updated');
        }
    } catch (error) {
        console.error('Failed to update top losers:', error);
        showError('[data-losers-container]', 'Failed to load top losers');
    }
}

/**
 * Update most active stocks section
 */
async function updateMostActive() {
    try {
        const result = await MarketDataClient.getMostActive();
        if (result.status === 'success') {
            updateMostActiveUI(result.data);
            console.log('✓ Most active stocks updated');
        }
    } catch (error) {
        console.error('Failed to update most active:', error);
        showError('[data-active-container]', 'Failed to load most active stocks');
    }
}

/**
 * Update stock quote
 */
async function updateStockQuote(symbol) {
    try {
        const result = await MarketDataClient.getStockQuote(symbol);
        if (result.status === 'success') {
            console.log(`${symbol} Quote:`, result.data);
            return result.data;
        }
    } catch (error) {
        console.error(`Failed to get quote for ${symbol}:`, error);
    }
}

/**
 * Render indices data in UI
 */
function updateIndicesUI(indices) {
    const container = document.querySelector('[data-indices-container]');
    if (!container) return;
    
    container.innerHTML = indices.map(index => `
        <div style="padding: 20px; border: 1px solid #ecf0f1; border-radius: 8px; cursor: pointer; transition: all 0.3s;">
            <div style="font-size: 14px; color: #7f8c8d; margin-bottom: 8px;">${index.symbol}</div>
            <div style="font-size: 24px; font-weight: 600; color: #2c3e50; margin-bottom: 8px;">₹${index.price.toFixed(2)}</div>
            <div style="font-size: 12px; color: ${index.change_percent >= 0 ? '#27ae60' : '#e74c3c'};">
                ${index.change_percent >= 0 ? '↑' : '↓'} ${Math.abs(index.change_percent).toFixed(2)}%
            </div>
        </div>
    `).join('');
}

/**
 * Render top gainers in UI
 */
function updateTopGainersUI(gainers) {
    const container = document.querySelector('[data-gainers-container]');
    if (!container) return;
    
    container.innerHTML = gainers.map(gainer => `
        <div style="padding: 12px 0; border-bottom: 1px solid #ecf0f1; display: flex; justify-content: space-between; align-items: center;">
            <div>
                <div style="font-weight: 600; font-size: 13px; color: #2c3e50;">${gainer.symbol}</div>
            </div>
            <div style="text-align: right;">
                <div style="font-weight: 600; color: #2c3e50;">₹${gainer.price.toFixed(2)}</div>
                <div style="font-size: 12px; color: #27ae60;">↑ ${gainer.change_percent.toFixed(2)}%</div>
            </div>
        </div>
    `).join('');
}

/**
 * Render top losers in UI
 */
function updateTopLosersUI(losers) {
    const container = document.querySelector('[data-losers-container]');
    if (!container) return;
    
    container.innerHTML = losers.map(loser => `
        <div style="padding: 12px 0; border-bottom: 1px solid #ecf0f1; display: flex; justify-content: space-between; align-items: center;">
            <div>
                <div style="font-weight: 600; font-size: 13px; color: #2c3e50;">${loser.symbol}</div>
            </div>
            <div style="text-align: right;">
                <div style="font-weight: 600; color: #2c3e50;">₹${loser.price.toFixed(2)}</div>
                <div style="font-size: 12px; color: #e74c3c;">↓ ${Math.abs(loser.change_percent).toFixed(2)}%</div>
            </div>
        </div>
    `).join('');
}

/**
 * Render most active stocks in UI
 */
function updateMostActiveUI(active) {
    const container = document.querySelector('[data-active-container]');
    if (!container) return;
    
    container.innerHTML = active.map(stock => `
        <div style="padding: 15px; background: #f8f9fa; border-radius: 6px; border-left: 3px solid #667eea;">
            <div style="font-weight: 600; color: #2c3e50; margin-bottom: 5px;">${stock.symbol}</div>
            <div style="font-size: 12px; color: #7f8c8d;">Price: ₹${stock.price.toFixed(2)}</div>
            <div style="font-size: 12px; color: #2c3e50; margin-top: 5px; ${stock.change_percent >= 0 ? 'color: #27ae60;' : 'color: #e74c3c;'}">${stock.change_percent >= 0 ? '↑' : '↓'} ${Math.abs(stock.change_percent).toFixed(2)}%</div>
        </div>
    `).join('');
}

/**
 * Auto-refresh data at intervals
 */
function startAutoRefresh(intervalMs = 60000) { // 60 seconds by default
    console.log(`Starting auto-refresh every ${intervalMs}ms`);
    
    // Initial load
    updateIndices();
    updateTopGainers();
    updateTopLosers();
    updateMostActive();
    
    // Refresh at intervals
    setInterval(() => {
        updateIndices();
        updateTopGainers();
        updateTopLosers();
        updateMostActive();
    }, intervalMs);
}

/**
 * Initialize on page load
 */
document.addEventListener('DOMContentLoaded', () => {
    console.log(`🔌 Attempting to connect to backend at: ${API_BASE_URL}`);

    // Check API health and start refreshing if healthy
    MarketDataClient.healthCheck()
        .then(result => {
            console.log('✓ Backend API is healthy');
            console.log('📊 Connected to Indian Market (NSE/BSE) data');
            // start auto-refreshing data
            startAutoRefresh();
        })
        .catch(error => {
            console.error('✗ Backend API is not responding at', API_BASE_URL);
            console.error('  Error:', error && error.message ? error.message : error);
            console.error('  Make sure Flask server is running: python app.py');

            // Show connection error on page
            const containers = [
                '[data-indices-container]',
                '[data-gainers-container]',
                '[data-losers-container]',
                '[data-active-container]'
            ];
            containers.forEach(selector => {
                showError(selector, `Backend not responding (${API_BASE_URL})`);
            });
        });
});
