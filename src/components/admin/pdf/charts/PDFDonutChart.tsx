import { Svg, Path, Text, G, Circle } from '@react-pdf/renderer';

interface PDFDonutChartProps {
  segments: { label: string; value: number; color: string }[];
  size: number;
  thickness?: number;
  centerLabel?: string;
  centerValue?: string;
}

const PDFDonutChart = ({
  segments,
  size,
  thickness = 20,
  centerLabel,
  centerValue,
}: PDFDonutChartProps) => {
  const total = segments.reduce((sum, s) => sum + s.value, 0);
  const radius = (size - thickness) / 2;
  const center = size / 2;

  // Calculate arc paths
  let startAngle = -90; // Start from top
  const arcs = segments.map((segment) => {
    const angle = total > 0 ? (segment.value / total) * 360 : 0;
    const endAngle = startAngle + angle;

    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;

    const x1 = center + radius * Math.cos(startRad);
    const y1 = center + radius * Math.sin(startRad);
    const x2 = center + radius * Math.cos(endRad);
    const y2 = center + radius * Math.sin(endRad);

    const largeArc = angle > 180 ? 1 : 0;

    const path = angle >= 360 
      ? `M ${center + radius} ${center} A ${radius} ${radius} 0 1 1 ${center - radius} ${center} A ${radius} ${radius} 0 1 1 ${center + radius} ${center}`
      : `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`;

    startAngle = endAngle;

    return { ...segment, path };
  });

  return (
    <Svg width={size} height={size}>
      {/* Background circle */}
      <Circle
        cx={center}
        cy={center}
        r={radius}
        stroke="#e2e8f0"
        strokeWidth={thickness}
        fill="none"
      />
      
      {/* Segments */}
      {arcs.map((arc, index) => (
        <Path
          key={index}
          d={arc.path}
          stroke={arc.color}
          strokeWidth={thickness}
          fill="none"
          strokeLinecap="round"
        />
      ))}

      {/* Center text */}
      {centerValue && (
        <G>
          <Text
            x={center}
            y={center - 5}
            style={{ fontSize: 18, fontWeight: 700, fill: '#0f172a' }}
            textAnchor="middle"
          >
            {centerValue}
          </Text>
          {centerLabel && (
            <Text
              x={center}
              y={center + 12}
              style={{ fontSize: 8, fill: '#64748b' }}
              textAnchor="middle"
            >
              {centerLabel}
            </Text>
          )}
        </G>
      )}
    </Svg>
  );
};

export default PDFDonutChart;
