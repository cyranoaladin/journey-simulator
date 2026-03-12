import * as React from 'react';
import { motion } from 'framer-motion';

interface MasteryScore {
    dimension: string;
    score: number;
    maxScore: number;
}

interface RadarChartProps {
    scores: MasteryScore[];
}

const RadarChart: React.FC<RadarChartProps> = ({ scores }) => {
    const centerX = 150;
    const centerY = 150;
    const maxRadius = 120;
    const angleStep = (2 * Math.PI) / scores.length;

    // Calculate points for the score polygon
    const scorePoints = scores.map((score, index) => {
        const angle = angleStep * index - Math.PI / 2; // Start from top
        const radius = (score.score / score.maxScore) * maxRadius;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        return `${x},${y}`;
    }).join(' ');

    // Calculate points for the max polygon (outer boundary)
    const maxPoints = scores.map((_, index) => {
        const angle = angleStep * index - Math.PI / 2;
        const x = centerX + maxRadius * Math.cos(angle);
        const y = centerY + maxRadius * Math.sin(angle);
        return `${x},${y}`;
    }).join(' ');

    // Generate grid circles
    const gridCircles = [0.25, 0.5, 0.75, 1].map(ratio => (
        <circle
            key={ratio}
            cx={centerX}
            cy={centerY}
            r={maxRadius * ratio}
            fill="none"
            stroke="rgba(255, 255, 255, 0.1)"
            strokeWidth="1"
        />
    ));

    // Generate axis lines and labels
    const axes = scores.map((score, index) => {
        const angle = angleStep * index - Math.PI / 2;
        const x = centerX + maxRadius * Math.cos(angle);
        const y = centerY + maxRadius * Math.sin(angle);
        const labelX = centerX + (maxRadius + 30) * Math.cos(angle);
        const labelY = centerY + (maxRadius + 30) * Math.sin(angle);

        return (
            <g key={index}>
                <line
                    x1={centerX}
                    y1={centerY}
                    x2={x}
                    y2={y}
                    stroke="rgba(255, 255, 255, 0.2)"
                    strokeWidth="1"
                />
                <text
                    x={labelX}
                    y={labelY}
                    fill="white"
                    fontSize="12"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="font-semibold"
                >
                    {score.dimension}
                </text>
                <text
                    x={labelX}
                    y={labelY + 15}
                    fill="#00E5FF"
                    fontSize="10"
                    textAnchor="middle"
                    className="font-mono"
                >
                    {score.score}/{score.maxScore}
                </text>
            </g>
        );
    });

    return (
        <svg width="300" height="300" viewBox="0 0 300 300" className="mx-auto">
            {gridCircles}
            {axes}

            {/* Max polygon (reference) */}
            <polygon
                points={maxPoints}
                fill="rgba(0, 240, 255, 0.05)"
                stroke="rgba(0, 240, 255, 0.3)"
                strokeWidth="1"
            />

            {/* Score polygon (actual performance) */}
            <motion.polygon
                points={scorePoints}
                fill="rgba(0, 240, 255, 0.3)"
                stroke="#00E5FF"
                strokeWidth="2"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 1.5, ease: 'easeOut' }}
            />

            {/* Score points */}
            {scores.map((score, index) => {
                const angle = angleStep * index - Math.PI / 2;
                const radius = (score.score / score.maxScore) * maxRadius;
                const x = centerX + radius * Math.cos(angle);
                const y = centerY + radius * Math.sin(angle);

                return (
                    <motion.circle
                        key={index}
                        cx={x}
                        cy={y}
                        r="4"
                        fill="#00E5FF"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: index * 0.1 + 0.5, duration: 0.3 }}
                    />
                );
            })}
        </svg>
    );
};

export default RadarChart;
