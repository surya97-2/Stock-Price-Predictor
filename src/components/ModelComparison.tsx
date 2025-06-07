import React from 'react';
import { ModelMetrics } from '../types/stock';
import { BarChart3, TrendingUp, Target, Award } from 'lucide-react';

interface ModelComparisonProps {
  models: {
    name: string;
    metrics: ModelMetrics;
    color: string;
  }[];
}

const ModelComparison: React.FC<ModelComparisonProps> = ({ models }) => {
  const bestModel = models.reduce((best, current) => 
    current.metrics.rSquared > best.metrics.rSquared ? current : best
  );

  const formatPercentage = (value: number) => `${(value * 100).toFixed(1)}%`;
  const formatNumber = (value: number) => value.toFixed(3);

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/30">
      <div className="flex items-center gap-3 mb-6">
        <BarChart3 className="w-6 h-6 text-purple-400" />
        <h3 className="text-xl font-semibold text-white">Model Comparison</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {['rSquared', 'accuracy', 'mse', 'mae'].map((metric) => (
          <div key={metric} className="bg-gray-900/40 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              {metric === 'rSquared' && <Target className="w-4 h-4 text-blue-400" />}
              {metric === 'accuracy' && <Award className="w-4 h-4 text-green-400" />}
              {metric === 'mse' && <TrendingUp className="w-4 h-4 text-orange-400" />}
              {metric === 'mae' && <BarChart3 className="w-4 h-4 text-purple-400" />}
              <h4 className="text-sm font-medium text-gray-300 capitalize">
                {metric === 'rSquared' ? 'R-Squared' : 
                 metric === 'mse' ? 'MSE' :
                 metric === 'mae' ? 'MAE' : 'Accuracy'}
              </h4>
            </div>
            
            <div className="space-y-2">
              {models.map((model) => {
                const value = model.metrics[metric as keyof ModelMetrics];
                const isPercentage = metric === 'rSquared' || metric === 'accuracy';
                const isBest = model.name === bestModel.name;
                
                return (
                  <div key={model.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: model.color }}
                      />
                      <span className="text-xs text-gray-400">{model.name}</span>
                    </div>
                    <span className={`text-xs font-medium ${
                      isBest ? 'text-green-400' : 'text-gray-300'
                    }`}>
                      {isPercentage ? formatPercentage(value) : formatNumber(value)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-gradient-to-r from-green-900/20 to-emerald-900/20 rounded-lg p-4 border border-green-700/30">
        <div className="flex items-center gap-2 mb-2">
          <Award className="w-5 h-5 text-green-400" />
          <h4 className="text-lg font-semibold text-green-400">Best Performing Model</h4>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: bestModel.color }}
            />
            <span className="text-white font-medium">{bestModel.name}</span>
          </div>
          <div className="text-right">
            <div className="text-green-400 text-lg font-semibold">
              {formatPercentage(bestModel.metrics.rSquared)}
            </div>
            <div className="text-xs text-gray-400">R-Squared Score</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModelComparison;