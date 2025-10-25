#!/usr/bin/env node

/**
 * Generate Chrome Extension ID from public key
 * Based on the key in wxt.config.ts
 */

const crypto = require('crypto');

// Your extension's public key from manifest
const publicKey = 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAoBdvyfuFUgTrhc67T7sofP1iOA1J6gDOBQeg2cjWK2Ss40dUq5xdtjkmHzZrn6rGurTlwg/vJwbFQS+vSvhTqYnEUEi+TlCGSDfIiM3mb5R308Dy5qol4dXqWZXRunUzI1KS+lAknCIkBuWqz26uVW574kxkRPAggBI/IjpGk/ZwVjVBu4u7HsIYMWjLqFtQ9CC0467u5TdV1+hrC/1qBjXlrYQrZPdIEh5MOAX0Sq38GVG4LdB+We1MLxhNOLbxLadxq7rkp04FLh7jFWte6lqqOgFDS9Au1T20a4awHsdtddPyHXRSvH5E/5vy/9h7Vuw9uyUVZ54h0SGg2e3YQQIDAQAB';

function generateExtensionId(publicKey) {
  // Convert base64 to binary
  const keyBuffer = Buffer.from(publicKey, 'base64');
  
  // Create SHA256 hash
  const hash = crypto.createHash('sha256').update(keyBuffer).digest();
  
  // Take first 16 bytes
  const truncatedHash = hash.slice(0, 16);
  
  // Convert to extension ID (a-p mapping)
  let extensionId = '';
  for (let i = 0; i < 16; i++) {
    extensionId += String.fromCharCode(97 + (truncatedHash[i] % 16));
  }
  
  return extensionId;
}

const extensionId = generateExtensionId(publicKey);
console.log('Your Chrome Extension ID is:', extensionId);
console.log('\nUse this ID when setting up OAuth in Google Cloud Console');
console.log('Authorized redirect URI should be:');
console.log(`chrome-extension://${extensionId}/`);