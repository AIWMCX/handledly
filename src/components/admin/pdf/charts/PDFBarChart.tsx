import { Svg, Rect, Text, G } from '@react-pdf/renderer';

interface PDFBarChartProps {
  data: { label: string; value: number; color?: string }[];
  width: number;
  height: number;
  horizontal?: boolean;
  showValues?: boolean;
  barColor?: string;
}

const PDFBarChart = ({ 
  data, 
  width, 
  height, 
  horizontal = false,
  showValues = true,
  barColor = '#1E3A5F'
}: PDFBarChartProps) => {
  const maxValue = Math.max(...data.map(d => d.value));
  const padding = { top: 10, right: 10, bottom: 30, left: 60 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  if (horizontal) {
    const barHeight = (chartHeight / data.length) * 0.7;
    const barGap = (chartHeight / data.length) * 0.3;

    return (
      <Svg width={width} height={height}>
        {data.map((item, index) => {
          const barWidth = maxValue > 0 ? (item.value / maxValue) * chartWidth : 0;
          const y = padding.top + index * (barHeight + barGap);

          return (
            <G key={index}>
              {/* Label */}
              <Text
                x={padding.left - 5}
                y={y + barHeight / 2 + 3}
                style={{ fontSize: 8, fill: '#64748b' }}
                textAnchor="end"
              >
                {item.label}
              </Text>
              {/* Bar */}
              <Rect
                x={padding.left}
                y={y}
                width={barWidth}
                height={barHeight}
                fill={item.color || barColor}
                rx={2}
              />
              {/* Value */}
              {showValues && item.value > 0 && (
                <Text
                  x={padding.left + barWidth + 5}
                  y={y + barHeight / 2 + 3}
                  style={{ fontSize: 8, fill: '#0f172a', fontWeight: 600 }}
                >
                  {item.value.toLocaleString()}
                </Text>
              )}
            </G>
          );
        })}
      </Svg>
    );
  }

  // Vertical bars
  const barWidth = (chartWidth / data.length) * 0.6;
  const barGap = (chartWidth / data.length) * 0.4;

  return (
    <Svg width={width} height={height}>
      {data.map((item, index) => {
        const barHeight = maxValue > 0 ? (item.value / maxValue) * chartHeight : 0;
        const x = padding.left + index * (barWidth + barGap) + barGap / 2;
        const y = padding.top + chartHeight - barHeight;

        return (
          <G key={index}>
            {/* Bar */}
            <Rect
              x={x}
              y={y}
              width={barWidth}
              height={barHeight}
              fill={item.color || barColor}
              rx={2}
            />
            {/* Label */}
            <Text
              x={x + barWidth / 2}
              y={height - 10}
              style={{ fontSize: 7, fill: '#64748b' }}
              textAnchor="middle"
            >
              {item.label}
            </Text>
            {/* Value */}
            {showValues && item.value > 0 && (
              <Text
                x={x + barWidth / 2}
                y={y - 5}
                style={{ fontSize: 8, fill: '#0f172a', fontWeight: 600 }}
                textAnchor="middle"
              >
                {item.value.toLocaleString()}
              </Text>
            )}
          </G>
        );
      })}
    </Svg>
  );
};

export default PDFBarChart;
