import { useEffect } from 'react';
import { ethers } from 'ethers';
import { providers, CHAINS } from '../lib/providers';
import { useGasStore } from '../stores/useGasStore';
import { getEthPrice } from '../lib/uniswap';

async function estimatePriorityFee(provider: ethers.providers.Provider): Promise<number> {
  try {
    const feeData = await provider.getFeeData();
    if (feeData.maxPriorityFeePerGas) {
      return parseFloat(ethers.utils.formatUnits(feeData.maxPriorityFeePerGas, 'gwei'));
    }
    return 0;
  } catch (error) {
    console.error('Error estimating priority fee:', error);
    return 0;
  }
}

function useWebSocket() {
  const {
    updateChainData,
    setEthPrice,
    setChainStatus,
    addHistoryPoint
  } = useGasStore();

  useEffect(() => {
    console.log('Setting up blockchain data polling...');
    
    const intervals: NodeJS.Timeout[] = [];
    
    // Initialize connections and polling
    CHAINS.forEach((chain) => {
      const provider = providers[chain];
      if (!provider) {
        console.log(`No provider for ${chain}`);
        setChainStatus(chain, 'disconnected');
        return;
      }

      // Poll for new blocks and gas data
      const interval = setInterval(async () => {
        try {
          const blockNumber = await provider.getBlockNumber();
          console.log(`[${chain}] Checking block: ${blockNumber}`);
          
          const block = await provider.getBlock(blockNumber);
          if (!block) {
            console.log(`[${chain}] No block data`);
            return;
          }

          const baseFee = block.baseFeePerGas 
            ? parseFloat(ethers.utils.formatUnits(block.baseFeePerGas, 'gwei'))
            : 0;
            
          const priorityFee = await estimatePriorityFee(provider);
          const timestamp = block.timestamp;

          console.log(`[${chain}] Updating gas data:`, {
            baseFee,
            priorityFee,
            timestamp
          });

          updateChainData(chain, {
            currentBaseFee: baseFee,
            currentPriorityFee: priorityFee
          });

          addHistoryPoint(chain, {
            timestamp,
            baseFee,
            priorityFee
          });

          setChainStatus(chain, 'connected');
        } catch (error) {
          console.error(`[${chain}] Error processing block:`, error);
          setChainStatus(chain, 'error');
        }
      }, 5000); // Poll every 5 seconds

      intervals.push(interval);
    });

    // ETH Price updates
    let ethPriceInterval: NodeJS.Timeout | null = null;
    const ethereumProvider = providers.ethereum;
    
    if (ethereumProvider) {
      // Initial price update
      getEthPrice(ethereumProvider).then(price => {
        if (price > 0) {
          console.log('Initial ETH price:', price);
          setEthPrice(price);
        }
      });

      // Regular price updates
      ethPriceInterval = setInterval(async () => {
        try {
          const price = await getEthPrice(ethereumProvider);
          if (price > 0) {
            console.log('Updated ETH price:', price);
            setEthPrice(price);
          }
        } catch (error) {
          console.error('Error updating ETH price:', error);
        }
      }, 10000); // Update every 10 seconds

      intervals.push(ethPriceInterval);
    }

    // Cleanup function
    return () => {
      console.log('Cleaning up polling intervals...');
      intervals.forEach(interval => clearInterval(interval));
    };
  }, [updateChainData, setEthPrice, setChainStatus, addHistoryPoint]);
}

export { useWebSocket };