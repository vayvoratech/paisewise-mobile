import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Modal,
  TextInput,
} from 'react-native';
import { watchlistManager, PriceAlertItem } from '../../watchlist/watchlistManager';
import { ConfirmModal } from '../../../shared/ui/ConfirmModal';

// Expanded mock data mapping for watchlist & popular stocks
const MOCK_STOCK_DATABASE: Record<string, { name: string; price: string; change: string; pe: string; cap: string; yield: string; high: string; chart: { x: string; y: number }[] }> = {
  RELIANCE: {
    name: 'Reliance Industries Ltd',
    price: '$2,952.00',
    change: '+$35.20 (+1.2%) Today',
    pe: '28.4',
    cap: '19.95L Cr',
    yield: '0.32%',
    high: '3,024.00',
    chart: [
      { x: '9:30', y: 2920 },
      { x: '11:00', y: 2935 },
      { x: '13:00', y: 2940 },
      { x: '15:00', y: 2952 },
    ],
  },
  AAPL: {
    name: 'Apple Inc.',
    price: '$189.42',
    change: '+$2.34 (+1.25%) Today',
    pe: '31.5',
    cap: '2.94T',
    yield: '0.55%',
    high: '198.23',
    chart: [
      { x: '9:30', y: 187.10 },
      { x: '11:00', y: 188.20 },
      { x: '13:00', y: 188.90 },
      { x: '15:00', y: 189.42 },
    ],
  },
  TSLA: {
    name: 'Tesla Inc.',
    price: '$219.80',
    change: '-$7.70 (-3.4%) Today',
    pe: '65.2',
    cap: '698.4B',
    yield: '0.00%',
    high: '271.00',
    chart: [
      { x: '9:30', y: 225.00 },
      { x: '11:00', y: 222.50 },
      { x: '13:00', y: 220.10 },
      { x: '15:00', y: 219.80 },
    ],
  },
  NVDA: {
    name: 'NVIDIA Corp.',
    price: '$878.36',
    change: '+$34.80 (+4.12%) Today',
    pe: '72.1',
    cap: '2.16T',
    yield: '0.03%',
    high: '974.00',
    chart: [
      { x: '9:30', y: 850.00 },
      { x: '11:00', y: 862.50 },
      { x: '13:00', y: 871.00 },
      { x: '15:00', y: 878.36 },
    ],
  },
  MSFT: {
    name: 'Microsoft Corp.',
    price: '$415.50',
    change: '+$3.50 (+0.85%) Today',
    pe: '36.8',
    cap: '3.09T',
    yield: '0.71%',
    high: '430.82',
    chart: [
      { x: '9:30', y: 412.00 },
      { x: '11:00', y: 413.80 },
      { x: '13:00', y: 414.50 },
      { x: '15:00', y: 415.50 },
    ],
  },
  TCS: {
    name: 'Tata Consultancy Services',
    price: '$3,801.00',
    change: '-$30.50 (-0.8%) Today',
    pe: '31.2',
    cap: '13.75L Cr',
    yield: '1.45%',
    high: '4,045.00',
    chart: [
      { x: '9:30', y: 3840 },
      { x: '11:00', y: 3820 },
      { x: '13:00', y: 3810 },
      { x: '15:00', y: 3801 },
    ],
  },
  INFY: {
    name: 'Infosys Limited',
    price: '$1,456.00',
    change: '+$2.10 (+0.15%) Today',
    pe: '25.6',
    cap: '6.05L Cr',
    yield: '2.10%',
    high: '1,620.00',
    chart: [
      { x: '9:30', y: 1450 },
      { x: '11:00', y: 1452 },
      { x: '13:00', y: 1455 },
      { x: '15:00', y: 1456 },
    ],
  },
};

export default function StockDetailScreen({ route, navigation }: { route: any; navigation: any }) {
  const { symbol = 'RELIANCE', companyName } = route.params || {};
  const [selectedInterval, setSelectedInterval] = useState('1D');
  const [activeJargon, setActiveJargon] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Watchlist state & confirm modal
  const [isWatchlisted, setIsWatchlisted] = useState(false);
  const [watchConfirmVisible, setWatchConfirmVisible] = useState(false);

  // Alert modal state & alerts list
  const [alertModalVisible, setAlertModalVisible] = useState(false);
  const [targetPriceInput, setTargetPriceInput] = useState('');
  const [alertCondition, setAlertCondition] = useState<'GT' | 'LT'>('GT');
  const [alertError, setAlertError] = useState<string | null>(null);
  const [alertSuccess, setAlertSuccess] = useState<string | null>(null);
  const [existingAlerts, setExistingAlerts] = useState<PriceAlertItem[]>([]);

  // Sync watchlist & alerts on mount & manager changes
  useEffect(() => {
    const updateStates = () => {
      setIsWatchlisted(watchlistManager.isInWatchlist(symbol));
      setExistingAlerts(watchlistManager.getAlertsForSymbol(symbol));
    };

    updateStates();

    watchlistManager.on('change', updateStates);
    watchlistManager.on('alerts_change', updateStates);

    return () => {
      watchlistManager.off('change', updateStates);
      watchlistManager.off('alerts_change', updateStates);
    };
  }, [symbol]);

  const handleStarPress = () => {
    setWatchConfirmVisible(true);
  };

  const handleConfirmWatchlistToggle = () => {
    if (isWatchlisted) {
      watchlistManager.removeFromWatchlist(symbol);
    } else {
      const stockName = companyName || MOCK_STOCK_DATABASE[symbol]?.name || `${symbol} Corp.`;
      watchlistManager.addToWatchlist(symbol, stockName);
    }
    setWatchConfirmVisible(false);
  };

  const handleCreateAlert = () => {
    setAlertError(null);
    const targetPrice = parseFloat(targetPriceInput);

    if (isNaN(targetPrice) || targetPrice <= 0) {
      setAlertError('Please enter a valid positive target price.');
      return;
    }

    if (watchlistManager.isDuplicateAlert(symbol, targetPrice, alertCondition)) {
      setAlertError(`⚠️ Duplicate: Alert already exists for ${symbol} at ₹${targetPrice} (${alertCondition})`);
      return;
    }

    watchlistManager.addAlert(symbol, targetPrice, alertCondition);
    setAlertSuccess(`Alert set for ${symbol} when price is ${alertCondition === 'GT' ? 'above' : 'below'} ₹${targetPrice}`);
    setTargetPriceInput('');
    setTimeout(() => {
      setAlertSuccess(null);
    }, 2000);
  };

  const handleDeleteAlert = (alertId: string) => {
    watchlistManager.deleteAlert(alertId);
  };

  const marketClosed = true;
  const baseStockInfo = MOCK_STOCK_DATABASE[symbol];
  const stockInfo = {
    name: companyName || baseStockInfo?.name || `${symbol} Corporation`,
    price: baseStockInfo?.price || '$150.00',
    change: baseStockInfo?.change || '+$1.50 (+1.0%) Today',
    pe: baseStockInfo?.pe || '25.0',
    cap: baseStockInfo?.cap || '100B',
    yield: baseStockInfo?.yield || '1.0%',
    high: baseStockInfo?.high || '160.00',
    chart: baseStockInfo?.chart || [
      { x: '9:30', y: 145 },
      { x: '11:00', y: 147 },
      { x: '13:00', y: 148 },
      { x: '15:00', y: 150 },
    ],
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Navigation Header */}
      <View style={styles.navHeader}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.navTitle}>{symbol}</Text>
        <View style={styles.headerRightActions}>
          <TouchableOpacity style={styles.iconActionBtn} onPress={() => setAlertModalVisible(true)}>
            <Text style={styles.actionEmojiIcon}>🔔</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.iconActionBtn, isWatchlisted && styles.starBtnActive]} onPress={handleStarPress}>
            <Text style={styles.actionEmojiIcon}>{isWatchlisted ? '⭐' : '☆'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {marketClosed && (
        <View style={styles.banner}>
          <Text style={styles.bannerText}>Market Closed • Orders will queue for next open</Text>
        </View>
      )}

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#4F46E5" />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.headerBlock}>
            <Text style={styles.symbolTitle}>{stockInfo.name}</Text>
            <Text style={styles.priceDisplay}>{stockInfo.price}</Text>
            <Text style={styles.changeDisplay}>{stockInfo.change}</Text>
          </View>

          <View style={styles.intervalRow}>
            {['1D', '1W', '1M', '1Y', 'ALL'].map((item) => (
              <TouchableOpacity
                key={item}
                style={[styles.intervalBtn, selectedInterval === item && styles.intervalBtnActive]}
                onPress={() => setSelectedInterval(item)}
              >
                <Text style={[styles.intervalText, selectedInterval === item && styles.intervalTextActive]}>
                  {item}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Clean Dynamic Chart Card */}
          <View style={styles.chartWrapper}>
            <View style={styles.mockChartContainer}>
              <Text style={styles.mockChartTitle}>Live Price Trend ({selectedInterval})</Text>
              <View style={styles.mockPointsRow}>
                {stockInfo.chart.map((pt, idx) => (
                  <View key={idx} style={styles.mockPointItem}>
                    <Text style={styles.mockPointVal}>{pt.y}</Text>
                    <View style={styles.mockBar} />
                    <Text style={styles.mockPointTime}>{pt.x}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>

          <View style={styles.statsContainer}>
            <Text style={styles.sectionHeader}>Key Statistics</Text>
            <View style={styles.statsGrid}>
              <TouchableOpacity style={styles.statBox} onPress={() => setActiveJargon('P/E Ratio: Price-to-Earnings measures company valuation relative to its per-share earnings.')}>
                <Text style={styles.statLabel}>P/E Ratio ⓘ</Text>
                <Text style={styles.statValue}>{stockInfo.pe}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.statBox} onPress={() => setActiveJargon("Market Cap: Total dollar market value of a company's outstanding shares.")}>
                <Text style={styles.statLabel}>Market Cap ⓘ</Text>
                <Text style={styles.statValue}>{stockInfo.cap}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.statBox} onPress={() => setActiveJargon('Div Yield: Annual percentage return paid out via dividends relative to stock price.')}>
                <Text style={styles.statLabel}>Div Yield ⓘ</Text>
                <Text style={styles.statValue}>{stockInfo.yield}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.statBox} onPress={() => setActiveJargon('52W High/Low: Extreme price metrics traded over the past year.')}>
                <Text style={styles.statLabel}>52W High ⓘ</Text>
                <Text style={styles.statValue}>{stockInfo.high}</Text>
              </TouchableOpacity>
            </View>
            {activeJargon && (
              <View style={styles.jargonBox}>
                <Text style={styles.jargonText}>{activeJargon}</Text>
              </View>
            )}
          </View>
        </ScrollView>
      )}

      {/* Confirmation Modal for Watchlist Add/Remove */}
      <ConfirmModal
        visible={watchConfirmVisible}
        title={isWatchlisted ? 'Remove from Watchlist' : 'Add to Watchlist'}
        message={
          isWatchlisted
            ? `Are you sure you want to remove ${symbol} from your Watchlist?`
            : `Are you sure you want to add ${symbol} to your Watchlist?`
        }
        confirmText={isWatchlisted ? 'Yes, Remove' : 'Yes, Add'}
        confirmVariant={isWatchlisted ? 'danger' : 'primary'}
        onConfirm={handleConfirmWatchlistToggle}
        onCancel={() => setWatchConfirmVisible(false)}
      />

      {/* Price Alert Manager Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={alertModalVisible}
        onRequestClose={() => setAlertModalVisible(false)}
      >
        <View style={styles.alertModalOverlay}>
          <View style={styles.alertModalSheet}>
            <View style={styles.alertModalHeader}>
              <Text style={styles.alertModalTitle}>🔔 Price Alerts for {symbol}</Text>
              <TouchableOpacity onPress={() => setAlertModalVisible(false)}>
                <Text style={styles.closeModalText}>✕</Text>
              </TouchableOpacity>
            </View>

            {alertSuccess && (
              <View style={styles.alertSuccessBox}>
                <Text style={styles.alertSuccessText}>✓ {alertSuccess}</Text>
              </View>
            )}

            {alertError && (
              <View style={styles.alertErrorBox}>
                <Text style={styles.alertErrorText}>{alertError}</Text>
              </View>
            )}

            <View style={styles.alertForm}>
              <Text style={styles.alertLabel}>Create New Alert</Text>
              <TextInput
                style={styles.alertInput}
                placeholder="Enter target price e.g. 3050"
                keyboardType="numeric"
                value={targetPriceInput}
                onChangeText={setTargetPriceInput}
              />

              <View style={styles.conditionRow}>
                {(['GT', 'LT'] as const).map((cond) => (
                  <TouchableOpacity
                    key={cond}
                    style={[styles.condBtn, alertCondition === cond && styles.condBtnActive]}
                    onPress={() => setAlertCondition(cond)}
                  >
                    <Text style={[styles.condBtnText, alertCondition === cond && styles.condBtnTextActive]}>
                      {cond === 'GT' ? '📈 Above (>)' : '📉 Below (<)'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity style={styles.createAlertSubmitBtn} onPress={handleCreateAlert}>
                <Text style={styles.createAlertSubmitText}>Save Price Alert 🔔</Text>
              </TouchableOpacity>
            </View>

            {/* List of Existing Active Alerts for this Symbol */}
            <View style={styles.existingAlertsSection}>
              <Text style={styles.existingAlertsTitle}>
                Active Alerts ({existingAlerts.length})
              </Text>
              {existingAlerts.length === 0 ? (
                <Text style={styles.noAlertsText}>No active price alerts set for {symbol}.</Text>
              ) : (
                existingAlerts.map((alt) => (
                  <View key={alt.id} style={styles.alertCardRow}>
                    <View style={styles.alertCardInfo}>
                      <Text style={styles.alertCardCondition}>
                        Target: {alt.condition === 'GT' ? 'Above' : 'Below'} ₹{alt.targetPrice.toFixed(2)}
                      </Text>
                      <Text style={styles.alertCardStatus}>Status: {alt.status}</Text>
                    </View>
                    <TouchableOpacity
                      style={styles.deleteAlertBtn}
                      onPress={() => handleDeleteAlert(alt.id)}
                    >
                      <Text style={styles.deleteAlertBtnText}>🗑️</Text>
                    </TouchableOpacity>
                  </View>
                ))
              )}
            </View>
          </View>
        </View>
      </Modal>

      {/* Footer Action Buttons */}
      <View style={styles.footerAction}>
        <TouchableOpacity 
          style={[styles.actionBtn, styles.sellBtn]} 
          onPress={() => navigation.navigate('BuySell', { symbol, mode: 'sell' })}
        >
          <Text style={styles.sellBtnText}>Sell</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.actionBtn, styles.buyBtn]} 
          onPress={() => navigation.navigate('BuySell', { symbol, mode: 'buy' })}
        >
          <Text style={styles.buyBtnText}>Buy</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  navHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  backBtn: { paddingVertical: 4 },
  backBtnText: { fontSize: 16, fontWeight: '600', color: '#4F46E5' },
  navTitle: { fontSize: 16, fontWeight: '700', color: '#111' },
  headerRightActions: { flexDirection: 'row', gap: 12 },
  iconActionBtn: { padding: 8, borderRadius: 20, backgroundColor: '#F3F4F6' },
  starBtnActive: { backgroundColor: '#FEF3C7' },
  actionEmojiIcon: { fontSize: 18 },
  banner: { backgroundColor: '#FEF3C7', paddingVertical: 8, alignItems: 'center' },
  bannerText: { fontSize: 12, fontWeight: '600', color: '#92400E' },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { padding: 20, paddingBottom: 100 },
  headerBlock: { alignItems: 'center', marginBottom: 16 },
  symbolTitle: { fontSize: 14, fontWeight: '600', color: '#6B7280', marginBottom: 4 },
  priceDisplay: { fontSize: 32, fontWeight: '800', color: '#111', marginVertical: 4 },
  changeDisplay: { fontSize: 14, fontWeight: '600', color: '#10B981' },
  intervalRow: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 12 },
  intervalBtn: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 16, backgroundColor: '#F3F4F6' },
  intervalBtnActive: { backgroundColor: '#4F46E5' },
  intervalText: { fontSize: 12, fontWeight: '600', color: '#4B5563' },
  intervalTextActive: { color: '#FFF' },
  chartWrapper: { marginVertical: 8 },
  mockChartContainer: { backgroundColor: '#F8FAFC', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0' },
  mockChartTitle: { fontSize: 12, fontWeight: '600', color: '#64748B', marginBottom: 12, textAlign: 'center' },
  mockPointsRow: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-end', height: 100 },
  mockPointItem: { alignItems: 'center', gap: 6 },
  mockPointVal: { fontSize: 11, fontWeight: '700', color: '#1E293B' },
  mockBar: { width: 8, height: 40, backgroundColor: '#4F46E5', borderRadius: 4 },
  mockPointTime: { fontSize: 10, color: '#64748B' },
  statsContainer: { marginTop: 24 },
  sectionHeader: { fontSize: 16, fontWeight: '700', color: '#111', marginBottom: 12 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  statBox: { width: '48%', backgroundColor: '#F9FAFB', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#F3F4F6' },
  statLabel: { fontSize: 12, color: '#6B7280', marginBottom: 4 },
  statValue: { fontSize: 16, fontWeight: '700', color: '#1F2937' },
  jargonBox: { marginTop: 12, backgroundColor: '#EEF2FF', padding: 12, borderRadius: 8 },
  jargonText: { fontSize: 13, color: '#3730A3', lineHeight: 18 },
  alertModalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  alertModalSheet: { backgroundColor: '#FFF', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, paddingBottom: 40, maxHeight: '85%' },
  alertModalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  alertModalTitle: { fontSize: 18, fontWeight: '700', color: '#111' },
  closeModalText: { fontSize: 18, fontWeight: '700', color: '#666' },
  alertForm: { gap: 10, marginBottom: 16 },
  alertLabel: { fontSize: 13, fontWeight: '700', color: '#374151' },
  alertInput: { borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, padding: 12, fontSize: 16 },
  conditionRow: { flexDirection: 'row', gap: 12 },
  condBtn: { flex: 1, padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#E5E7EB', alignItems: 'center' },
  condBtnActive: { borderColor: '#4F46E5', backgroundColor: '#EEF2FF' },
  condBtnText: { fontSize: 13, fontWeight: '600', color: '#4B5563' },
  condBtnTextActive: { color: '#4F46E5' },
  createAlertSubmitBtn: { backgroundColor: '#4F46E5', padding: 14, borderRadius: 10, alignItems: 'center', marginTop: 6 },
  createAlertSubmitText: { color: '#FFF', fontSize: 15, fontWeight: '700' },
  alertSuccessBox: { padding: 12, backgroundColor: '#D1FAE5', borderRadius: 8, marginBottom: 12 },
  alertSuccessText: { color: '#065F46', fontSize: 13, fontWeight: '600', textAlign: 'center' },
  alertErrorBox: { padding: 12, backgroundColor: '#FEE2E2', borderRadius: 8, marginBottom: 12 },
  alertErrorText: { color: '#B91C1C', fontSize: 13, fontWeight: '600', textAlign: 'center' },
  existingAlertsSection: { borderTopWidth: 1, borderTopColor: '#F3F4F6', paddingTop: 12 },
  existingAlertsTitle: { fontSize: 14, fontWeight: '700', color: '#111827', marginBottom: 8 },
  noAlertsText: { fontSize: 13, color: '#9CA3AF', fontStyle: 'italic' },
  alertCardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12, backgroundColor: '#F9FAFB', borderRadius: 8, marginBottom: 8, borderWidth: 1, borderColor: '#F3F4F6' },
  alertCardInfo: { gap: 2 },
  alertCardCondition: { fontSize: 14, fontWeight: '600', color: '#1F2937' },
  alertCardStatus: { fontSize: 11, fontWeight: '500', color: '#10B981' },
  deleteAlertBtn: { padding: 6 },
  deleteAlertBtnText: { fontSize: 14 },
  footerAction: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', padding: 16, backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: '#E5E7EB', gap: 12 },
  actionBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  sellBtn: { backgroundColor: '#FEE2E2' },
  sellBtnText: { color: '#DC2626', fontSize: 16, fontWeight: '700' },
  buyBtn: { backgroundColor: '#4F46E5' },
  buyBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
});