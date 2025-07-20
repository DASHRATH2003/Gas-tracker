import { useState } from 'react';
import { useGasStore } from '../stores/useGasStore';

export function WalletSimulator() {
  const [amount, setAmount] = useState('');
  const [selectedChain, setSelectedChain] = useState<'ethereum' | 'polygon' | 'arbitrum'>('ethereum');
  const { chains, ethPrice, mode, setMode } = useGasStore();

  const calculateCost = () => {
    const chainData = chains[selectedChain];
    const gasUnits = 21000; // Standard ETH transfer
    const gasPriceGwei = Number(chainData.currentBaseFee) + Number(chainData.currentPriorityFee);
    const gasPriceEth = gasPriceGwei * 1e9 / 1e18;
    const transactionCostEth = gasPriceEth * gasUnits;
    const amountEth = Number(amount) || 0;
    const totalCostEth = transactionCostEth + amountEth;
    const totalCostUsd = totalCostEth * ethPrice;
    
    return {
      transactionCostEth,
      totalCostEth,
      totalCostUsd,
    };
  };

  const costs = calculateCost();

  return (
    <div className="simulator">
      <div className="mode-toggle">
        <button onClick={() => setMode('live')} className={mode === 'live' ? 'active' : ''}>
          Live Mode
        </button>
        <button onClick={() => setMode('simulation')} className={mode === 'simulation' ? 'active' : ''}>
          Simulation Mode
        </button>
      </div>
      
      {mode === 'simulation' && (
        <div className="simulation-controls">
          <select value={selectedChain} onChange={(e) => setSelectedChain(e.target.value as any)}>
            <option value="ethereum">Ethereum</option>
            <option value="polygon">Polygon</option>
            <option value="arbitrum">Arbitrum</option>
          </select>
          
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Amount (ETH/MATIC)"
          />
          
          <div className="results">
            <p>Transaction Cost: {costs.transactionCostEth.toFixed(8)} ETH</p>
            <p>Total Cost: {costs.totalCostEth.toFixed(8)} ETH (${costs.totalCostUsd.toFixed(2)})</p>
          </div>
        </div>
      )}
      
      <div className="comparison-table">
        {/* Table showing comparison across all chains */}
      </div>
    </div>
  );
}