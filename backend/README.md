# CryptoKindOnly Backend

## API Key Management System

This backend includes a robust API key management system for CoinMarketCap API keys. The system allows for:

- Multiple API keys with automatic rotation
- Usage tracking for each key
- Easy addition and removal of keys
- Automatic failover if a key hits rate limits

### Managing API Keys

You can manage API keys through the provided REST API endpoints or using the command-line script.

#### Using the REST API

1. **List all API keys**:
   ```
   GET /api/keys/list
   ```

2. **Add a new API key**:
   ```
   POST /api/keys/add
   Content-Type: application/json
   
   {
     "key": "your-api-key-here",
     "rateLimit": 30
   }
   ```

3. **Remove an API key**:
   ```
   POST /api/keys/remove
   Content-Type: application/json
   
   {
     "key": "your-api-key-here"
   }
   ```

4. **Reset API key usage counts**:
   ```
   POST /api/keys/reset-usage
   ```

#### Using the Command-Line Script

A command-line script is provided for managing API keys:

```bash
# Navigate to the scripts directory
cd scripts

# List all API keys
node manageApiKeys.js list

# Add a new API key with optional rate limit (default: 30)
node manageApiKeys.js add YOUR_API_KEY_HERE 30

# Remove an API key
node manageApiKeys.js remove YOUR_API_KEY_HERE

# Reset usage counts for all keys
node manageApiKeys.js reset
```

### Cryptocurrency Data API

The backend provides several endpoints for accessing cryptocurrency data:

1. **Get top 50 cryptocurrencies**:
   ```
   GET /api/crypto/top-fifty
   ```
   Returns detailed information for the top 50 cryptocurrencies by market cap, including prices in both USD and INR.

2. **Get latest cryptocurrency listings**:
   ```
   GET /api/crypto/listings/latest
   ```
   Optional query parameters:
   - `limit`: Number of results (default: 100)
   - `start`: Starting position (default: 1)
   - `sort`: Sort field (default: market_cap)
   - `sort_dir`: Sort direction (default: desc)
   - `convert`: Currency conversion (default: INR)

3. **Get specific cryptocurrency details**:
   ```
   GET /api/crypto/info/:id
   ```
   Where `:id` is the CoinMarketCap ID of the cryptocurrency.

4. **Search cryptocurrencies**:
   ```
   GET /api/crypto/search?query=bitcoin
   ```

5. **Get historical data**:
   ```
   GET /api/crypto/historical/:id
   ```

6. **Get top gainers and losers**:
   ```
   GET /api/crypto/top-movers
   ```

## Setup Instructions

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables in `.env` file:
   ```
   PORT=5000
   NODE_ENV=development
   COINMARKETCAP_API_KEY=your_default_api_key_here
   COINMARKETCAP_API_URL=https://pro-api.coinmarketcap.com/v1
   ```

3. Initialize the database:
   ```bash
   node models/initDb.js
   ```

4. Start the server:
   ```bash
   npm start
   ```

## Updating Cryptocurrency Data

To manually update cryptocurrency data in the database:

```bash
node utils/updateCryptoData.js
```

You can also set up a cron job to run this script periodically.