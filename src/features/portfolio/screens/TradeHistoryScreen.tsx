import React, { useEffect, useState, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Modal,
  TextInput,
  Share,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import { colors, radius, spacing, typography } from '../../../core/theme/theme';
import { formatINR } from '../../../shared/format';
import { OrderReceipt } from '../order.types';
import { fetchRealOrdersThunk } from '../../practice/slices/orderSlice';
import Analytics from '../../../core/analyticsService';
import type { RootState, AppDispatch } from '../../../app/store';

type DateFilter = 'ALL' | 'TODAY' | 'LAST_7D' | 'THIS_MONTH' | 'CUSTOM';

export default function TradeHistoryScreen() {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch<AppDispatch>();

  const realOrders = useSelector((state: RootState) => state.order.realOrders);
  const practiceOrders = useSelector((state: RootState) => state.order.orders);

  const [dateFilter, setDateFilter] = useState<DateFilter>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [calendarModalVisible, setCalendarModalVisible] = useState(false);
  const [exportModalVisible, setExportModalVisible] = useState(false);
  const [csvContent, setCsvContent] = useState('');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [copiedToast, setCopiedToast] = useState(false);

  useEffect(() => {
    dispatch(fetchRealOrdersThunk());
  }, [dispatch]);

  // Combine real completed orders + practice orders into standard trade history items
  const allTrades = useMemo(() => {
    const realCompleted = realOrders
      .filter((o) => o.status === 'COMPLETE')
      .map((o) => ({
        id: o.orderId,
        orderId: o.orderId,
        brokerOrderId: o.brokerOrderId || 'FYERS_LIVE',
        symbol: o.symbol,
        side: o.side,
        quantity: o.filledQty || o.quantity,
        price: o.avgPrice || o.price,
        totalValue: Math.round((o.avgPrice || o.price) * (o.filledQty || o.quantity)),
        timestamp: o.placedAt,
        status: o.status,
        isPaper: false,
      }));

    const paperExecuted = practiceOrders.map((p, idx) => ({
      id: p.id || `paper_${idx}`,
      orderId: `paper_ord_${idx}`,
      brokerOrderId: 'PAPER_SIM',
      symbol: p.symbol,
      side: (p.type || 'BUY') as 'BUY' | 'SELL',
      quantity: p.shares,
      price: p.pricePerShare,
      totalValue: Math.round(p.pricePerShare * p.shares),
      timestamp: p.timestamp,
      status: 'COMPLETE' as const,
      isPaper: true,
    }));

    // If both empty, supply standard demo trades
    if (realCompleted.length === 0 && paperExecuted.length === 0) {
      return [
        {
          id: 'demo_tr_1',
          orderId: 'ord_1001',
          brokerOrderId: 'FYERS_9021',
          symbol: 'RELIANCE',
          side: 'BUY' as const,
          quantity: 5,
          price: 2950.00,
          totalValue: 14750,
          timestamp: new Date().toISOString(),
          status: 'COMPLETE' as const,
          isPaper: false,
        },
        {
          id: 'demo_tr_2',
          orderId: 'ord_1002',
          brokerOrderId: 'FYERS_9022',
          symbol: 'TCS',
          side: 'BUY' as const,
          quantity: 3,
          price: 3801.00,
          totalValue: 11403,
          timestamp: new Date(Date.now() - 86400000).toISOString(),
          status: 'COMPLETE' as const,
          isPaper: false,
        },
        {
          id: 'demo_tr_3',
          orderId: 'ord_1003',
          brokerOrderId: 'FYERS_9023',
          symbol: 'INFY',
          side: 'SELL' as const,
          quantity: 4,
          price: 1456.00,
          totalValue: 5824,
          timestamp: new Date(Date.now() - 86400000 * 3).toISOString(),
          status: 'COMPLETE' as const,
          isPaper: false,
        },
      ];
    }

    return [...realCompleted, ...paperExecuted].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }, [realOrders, practiceOrders]);

  // Filter trades based on date and search query
  const filteredTrades = useMemo(() => {
    const now = new Date();
    return allTrades.filter((t) => {
      const tradeDate = new Date(t.timestamp);
      const matchesSearch = t.symbol.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;

      if (dateFilter === 'TODAY') {
        return tradeDate.toDateString() === now.toDateString();
      } else if (dateFilter === 'LAST_7D') {
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return tradeDate >= sevenDaysAgo;
      } else if (dateFilter === 'THIS_MONTH') {
        return (
          tradeDate.getMonth() === now.getMonth() &&
          tradeDate.getFullYear() === now.getFullYear()
        );
      } else if (dateFilter === 'CUSTOM') {
        if (customStartDate && tradeDate < new Date(customStartDate)) return false;
        if (customEndDate && tradeDate > new Date(customEndDate + 'T23:59:59')) return false;
        return true;
      }
      return true;
    });
  }, [allTrades, dateFilter, searchQuery, customStartDate, customEndDate]);

  // Metrics
  const totalVolume = filteredTrades.reduce((sum, t) => sum + t.totalValue, 0);
  const buyCount = filteredTrades.filter((t) => t.side === 'BUY').length;
  const sellCount = filteredTrades.filter((t) => t.side === 'SELL').length;

  // CSV Generator
  const generateCsv = () => {
    const headers = 'Trade Date,Order ID,Broker ID,Symbol,Side,Quantity,Price (INR),Total Value (INR),Status,Mode\n';
    const rows = filteredTrades
      .map((t) => {
        const dateStr = new Date(t.timestamp).toISOString();
        return `"${dateStr}","${t.orderId}","${t.brokerOrderId || 'N/A'}","${t.symbol}","${t.side}",${t.quantity},${t.price},${t.totalValue},"${t.status}","${t.isPaper ? 'Practice' : 'Real'}"`;
      })
      .join('\n');

    const csv = headers + rows;
    setCsvContent(csv);
    setExportModalVisible(true);

    Analytics.taxReportDownloaded({
      report_type: 'trade_history_csv',
      report_period: dateFilter,
      file_format: 'csv',
    });
  };

  const handleShareCsv = async () => {
    try {
      await Share.share({
        title: 'PaiseWise Trade History Report',
        message: csvContent,
      });
    } catch (err) {
      console.warn('Share CSV error:', err);
    }
  };

  const renderTradeItem = ({ item }: { item: any }) => {
    const isBuy = item.side === 'BUY';
    return (
      <View style={styles.tradeCard}>
        <View style={styles.tradeTop}>
          <View style={styles.tradeSymbolRow}>
            <Text style={styles.tradeSymbol}>{item.symbol}</Text>
            <View style={[styles.sideBadge, isBuy ? styles.sideBuy : styles.sideSell]}>
              <Text style={[styles.sideText, isBuy ? styles.sideBuyText : styles.sideSellText]}>
                {item.side}
              </Text>
            </View>
            <View style={[styles.modeBadge, item.isPaper ? styles.modePaper : styles.modeReal]}>
              <Text style={[styles.modeBadgeText, item.isPaper ? styles.modePaperText : styles.modeRealText]}>
                {item.isPaper ? 'PRACTICE' : 'REAL'}
              </Text>
            </View>
          </View>
          <Text style={styles.tradeValue}>{formatINR(item.totalValue)}</Text>
        </View>

        <View style={styles.tradeBottom}>
          <Text style={styles.tradeMeta}>
            {item.quantity} shares @ {formatINR(item.price)}
          </Text>
          <Text style={styles.tradeDate}>
            {new Date(item.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })} ·{' '}
            {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      {/* Header */}
      <View style={styles.navHeader}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.navTitle}>Trade History</Text>
        <TouchableOpacity style={styles.exportBtn} onPress={generateCsv}>
          <Text style={styles.exportBtnText}>📥 CSV</Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchWrapper}>
        <TextInput
          style={styles.searchInput}
          placeholder="Filter trades by symbol..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={colors.textMuted}
        />
      </View>

      {/* Date Filter Chips & Calendar Picker */}
      <View style={styles.filterRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {[
            { id: 'ALL', label: 'All Time' },
            { id: 'TODAY', label: 'Today' },
            { id: 'LAST_7D', label: 'Last 7 Days' },
            { id: 'THIS_MONTH', label: 'This Month' },
            { id: 'CUSTOM', label: '📅 Custom Range' },
          ].map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.filterChip, dateFilter === item.id && styles.filterChipActive]}
              onPress={() => {
                if (item.id === 'CUSTOM') {
                  setDateFilter('CUSTOM');
                  setCalendarModalVisible(true);
                } else {
                  setDateFilter(item.id as DateFilter);
                }
              }}
            >
              <Text style={[styles.filterChipText, dateFilter === item.id && styles.filterChipTextActive]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Summary Statistics Card */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Total Trades</Text>
          <Text style={styles.summaryValue}>{filteredTrades.length}</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Traded Value</Text>
          <Text style={styles.summaryValue}>{formatINR(totalVolume)}</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Buy / Sell</Text>
          <Text style={styles.summaryValue}>
            <Text style={{ color: colors.green }}>{buyCount}B</Text> / <Text style={{ color: colors.pink }}>{sellCount}S</Text>
          </Text>
        </View>
      </View>

      {/* Trades List */}
      <FlatList
        data={filteredTrades}
        keyExtractor={(item) => item.id}
        renderItem={renderTradeItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📜</Text>
            <Text style={styles.emptyTitle}>No trades in this period</Text>
            <Text style={styles.emptySubtitle}>Try changing your date filter or search query.</Text>
          </View>
        }
      />

      {/* Calendar Date Picker Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={calendarModalVisible}
        onRequestClose={() => setCalendarModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>📅 Select Date Range</Text>
              <TouchableOpacity onPress={() => setCalendarModalVisible(false)}>
                <Text style={styles.closeText}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSubtitle}>Filter trade execution records by start & end date.</Text>

            <View style={styles.dateInputs}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Start Date (YYYY-MM-DD)</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="2026-01-01"
                  value={customStartDate}
                  onChangeText={setCustomStartDate}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>End Date (YYYY-MM-DD)</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="2026-12-31"
                  value={customEndDate}
                  onChangeText={setCustomEndDate}
                />
              </View>
            </View>

            {/* Quick Presets */}
            <View style={styles.presetsRow}>
              <TouchableOpacity
                style={styles.presetBtn}
                onPress={() => {
                  const d = new Date();
                  setCustomStartDate(new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split('T')[0]);
                  setCustomEndDate(d.toISOString().split('T')[0]);
                }}
              >
                <Text style={styles.presetText}>Month-to-Date</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.presetBtn}
                onPress={() => {
                  const d = new Date();
                  setCustomStartDate(new Date(d.getFullYear(), 0, 1).toISOString().split('T')[0]);
                  setCustomEndDate(d.toISOString().split('T')[0]);
                }}
              >
                <Text style={styles.presetText}>Year-to-Date</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.applyBtn}
              onPress={() => setCalendarModalVisible(false)}
            >
              <Text style={styles.applyBtnText}>Apply Date Filter</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* CSV Export & Preview Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={exportModalVisible}
        onRequestClose={() => setExportModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { maxHeight: '85%' }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>📥 Export Trades to CSV</Text>
              <TouchableOpacity onPress={() => setExportModalVisible(false)}>
                <Text style={styles.closeText}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSubtitle}>
              Exporting {filteredTrades.length} trades with timestamp, prices, and broker audit identifiers.
            </Text>

            <View style={styles.csvPreviewContainer}>
              <ScrollView horizontal showsHorizontalScrollIndicator={true}>
                <ScrollView nestedScrollEnabled showsVerticalScrollIndicator={true}>
                  <Text style={styles.csvTextMono}>{csvContent}</Text>
                </ScrollView>
              </ScrollView>
            </View>

            {copiedToast && (
              <View style={styles.toastBox}>
                <Text style={styles.toastText}>✓ CSV Copied to Clipboard!</Text>
              </View>
            )}

            <View style={styles.modalActionsRow}>
              <TouchableOpacity style={styles.shareActionBtn} onPress={handleShareCsv}>
                <Text style={styles.shareActionText}>📤 Share / Save CSV</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surfaceAlt },
  navHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: { paddingVertical: 4 },
  backBtnText: { ...typography.bodyBold, color: colors.purple },
  navTitle: { ...typography.h3, color: colors.text },
  exportBtn: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  exportBtnText: { fontSize: 12, fontWeight: '800', color: '#B45309' },
  searchWrapper: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
  },
  searchInput: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.md,
    paddingHorizontal: 12,
    paddingVertical: 8,
    ...typography.caption,
    color: colors.text,
  },
  filterRow: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: spacing.sm,
  },
  filterScroll: {
    paddingHorizontal: spacing.lg,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceMuted,
  },
  filterChipActive: {
    backgroundColor: '#D97706',
  },
  filterChipText: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.textMuted,
    fontSize: 11,
  },
  filterChipTextActive: {
    color: colors.white,
  },
  summaryCard: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: colors.surface,
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  summaryItem: { alignItems: 'center' },
  summaryLabel: { ...typography.caption, color: colors.textMuted, fontSize: 10 },
  summaryValue: { ...typography.bodyBold, color: colors.text, fontSize: 14, marginTop: 2 },
  summaryDivider: { width: 1, height: 28, backgroundColor: colors.border },
  listContent: {
    padding: spacing.lg,
    gap: spacing.sm,
    paddingBottom: 100,
  },
  tradeCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tradeTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  tradeSymbolRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tradeSymbol: {
    ...typography.bodyBold,
    color: colors.text,
  },
  sideBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  sideBuy: { backgroundColor: '#DCFCE7' },
  sideSell: { backgroundColor: '#FEE2E2' },
  sideText: { fontSize: 9, fontWeight: '800' },
  sideBuyText: { color: '#15803D' },
  sideSellText: { color: '#B91C1C' },
  modeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  modePaper: { backgroundColor: '#E0E7FF' },
  modeReal: { backgroundColor: '#FEF3C7' },
  modeBadgeText: { fontSize: 9, fontWeight: '800' },
  modePaperText: { color: '#4338CA' },
  modeRealText: { color: '#B45309' },
  tradeValue: {
    ...typography.bodyBold,
    color: colors.text,
  },
  tradeBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tradeMeta: { ...typography.caption, color: colors.textMuted, fontSize: 11 },
  tradeDate: { ...typography.caption, color: colors.textMuted, fontSize: 10 },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.xl,
  },
  emptyIcon: { fontSize: 44, marginBottom: spacing.md },
  emptyTitle: { ...typography.h3, color: colors.text, marginBottom: 4 },
  emptySubtitle: { ...typography.caption, color: colors.textMuted, textAlign: 'center' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modalCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.xl,
    width: '100%',
    maxWidth: 480,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  modalTitle: { ...typography.h3, color: colors.text },
  closeText: { fontSize: 18, fontWeight: '700', color: colors.textMuted },
  modalSubtitle: { ...typography.caption, color: colors.textMuted, marginBottom: spacing.lg },
  dateInputs: { gap: 12, marginBottom: spacing.md },
  inputGroup: { gap: 4 },
  inputLabel: { ...typography.caption, color: colors.textMuted },
  modalInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    ...typography.body,
    color: colors.text,
  },
  presetsRow: { flexDirection: 'row', gap: 8, marginBottom: spacing.lg },
  presetBtn: {
    flex: 1,
    backgroundColor: colors.surfaceMuted,
    paddingVertical: 8,
    borderRadius: radius.sm,
    alignItems: 'center',
  },
  presetText: { ...typography.caption, color: colors.text, fontWeight: '600', fontSize: 11 },
  applyBtn: {
    backgroundColor: '#D97706',
    paddingVertical: 14,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  applyBtnText: { ...typography.bodyBold, color: colors.white },
  csvPreviewContainer: {
    backgroundColor: '#1E293B',
    borderRadius: radius.md,
    padding: spacing.md,
    maxHeight: 220,
    marginVertical: spacing.md,
  },
  csvTextMono: {
    color: '#E2E8F0',
    fontFamily: 'monospace',
    fontSize: 11,
    lineHeight: 18,
  },
  toastBox: {
    backgroundColor: '#DCFCE7',
    paddingVertical: 6,
    borderRadius: radius.sm,
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  toastText: { color: '#15803D', fontWeight: '700', fontSize: 12 },
  modalActionsRow: { flexDirection: 'row', gap: 10 },
  shareActionBtn: {
    flex: 1,
    backgroundColor: '#D97706',
    paddingVertical: 14,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  shareActionText: { ...typography.bodyBold, color: colors.white },
});
