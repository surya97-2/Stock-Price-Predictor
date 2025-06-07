import React, { useRef, useEffect } from 'react';
import { StockData, PredictionResult } from '../types/stock';

interface StockChartProps {
  historicalData: StockData[];
  predictions: PredictionResult[];
  width?: number;
  height?: number;
}

const StockChart: React.FC<StockChartProps> = ({ 
  historicalData, 
  predictions, 
  width = 800, 
  height = 400 
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  
  useEffect(() => {
    if (!svgRef.current || historicalData.length === 0) return;
    
    const svg = svgRef.current;
    const margin = { top: 20, right: 50, bottom: 40, left: 60 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;
    
    // Clear previous content
    svg.innerHTML = '';
    
    // Combine all data for scaling
    const allPrices = [
      ...historicalData.map(d => d.price),
      ...predictions.map(p => p.predictedPrice),
      ...predictions.flatMap(p => [p.confidenceInterval.lower, p.confidenceInterval.upper])
    ];
    
    const minPrice = Math.min(...allPrices) * 0.95;
    const maxPrice = Math.max(...allPrices) * 1.05;
    const priceRange = maxPrice - minPrice;
    
    // Create scales
    const xScale = (index: number) => (index / (historicalData.length + predictions.length - 1)) * chartWidth;
    const yScale = (price: number) => chartHeight - ((price - minPrice) / priceRange) * chartHeight;
    
    // Create background gradient
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
    gradient.setAttribute('id', 'chartGradient');
    gradient.setAttribute('x1', '0%');
    gradient.setAttribute('y1', '0%');
    gradient.setAttribute('x2', '0%');
    gradient.setAttribute('y2', '100%');
    
    const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stop1.setAttribute('offset', '0%');
    stop1.setAttribute('stop-color', '#60A5FA');
    stop1.setAttribute('stop-opacity', '0.3');
    
    const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stop2.setAttribute('offset', '100%');
    stop2.setAttribute('stop-color', '#60A5FA');
    stop2.setAttribute('stop-opacity', '0.05');
    
    gradient.appendChild(stop1);
    gradient.appendChild(stop2);
    defs.appendChild(gradient);
    svg.appendChild(defs);
    
    // Create main group
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('transform', `translate(${margin.left},${margin.top})`);
    
    // Draw grid lines
    const gridGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    gridGroup.setAttribute('class', 'grid');
    
    // Horizontal grid lines
    for (let i = 0; i <= 5; i++) {
      const y = (i / 5) * chartHeight;
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', '0');
      line.setAttribute('y1', y.toString());
      line.setAttribute('x2', chartWidth.toString());
      line.setAttribute('y2', y.toString());
      line.setAttribute('stroke', '#374151');
      line.setAttribute('stroke-opacity', '0.2');
      line.setAttribute('stroke-width', '1');
      gridGroup.appendChild(line);
    }
    
    g.appendChild(gridGroup);
    
    // Draw confidence interval area for predictions
    if (predictions.length > 0) {
      const confidencePath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      let pathData = '';
      
      // Upper bound
      predictions.forEach((pred, i) => {
        const x = xScale(historicalData.length + i);
        const y = yScale(pred.confidenceInterval.upper);
        pathData += i === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`;
      });
      
      // Lower bound (reverse order)
      for (let i = predictions.length - 1; i >= 0; i--) {
        const x = xScale(historicalData.length + i);
        const y = yScale(predictions[i].confidenceInterval.lower);
        pathData += ` L ${x} ${y}`;
      }
      
      pathData += ' Z';
      confidencePath.setAttribute('d', pathData);
      confidencePath.setAttribute('fill', '#EF4444');
      confidencePath.setAttribute('fill-opacity', '0.1');
      g.appendChild(confidencePath);
    }
    
    // Draw historical data line
    const historicalPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    let historicalPathData = '';
    
    historicalData.forEach((point, i) => {
      const x = xScale(i);
      const y = yScale(point.price);
      historicalPathData += i === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`;
    });
    
    historicalPath.setAttribute('d', historicalPathData);
    historicalPath.setAttribute('stroke', '#60A5FA');
    historicalPath.setAttribute('stroke-width', '2');
    historicalPath.setAttribute('fill', 'none');
    g.appendChild(historicalPath);
    
    // Draw prediction line
    if (predictions.length > 0) {
      const predictionPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      let predictionPathData = '';
      
      // Connect from last historical point
      const lastHistorical = historicalData[historicalData.length - 1];
      const lastX = xScale(historicalData.length - 1);
      const lastY = yScale(lastHistorical.price);
      predictionPathData = `M ${lastX} ${lastY}`;
      
      predictions.forEach((pred, i) => {
        const x = xScale(historicalData.length + i);
        const y = yScale(pred.predictedPrice);
        predictionPathData += ` L ${x} ${y}`;
      });
      
      predictionPath.setAttribute('d', predictionPathData);
      predictionPath.setAttribute('stroke', '#EF4444');
      predictionPath.setAttribute('stroke-width', '2');
      predictionPath.setAttribute('stroke-dasharray', '5,5');
      predictionPath.setAttribute('fill', 'none');
      g.appendChild(predictionPath);
    }
    
    // Draw data points
    historicalData.forEach((point, i) => {
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', xScale(i).toString());
      circle.setAttribute('cy', yScale(point.price).toString());
      circle.setAttribute('r', '3');
      circle.setAttribute('fill', '#60A5FA');
      circle.setAttribute('stroke', '#1E40AF');
      circle.setAttribute('stroke-width', '1');
      g.appendChild(circle);
    });
    
    // Draw prediction points
    predictions.forEach((pred, i) => {
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', xScale(historicalData.length + i).toString());
      circle.setAttribute('cy', yScale(pred.predictedPrice).toString());
      circle.setAttribute('r', '3');
      circle.setAttribute('fill', '#EF4444');
      circle.setAttribute('stroke', '#DC2626');
      circle.setAttribute('stroke-width', '1');
      g.appendChild(circle);
    });
    
    // Add Y-axis labels
    for (let i = 0; i <= 5; i++) {
      const price = minPrice + (i / 5) * priceRange;
      const y = (5 - i) / 5 * chartHeight;
      
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', '-10');
      text.setAttribute('y', y.toString());
      text.setAttribute('text-anchor', 'end');
      text.setAttribute('alignment-baseline', 'middle');
      text.setAttribute('fill', '#9CA3AF');
      text.setAttribute('font-size', '12');
      text.textContent = `$${price.toFixed(2)}`;
      g.appendChild(text);
    }
    
    // Add divider line between historical and predictions
    if (predictions.length > 0) {
      const dividerX = xScale(historicalData.length - 1);
      const dividerLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      dividerLine.setAttribute('x1', dividerX.toString());
      dividerLine.setAttribute('y1', '0');
      dividerLine.setAttribute('x2', dividerX.toString());
      dividerLine.setAttribute('y2', chartHeight.toString());
      dividerLine.setAttribute('stroke', '#9CA3AF');
      dividerLine.setAttribute('stroke-width', '1');
      dividerLine.setAttribute('stroke-dasharray', '3,3');
      g.appendChild(dividerLine);
    }
    
    svg.appendChild(g);
  }, [historicalData, predictions, width, height]);
  
  return (
    <div className="relative">
      <svg
        ref={svgRef}
        width={width}
        height={height}
        className="bg-gray-900/20 rounded-lg border border-gray-700/30"
        viewBox={`0 0 ${width} ${height}`}
      />
      <div className="absolute top-4 right-4 flex gap-4 text-sm">
        <div className="flex items-center gap-2 text-blue-400">
          <div className="w-3 h-0.5 bg-blue-400"></div>
          <span>Historical</span>
        </div>
        <div className="flex items-center gap-2 text-red-400">
          <div className="w-3 h-0.5 bg-red-400 border-dashed"></div>
          <span>Predicted</span>
        </div>
      </div>
    </div>
  );
};

export default StockChart;