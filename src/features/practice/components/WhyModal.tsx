import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, radius, spacing, typography } from '../../../core/theme/theme';
import { PracticeStock } from '../practice.data';
import { formatINR } from '../../../shared/format';

interface WhyModalProps {
  stock: PracticeStock | null;
  visible: boolean;
  onClose: () => void;
  onBuyPress: (stock: PracticeStock) => void;
}

export function WhyModal({ stock, visible, onClose, onBuyPress }: WhyModalProps) {
  if (!stock) return null;

  const up = stock.changePct >= 0;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <View style={styles.grabber} />

          <View style={styles.header}>
            <View style={styles.titleRow}>
              <View style={styles.emojiBadge}>
                <Text style={{ fontSize: 24 }}>{stock.emoji}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.symbol}>{stock.symbol}</Text>
                <Text style={styles.name}>{stock.name}</Text>
              </View>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <Text style={styles.closeBtnText}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.priceRow}>
              <Text style={styles.price}>{formatINR(stock.price)}</Text>
              <View style={[styles.pctBadge, { backgroundColor: up ? '#EAFBF3' : colors.redSoft }]}>
                <Text style={[styles.pctText, { color: up ? colors.green : colors.pink }]}>
                  {up ? '▲ +' : '▼ '}{stock.changePct}% today
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.cardHead}>
              <Text style={styles.cardBadge}>💡 BEGINNER ANALYSIS</Text>
              <Text style={styles.sector}>{stock.sector}</Text>
            </View>
            <Text style={styles.whyText}>{stock.whyReason}</Text>
          </View>

          <View style={styles.metricsRow}>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>P/E RATIO</Text>
              <Text style={styles.metricValue}>{stock.peRatio ? `${stock.peRatio}x` : '24.5x'}</Text>
              <Text style={styles.metricSub}>Valuation</Text>
            </View>
            <View style={styles.metricDivider} />
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>MARKET CAP</Text>
              <Text style={styles.metricValue}>{stock.marketCap || 'Large Cap'}</Text>
              <Text style={styles.metricSub}>Blue-chip</Text>
            </View>
            <View style={styles.metricDivider} />
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>RISK LEVEL</Text>
              <Text style={[styles.metricValue, { color: colors.green }]}>Moderate</Text>
              <Text style={styles.metricSub}>Top 50 Nifty</Text>
            </View>
          </View>

          <View style={styles.tipBox}>
            <Text style={styles.tipTitle}>🎓 Practice Trading Tip</Text>
            <Text style={styles.tipText}>
              In practice mode, use virtual money to observe how market news affects this stock without financial stress!
            </Text>
          </View>

          <SafeAreaView edges={['bottom']}>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => {
                onClose();
                onBuyPress(stock);
              }}
            >
              <Text style={styles.actionBtnText}>Practice Buy {stock.symbol} →</Text>
            </TouchableOpacity>
          </SafeAreaView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.xl,
  },
  grabber: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginBottom: spacing.md,
  },
  header: {
    marginBottom: spacing.md,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  emojiBadge: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  symbol: {
    ...typography.h2,
    color: colors.text,
  },
  name: {
    ...typography.caption,
    color: colors.textMuted,
  },
  closeBtn: {
    padding: spacing.xs,
  },
  closeBtnText: {
    fontSize: 18,
    color: colors.textMuted,
    fontWeight: '700',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  price: {
    ...typography.h2,
    color: colors.text,
  },
  pctBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  pctText: {
    ...typography.caption,
    fontWeight: '700',
  },
  card: {
    backgroundColor: '#F8FAFC',
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: spacing.sm,
  },
  cardHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  cardBadge: {
    ...typography.overline,
    color: colors.purple,
    fontWeight: '800',
  },
  sector: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: '600',
  },
  whyText: {
    ...typography.body,
    color: '#334155',
    lineHeight: 22,
    marginTop: 4,
  },
  metricsRow: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    marginTop: spacing.md,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  metricItem: {
    alignItems: 'center',
    flex: 1,
  },
  metricLabel: {
    ...typography.overline,
    fontSize: 10,
    color: colors.textMuted,
  },
  metricValue: {
    ...typography.bodyBold,
    color: colors.text,
    marginTop: 2,
  },
  metricSub: {
    fontSize: 11,
    color: colors.textMuted,
  },
  metricDivider: {
    width: 1,
    height: 28,
    backgroundColor: colors.border,
  },
  tipBox: {
    backgroundColor: colors.yellowCard,
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: colors.yellowBorder,
  },
  tipTitle: {
    ...typography.caption,
    fontWeight: '700',
    color: '#92722A',
  },
  tipText: {
    fontSize: 13,
    color: '#92722A',
    marginTop: 2,
    lineHeight: 18,
  },
  actionBtn: {
    backgroundColor: colors.green,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  actionBtnText: {
    ...typography.bodyBold,
    color: colors.white,
  },
});
