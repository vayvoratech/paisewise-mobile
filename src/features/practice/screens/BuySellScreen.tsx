/**
 * BuySellScreen — Screen route container providing the Buy/Sell practice modal flow.
 * Also exports BuyModal and SellModal for modular use.
 */
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../app/navigation/types';
import { marketService } from '../../market/market.service';
import { Stock } from '../../market/market.types';
import { TOP_PRACTICE_STOCKS } from '../practice.data';
import { BuyModal } from '../components/BuyModal';
import { SellModal } from '../components/SellModal';
import { colors } from '../../../core/theme/theme';

export { BuyModal } from '../components/BuyModal';
export { SellModal } from '../components/SellModal';

type Props = NativeStackScreenProps<RootStackParamList, 'BuySell'>;

export default function BuySellScreen({ navigation, route }: Props) {
  const { symbol, mode: initialMode = 'buy' } = route.params;
  const [currentMode, setCurrentMode] = useState<'buy' | 'sell'>(
    initialMode === 'sell' ? 'sell' : 'buy'
  );
  const [stock, setStock] = useState<Stock | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. First check if we have predefined practice stock data for this symbol
    const foundLocal = TOP_PRACTICE_STOCKS.find(
      (s) => s.symbol.toUpperCase() === (symbol || '').toUpperCase()
    );

    marketService
      .getStock(symbol)
      .then((s) => {
        if (s) {
          setStock(s);
        } else if (foundLocal) {
          setStock({
            symbol: foundLocal.symbol,
            name: foundLocal.name,
            price: foundLocal.price,
            changePct: foundLocal.changePct,
            trend: foundLocal.trend,
            emoji: foundLocal.emoji,
          });
        } else {
          setStock({
            symbol: symbol || 'NIFTY',
            name: symbol || 'Stock',
            price: 1500,
            changePct: 0.5,
            trend: [1480, 1490, 1500],
            emoji: '📊',
          });
        }
      })
      .catch(() => {
        if (foundLocal) {
          setStock({
            symbol: foundLocal.symbol,
            name: foundLocal.name,
            price: foundLocal.price,
            changePct: foundLocal.changePct,
            trend: foundLocal.trend,
            emoji: foundLocal.emoji,
          });
        } else {
          setStock({
            symbol: symbol || 'NIFTY',
            name: symbol || 'Stock',
            price: 1500,
            changePct: 0.5,
            trend: [1480, 1490, 1500],
            emoji: '📊',
          });
        }
      })
      .finally(() => setLoading(false));
  }, [symbol]);

  const handleClose = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('MainTabs', { screen: 'Practice' });
    }
  };

  const handleTradeSuccess = (data: {
    symbol: string;
    shares: number;
    pricePerShare: number;
    totalPaid: number;
    xpEarned: number;
    clientOrderId: string;
    mode: 'buy' | 'sell';
  }) => {
    navigation.replace('TradeSuccess', {
      symbol: data.symbol,
      shares: data.shares,
      pricePerShare: data.pricePerShare,
      totalPaid: data.totalPaid,
      xpEarned: data.xpEarned,
      mode: data.mode,
      clientOrderId: data.clientOrderId,
    });
  };

  if (loading || !stock) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.green} />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      {currentMode === 'buy' ? (
        <BuyModal
          visible={true}
          stock={stock}
          onClose={handleClose}
          onSuccess={handleTradeSuccess}
          onSwitchToSell={() => setCurrentMode('sell')}
        />
      ) : (
        <SellModal
          visible={true}
          stock={stock}
          onClose={handleClose}
          onSuccess={handleTradeSuccess}
          onSwitchToBuy={() => setCurrentMode('buy')}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  center: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});