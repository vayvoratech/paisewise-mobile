import React from 'react';
import { StyleSheet, View } from 'react-native';
import { colors, radius } from '../../core/theme/theme';

type Props = {
  /** 0..1 */
  progress: number;
  color?: string;
  trackColor?: string;
  height?: number;
};

export function ProgressBar({ progress, color = colors.amber, trackColor = 'rgba(255,255,255,0.15)', height = 6 }: Props) {
  const pct = Math.max(0, Math.min(1, progress));
  return (
    <View style={[styles.track, { backgroundColor: trackColor, height, borderRadius: height }]}>
      <View style={[styles.fill, { backgroundColor: color, width: `${pct * 100}%`, borderRadius: height }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: { width: '100%', overflow: 'hidden' },
  fill: { height: '100%' },
});
