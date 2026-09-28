import { API_ENDPOINTS, BASE_URL } from '../../core/api/apiEndpoints';

export interface WatchlistItem {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change: number;
  isPositive: boolean;
}

export interface PriceAlertItem {
  id: string;
  symbol: string;
  targetPrice: number;
  condition: 'GT' | 'LT' | 'GTE' | 'LTE';
  status: 'ACTIVE' | 'TRIGGERED' | 'EXPIRED';
  createdAt: string;
}

type EventType = 'change' | 'alerts_change' | 'alert_triggered';
type Listener = (data?: any) => void;

const DEFAULT_USER_ID = '11111111-1111-1111-1111-111111111111';

class WatchlistManager {
  private changeListeners: Listener[] = [];
  private alertListeners: Listener[] = [];
  private triggerListeners: Listener[] = [];

  private watchlist: WatchlistItem[] = [];
  private priceAlerts: PriceAlertItem[] = [];
  private isLoaded = false;

  constructor() {
    this.initFromDatabase();
  }

  private async initFromDatabase(): Promise<void> {
    try {
      await Promise.all([this.loadWatchlistFromDb(), this.loadAlertsFromDb()]);
    } catch (e) {
      console.warn('Failed to load watchlist/alerts from backend DB:', e);
    } finally {
      this.isLoaded = true;
    }
  }

  private async loadWatchlistFromDb(): Promise<void> {
    try {
      const response = await fetch(`${BASE_URL}/market/watchlist`, {
        headers: { 'X-User-Id': DEFAULT_USER_ID },
      });
      if (response.ok) {
        const rawList: any[] = await response.json();
        if (Array.isArray(rawList) && rawList.length > 0) {
          this.watchlist = rawList.map((item) => {
            const sym = item.symbol || item;
            const cleanSym = String(sym).replace(/^NSE:/, '').replace(/^BSE:/, '');
            return {
              id: cleanSym,
              symbol: cleanSym,
              name: `${cleanSym} Ltd.`,
              price: item.price || 1500.0,
              change: item.change || 0.5,
              isPositive: (item.change || 0) >= 0,
            };
          });
          this.notifyChange();
          return;
        }
      }
    } catch (e) {
      console.warn('Watchlist DB fetch fallback:', e);
    }

    // Seed default symbols into PostgreSQL if empty
    const seedSymbols = ['RELIANCE', 'TCS', 'INFY', 'HDFCBANK', 'ICICIBANK'];
    for (const sym of seedSymbols) {
      await this.addToWatchlistDb(sym);
    }
  }

  private async addToWatchlistDb(symbol: string): Promise<void> {
    try {
      const cleanSym = symbol.replace(/^NSE:/, '').replace(/^BSE:/, '');
      await fetch(`${BASE_URL}/market/watchlist?symbol=NSE:${cleanSym}`, {
        method: 'POST',
        headers: { 'X-User-Id': DEFAULT_USER_ID },
      });
    } catch (e) {
      console.warn('Add to Watchlist DB error:', e);
    }
  }

  private async removeFromWatchlistDb(symbol: string): Promise<void> {
    try {
      const cleanSym = symbol.replace(/^NSE:/, '').replace(/^BSE:/, '');
      await fetch(`${BASE_URL}/market/watchlist/NSE:${cleanSym}`, {
        method: 'DELETE',
        headers: { 'X-User-Id': DEFAULT_USER_ID },
      });
    } catch (e) {
      console.warn('Remove from Watchlist DB error:', e);
    }
  }

  private async loadAlertsFromDb(): Promise<void> {
    try {
      const response = await fetch(`${BASE_URL}/practice/alerts`, {
        headers: { 'X-User-Id': DEFAULT_USER_ID },
      });
      if (response.ok) {
        const rawAlerts: any[] = await response.json();
        if (Array.isArray(rawAlerts)) {
          this.priceAlerts = rawAlerts.map((alt) => ({
            id: String(alt.id),
            symbol: String(alt.symbol).replace(/^NSE:/, '').replace(/^BSE:/, ''),
            targetPrice: Number(alt.targetPrice),
            condition: alt.condition || 'GT',
            status: alt.status || 'ACTIVE',
            createdAt: alt.createdAt || new Date().toISOString(),
          }));
          this.notifyAlertsChange();
        }
      }
    } catch (e) {
      console.warn('Price Alerts DB fetch error:', e);
    }
  }

  // Event Listener System
  on(event: EventType, listener: Listener): void {
    if (event === 'change' && !this.changeListeners.includes(listener)) {
      this.changeListeners.push(listener);
    } else if (event === 'alerts_change' && !this.alertListeners.includes(listener)) {
      this.alertListeners.push(listener);
    } else if (event === 'alert_triggered' && !this.triggerListeners.includes(listener)) {
      this.triggerListeners.push(listener);
    }
  }

  off(event: EventType, listener: Listener): void {
    if (event === 'change') {
      this.changeListeners = this.changeListeners.filter((l) => l !== listener);
    } else if (event === 'alerts_change') {
      this.alertListeners = this.alertListeners.filter((l) => l !== listener);
    } else if (event === 'alert_triggered') {
      this.triggerListeners = this.triggerListeners.filter((l) => l !== listener);
    }
  }

  private notifyChange(): void {
    this.changeListeners.forEach((fn) => {
      try { fn(); } catch (e) {}
    });
  }

  private notifyAlertsChange(): void {
    this.alertListeners.forEach((fn) => {
      try { fn(); } catch (e) {}
    });
  }

  private notifyAlertTriggered(payload: { alert: PriceAlertItem; currentPrice: number }): void {
    this.triggerListeners.forEach((fn) => {
      try { fn(payload); } catch (e) {}
    });
  }

  // Public Methods
  getWatchlist(): WatchlistItem[] {
    return [...this.watchlist];
  }

  isInWatchlist(symbol: string): boolean {
    if (!symbol) return false;
    const cleanSymbol = symbol.replace(/^NSE:/, '').replace(/^BSE:/, '').toUpperCase();
    return this.watchlist.some(
      (item) => item.symbol.toUpperCase() === cleanSymbol || item.id.toUpperCase() === cleanSymbol
    );
  }

  addToWatchlist(symbol: string, name?: string, price?: number): WatchlistItem {
    const cleanSymbol = symbol.replace(/^NSE:/, '').replace(/^BSE:/, '').toUpperCase();
    const existing = this.watchlist.find((item) => item.symbol.toUpperCase() === cleanSymbol);
    if (existing) return existing;

    const newItem: WatchlistItem = {
      id: cleanSymbol,
      symbol: cleanSymbol,
      name: name || `${cleanSymbol} Ltd.`,
      price: price || 1500.0,
      change: 1.0,
      isPositive: true,
    };

    this.watchlist.unshift(newItem);
    this.notifyChange();

    // Persist to backend DB
    this.addToWatchlistDb(cleanSymbol);

    return newItem;
  }

  removeFromWatchlist(symbol: string): void {
    const cleanSymbol = symbol.replace(/^NSE:/, '').replace(/^BSE:/, '').toUpperCase();
    this.watchlist = this.watchlist.filter(
      (item) => item.symbol.toUpperCase() !== cleanSymbol && item.id.toUpperCase() !== cleanSymbol
    );
    this.notifyChange();

    // Remove from backend DB
    this.removeFromWatchlistDb(cleanSymbol);
  }

  reorderWatchlist(newOrder: WatchlistItem[]): void {
    this.watchlist = newOrder;
    this.notifyChange();

    // Reorder in backend DB
    fetch(`${BASE_URL}/market/watchlist/reorder`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Id': DEFAULT_USER_ID,
      },
      body: JSON.stringify(newOrder.map((item) => `NSE:${item.symbol}`)),
    }).catch((e) => console.warn('Reorder DB error:', e));
  }

  getAlertsForSymbol(symbol: string): PriceAlertItem[] {
    if (!symbol) return [];
    const cleanSymbol = symbol.replace(/^NSE:/, '').replace(/^BSE:/, '').toUpperCase();
    return this.priceAlerts.filter((alt) => alt.symbol.toUpperCase() === cleanSymbol);
  }

  getAllAlerts(): PriceAlertItem[] {
    return [...this.priceAlerts];
  }

  isDuplicateAlert(symbol: string, targetPrice: number, condition: string): boolean {
    if (!symbol) return false;
    const cleanSymbol = symbol.replace(/^NSE:/, '').replace(/^BSE:/, '').toUpperCase();
    return this.priceAlerts.some(
      (alt) =>
        alt.symbol.toUpperCase() === cleanSymbol &&
        alt.targetPrice === targetPrice &&
        alt.condition === condition &&
        alt.status === 'ACTIVE'
    );
  }

  addAlert(symbol: string, targetPrice: number, condition: 'GT' | 'LT' | 'GTE' | 'LTE'): PriceAlertItem {
    const cleanSymbol = symbol.replace(/^NSE:/, '').replace(/^BSE:/, '').toUpperCase();
    const newAlert: PriceAlertItem = {
      id: `alt-${Date.now()}`,
      symbol: cleanSymbol,
      targetPrice,
      condition,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
    };
    this.priceAlerts.unshift(newAlert);
    this.notifyAlertsChange();

    // Send to backend DB
    fetch(`${BASE_URL}/practice/alerts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Id': DEFAULT_USER_ID,
      },
      body: JSON.stringify({
        symbol: `NSE:${cleanSymbol}`,
        targetPrice,
        condition,
      }),
    }).catch((e) => console.warn('Create alert DB error:', e));

    return newAlert;
  }

  deleteAlert(alertId: string): void {
    this.priceAlerts = this.priceAlerts.filter((alt) => alt.id !== alertId);
    this.notifyAlertsChange();

    if (!alertId.startsWith('alt-')) {
      fetch(`${BASE_URL}/practice/alerts/${alertId}`, {
        method: 'DELETE',
        headers: { 'X-User-Id': DEFAULT_USER_ID },
      }).catch((e) => console.warn('Delete alert DB error:', e));
    }
  }

  /**
   * Evaluates current market tick against active price alerts and fires notifications.
   */
  evaluatePriceTick(symbol: string, currentPrice: number): void {
    const cleanSymbol = symbol.replace(/^NSE:/, '').replace(/^BSE:/, '').toUpperCase();
    const activeAlerts = this.priceAlerts.filter(
      (alt) => alt.symbol.toUpperCase() === cleanSymbol && alt.status === 'ACTIVE'
    );

    activeAlerts.forEach((alt) => {
      let isTriggered = false;
      if (alt.condition === 'GT' && currentPrice > alt.targetPrice) isTriggered = true;
      if (alt.condition === 'GTE' && currentPrice >= alt.targetPrice) isTriggered = true;
      if (alt.condition === 'LT' && currentPrice < alt.targetPrice) isTriggered = true;
      if (alt.condition === 'LTE' && currentPrice <= alt.targetPrice) isTriggered = true;

      if (isTriggered) {
        alt.status = 'TRIGGERED';
        this.notifyAlertsChange();
        this.notifyAlertTriggered({ alert: alt, currentPrice });
      }
    });
  }
}

export const watchlistManager = new WatchlistManager();
