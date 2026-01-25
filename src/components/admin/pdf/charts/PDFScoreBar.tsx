import { Svg, Rect, Text, G } from '@react-pdf/renderer';

interface PDFScoreBarProps {
  label: string;
  score: number;
  maxScore?: number;
  width: number;
  height?: number;
  color?: string;
  bgColor?: string;
}

const PDFScoreBar = ({
  label,
  score,
  maxScore = 10,
  width,
  height = 24,
  color = '#1E3A5F',
  bgColor = '#e2e8f0',
}: PDFScoreBarProps) => {
  const labelWidth = 100;
  const valueWidth = 30;
  const barWidth = width - labelWidth - valueWidth - 10;
  const barHeight = 8;
  const fillWidth = (score / maxScore) * barWidth;

  return (
    <Svg width={width} height={height}>
      {/* Label */}
      <Text
        x={0}
        y={height / 2 + 3}
        style={{ fontSize: 9, fill: '#334155' }}
      >
        {label}
      </Text>

      {/* Background bar */}
      <Rect
        x={labelWidth}
        y={(height - barHeight) / 2}
        width={barWidth}
        height={barHeight}
        fill={bgColor}
        rx={4}
      />

      {/* Fill bar */}
      <Rect
        x={labelWidth}
        y={(height - barHeight) / 2}
        width={fillWidth}
        height={barHeight}
        fill={color}
        rx={4}
      />

      {/* Score value */}
      <Text
        x={width - 5}
        y={height / 2 + 3}
        style={{ fontSize: 9, fontWeight: 600, fill: '#0f172a' }}
        textAnchor="end"
      >
        {score.toFixed(1)}/{maxScore}
      </Text>
    </Svg>
  );
};

export default PDFScoreBar;
