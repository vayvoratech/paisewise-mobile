/** Bottom tab bar: Home · Learn · Practice · Portfolio · Profile (emoji icons). */
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { colors, typography } from '../../core/theme/theme';
import { MainTabsParamList } from './types';
import HomeScreen from '../../features/home/screens/HomeScreen';
import LearnScreen from '../../features/learn/screens/LearnScreen';
import PracticeScreen from '../../features/practice/screens/PracticeScreen';
import PortfolioScreen from '../../features/portfolio/screens/PortfolioScreen';
import ProfileScreen from '../../features/profile/screens/ProfileScreen';

const Tab = createBottomTabNavigator<MainTabsParamList>();

const ICONS: Record<keyof MainTabsParamList, string> = {
  Home: '🏠',
  Learn: '📚',
  Practice: '🎮',
  Portfolio: '📈',
  Profile: '👤',
};

function TabIcon({ name, focused }: { name: keyof MainTabsParamList; focused: boolean }) {
  return (
    <View style={styles.iconWrap}>
      <Text style={[styles.icon, !focused && styles.iconDim]}>{ICONS[name]}</Text>
      <Text style={[styles.label, focused ? styles.labelActive : styles.labelIdle]}>{name.toUpperCase()}</Text>
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
        tabBarItemStyle: { paddingTop: 8 },
        tabBarIcon: ({ focused }) => <TabIcon name={route.name} focused={focused} />,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Learn" component={LearnScreen} />
      <Tab.Screen name="Practice" component={PracticeScreen} />
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
    height: 88,
    paddingBottom: 24,
  },
  iconWrap: { alignItems: 'center', width: 70 },
  icon: { fontSize: 24 },
  iconDim: { opacity: 0.45 },
  label: { ...typography.overline, fontSize: 10, marginTop: 4 },
  labelActive: { color: colors.text },
  labelIdle: { color: colors.textMuted },
  dot: { width: 5, height: 5, borderRadius: 3, backgroundColor: colors.amber, marginTop: 3 },
});
