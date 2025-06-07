import React from 'react';
import { TrendingUp, TrendingDown, Minus, AlertTriangle, Target, Calendar } from 'lucide-react';
import { StockPrediction } from '../types/stock';

interface PredictionSummaryProps {
  prediction: StockPrediction;
}

const PredictionSummary: React.FC<PredictionSummaryProps> = ({ prediction }) => {
  const currentPrice = prediction.historicalData[prediction.historicalData.length - 1].price;
  const futurePrice = prediction.predictions[prediction.predictions.length - 1].predictedPrice;
  const priceChange = futurePrice - currentPrice;
  const percentChange = (priceChange / currentPrice) * 100;
  
  const getTrendIcon = () => {
    switch (prediction.trend) {
      case 'bullish':
        return <TrendingUp className="w-5 h-5 text-green-400" />;
      case 'bearish':
        return <TrendingDown className="w-5 h-5 text-red-400" />;
      default:
        return <Minus className="w-5 h-5 text-yellow-400" />;
    }
  };
  
  const getRiskColor = () => {
    switch (prediction.riskLevel) {
      case 'low':
        return 'text-green-400 bg-green-900/20 border-green-700/30';
      case 'medium':
        return 'text-yellow-400 bg-yellow-900/20 border-yellow-700/30';
      case 'high':
        return 'text-red-400 bg-red-900/20 border-red-700/30';
      default:
        return 'text-gray-400 bg-gray-900/20 border-gray-700/30';
    }
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/30">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-white">Prediction Summary</h3>
        <div className="flex items-center gap-2">
          {getTrendIcon()}
          <span className="text-lg font-medium capitalize text-gray-300">
            {prediction.trend}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-900/40 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-blue-400" />
            <span className="text-sm text-gray-400">Current Price</span>
          </div>
          <div className="text-2xl font-bold text-white">
            ${currentPrice.toFixed(2)}
          </div>
        </div>

        <div className="bg-gray-900/40 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4 text-purple-400" />
            <span className="text-sm text-gray-400">30-Day Target</span>
          </div>
          <div className="text-2xl font-bold text-white">
            ${futurePrice.toFixed(2)}
          </div>
        </div>

        <div className="bg-gray-900/40 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            {priceChange >= 0 ? (
              <TrendingUp className="w-4 h-4 text-green-400" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-400" />
            )}
            <span className="text-sm text-gray-400">Expected Change</span>
          </div>
          <div className={`text-2xl font-bold ${
            priceChange >= 0 ? 'text-green-400' : 'text-red-400'
          }`}>
            {priceChange >= 0 ? '+' : ''}${priceChange.toFixed(2)}
          </div>
          <div className={`text-sm ${
            priceChange >= 0 ? 'text-green-400' : 'text-red-400'
          }`}>
            ({percentChange >= 0 ? '+' : ''}{percentChange.toFixed(1)}%)
          </div>
        </div>

        <div className={`rounded-lg p-4 border ${getRiskColor()}`}>
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-sm">Risk Level</span>
          </div>
          <div className="text-2xl font-bold capitalize">
            {prediction.riskLevel}
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-lg p-4 border border-blue-700/30">
        <h4 className="text-lg font-semibold text-blue-400 mb-3">Model Performance</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">
              {(prediction.metrics.rSquared * 100).toFixed(1)}%
            </div>
            <div className="text-xs text-gray-400">R-Squared</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">
              {prediction.metrics.accuracy.toFixed(1)}%
            </div>
            <div className="text-xs text-gray-400">Accuracy</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">
              ${prediction.metrics.mse.toFixed(2)}
            </div>
            <div className="text-xs text-gray-400">MSE</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">
              ${prediction.metrics.mae.toFixed(2)}
            </div>
            <div className="text-xs text-gray-400">MAE</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PredictionSummary;