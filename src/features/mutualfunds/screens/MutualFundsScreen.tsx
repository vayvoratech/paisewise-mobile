import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, radius, spacing, typography } from '../../../core/theme/theme';
import { FilterCategory, MutualFund } from '../mutualfunds.types';
import { mutualFundsService } from '../mutualfunds.service';
import { FundCard } from '../components/FundCard';
import analyticsService from '../../../core/analyticsService';

const CATEGORY_TABS: { key: FilterCategory; label: string; icon: string }[] = [
  { key: 'all', label: 'All Funds', icon: '🌐' },
  { key: 'large', label: 'Large Cap', icon: '🏛️' },
  { key: 'mid', label: 'Mid Cap', icon: '🚀' },
  { key: 'debt', label: 'Debt Funds', icon: '🛡️' },
];

const CATEGORY_INSIGHTS: Record<FilterCategory, { title: string; desc: string }> = {
  all: {
    title: 'Diversified Wealth Building',
    desc: 'Explore India’s top-performing equity and debt mutual funds rated by PaiseWise AI.',
  },
  large: {
    title: 'Blue Chip Stability',
    desc: 'Invests in top 100 established market leaders like Reliance, HDFC & Infosys for stable long-term wealth.',
  },
  mid: {
    title: 'High-Growth Opportunities',
    desc: 'Companies ranked 101-250 by market cap with fast business scaling and higher return potential.',
  },
  debt: {
    title: 'Capital Preservation & Yield',
    desc: 'Invests in Govt G-Secs & AAA corporate bonds for predictable returns with low volatility.',
  },
};

export default function MutualFundsScreen({ route, navigation }: { route: any; navigation: any }) {
  const initialCategory: FilterCategory = route.params?.category || 'all';
  const [selectedCategory, setSelectedCategory] = useState<FilterCategory>(initialCategory);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [onlyAiRecommended, setOnlyAiRecommended] = useState(false);
  const [funds, setFunds] = useState<MutualFund[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Debounce search query by 250ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch funds on category or search query change
  const loadFunds = useCallback(async () => {
    setLoading(true);
    try {
      const data = await mutualFundsService.getFunds(selectedCategory, debouncedQuery);
      setFunds(data);
    } catch (e) {
      console.warn('Failed to load mutual funds:', e);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, debouncedQuery]);

  useEffect(() => {
    loadFunds();
  }, [loadFunds]);

  // Analytics: Track screen view on mount
  useEffect(() => {
    analyticsService.mfScreenViewed({
      funds_shown_count: funds.length,
      default_filter: selectedCategory,
    });
  }, []);

  // Handle Category Tab Selection
  const handleCategoryPress = (category: FilterCategory) => {
    const prevCategory = selectedCategory;
    setSelectedCategory(category);
    analyticsService.mfCategoryFiltered({
      category_selected: category,
      category_previous: prevCategory,
      results_count: funds.length,
    });
  };

  // Handle Search Input Change
  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
    if (text.length > 2) {
      analyticsService.mfSearched({
        query_text: text,
        results_count: funds.length,
      });
    }
  };

  // Pull-to-refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await loadFunds();
    setRefreshing(false);
  };

  // Filtered list with AI Recommendation toggle
  const displayedFunds = useMemo(() => {
    if (!onlyAiRecommended) return funds;
    return funds.filter((f) => f.aiRecommendation.isRecommended);
  }, [funds, onlyAiRecommended]);

  // Separate AI curated top picks for the hero carousel
  const aiCuratedFunds = useMemo(() => {
    return funds.filter((f) => f.aiRecommendation.isRecommended);
  }, [funds]);

  // Navigate to Fund Detail Screen
  const handleFundPress = (fund: MutualFund, position: number) => {
    analyticsService.fundTapped({
      fund_id: fund.id,
      fund_name: fund.name,
      fund_category: fund.category,
      source_position: position + 1,
    });

    navigation.navigate('FundDetail', {
      fundId: fund.id,
      fundName: fund.name,
    });
  };

  const activeInsight = CATEGORY_INSIGHTS[selectedCategory];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* App Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerTitle}>Mutual Funds</Text>
          <Text style={styles.headerSubtitle}>Direct Plans • Zero Commission</Text>
        </View>
        <TouchableOpacity
          style={[styles.aiFilterBtn, onlyAiRecommended && styles.aiFilterBtnActive]}
          onPress={() => setOnlyAiRecommended(!onlyAiRecommended)}
          activeOpacity={0.8}
        >
          <Text style={styles.aiFilterBtnText}>⚡ AI Picks</Text>
        </TouchableOpacity>
      </View>

      {/* Search Input Bar */}
      <View style={styles.searchBarContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search funds, AMC (e.g. HDFC), or holdings..."
          placeholderTextColor={colors.textMuted}
          value={searchQuery}
          onChangeText={handleSearchChange}
          autoCapitalize="none"
          autoCorrect={false}
          clearButtonMode="while-editing"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => handleSearchChange('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={styles.clearSearchText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Category Filter Tabs: All, Large Cap, Mid Cap, Debt */}
      <View style={styles.tabBarScrollWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsContainer}
        >
          {CATEGORY_TABS.map((tab) => {
            const isActive = selectedCategory === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                style={[styles.tabChip, isActive && styles.tabChipActive]}
                onPress={() => handleCategoryPress(tab.key)}
                activeOpacity={0.75}
              >
                <Text style={styles.tabIcon}>{tab.icon}</Text>
                <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Main Content Area */}
      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Category Educational / Strategy Insight */}
        <View style={styles.insightBanner}>
          <Text style={styles.insightEmoji}>💡</Text>
          <View style={styles.insightTextWrap}>
            <Text style={styles.insightTitle}>{activeInsight.title}</Text>
            <Text style={styles.insightDesc}>{activeInsight.desc}</Text>
          </View>
        </View>

        {/* AI Recommendations Spotlight (when not searching and on All/Category view) */}
        {!searchQuery && aiCuratedFunds.length > 0 && !onlyAiRecommended && (
          <View style={styles.aiSpotlightSection}>
            <View style={styles.sectionHeaderRow}>
              <View style={styles.sectionTitleWithBadge}>
                <Text style={styles.sectionTitle}>🤖 PaiseWise AI Top Picks</Text>
                <View style={styles.sparkleBadge}>
                  <Text style={styles.sparkleText}>High Alpha</Text>
                </View>
              </View>
              <Text style={styles.sectionCountText}>{aiCuratedFunds.length} Curated</Text>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.aiCardsCarousel}
            >
              {aiCuratedFunds.map((fund, idx) => (
                <TouchableOpacity
                  key={fund.id}
                  style={styles.aiSpotlightCard}
                  onPress={() => handleFundPress(fund, idx)}
                  activeOpacity={0.88}
                >
                  <View style={styles.aiCardHeader}>
                    <View style={styles.aiScoreBadge}>
                      <Text style={styles.aiScoreText}>⚡ {fund.aiRecommendation.matchScore}% Match</Text>
                    </View>
                    <Text style={styles.aiCategoryLabel}>{fund.categoryLabel}</Text>
                  </View>

                  <Text style={styles.aiFundName} numberOfLines={1}>
                    {fund.name}
                  </Text>
                  <Text style={styles.aiBadgeTag} numberOfLines={1}>
                    « {fund.aiRecommendation.badgeText} »
                  </Text>

                  <View style={styles.aiMetricsRow}>
                    <View>
                      <Text style={styles.aiMetricLabel}>3Y Return</Text>
                      <Text style={styles.aiMetricValue}>+{fund.returns3Y}%</Text>
                    </View>
                    <View>
                      <Text style={styles.aiMetricLabel}>Min SIP</Text>
                      <Text style={styles.aiMetricValueDark}>₹{fund.minSipAmount}/mo</Text>
                    </View>
                    <View>
                      <Text style={styles.aiMetricLabel}>Exp. Ratio</Text>
                      <Text style={styles.aiMetricValueDark}>{fund.expenseRatio}%</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Funds List Section */}
        <View style={styles.listSectionHeader}>
          <Text style={styles.sectionTitle}>
            {onlyAiRecommended ? '⚡ AI Recommended Funds' : 'All Funds in Category'}
          </Text>
          <Text style={styles.sectionCountText}>{displayedFunds.length} available</Text>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.purple} />
            <Text style={styles.loadingText}>Analyzing mutual funds...</Text>
          </View>
        ) : displayedFunds.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>🔎</Text>
            <Text style={styles.emptyTitle}>No Mutual Funds Found</Text>
            <Text style={styles.emptySubtitle}>
              Try adjusting your search query or reset category filter.
            </Text>
            <TouchableOpacity
              style={styles.resetFilterBtn}
              onPress={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setOnlyAiRecommended(false);
              }}
            >
              <Text style={styles.resetFilterText}>Reset All Filters</Text>
            </TouchableOpacity>
          </View>
        ) : (
          displayedFunds.map((fund, index) => (
            <FundCard
              key={fund.id}
              fund={fund}
              index={index}
              onPress={(f) => handleFundPress(f, index)}
            />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surfaceAlt,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surfaceAlt,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  backButtonText: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    lineHeight: 22,
  },
  headerTitleWrap: {
    flex: 1,
  },
  headerTitle: {
    ...typography.h2,
    color: colors.text,
    fontSize: 20,
  },
  headerSubtitle: {
    ...typography.caption,
    color: colors.textMuted,
    fontSize: 11,
  },
  aiFilterBtn: {
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.25)',
  },
  aiFilterBtnActive: {
    backgroundColor: colors.purple,
    borderColor: colors.purple,
  },
  aiFilterBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.purpleDeep,
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    marginHorizontal: spacing.lg,
    marginTop: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  searchIcon: {
    fontSize: 15,
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    padding: 0,
  },
  clearSearchText: {
    fontSize: 14,
    color: colors.textMuted,
    fontWeight: '700',
    paddingHorizontal: 4,
  },
  tabBarScrollWrapper: {
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  tabsContainer: {
    paddingHorizontal: spacing.lg,
    gap: 8,
  },
  tabChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 6,
  },
  tabChipActive: {
    backgroundColor: colors.navy,
    borderColor: colors.navy,
  },
  tabIcon: {
    fontSize: 13,
  },
  tabLabel: {
    ...typography.caption,
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
  },
  tabLabelActive: {
    color: colors.white,
    fontWeight: '700',
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: 40,
  },
  insightBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.yellowCard,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.yellowBorder,
    marginBottom: spacing.md,
    gap: 12,
  },
  insightEmoji: {
    fontSize: 22,
  },
  insightTextWrap: {
    flex: 1,
  },
  insightTitle: {
    ...typography.bodyBold,
    fontSize: 13,
    color: '#92400E',
  },
  insightDesc: {
    ...typography.caption,
    fontSize: 11,
    color: '#78350F',
    marginTop: 2,
    lineHeight: 16,
  },
  aiSpotlightSection: {
    marginBottom: spacing.md,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  sectionTitleWithBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    ...typography.h3,
    fontSize: 16,
    color: colors.text,
  },
  sparkleBadge: {
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  sparkleText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.purple,
  },
  sectionCountText: {
    ...typography.caption,
    fontSize: 11,
    color: colors.textMuted,
  },
  aiCardsCarousel: {
    gap: 12,
    paddingRight: spacing.lg,
  },
  aiSpotlightCard: {
    width: 250,
    backgroundColor: '#F8F7FF',
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1.5,
    borderColor: '#DED6FA',
    shadowColor: colors.purple,
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  aiCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  aiScoreBadge: {
    backgroundColor: colors.purple,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  aiScoreText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: '800',
  },
  aiCategoryLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.textMuted,
  },
  aiFundName: {
    ...typography.bodyBold,
    fontSize: 14,
    color: colors.text,
  },
  aiBadgeTag: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.purpleDeep,
    marginTop: 2,
    marginBottom: 10,
  },
  aiMetricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    borderRadius: radius.sm,
    padding: 8,
    borderWidth: 1,
    borderColor: 'rgba(222, 214, 250, 0.6)',
  },
  aiMetricLabel: {
    ...typography.overline,
    fontSize: 9,
    color: colors.textMuted,
  },
  aiMetricValue: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.green,
    marginTop: 2,
  },
  aiMetricValueDark: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
    marginTop: 2,
  },
  listSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
    marginTop: spacing.xs,
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  loadingText: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: spacing.sm,
  },
  emptyContainer: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: spacing.sm,
  },
  emptyEmoji: {
    fontSize: 36,
    marginBottom: spacing.sm,
  },
  emptyTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: 4,
  },
  emptySubtitle: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  resetFilterBtn: {
    backgroundColor: colors.navy,
    paddingHorizontal: spacing.lg,
    paddingVertical: 10,
    borderRadius: radius.md,
  },
  resetFilterText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 13,
  },
});
