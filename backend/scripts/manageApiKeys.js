// Script to manage CoinMarketCap API keys
require('dotenv').config();
const { loadApiKeys, saveApiKeys, addApiKey, removeApiKey, listApiKeys, resetApiKeyUsage } = require('../config/apiConfig');

// Command line arguments
const args = process.argv.slice(2);
const command = args[0];

// Display usage information
function showUsage() {
  console.log('\nCoinMarketCap API Key Management Tool');
  console.log('======================================');
  console.log('Usage:');
  console.log('  node manageApiKeys.js list                   - List all API keys');
  console.log('  node manageApiKeys.js add <key> [rateLimit]  - Add a new API key with optional rate limit');
  console.log('  node manageApiKeys.js remove <key>           - Remove an API key');
  console.log('  node manageApiKeys.js reset                  - Reset usage counts for all keys');
  console.log('\nExample:');
  console.log('  node manageApiKeys.js add abc123def456 30');
  console.log('');
}

// Main function
async function main() {
  try {
    switch (command) {
      case 'list':
        const keys = listApiKeys();
        console.log('\nAPI Keys:');
        console.log('=========');
        if (keys.length === 0) {
          console.log('No API keys found.');
        } else {
          keys.forEach((key, index) => {
            console.log(`${index + 1}. Key: ${key.key}, Rate Limit: ${key.rateLimit}, Used: ${key.used}`);
          });
        }
        break;
        
      case 'add':
        const newKey = args[1];
        const rateLimit = parseInt(args[2]) || 30;
        
        if (!newKey) {
          console.log('Error: API key is required');
          showUsage();
          return;
        }
        
        const addResult = addApiKey(newKey, rateLimit);
        if (addResult) {
          console.log(`Successfully added API key: ${newKey.substring(0, 5)}...`);
        } else {
          console.log(`Failed to add API key: ${newKey.substring(0, 5)}...`);
        }
        break;
        
      case 'remove':
        const keyToRemove = args[1];
        
        if (!keyToRemove) {
          console.log('Error: API key is required');
          showUsage();
          return;
        }
        
        const removeResult = removeApiKey(keyToRemove);
        if (removeResult) {
          console.log(`Successfully removed API key: ${keyToRemove.substring(0, 5)}...`);
        } else {
          console.log(`Failed to remove API key: ${keyToRemove.substring(0, 5)}...`);
        }
        break;
        
      case 'reset':
        resetApiKeyUsage();
        console.log('Successfully reset API key usage counts');
        break;
        
      default:
        showUsage();
        break;
    }
  } catch (error) {
    console.error(`Error: ${error.message}`);
  }
}

// Run the script
main();