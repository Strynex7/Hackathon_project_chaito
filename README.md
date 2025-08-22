# CryptoKindOnly

A comprehensive cryptocurrency information platform with real-time data, price tracking, and conversion tools.

## Project Structure

```
├── frontend/
│   ├── index.html           # Landing page
│   ├── explore.html         # Cryptocurrency exploration page
│   ├── calculator.html      # Crypto to INR calculator
│   ├── about.html           # About page
│   ├── contact.html         # Contact page
│   ├── css/
│   │   └── styles.css       # Main stylesheet
│   └── js/
│       ├── main.js          # Main JavaScript file
│       ├── explore.js       # Explore page functionality
│       ├── calculator.js    # Calculator functionality
│       ├── about.js         # About page functionality
│       └── contact.js       # Contact page functionality
├── backend/
│   ├── server.js            # Express server entry point
│   ├── package.json         # Node.js dependencies
│   ├── .env                 # Environment variables
│   ├── config/
│   │   ├── database.js      # Database connection
│   │   ├── apiConfig.js     # API configuration
│   │   └── apiKeys/         # API keys storage
│   │       └── coinmarketcap.json
│   ├── controllers/
│   │   ├── cryptoController.js    # Cryptocurrency data controller
│   │   ├── activityController.js  # Activity logging controller
│   │   └── feedbackController.js  # User feedback controller
│   ├── models/
│   │   ├── cryptoModel.js         # Cryptocurrency data model
│   │   ├── activityModel.js       # Activity logging model
│   │   ├── schema.sql             # Database schema
│   │   └── initDb.js              # Database initialization
│   ├── routes/
│   │   ├── cryptoRoutes.js        # Cryptocurrency API routes
│   │   ├── activityRoutes.js      # Activity logging routes
│   │   └── feedbackRoutes.js      # User feedback routes
│   └── utils/
│       ├── helpers.js             # Helper functions
│       ├── logger.js              # Logging utility
│       ├── middleware.js          # Express middleware
│       └── updateCryptoData.js    # Data update script
└── README.md                      # Project documentation
```

## Features

- Real-time cryptocurrency data from CoinMarketCap API
- Cryptocurrency exploration with filtering and sorting
- Crypto to INR and INR to Crypto conversion calculator
- Historical price charts
- Responsive design for all devices
- Contact form for user feedback
- Backend API with rate limiting and error handling

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- MySQL (v5.7 or higher)

### Frontend Setup

The frontend is built with HTML, CSS, and JavaScript. It can be served directly from the `frontend` directory or through the Express server in production mode.

### Backend Setup

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file based on the provided example:
   ```
   PORT=5000
   NODE_ENV=development
   
   # CoinMarketCap API
   COINMARKETCAP_API_URL=https://pro-api.coinmarketcap.com
   
   # Database
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=cryptokindonly
   DB_PORT=3306
   
   # Security
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   
   # Logging
   LOG_LEVEL=info
   ```

4. Initialize the database:
   ```
   node models/initDb.js
   ```

5. Start the server:
   ```
   npm start
   ```

   For development with auto-restart:
   ```
   npm run dev
   ```

## API Endpoints

### Cryptocurrency Data

- `GET /api/crypto/listings/latest` - Get latest cryptocurrency listings
- `GET /api/crypto/info/:id` - Get specific cryptocurrency details
- `GET /api/crypto/search` - Search cryptocurrencies
- `GET /api/crypto/historical/:id` - Get historical data for a cryptocurrency
- `GET /api/crypto/top-movers` - Get top gainers and losers

### Activity Logging

- `GET /api/activity/logs` - Get activity logs with pagination and filtering
- `GET /api/activity/stats` - Get activity statistics
- `DELETE /api/activity/logs/clear` - Clear old activity logs

### User Feedback

- `POST /api/feedback/submit` - Submit user feedback
- `GET /api/feedback` - Get all feedback (admin only)
- `PATCH /api/feedback/:id/status` - Update feedback status (admin only)
- `DELETE /api/feedback/:id` - Delete feedback (admin only)

## License

MIT