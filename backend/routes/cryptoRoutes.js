// Crypto Routes for CryptoKindOnly
const express = require('express');
const router = express.Router();
const cryptoController = require('../controllers/cryptoController');

// Get latest cryptocurrency listings
router.get('/listings/latest', cryptoController.getLatestListings);

// Get specific cryptocurrency details
router.get('/info/:id', cryptoController.getCryptoDetails);

// Search cryptocurrencies
router.get('/search', cryptoController.searchCryptocurrencies);

// Get historical data for a cryptocurrency
router.get('/historical/:id', cryptoController.getHistoricalData);

// Get top gainers and losers
router.get('/top-movers', cryptoController.getTopGainersLosers);

// Get top 50 cryptocurrencies with detailed information
router.get('/top-fifty', cryptoController.getTopFiftyCryptos);

module.exports = router;