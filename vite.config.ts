import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    'import.meta.env.VITE_ETH_WS_URL': JSON.stringify('https://eth-mainnet.g.alchemy.com/v2/d3RBNQpv2WZeTd9zecUUnqPJwsrCbH2c'),
    'import.meta.env.VITE_POLYGON_WS_URL': JSON.stringify('https://polygon-mainnet.g.alchemy.com/v2/d3RBNQpv2WZeTd9zecUUnqPJwsrCbH2c'),
    'import.meta.env.VITE_ARBITRUM_WS_URL': JSON.stringify('https://arb-mainnet.g.alchemy.com/v2/d3RBNQpv2WZeTd9zecUUnqPJwsrCbH2c'),
    global: 'globalThis',
  },
  resolve: {
    alias: {
      process: 'process/browser',
      stream: 'stream-browserify',
      zlib: 'browserify-zlib',
      util: 'util',
      buffer: 'buffer/',
      web3: 'web3/dist/web3.min.js',
    }
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: 'globalThis'
      }
    }
  }
});