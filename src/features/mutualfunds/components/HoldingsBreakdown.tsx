import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { colors, radius, spacing, typography } from '../../../core/theme/theme';
import { HoldingItem, SectorAllocation } from '../mutualfunds.types';

interface Props {
  holdings: HoldingItem[];
  sectors: SectorAllocation[];
  onHoldingPress?: (holding: HoldingItem) => void;
}

export function HoldingsBreakdown({ holdings, sectors, onHoldingPress }: Props) {
  const [activeTab, setActiveTab] = useState<'holdings' | 'sectors'>('holdings');

  return (
    <View style={styles.container}>
      {/* Sub-tab Navigation */}
      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'holdings' && styles.tabBtnActive]}
          onPress={() => setActiveTab('holdings')}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabText, activeTab === 'holdings' && styles.tabTextActive]}>
            Top Holdings ({holdings.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'sectors' && styles.tabBtnActive]}
          onPress={() => setActiveTab('sectors')}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabText, activeTab === 'sectors' && styles.tabTextActive]}>
            Sector Allocation
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content: Top Holdings */}
      {activeTab === 'holdings' ? (
        <View style={styles.listContainer}>
          {holdings.map((item, index) => {
            return (
              <TouchableOpacity
                key={item.id || index}
                style={styles.holdingRow}
                onPress={() => onHoldingPress?.(item)}
                disabled={!onHoldingPress}
                activeOpacity={0.7}
              >
                <View style={styles.rankBadge}>
                  <Text style={styles.rankText}>{index + 1}</Text>
                </View>

                <View style={styles.holdingInfo}>
                  <View style={styles.holdingTitleRow}>
                    <Text style={styles.holdingName} numberOfLines={1}>
                      {item.name}
                    </Text>
                    <Text style={styles.holdingAlloc}>{item.allocationPct.toFixed(1)}%</Text>
                  </View>

                  <View style={styles.metaRow}>
                    <Text style={styles.holdingSector}>{item.sector}</Text>
                    {item.instrumentType && (
                      <View style={styles.typeBadge}>
                        <Text style={styles.typeText}>{item.instrumentType}</Text>
                      </View>
                    )}
                  </View>

                  {/* Allocation Visual Bar */}
                  <View style={styles.barBg}>
                    <View
                      style={[
                        styles.barFill,
                        { width: `${Math.min(100, item.allocationPct * 8)}%` },
                      ]}
                    />
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      ) : (
        /* Content: Sector Allocation */
        <View style={styles.listContainer}>
          {sectors.map((sec, idx) => (
            <View key={sec.sector || idx} style={styles.sectorRow}>
              <View style={styles.sectorHead}>
                <View style={styles.sectorLabelWrap}>
                  <View
                    style={[
                      styles.sectorDot,
                      { backgroundColor: sec.color || colors.purple },
                    ]}
                  />
                  <Text style={styles.sectorName}>{sec.sector}</Text>
                </View>
                <Text style={styles.sectorPercent}>{sec.allocationPct.toFixed(1)}%</Text>
              </View>

              <View style={styles.barBg}>
                <View
                  style={[
                    styles.barFill,
                    {
                      width: `${Math.min(100, sec.allocationPct * 2.2)}%`,
                      backgroundColor: sec.color || colors.purple,
                    },
                  ]}
                />
              </View>
            </View>
          ))}
        </View>
      )}
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
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  tabRow: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.md,
    padding: 3,
    marginBottom: spacing.md,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: radius.sm,
  },
  tabBtnActive: {
    backgroundColor: colors.white,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  tabText: {
    ...typography.caption,
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
  },
  tabTextActive: {
    color: colors.text,
    fontWeight: '700',
  },
  listContainer: {
    gap: 12,
  },
  holdingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  rankBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  rankText: {
    ...typography.caption,
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
  },
  holdingInfo: {
    flex: 1,
  },
  holdingTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  holdingName: {
    ...typography.bodyBold,
    fontSize: 13,
    color: colors.text,
    flex: 1,
    marginRight: 8,
  },
  holdingAlloc: {
    ...typography.bodyBold,
    fontSize: 13,
    color: colors.text,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
    marginBottom: 4,
  },
  holdingSector: {
    ...typography.caption,
    fontSize: 11,
    color: colors.textMuted,
  },
  typeBadge: {
    backgroundColor: colors.surfaceAlt,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  typeText: {
    fontSize: 9,
    fontWeight: '600',
    color: colors.textFaint,
  },
  barBg: {
    height: 4,
    backgroundColor: colors.surfaceMuted,
    borderRadius: 2,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: colors.purple,
    borderRadius: 2,
  },
  sectorRow: {
    paddingVertical: 4,
  },
  sectorHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  sectorLabelWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  sectorName: {
    ...typography.bodyBold,
    fontSize: 13,
    color: colors.text,
  },
  sectorPercent: {
    ...typography.bodyBold,
    fontSize: 13,
    color: colors.text,
  },
});
