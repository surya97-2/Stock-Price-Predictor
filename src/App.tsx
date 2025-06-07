import React, { useState, useEffect, useMemo } from 'react';
import { Brain, LineChart, Zap } from 'lucide-react';
import StockChart from './components/StockChart';
import ModelComparison from './components/ModelComparison';
import StockSelector from './components/StockSelector';
import PredictionSummary from './components/PredictionSummary';
import { generateStockData, popularStocks } from './utils/stockData';
import { 
  LinearRegression, 
  PolynomialRegression, 
  generatePredictions, 
  calculateMetrics, 
  calculateMovingAverage 
} from './utils/predictions';
import { StockData, StockPrediction, ModelMetrics } from './types/stock';

function App() {
  const [selectedStock, setSelectedStock] = useState<string>('AAPL');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [stockData, setStockData] = useState<StockData[]>([]);

  // Generate new stock data when selection changes
  useEffect(() => {
    setIsLoading(true);
    // Simulate API call delay
    const timer = setTimeout(() => {
      const newData = generateStockData(selectedStock, 180); // 6 months of data
      setStockData(newData);
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [selectedStock]);

  // Calculate predictions and metrics
  const prediction = useMemo((): StockPrediction | null => {
    if (stockData.length === 0) return null;

    const prices = stockData.map(d => d.price);
    const indices = stockData.map((_, i) => i);

    // Linear Regression
    const linearModel = new LinearRegression();
    linearModel.fit(indices, prices);
    const linearPredictions = generatePredictions(stockData, linearModel, 30);
    const linearFitted = indices.map(i => linearModel.predict(i));
    const linearMetrics = calculateMetrics(prices, linearFitted);

    // Polynomial Regression
    const polyModel = new PolynomialRegression();
    polyModel.fit(indices, prices);
    const polyPredictions = generatePredictions(stockData, polyModel, 30);
    const polyFitted = indices.map(i => polyModel.predict(i));
    const polyMetrics = calculateMetrics(prices, polyFitted);

    // Use the better performing model
    const useBestModel = linearMetrics.rSquared > polyMetrics.rSquared;
    const bestPredictions = useBestModel ? linearPredictions : polyPredictions;
    const bestMetrics = useBestModel ? linearMetrics : polyMetrics;

    // Determine trend and risk
    const currentPrice = prices[prices.length - 1];
    const futurePrice = bestPredictions[bestPredictions.length - 1].predictedPrice;
    const priceChange = (futurePrice - currentPrice) / currentPrice;
    
    const trend = priceChange > 0.05 ? 'bullish' : priceChange < -0.05 ? 'bearish' : 'neutral';
    const volatility = Math.sqrt(prices.reduce((sum, price, i) => {
      if (i === 0) return 0;
      const change = (price - prices[i - 1]) / prices[i - 1];
      return sum + change * change;
    }, 0) / (prices.length - 1));
    
    const riskLevel = volatility > 0.03 ? 'high' : volatility > 0.015 ? 'medium' : 'low';

    return {
      symbol: selectedStock,
      historicalData: stockData,
      predictions: bestPredictions,
      metrics: bestMetrics,
      trend,
      riskLevel
    };
  }, [stockData, selectedStock]);

  // Model comparison data
  const modelComparison = useMemo(() => {
    if (stockData.length === 0) return [];

    const prices = stockData.map(d => d.price);
    const indices = stockData.map((_, i) => i);

    // Linear Regression
    const linearModel = new LinearRegression();
    linearModel.fit(indices, prices);
    const linearFitted = indices.map(i => linearModel.predict(i));
    const linearMetrics = calculateMetrics(prices, linearFitted);

    // Polynomial Regression
    const polyModel = new PolynomialRegression();
    polyModel.fit(indices, prices);
    const polyFitted = indices.map(i => polyModel.predict(i));
    const polyMetrics = calculateMetrics(prices, polyFitted);

    // Moving Average (simple prediction)
    const maPrice = calculateMovingAverage(stockData, 20);
    const maFitted = Array(prices.length).fill(maPrice);
    const maMetrics = calculateMetrics(prices, maFitted);

    return [
      { name: 'Linear Regression', metrics: linearMetrics, color: '#60A5FA' },
      { name: 'Polynomial Regression', metrics: polyMetrics, color: '#EF4444' },
      { name: 'Moving Average', metrics: maMetrics, color: '#10B981' }
    ];
  }, [stockData]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/20 to-purple-900/20">
      {/* Header */}
      <div className="bg-gray-900/50 backdrop-blur-sm border-b border-gray-700/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Stock Price Predictor</h1>
                <p className="text-gray-400 mt-1">Advanced ML-powered stock market analysis</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <LineChart className="w-4 h-4" />
                <span>Real-time Analysis</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <Zap className="w-4 h-4" />
                <span>AI Predictions</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-1">
            <StockSelector
              selectedStock={selectedStock}
              onStockChange={setSelectedStock}
              availableStocks={popularStocks}
              isLoading={isLoading}
            />
          </div>
          
          <div className="lg:col-span-2">
            {prediction && (
              <PredictionSummary prediction={prediction} />
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin w-12 h-12 border-4 border-blue-400 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-400">Analyzing {selectedStock} data...</p>
            </div>
          </div>
        ) : prediction ? (
          <>
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/30 mb-8">
              <div className="flex items-center gap-3 mb-6">
                <LineChart className="w-6 h-6 text-blue-400" />
                <h3 className="text-xl font-semibold text-white">Price Chart & Predictions</h3>
                <span className="text-sm text-gray-400">({selectedStock})</span>
              </div>
              
              <div className="overflow-x-auto">
                <StockChart
                  historicalData={prediction.historicalData}
                  predictions={prediction.predictions}
                  width={800}
                  height={400}
                />
              </div>
            </div>

            <ModelComparison models={modelComparison} />
          </>
        ) : null}
      </div>
    </div>
  );
}

export default App;