import { Svg, Circle, Text, G, Path } from '@react-pdf/renderer';

interface PDFProgressRingProps {
  percentage: number;
  size: number;
  strokeWidth?: number;
  color?: string;
  bgColor?: string;
  showLabel?: boolean;
  label?: string;
}

const PDFProgressRing = ({
  percentage,
  size,
  strokeWidth = 10,
  color = '#22C55E',
  bgColor = '#e2e8f0',
  showLabel = true,
  label,
}: PDFProgressRingProps) => {
  const radius = (size - strokeWidth) / 2;
  const center = size / 2;
  
  // Calculate the arc for the progress
  const clampedPercentage = Math.min(Math.max(percentage, 0), 100);
  const angle = (clampedPercentage / 100) * 360;
  const angleRad = (angle - 90) * (Math.PI / 180); // Start from top (-90 degrees)
  const startAngleRad = -90 * (Math.PI / 180);
  
  const x1 = center + radius * Math.cos(startAngleRad);
  const y1 = center + radius * Math.sin(startAngleRad);
  const x2 = center + radius * Math.cos(angleRad);
  const y2 = center + radius * Math.sin(angleRad);
  
  const largeArcFlag = angle > 180 ? 1 : 0;
  
  // Full circle path for 100%
  const progressPath = clampedPercentage >= 100
    ? `M ${x1} ${y1} A ${radius} ${radius} 0 1 1 ${center - radius} ${center} A ${radius} ${radius} 0 1 1 ${x1} ${y1}`
    : clampedPercentage > 0
    ? `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`
    : '';

  return (
    <Svg width={size} height={size}>
      {/* Background circle */}
      <Circle
        cx={center}
        cy={center}
        r={radius}
        stroke={bgColor}
        strokeWidth={strokeWidth}
        fill="none"
      />
      
      {/* Progress arc */}
      {progressPath && (
        <Path
          d={progressPath}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
        />
      )}

      {/* Center text */}
      {showLabel && (
        <G>
          <Text
            x={center}
            y={center - 2}
            style={{ fontSize: 20, fontWeight: 700, fill: '#0f172a' }}
            textAnchor="middle"
          >
            {percentage}%
          </Text>
          {label && (
            <Text
              x={center}
              y={center + 14}
              style={{ fontSize: 8, fill: '#64748b' }}
              textAnchor="middle"
            >
              {label}
            </Text>
          )}
        </G>
      )}
    </Svg>
  );
};

export default PDFProgressRing;
