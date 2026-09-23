import React, { useState, useMemo } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Dimensions } from 'react-native';
import Svg, { Path, Defs, LinearGradient as SvgGradient, Stop, Line, Circle } from 'react-native-svg';
import { colors, radius, spacing, typography } from '../../../core/theme/theme';
import { NAVPoint } from '../mutualfunds.types';

const INTERVALS = ['1M', '6M', '1Y', '3Y', '5Y', 'ALL'] as const;
type IntervalType = (typeof INTERVALS)[number];

interface Props {
  navHistory: Record<IntervalType, NAVPoint[]>;
  currentNav: number;
  selectedInterval?: IntervalType;
  onIntervalChange?: (interval: IntervalType) => void;
  accentColor?: string;
}

export function NAVGraph({
  navHistory,
  currentNav,
  selectedInterval: controlledInterval,
  onIntervalChange,
  accentColor = colors.green,
}: Props) {
  const [internalInterval, setInternalInterval] = useState<IntervalType>('1Y');
  const activeInterval = controlledInterval || internalInterval;

  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const screenWidth = Dimensions.get('window').width;
  const graphWidth = Math.max(300, screenWidth - spacing.xl * 2 - spacing.md * 2);
  const graphHeight = 180;
  const paddingVertical = 20;

  const dataPoints = useMemo(() => {
    return navHistory[activeInterval] || navHistory['1Y'] || [];
  }, [navHistory, activeInterval]);

  const { minVal, maxVal, pathD, areaD, points, pctChange, isPositive } = useMemo(() => {
    if (!dataPoints || dataPoints.length < 2) {
      return { minVal: 0, maxVal: 0, pathD: '', areaD: '', points: [], pctChange: 0, isPositive: true };
    }

    const values = dataPoints.map((p) => p.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;

    const startVal = values[0];
    const endVal = values[values.length - 1];
    const change = endVal - startVal;
    const pct = (change / startVal) * 100;

    const stepX = graphWidth / (dataPoints.length - 1);
    const drawHeight = graphHeight - paddingVertical * 2;

    const pts = dataPoints.map((p, i) => {
      const x = i * stepX;
      const y = paddingVertical + drawHeight * (1 - (p.value - min) / range);
      return { x, y, point: p };
    });

    // Build smooth cubic bezier or line path
    let line = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
    for (let i = 1; i < pts.length; i++) {
      const prev = pts[i - 1];
      const curr = pts[i];
      const cp1x = prev.x + (curr.x - prev.x) / 2;
      const cp1y = prev.y;
      const cp2x = prev.x + (curr.x - prev.x) / 2;
      const cp2y = curr.y;
      line += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${curr.x.toFixed(1)} ${curr.y.toFixed(1)}`;
    }

    const area = `${line} L ${graphWidth} ${graphHeight} L 0 ${graphHeight} Z`;

    return {
      minVal: min,
      maxVal: max,
      pathD: line,
      areaD: area,
      points: pts,
      pctChange: pct,
      isPositive: pct >= 0,
    };
  }, [dataPoints, graphWidth, graphHeight]);

  const handleIntervalSelect = (interval: IntervalType) => {
    setActiveIndex(null);
    setInternalInterval(interval);
    onIntervalChange?.(interval);
  };

  const selectedPoint = activeIndex !== null && points[activeIndex] ? points[activeIndex] : null;
  const displayValue = selectedPoint ? selectedPoint.point.value : currentNav;
  const displayDate = selectedPoint ? selectedPoint.point.date : dataPoints[dataPoints.length - 1]?.date;

  const strokeColor = isPositive ? accentColor : colors.pink;
  const gradId = `nav-grad-${activeInterval}-${isPositive ? 'green' : 'red'}`;

  return (
    <View style={styles.container}>
      {/* Dynamic Inspector Header */}
      <View style={styles.metricsRow}>
        <View>
          <Text style={styles.displayNav}>₹{displayValue.toFixed(2)}</Text>
          <View style={styles.changeBadgeRow}>
            <Text style={[styles.pctText, { color: isPositive ? colors.green : colors.pink }]}>
              {isPositive ? '↑ +' : '↓ '}{pctChange.toFixed(2)}%
            </Text>
            <Text style={styles.intervalScopeText}>over {activeInterval}</Text>
          </View>
        </View>
        <View style={styles.dateBadge}>
          <Text style={styles.dateLabel}>{displayDate || 'Latest NAV'}</Text>
          {selectedPoint && <Text style={styles.scrubHint}>Tapped Point</Text>}
        </View>
      </View>

      {/* SVG Canvas */}
      <View style={styles.chartWrapper}>
        <Svg width={graphWidth} height={graphHeight}>
          <Defs>
            <SvgGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor={strokeColor} stopOpacity={0.32} />
              <Stop offset="90%" stopColor={strokeColor} stopOpacity={0.02} />
              <Stop offset="100%" stopColor={strokeColor} stopOpacity={0} />
            </SvgGradient>
          </Defs>

          {/* Baseline guide line */}
          <Line
            x1="0"
            y1={graphHeight - 1}
            x2={graphWidth}
            y2={graphHeight - 1}
            stroke={colors.border}
            strokeWidth="1"
            strokeDasharray="4 4"
          />

          {/* Area Fill */}
          {areaD ? <Path d={areaD} fill={`url(#${gradId})`} /> : null}

          {/* Trend Line */}
          {pathD ? (
            <Path
              d={pathD}
              stroke={strokeColor}
              strokeWidth="2.5"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ) : null}

          {/* Active / Highlighted Point */}
          {selectedPoint ? (
            <>
              <Line
                x1={selectedPoint.x}
                y1={paddingVertical}
                x2={selectedPoint.x}
                y2={graphHeight}
                stroke={colors.textMuted}
                strokeWidth="1"
                strokeDasharray="3 3"
              />
              <Circle
                cx={selectedPoint.x}
                cy={selectedPoint.y}
                r={6}
                fill={strokeColor}
                stroke={colors.white}
                strokeWidth={2}
              />
            </>
          ) : points.length > 0 ? (
            <Circle
              cx={points[points.length - 1].x}
              cy={points[points.length - 1].y}
              r={4.5}
              fill={strokeColor}
              stroke={colors.white}
              strokeWidth={1.5}
            />
          ) : null}
        </Svg>

        {/* Interactive Touch Overlay Zones */}
        <View style={styles.touchOverlay}>
          {points.map((pt, idx) => (
            <TouchableOpacity
              key={idx}
              style={styles.touchZone}
              activeOpacity={0.8}
              onPress={() => setActiveIndex(idx === activeIndex ? null : idx)}
            />
          ))}
        </View>
      </View>

      {/* High / Low Indicator Strip */}
      <View style={styles.minMaxRow}>
        <Text style={styles.minMaxText}>Low: ₹{minVal.toFixed(2)}</Text>
        <Text style={styles.hintText}>Tap curve to inspect</Text>
        <Text style={styles.minMaxText}>High: ₹{maxVal.toFixed(2)}</Text>
      </View>

      {/* Interval Selector Tabs */}
      <View style={styles.intervalRow}>
        {INTERVALS.map((int) => {
          const isActive = activeInterval === int;
          return (
            <TouchableOpacity
              key={int}
              style={[styles.intervalBtn, isActive && styles.intervalBtnActive]}
              onPress={() => handleIntervalSelect(int)}
              activeOpacity={0.7}
            >
              <Text style={[styles.intervalBtnText, isActive && styles.intervalBtnTextActive]}>
                {int}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  displayNav: {
    ...typography.h1,
    color: colors.text,
    fontSize: 26,
    fontWeight: '800',
  },
  changeBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  pctText: {
    ...typography.bodyBold,
    fontSize: 14,
  },
  intervalScopeText: {
    ...typography.caption,
    color: colors.textMuted,
    fontSize: 12,
  },
  dateBadge: {
    alignItems: 'flex-end',
    backgroundColor: colors.surfaceMuted,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.sm,
  },
  dateLabel: {
    ...typography.caption,
    color: colors.text,
    fontWeight: '600',
    fontSize: 11,
  },
  scrubHint: {
    fontSize: 9,
    color: colors.purple,
    fontWeight: '700',
    marginTop: 1,
  },
  chartWrapper: {
    position: 'relative',
    height: 180,
    marginTop: spacing.xs,
  },
  touchOverlay: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
  },
  touchZone: {
    flex: 1,
    height: '100%',
  },
  minMaxRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.xs,
    paddingHorizontal: 2,
    borderTopWidth: 1,
    borderTopColor: 'rgba(226, 232, 240, 0.6)',
    marginTop: spacing.xs,
  },
  minMaxText: {
    ...typography.caption,
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '500',
  },
  hintText: {
    fontSize: 10,
    color: colors.textMutedDark,
    fontStyle: 'italic',
  },
  intervalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.md,
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.md,
    padding: 3,
  },
  intervalBtn: {
    flex: 1,
    paddingVertical: 7,
    alignItems: 'center',
    borderRadius: radius.sm,
  },
  intervalBtnActive: {
    backgroundColor: colors.white,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  intervalBtnText: {
    ...typography.caption,
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
  },
  intervalBtnTextActive: {
    color: colors.text,
    fontWeight: '700',
  },
});
