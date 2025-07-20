import { ethers } from 'ethers';

export type ChainType = 'ethereum' | 'polygon' | 'arbitrum';

export const CHAINS: ChainType[] = ['ethereum', 'polygon', 'arbitrum'];

// Create providers object with JSON RPC providers for each chain
export const providers: Record<ChainType, ethers.providers.JsonRpcProvider | null> = {
  ethereum: null,
  polygon: null,
  arbitrum: null
};

// Setup provider event handlers and reconnection logic
function setupProviderHandlers(chain: ChainType, provider: ethers.providers.JsonRpcProvider) {
  let retryAttempts = 0;
  const maxRetryAttempts = 5;

  provider.on('error', (error) => {
    console.error(`[${chain}] Provider error:`, error);
    if (retryAttempts < maxRetryAttempts) {
      retryAttempts++;
      const delay = Math.min(1000 * Math.pow(2, retryAttempts), 30000);
      console.log(`[${chain}] Attempting reconnect in ${delay}ms (attempt ${retryAttempts}/${maxRetryAttempts})`);
      setTimeout(() => handleReconnect(chain), delay);
    } else {
      console.error(`[${chain}] Max retry attempts reached`);
    }
  });

  // Poll for network status
  setInterval(async () => {
    try {
      await provider.getBlockNumber();
      retryAttempts = 0;
    } catch (error) {
      console.error(`[${chain}] Network error:`, error);
      if (retryAttempts < maxRetryAttempts) {
        handleReconnect(chain);
      }
    }
  }, 30000);
}

async function handleReconnect(chain: ChainType) {
  const url = getUrlForChain(chain);
  
  if (!url) {
    console.error(`[${chain}] No RPC URL configured`);
    return;
  }

  try {
    console.log(`[${chain}] Creating new provider`);
    const newProvider = new ethers.providers.JsonRpcProvider(url);
    providers[chain] = newProvider;
    setupProviderHandlers(chain, newProvider);
  } catch (error) {
    console.error(`[${chain}] Failed to reconnect:`, error);
    providers[chain] = null;
  }
}

function getUrlForChain(chain: ChainType): string {
  const urls = {
    ethereum: import.meta.env.VITE_ETH_WS_URL,
    polygon: import.meta.env.VITE_POLYGON_WS_URL,
    arbitrum: import.meta.env.VITE_ARBITRUM_WS_URL,
  };
  const url = urls[chain];
  if (!url) {
    console.error(`[${chain}] Missing RPC URL in environment variables`);
  }
  return url || '';
}

// Initialize providers immediately
console.log('Initializing JSON RPC providers...');
CHAINS.forEach((chain) => {
  const url = getUrlForChain(chain);
  if (url) {
    try {
      console.log(`[${chain}] Connecting to ${url.split('?')[0]}`);
      const provider = new ethers.providers.JsonRpcProvider(url);
      providers[chain] = provider;
      setupProviderHandlers(chain, provider);

      // Test connection immediately
      provider.getBlockNumber().then((blockNumber) => {
        console.log(`[${chain}] Connected! Current block: ${blockNumber}`);
      });
    } catch (error) {
      console.error(`[${chain}] Failed to initialize:`, error);
      providers[chain] = null;
    }
  }
});