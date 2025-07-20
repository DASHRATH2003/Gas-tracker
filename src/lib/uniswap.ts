import { ethers } from 'ethers';

const USDC_ETH_POOL = '0x8ad599c3A0ff1De082011EFDDc58f1908eb6e6D8';

const POOL_ABI = [
  'event Swap(address indexed sender, address indexed recipient, int256 amount0, int256 amount1, uint160 sqrtPriceX96, uint128 liquidity, int24 tick)',
  'function slot0() external view returns (uint160 sqrtPriceX96, int24 tick, uint16 observationIndex, uint16 observationCardinality, uint16 observationCardinalityNext, uint8 feeProtocol, bool unlocked)'
];

export async function getEthPrice(provider: ethers.providers.Provider): Promise<number> {
  try {
    const poolContract = new ethers.Contract(USDC_ETH_POOL, POOL_ABI, provider);
    const slot0 = await poolContract.slot0();
    const sqrtPriceX96 = slot0.sqrtPriceX96;
    
    // Convert sqrtPriceX96 to actual price
    const Q96 = ethers.BigNumber.from('2').pow(96);
    const Q192 = Q96.mul(Q96);
    const baseAmount = ethers.utils.parseUnits('1', 18);
    const quoteAmount = baseAmount.mul(Q192).div(sqrtPriceX96.mul(sqrtPriceX96));
    const price = parseFloat(ethers.utils.formatUnits(quoteAmount, 6));
    
    return price;
  } catch (error) {
    console.error('Error fetching ETH price:', error);
    return 0;
  }
}