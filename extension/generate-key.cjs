const crypto = require('crypto');

// Generate RSA key pair
const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: {
    type: 'spki',
    format: 'der'
  },
  privateKeyEncoding: {
    type: 'pkcs8',
    format: 'pem'
  }
});

// Convert public key to base64
const publicKeyBase64 = publicKey.toString('base64');

console.log('=== PUBLIC KEY (for manifest) ===');
console.log(publicKeyBase64);
console.log('\n=== PRIVATE KEY (save securely!) ===');
console.log(privateKey);
