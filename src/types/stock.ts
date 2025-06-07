export interface StockData {
  date: string;
  price: number;
  volume?: number;
}

export interface PredictionResult {
  date: string;
  predictedPrice: number;
  confidenceInterval: {
    lower: number;
    upper: number;
  };
}

export interface ModelMetrics {
  rSquared: number;
  mse: number;
  mae: number;
  accuracy: number;
}

export interface StockPrediction {
  symbol: string;
  historicalData: StockData[];
  predictions: PredictionResult[];
  metrics: ModelMetrics;
  trend: 'bullish' | 'bearish' | 'neutral';
  riskLevel: 'low' | 'medium' | 'high';
}