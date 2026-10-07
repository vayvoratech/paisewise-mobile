import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors, radius, spacing, typography } from '../../../core/theme/theme';
import { formatINR } from '../../../shared/format';
import { RootStackParamList } from '../../../app/navigation/types';
import { marketService } from '../../market/market.service';
import { Stock } from '../../market/market.types';
import { BuyModal } from '../components/BuyModal';
import { SellModal } from '../components/SellModal';

type Props = NativeStackScreenProps<RootStackParamList, 'BuySell'>;

export default function BuySellScreen({ navigation, route }: Props) {
  const { symbol, mode = 'buy', tradingMode = 'REAL' } = route.params || {};
  const isBuyMode = mode === 'buy';
  const [stock, setStock] = useState<Stock | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    marketService.getStock(symbol).then((s) => {
      const targetStock = s || {
        symbol: symbol,
        name: symbol === 'NIFTY' ? 'NIFTY 50 Index' : symbol,
        price: symbol === 'NIFTY' ? 22456.00 : 2952.00,
        changePct: 0.5,
        emoji: '📈'
      };
      setStock(targetStock as any);
      setLoading(false);
    }).catch(() => {
      setStock({
        symbol: symbol,
        name: symbol,
        price: 2952.00,
        changePct: 0.0,
        emoji: '📊'
      } as any);
      setLoading(false);
    });
  }, [symbol]);

  if (loading || !stock) {
    return (
      <View style={styles.root}>
        <View style={[styles.sheet, { minHeight: 200, justifyContent: 'center', alignItems: 'center' }]}>
          <ActivityIndicator size="large" color="#D97706" />
          <Text style={{ marginTop: 12, ...typography.caption, color: colors.textMuted }}>
            Loading market quote for {symbol}...
          </Text>
        </View>
      </View>
    );
  }

  const rawPrice: any = stock.price ?? 0;
  const numericPrice = typeof rawPrice === 'string'
    ? parseFloat(rawPrice.replace(/[^0-9.]/g, ''))
    : Number(rawPrice);
  const safePrice = isNaN(numericPrice) || numericPrice === 0 ? 2952.00 : numericPrice;
  const up = stock.changePct >= 0;

  const handleSuccess = (receipt: any) => {
    try {
      navigation.replace('TradeSuccess', {
        symbol: stock.symbol,
        shares: receipt.shares || receipt.quantity || 1,
        pricePerShare: receipt.pricePerShare || receipt.price || safePrice,
        totalPaid: receipt.totalPaid || Math.round((receipt.price || safePrice) * (receipt.shares || receipt.quantity || 1)),
        xpEarned: receipt.xpEarned || 25,
        mode: isBuyMode ? 'buy' : 'sell',
        isReal: receipt.isReal ?? (tradingMode === 'REAL'),
      });
    } catch {
      navigation.popToTop();
    }
  };

  return (
    <View style={styles.root}>
      <View style={styles.sheet}>
        <View style={styles.grabber} />

        {/* Modal Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.sym}>{stock.symbol}</Text>
            <Text style={styles.name}>{stock.name}</Text>
          </View>
          <View style={{ alignItems: 'flex-end', flexDirection: 'row', gap: 12 }}>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.price}>{formatINR(safePrice)}</Text>
              <Text style={[styles.changePct, { color: up ? colors.green : colors.pink }]}>
                {up ? '↑' : '↓'} {stock.changePct >= 0 ? '+' : ''}{stock.changePct}%
              </Text>
            </View>
            <TouchableOpacity 
              onPress={() => navigation.goBack()} 
              style={styles.closeBtn}
            >
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Render Modular Buy or Sell Modal with Real/Practice Engine */}
        {isBuyMode ? (
          <BuyModal
            symbol={stock.symbol}
            stockName={stock.name}
            currentPrice={safePrice}
            initialTradingMode={tradingMode as any}
            onSuccess={handleSuccess}
            onClose={() => navigation.goBack()}
          />
        ) : (
          <SellModal
            symbol={stock.symbol}
            stockName={stock.name}
            currentPrice={safePrice}
            initialTradingMode={tradingMode as any}
            ownedQuantity={5}
            onSuccess={handleSuccess}
            onClose={() => navigation.goBack()}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.45)' },
  sheet: { 
    backgroundColor: colors.surface, 
    borderTopLeftRadius: radius.xl, 
    borderTopRightRadius: radius.xl, 
    padding: spacing.lg,
    maxHeight: '90%',
  },
  grabber: { 
    width: 44, 
    height: 5, 
    borderRadius: 3, 
    backgroundColor: colors.border, 
    alignSelf: 'center', 
    marginBottom: spacing.md 
  },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'flex-start',
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sym: { ...typography.h2, color: colors.text },
  name: { ...typography.caption, color: colors.textMuted, marginTop: 2 },
  price: { ...typography.h2, color: colors.green },
  changePct: { ...typography.caption, marginTop: 2 },
  closeBtn: { padding: 6, justifyContent: 'center', alignItems: 'center' },
  closeBtnText: { fontSize: 18, fontWeight: 'bold', color: colors.textMuted },
});