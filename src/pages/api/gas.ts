import { ethers } from 'ethers';
import { ETHEREUM_RPC_URL } from '../../lib/constants';

// Initialize provider
const provider = new ethers.providers.JsonRpcProvider(ETHEREUM_RPC_URL);

export async function getGasPrice() {
  try {
    if (!provider) {
      throw new Error('Provider not initialized');
    }

    const block = await provider.getBlock('latest');
    if (!block) {
      throw new Error('Failed to fetch latest block');
    }

    const gasPrice = await provider.getGasPrice();
    const baseFee = block.baseFeePerGas ? 
      ethers.utils.formatUnits(block.baseFeePerGas, 'gwei') : '0';
    const priorityFee = gasPrice ? 
      ethers.utils.formatUnits(gasPrice, 'gwei') : '0';

    return {
      baseFee,
      priorityFee,
      timestamp: block.timestamp,
      blockNumber: block.number,
    };
  } catch (error) {
    console.error('Error fetching gas price:', error);
    throw error;
  }
}