import { CHAINS } from '../lib/constants';
import { useGasStore } from '../stores/useGasStore';

export function StatusIndicator() {
  const chains = useGasStore((state) => state.chains);

  return (
    <div className="status-indicators">
      {CHAINS.map((chain) => (
        <div key={chain} className="status-item">
          <span className="chain-name">{chain.toUpperCase()}:</span>
          <span className={`status-dot ${chains[chain].status}`} />
        </div>
      ))}
    </div>
  );
}