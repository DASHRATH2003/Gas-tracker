import { useEffect, useState } from 'react';
import { useGasStore } from '../stores/useGasStore';
import { CHAINS } from '../lib/providers';

export function Alert() {
  const { chains } = useGasStore();
  const [alerts, setAlerts] = useState<string[]>([]);
  const [showAlerts, setShowAlerts] = useState(false);

  useEffect(() => {
    const checkGasPrices = () => {
      const newAlerts = CHAINS.map(chain => {
        const chainData = chains[chain];
        const totalGasPrice = chainData.currentBaseFee + chainData.currentPriorityFee;
        if (totalGasPrice > 50) {
          return `⚠️ High gas price on ${chain.toUpperCase()}: ${totalGasPrice.toFixed(2)} Gwei`;
        }
        return null;
      }).filter(Boolean) as string[];

      if (newAlerts.length > 0) {
        setAlerts(newAlerts);
        setShowAlerts(true);
        // Show browser notification if supported
        if (Notification.permission === 'granted') {
          new Notification('Gas Price Alert', {
            body: newAlerts.join('\n'),
            icon: '/alert-icon.png'
          });
        }
      } else {
        setAlerts([]);
        setShowAlerts(false);
      }
    };

    // Request notification permission
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }

    // Check initially
    checkGasPrices();

    // Check whenever gas prices update
    const interval = setInterval(checkGasPrices, 5000);

    return () => clearInterval(interval);
  }, [chains]);

  if (!showAlerts) return null;

  return (
    <div className="alerts-container">
      {alerts.map((alert, index) => (
        <div key={index} className="alert">
          {alert}
          <button 
            className="alert-close"
            onClick={() => {
              const newAlerts = alerts.filter((_, i) => i !== index);
              setAlerts(newAlerts);
              if (newAlerts.length === 0) setShowAlerts(false);
            }}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
} 