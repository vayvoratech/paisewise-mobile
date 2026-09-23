import axios from 'axios';
import { BASE_URL } from '../../core/api/apiEndpoints';
import { tokenStore } from '../../core/security/secureStore';
import { FilterCategory, MutualFund, NAVPoint } from './mutualfunds.types';
import { MOCK_MUTUAL_FUNDS } from './mutualfunds.data';

async function getHeaders() {
  const token = await tokenStore.getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const mutualFundsService = {
  /**
   * Fetch mutual funds with optional category filter and search query
   */
  async getFunds(category: FilterCategory = 'all', searchQuery: string = ''): Promise<MutualFund[]> {
    try {
      const headers = await getHeaders();
      const params: Record<string, string> = {};
      if (category !== 'all') params.category = category;
      if (searchQuery.trim()) params.q = searchQuery.trim();

      const response = await axios.get(`${BASE_URL}/market/mutual-funds`, {
        params,
        headers,
        timeout: 2500,
      });

      if (Array.isArray(response.data) && response.data.length > 0) {
        return response.data;
      }
    } catch {
      // Backend not running or endpoint not yet configured; use resilient mock data
    }

    // Filter local dataset
    let filtered = [...MOCK_MUTUAL_FUNDS];

    if (category !== 'all') {
      filtered = filtered.filter((f) => f.category === category);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.trim().toLowerCase();
      filtered = filtered.filter(
        (f) =>
          f.name.toLowerCase().includes(query) ||
          f.amc.toLowerCase().includes(query) ||
          f.categoryLabel.toLowerCase().includes(query) ||
          f.category.toLowerCase().includes(query) ||
          f.benchmark.toLowerCase().includes(query) ||
          f.topHoldings.some((h) => h.name.toLowerCase().includes(query))
      );
    }

    return filtered;
  },

  /**
   * Get fund by unique ID
   */
  async getFundById(fundId: string): Promise<MutualFund | undefined> {
    try {
      const headers = await getHeaders();
      const response = await axios.get(`${BASE_URL}/market/mutual-funds/${fundId}`, {
        headers,
        timeout: 2500,
      });
      if (response.data && response.data.id) {
        return response.data;
      }
    } catch {
      // Fall back to mock dataset
    }

    return MOCK_MUTUAL_FUNDS.find((f) => f.id === fundId);
  },

  /**
   * Get funds curated by PaiseWise AI (high match score)
   */
  async getAIRecommendedFunds(): Promise<MutualFund[]> {
    const all = await this.getFunds('all');
    return all.filter((f) => f.aiRecommendation.isRecommended).sort((a, b) => b.aiRecommendation.matchScore - a.aiRecommendation.matchScore);
  },

  /**
   * Get historical NAV points for selected timeframe
   */
  async getNavHistory(fundId: string, interval: '1M' | '6M' | '1Y' | '3Y' | '5Y' | 'ALL'): Promise<NAVPoint[]> {
    const fund = await this.getFundById(fundId);
    if (!fund) return [];
    return fund.navHistory[interval] || fund.navHistory['1Y'];
  },
};
