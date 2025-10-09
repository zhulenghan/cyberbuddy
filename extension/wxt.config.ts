import { defineConfig } from 'wxt'
import path from 'path'

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ['@wxt-dev/module-react'],

  manifest: {
    name: 'Cyber Buddy',
    description: 'AI-powered personalized desktop pet companion',
    version: '0.1.0',
    key: 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAoBdvyfuFUgTrhc67T7sofP1iOA1J6gDOBQeg2cjWK2Ss40dUq5xdtjkmHzZrn6rGurTlwg/vJwbFQS+vSvhTqYnEUEi+TlCGSDfIiM3mb5R308Dy5qol4dXqWZXRunUzI1KS+lAknCIkBuWqz26uVW574kxkRPAggBI/IjpGk/ZwVjVBu4u7HsIYMWjLqFtQ9CC0467u5TdV1+hrC/1qBjXlrYQrZPdIEh5MOAX0Sq38GVG4LdB+We1MLxhNOLbxLadxq7rkp04FLh7jFWte6lqqOgFDS9Au1T20a4awHsdtddPyHXRSvH5E/5vy/9h7Vuw9uyUVZ54h0SGg2e3YQQIDAQAB',
    permissions: [
      'storage',
      'tabs',
      'idle',
      'identity'
    ],
    host_permissions: [
      'https://*.cyberbuddy.com/*',
      'https://*.execute-api.us-east-1.amazonaws.com/*',
      '<all_urls>'
    ]
  },

  // Vite configuration
  vite: () => ({
    resolve: {
      alias: {
        '@shared': path.resolve(__dirname, '../shared'),
        '@': path.resolve(__dirname, './')
      }
    }
  }),

  // Development configuration
  dev: {
    server: {
      port: 3000
    }
  }
})
