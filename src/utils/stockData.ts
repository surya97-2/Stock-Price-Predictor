import { StockData } from '../types/stock';

// Generate realistic stock data with trends and volatility
export const generateStockData = (symbol: string, days: number = 365): StockData[] => {
  const data: StockData[] = [];
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  let basePrice = Math.random() * 100 + 50; // Start between $50-150
  const trend = (Math.random() - 0.5) * 0.02; // Daily trend between -1% to 1%
  const volatility = 0.03 + Math.random() * 0.05; // 3-8% daily volatility
  
  for (let i = 0; i < days; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    
    // Add trend and random walk
    const randomChange = (Math.random() - 0.5) * volatility * basePrice;
    const trendChange = trend * basePrice;
    basePrice += randomChange + trendChange;
    
    // Prevent negative prices
    basePrice = Math.max(basePrice, 1);
    
    data.push({
      date: date.toISOString().split('T')[0],
      price: Math.round(basePrice * 100) / 100,
      volume: Math.floor(Math.random() * 1000000) + 100000
    });
  }
  
  return data;
};

export const popularStocks = [
  'AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA', 'META', 'NFLX', 'NVDA'
];