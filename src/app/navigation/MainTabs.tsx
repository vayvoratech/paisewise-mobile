/** Bottom tab bar: Home · Learn · Practice · Watchlist · Portfolio · Profile (emoji icons). */
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { colors, typography } from '../../core/theme/theme';
import { MainTabsParamList } from './types';
import HomeScreen from '../../features/home/screens/HomeScreen';
import LearnScreen from '../../features/learn/screens/LearnScreen';
import PracticeScreen from '../../features/practice/screens/PracticeScreen';
import WatchlistScreen from '../../features/watchlist/screens/WatchlistScreen';
import PortfolioScreen from '../../features/portfolio/screens/PortfolioScreen';
import ProfileScreen from '../../features/profile/screens/ProfileScreen';

const Tab = createBottomTabNavigator<MainTabsParamList>();

const ICONS: Record<keyof MainTabsParamList, string> = {
  Home: '🏠',
  Learn: '📚',
  Practice: '🎮',
  Watchlist: '⭐',
  Portfolio: '📈',
  Profile: '👤',
};

function TabIcon({ name, focused }: { name: keyof MainTabsParamList; focused: boolean }) {
  return (
    <View style={styles.iconWrap}>
      <Text style={[styles.icon, !focused && styles.iconDim]}>{ICONS[name]}</Text>
      <Text numberOfLines={1} style={[styles.label, focused ? styles.labelActive : styles.labelIdle]}>
        {name.toUpperCase()}
      </Text>
      {focused && <View style={styles.dot} />}
    </View>
  );
}

export default function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: styles.bar,
        tabBarItemStyle: { paddingHorizontal: 0 },
        tabBarIcon: ({ focused }) => <TabIcon name={route.name} focused={focused} />,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Learn" component={LearnScreen} />
      <Tab.Screen name="Practice" component={PracticeScreen} />
      <Tab.Screen name="Watchlist" component={WatchlistScreen} />
      <Tab.Screen name="Portfolio" component={PortfolioScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    height: 96, // Increased height for better visual spacing
    paddingBottom: 28,
    paddingHorizontal: 4,
  },
  iconWrap: { 
    alignItems: 'center', 
    flex: 1, 
    justifyContent: 'center',
    paddingTop: 10,
  },
  icon: { fontSize: 22 },
  iconDim: { opacity: 0.45 },
  label: { 
    ...typography.overline, 
    fontSize: 8, 
    marginTop: 4, 
    letterSpacing: -0.2, 
    textAlign: 'center' 
  },
  labelActive: { color: colors.text, fontWeight: '700' },
  labelIdle: { color: colors.textMuted },
  dot: { width: 4, height: 4, borderRadius: 2, backgroundColor: colors.amber, marginTop: 3 },
});