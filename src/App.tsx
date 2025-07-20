import { useEffect } from 'react';
import { useWebSocket } from './hooks/useWebSocket';
import { GasPriceChart } from './components/GasPriceChart';
import { SimulationPanel } from './components/SimulationPanel';
import { StatusIndicator } from './components/StatusIndicator';
import { Alert } from './components/Alert';
import { CHAINS } from './lib/providers';
import { useGasStore } from './stores/useGasStore';
import './App.css';

function App() {
  const { chains, ethPrice } = useGasStore();
  useWebSocket();

  useEffect(() => {
    console.log('Current chain states:', chains);
    console.log('Current ETH price:', ethPrice);
  }, [chains, ethPrice]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const refreshInterval = setInterval(() => {
      window.location.reload();
    }, 30000);

    return () => clearInterval(refreshInterval);
  }, []);

  return (
    <div className="app">
      <Alert />
      <header>
        <h1>Cross-Chain Gas Tracker</h1>
        <StatusIndicator />
      </header>

      <div className="dashboard">
        <div className="charts-container">
          {CHAINS.map((chain) => (
            <GasPriceChart key={chain} chain={chain} />
          ))}
        </div>

        <div className="simulation-container">
          <SimulationPanel />
        </div>
      </div>

      <div className="refresh-indicator">
        Auto-refreshing in {Math.ceil((30000 - (Date.now() % 30000)) / 1000)}s
      </div>
    </div>
  );
}

export default App;