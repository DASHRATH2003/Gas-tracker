import { create } from 'zustand';
import { CHAINS, type ChainType } from '../lib/providers';

interface GasPoint {
  timestamp: number;
  baseFee: number;
  priorityFee: number;
  usdPrice: number;
}

interface ChainData {
  currentBaseFee: number;
  currentPriorityFee: number;
  history: GasPoint[];
  status: 'connected' | 'disconnected' | 'error';
}

interface StoreState {
  mode: 'live' | 'simulation';
  chains: Record<ChainType, ChainData>;
  ethPrice: number;
  setMode: (mode: 'live' | 'simulation') => void;
  updateChainData: (chain: ChainType, data: Partial<ChainData>) => void;
  setEthPrice: (price: number) => void;
  setChainStatus: (chain: ChainType, status: 'connected' | 'disconnected' | 'error') => void;
  addHistoryPoint: (chain: ChainType, point: Omit<GasPoint, 'usdPrice'>) => void;
}

const initialState = CHAINS.reduce((acc, chain) => {
  return {
    ...acc,
    [chain]: {
      currentBaseFee: 0,
      currentPriorityFee: 0,
      history: [],
      status: 'disconnected',
    },
  };
}, {} as Record<ChainType, ChainData>);

export const useGasStore = create<StoreState>((set) => ({
  mode: 'live',
  chains: initialState,
  ethPrice: 0,
  
  setMode: (mode) => set({ mode }),
  
  updateChainData: (chain, data) => {
    console.log(`Updating ${chain} data:`, data);
    set((state) => ({
      chains: {
        ...state.chains,
        [chain]: { ...state.chains[chain], ...data },
      },
    }));
  },
  
  setEthPrice: (price) => {
    console.log('Setting ETH price:', price);
    set({ ethPrice: price });
  },
  
  setChainStatus: (chain, status) => {
    console.log(`Setting ${chain} status:`, status);
    set((state) => ({
      chains: {
        ...state.chains,
        [chain]: {
          ...state.chains[chain],
          status,
        },
      },
    }));
  },
  
  addHistoryPoint: (chain, point) => {
    console.log(`Adding history point for ${chain}:`, point);
    set((state) => {
      const history = [...state.chains[chain].history];
      if (history.length >= 100) history.shift();

      return {
        chains: {
          ...state.chains,
          [chain]: {
            ...state.chains[chain],
            history: [
              ...history,
              {
                ...point,
                usdPrice: state.ethPrice,
              },
            ],
          },
        },
      };
    });
  },
}));