/* ==========================================================================
   BetaBinary - Exact Canvas Chart Renderer (chart.js)
   Replicating original betabinary.ke/trade stepped area chart, Y-scale & timestamps
   ========================================================================== */

import { priceEngine } from './engine.js';
import { stateManager } from './state.js';

export class ChartRenderer {
  constructor(canvasElement) {
    this.canvas = canvasElement;
    this.ctx = canvasElement.getContext('2d');
    this.chartType = 'area'; // 'area' or 'candles'
    this.timeframe = 1; // 1s
    this.zoomLevel = 1.0;
    this.visibleTicksCount = 50;
    
    this.activeIndicators = {
      sma: false,
      bollinger: false,
      rsi: false
    };

    this.mousePos = null;

    this.initCanvasSize();
    this.setupEvents();
  }

  initCanvasSize() {
    if (!this.canvas || !this.canvas.parentElement) return;
    const rect = this.canvas.parentElement.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    this.width = rect.width;
    this.height = rect.height;
    this.canvas.width = this.width * dpr;
    this.canvas.height = this.height * dpr;
    this.ctx.scale(dpr, dpr);
  }

  setupEvents() {
    window.addEventListener('resize', () => this.initCanvasSize());

    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.mousePos = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    });

    this.canvas.addEventListener('mouseleave', () => {
      this.mousePos = null;
    });

    // Zoom buttons listener
    document.querySelector('#btn-zoom-in')?.addEventListener('click', () => {
      this.visibleTicksCount = Math.max(20, this.visibleTicksCount - 10);
    });
    document.querySelector('#btn-zoom-out')?.addEventListener('click', () => {
      this.visibleTicksCount = Math.min(150, this.visibleTicksCount + 10);
    });
    document.querySelector('#btn-zoom-reset')?.addEventListener('click', () => {
      this.visibleTicksCount = 50;
    });
  }

  setChartType(type) {
    this.chartType = type;
  }

  render(assetId, openPositions = []) {
    const ctx = this.ctx;
    const width = this.width;
    const height = this.height;

    if (!width || !height) return;

    ctx.clearRect(0, 0, width, height);

    if (this.chartType === 'area') {
      const fullHistory = priceEngine.getTickHistory(assetId);
      if (fullHistory.length < 2) return;
      const history = fullHistory.slice(-this.visibleTicksCount);
      this.drawAreaChart(history, openPositions);
    } else {
      const candles = priceEngine.getCandles(assetId, this.timeframe);
      if (candles.length < 2) return;
      this.drawCandleChart(candles.slice(-this.visibleTicksCount), openPositions);
    }

    // Crosshairs
    if (this.mousePos) {
      this.drawCrosshair(this.mousePos);
    }
  }

  drawAreaChart(data, openPositions) {
    const ctx = this.ctx;
    const rightMargin = 75;
    const bottomMargin = 28;
    const width = this.width - rightMargin;
    const height = this.height - bottomMargin;

    // Calculate Min & Max Prices
    let minPrice = Infinity;
    let maxPrice = -Infinity;
    for (const d of data) {
      if (d.price < minPrice) minPrice = d.price;
      if (d.price > maxPrice) maxPrice = d.price;
    }

    const diff = maxPrice - minPrice;
    const padding = diff > 0 ? diff * 0.2 : 1;
    minPrice -= padding;
    maxPrice += padding;

    const priceToY = (p) => height - ((p - minPrice) / (maxPrice - minPrice)) * (height - 30) - 15;
    const indexToX = (idx) => (idx / (data.length - 1)) * width;

    // 1. Background Grid Lines & Y-Axis Scale
    this.drawGridAndScales(minPrice, maxPrice, data, width, height, rightMargin, bottomMargin);

    // 2. Stepped / Smooth Line Path & Area Fill
    ctx.save();

    // Area Fill Gradient
    ctx.beginPath();
    ctx.moveTo(0, height);
    for (let i = 0; i < data.length; i++) {
      const x = indexToX(i);
      const y = priceToY(data[i].price);
      if (i === 0) {
        ctx.lineTo(x, y);
      } else {
        const prevX = indexToX(i - 1);
        const prevY = priceToY(data[i - 1].price);
        // Clean stepped-curve interpolation matching original Betabinary chart
        ctx.bezierCurveTo((prevX + x) / 2, prevY, (prevX + x) / 2, y, x, y);
      }
    }
    ctx.lineTo(width, height);
    ctx.closePath();

    const areaGradient = ctx.createLinearGradient(0, 0, 0, height);
    areaGradient.addColorStop(0, 'rgba(255, 255, 255, 0.08)');
    areaGradient.addColorStop(0.5, 'rgba(0, 208, 156, 0.03)');
    areaGradient.addColorStop(1, 'rgba(0, 208, 156, 0)');
    ctx.fillStyle = areaGradient;
    ctx.fill();

    // Line Stroke (Clean white/silver line with glow)
    ctx.beginPath();
    for (let i = 0; i < data.length; i++) {
      const x = indexToX(i);
      const y = priceToY(data[i].price);
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        const prevX = indexToX(i - 1);
        const prevY = priceToY(data[i - 1].price);
        ctx.bezierCurveTo((prevX + x) / 2, prevY, (prevX + x) / 2, y, x, y);
      }
    }
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 2;
    ctx.shadowColor = 'rgba(255, 255, 255, 0.4)';
    ctx.shadowBlur = 4;
    ctx.stroke();
    ctx.restore();

    // 3. Current Live Point & Horizontal Reference Line
    const lastPoint = data[data.length - 1];
    const currentX = width;
    const currentY = priceToY(lastPoint.price);

    ctx.save();
    // Dashed horizontal price line
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.setLineDash([4, 4]);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, currentY);
    ctx.lineTo(this.width, currentY);
    ctx.stroke();

    // Glowing White Head Dot
    ctx.setLineDash([]);
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = '#ffffff';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(currentX, currentY, 4.5, 0, Math.PI * 2);
    ctx.fill();

    // 100% Badge pill at current level
    ctx.fillStyle = 'rgba(21, 34, 54, 0.95)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(currentX + 5, currentY - 10, 42, 20, 4);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 10px "JetBrains Mono", monospace';
    ctx.fillText('100%', currentX + 11, currentY + 4);

    ctx.restore();

    // 4. Draw Active Positions Markers
    this.drawOpenPositionsMarkers(openPositions, priceToY, width);
  }

  drawGridAndScales(minPrice, maxPrice, data, width, height, rightMargin, bottomMargin) {
    const ctx = this.ctx;
    ctx.save();

    // Horizontal grid lines & Y-axis labels
    const rows = 6;
    ctx.fillStyle = '#627289';
    ctx.font = '11px "JetBrains Mono", monospace';
    ctx.textAlign = 'left';

    for (let i = 0; i <= rows; i++) {
      const y = (height / rows) * i;
      const price = maxPrice - (i / rows) * (maxPrice - minPrice);

      // Grid line
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();

      // Y-axis label on right
      ctx.fillText(price.toFixed(2), width + 10, y + 4);
    }

    // Vertical grid lines & Bottom Timestamps
    const cols = 7;
    ctx.textAlign = 'center';

    for (let j = 0; j <= cols; j++) {
      const x = (width / cols) * j;
      
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();

      // Timestamp at bottom
      const dataIdx = Math.floor((j / cols) * (data.length - 1));
      if (data[dataIdx]) {
        const time = new Date(data[dataIdx].time).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
        ctx.fillStyle = '#627289';
        ctx.fillText(time, x, height + 18);
      }
    }

    ctx.restore();
  }

  drawCandleChart(candles, openPositions) {
    const ctx = this.ctx;
    const rightMargin = 75;
    const bottomMargin = 28;
    const width = this.width - rightMargin;
    const height = this.height - bottomMargin;

    let minPrice = Infinity;
    let maxPrice = -Infinity;
    for (const c of candles) {
      if (c.low < minPrice) minPrice = c.low;
      if (c.high > maxPrice) maxPrice = c.high;
    }

    const padding = (maxPrice - minPrice) * 0.2 || 1;
    minPrice -= padding;
    maxPrice += padding;

    const priceToY = (p) => height - ((p - minPrice) / (maxPrice - minPrice)) * (height - 30) - 15;
    const candleWidth = Math.max(3, (width / candles.length) * 0.7);

    // Draw candles
    for (let i = 0; i < candles.length; i++) {
      const c = candles[i];
      const x = (i / (candles.length - 1)) * (width - candleWidth) + candleWidth / 2;
      const openY = priceToY(c.open);
      const closeY = priceToY(c.close);
      const highY = priceToY(c.high);
      const lowY = priceToY(c.low);

      const isUp = c.close >= c.open;
      const color = isUp ? '#00d09c' : '#ff4d6a';

      ctx.save();
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.lineWidth = 1.2;

      // Wick
      ctx.beginPath();
      ctx.moveTo(x, highY);
      ctx.lineTo(x, lowY);
      ctx.stroke();

      // Body
      const topY = Math.min(openY, closeY);
      const bodyH = Math.max(2, Math.abs(closeY - openY));
      ctx.fillRect(x - candleWidth / 2, topY, candleWidth, bodyH);
      ctx.restore();
    }

    this.drawGridAndScales(minPrice, maxPrice, candles, width, height, rightMargin, bottomMargin);
  }

  drawOpenPositionsMarkers(openPositions, priceToY, width) {
    const ctx = this.ctx;
    for (const pos of openPositions) {
      const y = priceToY(pos.entryPrice);
      const isCall = pos.direction === 'EVEN' || pos.direction === 'CALL' || pos.direction === 'OVER' || pos.direction === 'MATCHES';
      const color = isCall ? '#00d09c' : '#ff4d6a';

      ctx.save();
      ctx.strokeStyle = color;
      ctx.setLineDash([5, 3]);
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();

      // Tag
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.roundRect(10, y - 11, 85, 22, 4);
      ctx.fill();
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 10px "Inter", sans-serif';
      ctx.fillText(`${pos.direction} $${pos.stake}`, 16, y + 4);
      ctx.restore();
    }
  }

  drawCrosshair(pos) {
    const ctx = this.ctx;
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.setLineDash([2, 2]);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(pos.x, 0);
    ctx.lineTo(pos.x, this.height);
    ctx.moveTo(0, pos.y);
    ctx.lineTo(this.width, pos.y);
    ctx.stroke();
    ctx.restore();
  }
}
