import React from 'react';
import { Search, TrendingUp } from 'lucide-react';

interface StockSelectorProps {
  selectedStock: string;
  onStockChange: (stock: string) => void;
  availableStocks: string[];
  isLoading?: boolean;
}

const StockSelector: React.FC<StockSelectorProps> = ({
  selectedStock,
  onStockChange,
  availableStocks,
  isLoading = false
}) => {
  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/30">
      <div className="flex items-center gap-3 mb-4">
        <TrendingUp className="w-6 h-6 text-blue-400" />
        <h3 className="text-xl font-semibold text-white">Select Stock</h3>
      </div>
      
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <select
          value={selectedStock}
          onChange={(e) => onStockChange(e.target.value)}
          disabled={isLoading}
          className="w-full pl-10 pr-4 py-3 bg-gray-900/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {availableStocks.map((stock) => (
            <option key={stock} value={stock} className="bg-gray-800">
              {stock}
            </option>
          ))}
        </select>
        
        {isLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full"></div>
          </div>
        )}
      </div>
      
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
        {availableStocks.slice(0, 8).map((stock) => (
          <button
            key={stock}
            onClick={() => onStockChange(stock)}
            disabled={isLoading}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
              selectedStock === stock
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50 hover:text-white'
            }`}
          >
            {stock}
          </button>
        ))}
      </div>
    </div>
  );
};

export default StockSelector;