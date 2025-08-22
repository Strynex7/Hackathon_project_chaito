-- Database Schema for CryptoKindOnly

-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS cryptokindonly;

-- Use the database
USE cryptokindonly;

-- Cryptocurrencies table
CREATE TABLE IF NOT EXISTS cryptocurrencies (
  id INT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  symbol VARCHAR(20) NOT NULL,
  slug VARCHAR(100) NOT NULL,
  price DECIMAL(24, 8) NOT NULL,
  volume_24h DECIMAL(24, 2) NOT NULL,
  market_cap DECIMAL(24, 2) NOT NULL,
  percent_change_1h DECIMAL(10, 2) NOT NULL,
  percent_change_24h DECIMAL(10, 2) NOT NULL,
  percent_change_7d DECIMAL(10, 2) NOT NULL,
  circulating_supply DECIMAL(24, 2),
  total_supply DECIMAL(24, 2),
  max_supply DECIMAL(24, 2),
  last_updated TIMESTAMP NOT NULL,
  INDEX idx_symbol (symbol),
  INDEX idx_name (name),
  INDEX idx_market_cap (market_cap),
  INDEX idx_percent_change_24h (percent_change_24h)
);

-- Historical prices table
CREATE TABLE IF NOT EXISTS historical_prices (
  id INT AUTO_INCREMENT PRIMARY KEY,
  crypto_id INT NOT NULL,
  price DECIMAL(24, 8) NOT NULL,
  volume_24h DECIMAL(24, 2) NOT NULL,
  market_cap DECIMAL(24, 2) NOT NULL,
  timestamp TIMESTAMP NOT NULL,
  FOREIGN KEY (crypto_id) REFERENCES cryptocurrencies(id) ON DELETE CASCADE,
  INDEX idx_crypto_timestamp (crypto_id, timestamp)
);

-- Activity logs table
CREATE TABLE IF NOT EXISTS activity_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  action VARCHAR(100) NOT NULL,
  ip_address VARCHAR(45) NOT NULL,
  details TEXT,
  timestamp TIMESTAMP NOT NULL,
  INDEX idx_action (action),
  INDEX idx_ip_address (ip_address),
  INDEX idx_timestamp (timestamp)
);

-- User feedback table
CREATE TABLE IF NOT EXISTS user_feedback (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL,
  subject VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  ip_address VARCHAR(45) NOT NULL,
  status ENUM('new', 'read', 'responded', 'closed') DEFAULT 'new',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_status (status),
  INDEX idx_created_at (created_at)
);

-- API usage table
CREATE TABLE IF NOT EXISTS api_usage (
  id INT AUTO_INCREMENT PRIMARY KEY,
  api_key VARCHAR(64) NOT NULL,
  endpoint VARCHAR(100) NOT NULL,
  ip_address VARCHAR(45) NOT NULL,
  timestamp TIMESTAMP NOT NULL,
  response_time INT NOT NULL,
  status_code INT NOT NULL,
  INDEX idx_api_key (api_key),
  INDEX idx_endpoint (endpoint),
  INDEX idx_timestamp (timestamp)
);

-- Sample data for cryptocurrencies
INSERT INTO cryptocurrencies (id, name, symbol, slug, price, volume_24h, market_cap, percent_change_1h, percent_change_24h, percent_change_7d, circulating_supply, total_supply, max_supply, last_updated)
VALUES
(1, 'Bitcoin', 'BTC', 'bitcoin', 50000.00, 30000000000.00, 950000000000.00, 0.5, 2.3, 5.1, 19000000.00, 21000000.00, 21000000.00, NOW()),
(2, 'Ethereum', 'ETH', 'ethereum', 3000.00, 15000000000.00, 350000000000.00, 0.3, 1.8, 4.2, 120000000.00, 120000000.00, NULL, NOW()),
(3, 'Tether', 'USDT', 'tether', 1.00, 50000000000.00, 80000000000.00, 0.0, 0.1, 0.0, 80000000000.00, 80000000000.00, NULL, NOW()),
(4, 'Binance Coin', 'BNB', 'binance-coin', 400.00, 2000000000.00, 65000000000.00, -0.2, 1.5, 3.8, 165000000.00, 165000000.00, 165000000.00, NOW()),
(5, 'Cardano', 'ADA', 'cardano', 1.20, 1500000000.00, 40000000000.00, -0.5, -2.1, 3.5, 33000000000.00, 45000000000.00, 45000000000.00, NOW()),
(6, 'Solana', 'SOL', 'solana', 100.00, 2500000000.00, 35000000000.00, 1.2, 5.3, 15.2, 350000000.00, 500000000.00, NULL, NOW()),
(7, 'XRP', 'XRP', 'xrp', 0.80, 3000000000.00, 38000000000.00, -0.3, -1.2, -3.5, 47000000000.00, 100000000000.00, 100000000000.00, NOW()),
(8, 'Polkadot', 'DOT', 'polkadot', 25.00, 1200000000.00, 25000000000.00, 0.8, 3.2, 7.5, 1000000000.00, 1100000000.00, NULL, NOW()),
(9, 'Dogecoin', 'DOGE', 'dogecoin', 0.15, 1800000000.00, 20000000000.00, -1.5, -5.2, -8.3, 132000000000.00, 132000000000.00, NULL, NOW()),
(10, 'Avalanche', 'AVAX', 'avalanche', 80.00, 1000000000.00, 18000000000.00, 1.8, 7.5, 22.3, 225000000.00, 720000000.00, 720000000.00, NOW());

-- Sample data for historical prices (for Bitcoin only)
INSERT INTO historical_prices (crypto_id, price, volume_24h, market_cap, timestamp)
VALUES
(1, 48000.00, 28000000000.00, 910000000000.00, DATE_SUB(NOW(), INTERVAL 30 DAY)),
(1, 49000.00, 29000000000.00, 930000000000.00, DATE_SUB(NOW(), INTERVAL 25 DAY)),
(1, 47500.00, 27000000000.00, 900000000000.00, DATE_SUB(NOW(), INTERVAL 20 DAY)),
(1, 46800.00, 26000000000.00, 890000000000.00, DATE_SUB(NOW(), INTERVAL 15 DAY)),
(1, 48500.00, 28500000000.00, 920000000000.00, DATE_SUB(NOW(), INTERVAL 10 DAY)),
(1, 49500.00, 29500000000.00, 940000000000.00, DATE_SUB(NOW(), INTERVAL 5 DAY)),
(1, 50000.00, 30000000000.00, 950000000000.00, NOW());

-- Sample data for activity logs
INSERT INTO activity_logs (action, ip_address, details, timestamp)
VALUES
('api_request', '192.168.1.1', 'GET /api/crypto/listings/latest', DATE_SUB(NOW(), INTERVAL 1 HOUR)),
('api_request', '192.168.1.2', 'GET /api/crypto/info/1', DATE_SUB(NOW(), INTERVAL 45 MINUTE)),
('api_request', '192.168.1.3', 'GET /api/crypto/search?q=bitcoin', DATE_SUB(NOW(), INTERVAL 30 MINUTE)),
('api_request', '192.168.1.4', 'GET /api/crypto/historical/1?timeframe=7d', DATE_SUB(NOW(), INTERVAL 15 MINUTE)),
('api_request', '192.168.1.5', 'GET /api/crypto/top-movers', DATE_SUB(NOW(), INTERVAL 5 MINUTE));

-- Sample data for user feedback
INSERT INTO user_feedback (name, email, subject, message, ip_address, status, created_at)
VALUES
('John Doe', 'john@example.com', 'Feature Request', 'I would like to see more altcoins added to your platform.', '192.168.1.10', 'new', DATE_SUB(NOW(), INTERVAL 2 DAY)),
('Jane Smith', 'jane@example.com', 'Bug Report', 'The historical chart is not loading properly on mobile devices.', '192.168.1.11', 'read', DATE_SUB(NOW(), INTERVAL 1 DAY)),
('Bob Johnson', 'bob@example.com', 'General Inquiry', 'What data sources do you use for cryptocurrency information?', '192.168.1.12', 'responded', DATE_SUB(NOW(), INTERVAL 12 HOUR));

-- Sample data for API usage
INSERT INTO api_usage (api_key, endpoint, ip_address, timestamp, response_time, status_code)
VALUES
('sample_api_key_1', '/api/crypto/listings/latest', '192.168.1.20', DATE_SUB(NOW(), INTERVAL 3 HOUR), 120, 200),
('sample_api_key_2', '/api/crypto/info/1', '192.168.1.21', DATE_SUB(NOW(), INTERVAL 2 HOUR), 85, 200),
('sample_api_key_1', '/api/crypto/search', '192.168.1.20', DATE_SUB(NOW(), INTERVAL 1 HOUR), 95, 200),
('sample_api_key_3', '/api/crypto/historical/1', '192.168.1.22', DATE_SUB(NOW(), INTERVAL 30 MINUTE), 150, 200),
('sample_api_key_2', '/api/crypto/top-movers', '192.168.1.21', DATE_SUB(NOW(), INTERVAL 15 MINUTE), 110, 200);