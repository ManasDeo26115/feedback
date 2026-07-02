import { useState } from 'react';
import { motion } from 'framer-motion';

const CHART_SIZE = 280;
const CENTER = CHART_SIZE / 2;
const LEVELS = 5;
const MAX_VALUE = 10;

export const RadarChart = ({ data = [] }) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const count = data.length;
  if (count === 0) return null;

  const angleStep = (2 * Math.PI) / count;
  const radius = CENTER - 40;

  // Get point coordinates at a given level for a given index
  const getPoint = (index, value) => {
    const angle = angleStep * index - Math.PI / 2;
    const r = (value / MAX_VALUE) * radius;
    return {
      x: CENTER + r * Math.cos(angle),
      y: CENTER + r * Math.sin(angle),
    };
  };

  // Build grid polygons
  const gridPolygons = [];
  for (let level = 1; level <= LEVELS; level++) {
    const fraction = level / LEVELS;
    const points = Array.from({ length: count }, (_, i) => {
      const angle = angleStep * i - Math.PI / 2;
      const r = fraction * radius;
      return `${CENTER + r * Math.cos(angle)},${CENTER + r * Math.sin(angle)}`;
    }).join(' ');
    gridPolygons.push(points);
  }

  // Build axis lines
  const axisLines = Array.from({ length: count }, (_, i) => {
    const angle = angleStep * i - Math.PI / 2;
    return {
      x2: CENTER + radius * Math.cos(angle),
      y2: CENTER + radius * Math.sin(angle),
    };
  });

  // Build data polygon
  const dataPoints = data.map((d, i) => getPoint(i, d.value));
  const dataPolygonStr = dataPoints.map((p) => `${p.x},${p.y}`).join(' ');

  // Label positions (slightly outside the grid)
  const labels = data.map((d, i) => {
    const angle = angleStep * i - Math.PI / 2;
    const labelR = radius + 26;
    return {
      x: CENTER + labelR * Math.cos(angle),
      y: CENTER + labelR * Math.sin(angle),
      label: d.label,
      value: d.value,
      anchor:
        Math.abs(Math.cos(angle)) < 0.1
          ? 'middle'
          : Math.cos(angle) > 0
          ? 'start'
          : 'end',
    };
  });

  return (
    <div className="relative flex items-center justify-center">
      <svg
        viewBox={`0 0 ${CHART_SIZE} ${CHART_SIZE}`}
        className="w-full max-w-[320px] h-auto"
        role="img"
        aria-label="Radar chart showing trait scores"
      >
        {/* Grid */}
        {gridPolygons.map((points, i) => (
          <polygon
            key={i}
            points={points}
            fill="none"
            stroke="#e2e8f0"
            strokeWidth={i === LEVELS - 1 ? 1.5 : 0.8}
            opacity={0.6 + i * 0.08}
          />
        ))}

        {/* Axis lines */}
        {axisLines.map((line, i) => (
          <line
            key={i}
            x1={CENTER}
            y1={CENTER}
            x2={line.x2}
            y2={line.y2}
            stroke="#e2e8f0"
            strokeWidth={0.8}
            opacity={0.5}
          />
        ))}

        {/* Animated Data polygon fill */}
        <motion.polygon
          initial={{ scale: 0.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.85, points: dataPolygonStr }}
          transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.2 }}
          stroke="url(#radarStroke)"
          strokeWidth={2.5}
          strokeLinejoin="round"
          fill="url(#radarGradient)"
          style={{ transformOrigin: 'center' }}
        />

        {/* Data points */}
        {dataPoints.map((p, i) => (
          <motion.circle
            key={i}
            cx={p.x}
            cy={p.y}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: hoveredIndex === i ? 1.4 : 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
            r={4}
            fill="white"
            stroke="#4c6ef5"
            strokeWidth={2}
            className="cursor-pointer"
            onMouseEnter={() => setHoveredIndex(i)}
            onMouseLeave={() => setHoveredIndex(null)}
          />
        ))}

        {/* Labels */}
        {labels.map((l, i) => (
          <text
            key={i}
            x={l.x}
            y={l.y}
            textAnchor={l.anchor}
            dominantBaseline="central"
            className={`text-[8px] font-bold transition-all duration-200 ${
              hoveredIndex === i ? 'fill-blue-700' : 'fill-slate-500'
            }`}
          >
            {l.label}
            {hoveredIndex === i && (
              <tspan className="fill-blue-600 font-extrabold"> ({l.value.toFixed(1)})</tspan>
            )}
          </text>
        ))}

        {/* Gradient definitions */}
        <defs>
          <linearGradient id="radarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(59, 130, 246, 0.25)" />
            <stop offset="100%" stopColor="rgba(99, 102, 241, 0.18)" />
          </linearGradient>
          <linearGradient id="radarStroke" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#6366f1" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};
