import { useEffect, useRef } from 'react';
import { generateStableKey } from '../../utils/generateStableKey';

export interface IndicatorBlock {
  kind: 'indicator_block';
  id: string;
  title: string;
  indicators: Array<{
    name: string;
    value: number; // 0-100
    max: number; // généralement 100
    color?: string; // couleur personnalisée
  }>;
  type: 'gauge' | 'radar' | 'bar'; // Type de visualisation
}

interface IndicatorBlockProps {
  block: IndicatorBlock;
}

export default function IndicatorBlock({ block }: IndicatorBlockProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (block.type === 'radar' && canvasRef.current) {
      drawRadarChart();
    } else if (block.type === 'gauge' && canvasRef.current) {
      drawGaugeChart();
    }
  }, [block]);

  const drawRadarChart = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = canvas;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) * 0.4;
    const numIndicators = block.indicators.length;
    const angleStep = (Math.PI * 2) / numIndicators;

    // Effacer le canvas
    ctx.clearRect(0, 0, width, height);

    // Dessiner le fond du graphique
    ctx.beginPath();
    for (let i = 0; i < numIndicators; i++) {
      const angle = i * angleStep - Math.PI / 2;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.closePath();
    ctx.strokeStyle = '#374151'; // border-white/10
    ctx.stroke();

    // Dessiner les lignes radiales
    ctx.beginPath();
    for (let i = 0; i < numIndicators; i++) {
      const angle = i * angleStep - Math.PI / 2;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);

      ctx.moveTo(centerX, centerY);
      ctx.lineTo(x, y);
    }
    ctx.strokeStyle = '#374151';
    ctx.stroke();

    // Dessiner les indicateurs
    ctx.beginPath();
    for (let i = 0; i < numIndicators; i++) {
      const indicator = block.indicators[i];
      const value = indicator.value / indicator.max;
      const angle = i * angleStep - Math.PI / 2;
      const x = centerX + (radius * value) * Math.cos(angle);
      const y = centerY + (radius * value) * Math.sin(angle);

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.closePath();
    ctx.fillStyle = 'rgba(8, 145, 178, 0.3)'; // bg-cyan-500/30
    ctx.fill();
    ctx.strokeStyle = '#0ea5e9'; // text-cyan-400
    ctx.lineWidth = 2;
    ctx.stroke();

    // Dessiner les points
    for (let i = 0; i < numIndicators; i++) {
      const indicator = block.indicators[i];
      const value = indicator.value / indicator.max;
      const angle = i * angleStep - Math.PI / 2;
      const x = centerX + (radius * value) * Math.cos(angle);
      const y = centerY + (radius * value) * Math.sin(angle);

      ctx.beginPath();
      ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.fillStyle = '#0ea5e9'; // text-cyan-400
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Dessiner les labels
    for (let i = 0; i < numIndicators; i++) {
      const indicator = block.indicators[i];
      const angle = i * angleStep - Math.PI / 2;
      const x = centerX + (radius * 1.1) * Math.cos(angle);
      const y = centerY + (radius * 1.1) * Math.sin(angle);

      ctx.font = '12px sans-serif';
      ctx.fillStyle = '#d1d5db';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(indicator.name, x, y);
    }
  };

  const drawGaugeChart = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = canvas;
    const centerX = width / 2;
    const centerY = height * 0.8;
    const radius = Math.min(width, height) * 0.4;

    // Effacer le canvas
    ctx.clearRect(0, 0, width, height);

    // Dessiner l'arc de base
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, Math.PI, 2 * Math.PI);
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 10;
    ctx.stroke();

    // Dessiner les valeurs
    if (block.indicators.length > 0) {
      const indicator = block.indicators[0]; // Pour la jauge, on affiche le premier indicateur
      const value = indicator.value / indicator.max;
      const startAngle = Math.PI;
      const endAngle = Math.PI + value * Math.PI;

      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.strokeStyle = '#0ea5e9'; // text-cyan-400
      ctx.lineWidth = 10;
      ctx.lineCap = 'round';
      ctx.stroke();

      // Dessiner le texte
      ctx.font = 'bold 20px sans-serif';
      ctx.fillStyle = '#f9fafb';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${Math.round(indicator.value)}`, centerX, centerY - 10);

      ctx.font = '14px sans-serif';
      ctx.fillStyle = '#9ca3af';
      ctx.fillText(indicator.name, centerX, centerY + 20);
    }
  };

  return (
    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
      <h4 className="font-semibold mb-4 flex items-center">
        <span className="w-2 h-2 bg-cyan-500 rounded-full mr-2"></span>
        {block.title}
      </h4>

      <div className="flex justify-center">
        <canvas
          ref={canvasRef}
          width={block.type === 'radar' ? 400 : 300}
          height={block.type === 'radar' ? 400 : 200}
          className="w-full"
        />
      </div>

      {block.type !== 'radar' && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mt-4">
          {block.indicators.map((indicator) => {
            const indicatorKey = generateStableKey(indicator, 'indicator', ['name', 'id']);
            return (
              <div key={indicatorKey} className="bg-black/30 rounded-lg p-3 border border-white/10">
                <div className="text-sm font-medium text-cyan-400">{indicator.name}</div>
                <div className="text-lg font-bold">{Math.round(indicator.value)}/{indicator.max}</div>
                <div className="w-full bg-gray-700 rounded-full h-1.5 mt-1">
                  <div
                    className="h-1.5 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500"
                    style={{ width: `${(indicator.value / indicator.max) * 100}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
