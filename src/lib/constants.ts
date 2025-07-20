export const CHAINS = ['ethereum', 'polygon', 'arbitrum'] as const;
export type ChainType = typeof CHAINS[number];

export const CHAIN_NAMES = {
  ethereum: 'Ethereum',
  polygon: 'Polygon',
  arbitrum: 'Arbitrum',
} as const;

export const GAS_LIMITS = {
  ethereum: 21000, // Standard ETH transfer
  polygon: 25000, // Standard MATIC transfer
  arbitrum: 35000, // Standard ARB transfer
} as const;

export const CHAIN_COLORS = {
  ethereum: '#627EEA',
  polygon: '#8247E5',
  arbitrum: '#28A0F0',
} as const;

export const CHAIN_TOKENS = {
  ethereum: 'ETH',
  polygon: 'MATIC',
  arbitrum: 'ETH',
} as const;

// Uniswap V3 ETH/USDC pool on Ethereum mainnet
export const UNISWAP_V3_ETH_USDC_POOL = '0x88e6A0c2dDD26FEEb64F039a2c41296FcB3f5640';

// Status types for chain connections
export type ChainStatus = 'connected' | 'disconnected' | 'error';

// Update intervals
export const ETH_PRICE_UPDATE_INTERVAL = 30000; // 30 seconds
export const GAS_PRICE_UPDATE_INTERVAL = 15000; // 15 seconds

// RPC URLs
export const ETHEREUM_RPC_URL = 'https://eth-mainnet.g.alchemy.com/v2/your-api-key';