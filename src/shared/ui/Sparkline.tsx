import React from 'react';
import { View } from 'react-native';
import Svg, { Path, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';
import { colors } from '../../core/theme/theme';

type Props = {
  data: number[];
  width: number;
  height: number;
  color?: string;
  /** Fill the area under the line with a fading gradient. */
  fill?: boolean;
  strokeWidth?: number;
};

/** Lightweight line/area chart for price trends and portfolio value. */
export function Sparkline({ data, width, height, color = colors.green, fill = true, strokeWidth = 2.5 }: Props) {
  if (data.length < 2) return <View style={{ width, height }} />;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const stepX = width / (data.length - 1);
  const pad = strokeWidth;

  const points = data.map((v, i) => {
    const x = i * stepX;
    const y = pad + (height - pad * 2) * (1 - (v - min) / range);
    return [x, y] as const;
  });

  const linePath = points.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  const areaPath = `${linePath} L${width},${height} L0,${height} Z`;
  const gradId = `spark-${color.replace('#', '')}`;

  return (
    <Svg width={width} height={height}>
      {fill && (
        <Defs>
          <SvgGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={color} stopOpacity={0.25} />
            <Stop offset="1" stopColor={color} stopOpacity={0} />
          </SvgGradient>
        </Defs>
      )}
      {fill && <Path d={areaPath} fill={`url(#${gradId})`} />}
      <Path d={linePath} stroke={color} strokeWidth={strokeWidth} fill="none" strokeLinejoin="round" strokeLinecap="round" />
    </Svg>
  );
}
