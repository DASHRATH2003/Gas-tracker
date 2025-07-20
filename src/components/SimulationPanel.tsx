import { useState } from 'react';
import { useGasStore } from '../stores/useGasStore';
import { CHAINS } from '../lib/providers';

function getGasPriceColor(price: number): string {
  if (price < 30) return 'var(--accent-green)';
  if (price < 100) return 'var(--accent-yellow)';
  return 'var(--accent-red)';
}

export function SimulationPanel() {
  const { mode, setMode, chains, ethPrice } = useGasStore();
  const [amount, setAmount] = useState('0.1');
  const [selectedChain, setSelectedChain] = useState(CHAINS[0]);

  const calculateCost = (chain: string) => {
    const gasLimit = 21000; // Basic ETH transfer
    const chainData = chains[chain as keyof typeof chains];
    const gasPriceGwei = chainData.currentBaseFee + chainData.currentPriorityFee;
    const gasPriceEth = (gasPriceGwei * gasLimit) / 1e9;
    const totalEth = parseFloat(amount) + gasPriceEth;
    const gasCostUsd = gasPriceEth * ethPrice;
    const totalUsd = totalEth * ethPrice;
    
    return {
      gasPrice: gasPriceGwei.toFixed(2),
      gasPriceColor: getGasPriceColor(gasPriceGwei),
      gasCostEth: gasPriceEth.toFixed(6),
      gasCostUsd: gasCostUsd.toFixed(2),
      totalEth: totalEth.toFixed(6),
      totalUsd: totalUsd.toFixed(2)
    };
  };

  return (
    <div className="simulation-container">
      <div className="simulation-header">
        <h2 className="simulation-title">Transaction Simulator</h2>
        <div className="mode-toggle">
          <button 
            className={mode === 'live' ? 'active' : ''} 
            onClick={() => setMode('live')}
          >
            Live
          </button>
          <button 
            className={mode === 'simulation' ? 'active' : ''} 
            onClick={() => setMode('simulation')}
          >
            Simulation
          </button>
        </div>
      </div>

      <div className="simulation-form">
        <div className="form-group">
          <label htmlFor="amount">Transaction Amount (ETH)</label>
          <input
            id="amount"
            type="number"
            min="0"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="chain">Source Chain</label>
          <select
            id="chain"
            value={selectedChain}
            onChange={(e) => setSelectedChain(e.target.value as typeof CHAINS[number])}
            className="form-select"
          >
            {CHAINS.map((chain) => (
              <option key={chain} value={chain}>
                {chain.toUpperCase()}
              </option>
            ))}
          </select>
        </div>
      </div>

      <table className="comparison-table">
        <thead>
          <tr>
            <th>Chain</th>
            <th>Gas Price (Gwei)</th>
            <th>Gas Cost (ETH)</th>
            <th>Gas Cost (USD)</th>
            <th>Total (ETH)</th>
            <th>Total (USD)</th>
          </tr>
        </thead>
        <tbody>
          {CHAINS.map((chain) => {
            const costs = calculateCost(chain);
            const isSelected = chain === selectedChain;
            return (
              <tr key={chain} className={isSelected ? 'highlight' : ''}>
                <td>{chain.toUpperCase()}</td>
                <td style={{ color: costs.gasPriceColor }}>{costs.gasPrice}</td>
                <td>{costs.gasCostEth}</td>
                <td>${costs.gasCostUsd}</td>
                <td>{costs.totalEth}</td>
                <td>${costs.totalUsd}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="eth-price-info">
        Current ETH Price: ${ethPrice.toFixed(2)}
      </div>
    </div>
  );
}