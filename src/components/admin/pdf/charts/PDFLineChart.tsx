import { Svg, Path, Text, G, Line, Rect } from '@react-pdf/renderer';

interface PDFLineChartProps {
  data: { x: string; y: number }[];
  width: number;
  height: number;
  color?: string;
  fillArea?: boolean;
  showGrid?: boolean;
}

const PDFLineChart = ({
  data,
  width,
  height,
  color = '#1E3A5F',
  fillArea = true,
  showGrid = true,
}: PDFLineChartProps) => {
  const padding = { top: 20, right: 20, bottom: 30, left: 50 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  
  const maxY = Math.max(...data.map(d => d.y));
  const minY = 0;
  const yRange = maxY - minY || 1;

  // Calculate points
  const points = data.map((d, i) => ({
    x: padding.left + (i / (data.length - 1 || 1)) * chartWidth,
    y: padding.top + chartHeight - ((d.y - minY) / yRange) * chartHeight,
    label: d.x,
    value: d.y,
  }));

  // Create line path
  const linePath = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
    .join(' ');

  // Create area path
  const areaPath = fillArea
    ? `${linePath} L ${points[points.length - 1]?.x || 0} ${padding.top + chartHeight} L ${padding.left} ${padding.top + chartHeight} Z`
    : '';

  // Grid lines
  const gridLines = [0, 0.25, 0.5, 0.75, 1].map(ratio => ({
    y: padding.top + chartHeight * (1 - ratio),
    value: Math.round(minY + yRange * ratio),
  }));

  return (
    <Svg width={width} height={height}>
      {/* Grid lines */}
      {showGrid && gridLines.map((line, i) => (
        <G key={i}>
          <Line
            x1={padding.left}
            y1={line.y}
            x2={width - padding.right}
            y2={line.y}
            stroke="#e2e8f0"
            strokeWidth={1}
          />
          <Text
            x={padding.left - 5}
            y={line.y + 3}
            style={{ fontSize: 7, fill: '#94a3b8' }}
            textAnchor="end"
          >
            ${(line.value / 1000).toFixed(0)}K
          </Text>
        </G>
      ))}

      {/* Area fill */}
      {fillArea && (
        <Path
          d={areaPath}
          fill={`${color}20`}
        />
      )}

      {/* Line */}
      <Path
        d={linePath}
        stroke={color}
        strokeWidth={2}
        fill="none"
      />

      {/* Data points */}
      {points.map((point, i) => (
        <G key={i}>
          <Rect
            x={point.x - 3}
            y={point.y - 3}
            width={6}
            height={6}
            fill={color}
            rx={3}
          />
          {/* X-axis labels (only for first, middle, last) */}
          {(i === 0 || i === data.length - 1 || i === Math.floor(data.length / 2)) && (
            <Text
              x={point.x}
              y={height - 10}
              style={{ fontSize: 8, fill: '#64748b' }}
              textAnchor="middle"
            >
              {point.label}
            </Text>
          )}
        </G>
      ))}
    </Svg>
  );
};

export default PDFLineChart;
