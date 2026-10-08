import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, typography } from '../../../core/theme/theme';
import { ReturnsPeriod } from '../mutualfunds.types';

interface Props {
  returnsComparison: ReturnsPeriod[];
  fundName: string;
  benchmarkName: string;
}

export function ReturnsTable({ returnsComparison, fundName, benchmarkName }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.headerBox}>
        <Text style={styles.title}>Historical Returns & Benchmarks</Text>
        <Text style={styles.subtitle}>Annualized CAGR for ≥ 1 Year; Absolute for {'<'} 1 Year</Text>
      </View>

      {/* Table Head */}
      <View style={styles.tableHeaderRow}>
        <Text style={[styles.colHeader, styles.colPeriod]}>Period</Text>
        <Text style={[styles.colHeader, styles.colValue, styles.colFund]}>This Fund</Text>
        <Text style={[styles.colHeader, styles.colValue]}>Category Avg</Text>
        <Text style={[styles.colHeader, styles.colValue]}>Benchmark</Text>
      </View>

      {/* Table Rows */}
      {returnsComparison.map((item, idx) => {
        const beatBenchmark = item.fundReturn > item.benchmarkReturn;
        const beatCategory = item.fundReturn > item.categoryAvg;
        const isAlternate = idx % 2 === 1;

        return (
          <View
            key={item.period}
            style={[styles.tableRow, isAlternate && styles.alternateRow]}
          >
            <View style={styles.colPeriod}>
              <Text style={styles.periodText}>{item.period}</Text>
              {beatBenchmark && (
                <View style={styles.alphaTag}>
                  <Text style={styles.alphaTagText}>+α</Text>
                </View>
              )}
            </View>

            <View style={[styles.colValue, styles.colFund]}>
              <Text
                style={[
                  styles.fundReturnVal,
                  { color: item.fundReturn >= 0 ? colors.green : colors.pink },
                ]}
              >
                {item.fundReturn >= 0 ? '+' : ''}{item.fundReturn.toFixed(2)}%
              </Text>
            </View>

            <View style={styles.colValue}>
              <Text style={styles.peerReturnVal}>
                {item.categoryAvg >= 0 ? '+' : ''}{item.categoryAvg.toFixed(2)}%
              </Text>
            </View>

            <View style={styles.colValue}>
              <Text style={styles.peerReturnVal}>
                {item.benchmarkReturn >= 0 ? '+' : ''}{item.benchmarkReturn.toFixed(2)}%
              </Text>
            </View>
          </View>
        );
      })}

      {/* Benchmark Reference Footnote */}
      <View style={styles.benchmarkFootnote}>
        <Text style={styles.footnoteLabel}>Benchmark Index: </Text>
        <Text style={styles.footnoteValue}>{benchmarkName}</Text>
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
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  headerBox: {
    marginBottom: spacing.md,
  },
  title: {
    ...typography.h3,
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  subtitle: {
    ...typography.caption,
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  tableHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs + 2,
    borderBottomWidth: 1.5,
    borderBottomColor: colors.border,
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
  },
  colHeader: {
    ...typography.overline,
    fontSize: 10,
    color: colors.textMuted,
    fontWeight: '700',
  },
  colPeriod: {
    width: '24%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  colValue: {
    width: '25.3%',
    alignItems: 'flex-end',
    textAlign: 'right',
  },
  colFund: {
    paddingRight: 4,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(226, 232, 240, 0.6)',
  },
  alternateRow: {
    backgroundColor: 'rgba(244, 243, 239, 0.4)',
  },
  periodText: {
    ...typography.bodyBold,
    fontSize: 13,
    color: colors.text,
  },
  alphaTag: {
    backgroundColor: colors.greenSoft,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
  },
  alphaTagText: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.green,
  },
  fundReturnVal: {
    ...typography.bodyBold,
    fontSize: 13,
    fontWeight: '700',
  },
  peerReturnVal: {
    ...typography.body,
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '500',
  },
  benchmarkFootnote: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
    paddingTop: spacing.xs,
  },
  footnoteLabel: {
    ...typography.caption,
    color: colors.textMuted,
    fontSize: 11,
  },
  footnoteValue: {
    ...typography.caption,
    color: colors.purple,
    fontWeight: '700',
    fontSize: 11,
  },
});
