import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { ChainType } from '../lib/providers';
import { useGasStore } from '../stores/useGasStore';

interface GasPriceChartProps {
  chain: ChainType;
}

interface GasDataPoint {
  timestamp: number;
  baseFee: number;
  priorityFee: number;
}

interface ChartDataPoint {
  timestamp: number;
  baseFee: number;
  priorityFee: number;
  gas: number;
  minGas: number;
  maxGas: number;
  time: string;
}

function getGasPriceColor(price: number): string {
  if (price < 30) return 'var(--accent-green)';
  if (price < 100) return 'var(--accent-yellow)';
  return 'var(--accent-red)';
}

function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
}

function groupDataBy15Minutes(data: GasDataPoint[]): ChartDataPoint[] {
  if (data.length === 0) return [];

  const groupedData: { [key: string]: GasDataPoint[] } = {};
  
  data.forEach(point => {
    // Round timestamp to nearest 15 minutes
    const date = new Date(point.timestamp * 1000);
    date.setMinutes(Math.floor(date.getMinutes() / 15) * 15);
    date.setSeconds(0);
    date.setMilliseconds(0);
    
    const key = date.getTime().toString();
    
    if (!groupedData[key]) {
      groupedData[key] = [];
    }
    groupedData[key].push(point);
  });

  return Object.entries(groupedData).map(([timestamp, points]) => {
    const avgBaseFee = points.reduce((sum, p) => sum + p.baseFee, 0) / points.length;
    const avgPriorityFee = points.reduce((sum, p) => sum + p.priorityFee, 0) / points.length;
    const totalGas = points.map(p => p.baseFee + p.priorityFee);
    
    return {
      timestamp: parseInt(timestamp) / 1000,
      baseFee: avgBaseFee,
      priorityFee: avgPriorityFee,
      gas: avgBaseFee + avgPriorityFee,
      minGas: Math.min(...totalGas),
      maxGas: Math.max(...totalGas),
      time: formatTimestamp(parseInt(timestamp) / 1000)
    };
  }).sort((a, b) => a.timestamp - b.timestamp);
}

export function GasPriceChart({ chain }: GasPriceChartProps) {
  const { chains, ethPrice } = useGasStore();
  const chainData = chains[chain];

  const totalGasPrice = chainData.currentBaseFee + chainData.currentPriorityFee;
  const gasPriceColor = getGasPriceColor(totalGasPrice);
  const gasCostUsd = (totalGasPrice * 21000 / 1e9) * ethPrice;

  const chartData = groupDataBy15Minutes(chainData.history);

  return (
    <div className="gas-price-card">
      <div className="gas-price-header">
        <div className="gas-price-title">
          <span>{chain.toUpperCase()} Gas Price</span>
          <span className={`chain-status ${chainData.status}`}>
            {chainData.status}
          </span>
        </div>
        <div className="gas-price-value" style={{ color: gasPriceColor }}>
          {totalGasPrice.toFixed(2)} Gwei
          <span className="gas-price-usd">
            (${gasCostUsd.toFixed(2)})
          </span>
        </div>
        <div className="gas-price-details">
          <span>Base: {chainData.currentBaseFee.toFixed(2)} Gwei</span>
          <span>Priority: {chainData.currentPriorityFee.toFixed(2)} Gwei</span>
        </div>
      </div>
      <div className="gas-price-chart">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis 
              dataKey="time" 
              stroke="#d1d5db"
              tick={{ fill: '#d1d5db', fontSize: 12 }}
              tickLine={{ stroke: '#d1d5db' }}
              interval="preserveStartEnd"
            />
            <YAxis 
              stroke="#d1d5db"
              tick={{ fill: '#d1d5db', fontSize: 12 }}
              tickLine={{ stroke: '#d1d5db' }}
              label={{ 
                value: 'Gas Price (Gwei)', 
                angle: -90, 
                position: 'insideLeft',
                fill: '#d1d5db',
                fontSize: 12
              }}
              domain={['auto', 'auto']}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1f2937',
                border: 'none',
                borderRadius: '0.5rem',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                padding: '0.75rem'
              }}
              itemStyle={{ color: '#d1d5db', fontSize: 12 }}
              labelStyle={{ color: '#f3f4f6', fontSize: 12, fontWeight: 'bold' }}
              labelFormatter={(time) => `Time: ${time}`}
              formatter={(value: number) => [`${value.toFixed(2)} Gwei`, '']}
            />
            <Line 
              type="monotone" 
              dataKey="gas" 
              stroke="#3b82f6"
              strokeWidth={2}
              dot={false}
              name="Total Gas"
              isAnimationActive={false}
            />
            <Line 
              type="monotone" 
              dataKey="baseFee" 
              stroke="#10b981"
              strokeWidth={2}
              dot={false}
              name="Base Fee"
              isAnimationActive={false}
            />
            <Line 
              type="monotone" 
              dataKey="priorityFee" 
              stroke="#f59e0b"
              strokeWidth={2}
              dot={false}
              name="Priority Fee"
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}