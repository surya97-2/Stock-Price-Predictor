import { StockData, PredictionResult, ModelMetrics } from '../types/stock';

// Linear Regression Implementation
export class LinearRegression {
  private slope: number = 0;
  private intercept: number = 0;
  
  fit(x: number[], y: number[]) {
    const n = x.length;
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);
    
    this.slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    this.intercept = (sumY - this.slope * sumX) / n;
  }
  
  predict(x: number): number {
    return this.slope * x + this.intercept;
  }
  
  getSlope(): number {
    return this.slope;
  }
}

// Polynomial Regression (degree 2)
export class PolynomialRegression {
  private coefficients: number[] = [];
  
  fit(x: number[], y: number[]) {
    // Simplified polynomial regression (degree 2)
    const n = x.length;
    const X = x.map(xi => [1, xi, xi * xi]);
    
    // Normal equation: (X^T * X)^-1 * X^T * y
    const XtX = this.matrixMultiply(this.transpose(X), X);
    const XtY = this.matrixVectorMultiply(this.transpose(X), y);
    
    // Solve using simplified approach for 3x3 matrix
    this.coefficients = this.solve3x3(XtX, XtY);
  }
  
  predict(x: number): number {
    return this.coefficients[0] + this.coefficients[1] * x + this.coefficients[2] * x * x;
  }
  
  private transpose(matrix: number[][]): number[][] {
    return matrix[0].map((_, i) => matrix.map(row => row[i]));
  }
  
  private matrixMultiply(a: number[][], b: number[][]): number[][] {
    const result = Array(a.length).fill(null).map(() => Array(b[0].length).fill(0));
    for (let i = 0; i < a.length; i++) {
      for (let j = 0; j < b[0].length; j++) {
        for (let k = 0; k < b.length; k++) {
          result[i][j] += a[i][k] * b[k][j];
        }
      }
    }
    return result;
  }
  
  private matrixVectorMultiply(matrix: number[][], vector: number[]): number[] {
    return matrix.map(row => row.reduce((sum, val, i) => sum + val * vector[i], 0));
  }
  
  private solve3x3(A: number[][], b: number[]): number[] {
    // Simplified Gaussian elimination for 3x3
    const det = A[0][0] * (A[1][1] * A[2][2] - A[1][2] * A[2][1]) -
                A[0][1] * (A[1][0] * A[2][2] - A[1][2] * A[2][0]) +
                A[0][2] * (A[1][0] * A[2][1] - A[1][1] * A[2][0]);
    
    if (Math.abs(det) < 1e-10) {
      return [0, 0, 0]; // Fallback for singular matrix
    }
    
    const x0 = (b[0] * (A[1][1] * A[2][2] - A[1][2] * A[2][1]) -
                A[0][1] * (b[1] * A[2][2] - A[1][2] * b[2]) +
                A[0][2] * (b[1] * A[2][1] - A[1][1] * b[2])) / det;
    
    const x1 = (A[0][0] * (b[1] * A[2][2] - A[1][2] * b[2]) -
                b[0] * (A[1][0] * A[2][2] - A[1][2] * A[2][0]) +
                A[0][2] * (A[1][0] * b[2] - b[1] * A[2][0])) / det;
    
    const x2 = (A[0][0] * (A[1][1] * b[2] - b[1] * A[2][1]) -
                A[0][1] * (A[1][0] * b[2] - b[1] * A[2][0]) +
                b[0] * (A[1][0] * A[2][1] - A[1][1] * A[2][0])) / det;
    
    return [x0, x1, x2];
  }
}

// Calculate model metrics
export const calculateMetrics = (actual: number[], predicted: number[]): ModelMetrics => {
  const n = actual.length;
  const actualMean = actual.reduce((a, b) => a + b, 0) / n;
  
  const sse = actual.reduce((sum, val, i) => sum + Math.pow(val - predicted[i], 2), 0);
  const sst = actual.reduce((sum, val) => sum + Math.pow(val - actualMean, 2), 0);
  const rSquared = Math.max(0, 1 - sse / sst);
  
  const mse = sse / n;
  const mae = actual.reduce((sum, val, i) => sum + Math.abs(val - predicted[i]), 0) / n;
  
  // Calculate accuracy as percentage of predictions within 5% of actual
  const accurateCount = actual.filter((val, i) => 
    Math.abs(val - predicted[i]) / val <= 0.05
  ).length;
  const accuracy = (accurateCount / n) * 100;
  
  return { rSquared, mse, mae, accuracy };
};

// Generate predictions with confidence intervals
export const generatePredictions = (
  data: StockData[], 
  model: LinearRegression | PolynomialRegression,
  daysAhead: number = 30
): PredictionResult[] => {
  const predictions: PredictionResult[] = [];
  const lastDate = new Date(data[data.length - 1].date);
  
  // Calculate standard error for confidence intervals
  const prices = data.map(d => d.price);
  const indices = data.map((_, i) => i);
  const predicted = indices.map(i => model.predict(i));
  const residuals = prices.map((price, i) => price - predicted[i]);
  const mse = residuals.reduce((sum, r) => sum + r * r, 0) / residuals.length;
  const standardError = Math.sqrt(mse);
  
  for (let i = 1; i <= daysAhead; i++) {
    const futureDate = new Date(lastDate);
    futureDate.setDate(futureDate.getDate() + i);
    
    const predictedPrice = model.predict(data.length + i - 1);
    const margin = 1.96 * standardError; // 95% confidence interval
    
    predictions.push({
      date: futureDate.toISOString().split('T')[0],
      predictedPrice: Math.max(0, predictedPrice),
      confidenceInterval: {
        lower: Math.max(0, predictedPrice - margin),
        upper: predictedPrice + margin
      }
    });
  }
  
  return predictions;
};

// Moving Average Prediction
export const calculateMovingAverage = (data: StockData[], window: number = 20): number => {
  const recentPrices = data.slice(-window).map(d => d.price);
  return recentPrices.reduce((a, b) => a + b, 0) / recentPrices.length;
};