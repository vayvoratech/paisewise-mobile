// --- Auth & User ---
export interface User { id: string; email: string; name: string; level: number; xp: number; }
export interface AuthTokens { accessToken: string; refreshToken: string; }
export interface OtpResponse { message: string; expiresAt: string; }
export interface LoginResponse { user: User; tokens: AuthTokens; }

// --- Learning ---
export interface Lesson { id: string; title: string; content: string; order: number; }
export interface LessonBlock { id: string; lessonId: string; type: 'text' | 'video' | 'quiz'; }
export interface QuizQuestion { id: string; question: string; options: string[]; }
export interface QuizAnswer { questionId: string; selectedOption: number; }
export interface UserProgress { userId: string; lessonId: string; completed: boolean; xpEarned: number; }

// --- Trading ---
export interface Order { id: string; symbol: string; qty: number; side: 'BUY' | 'SELL'; status: string; }
export interface Trade { id: string; orderId: string; executionPrice: number; }
export interface OrderRequest { symbol: string; qty: number; side: 'BUY' | 'SELL'; type: 'MARKET' | 'LIMIT'; }
export interface OrderResponse { orderId: string; status: 'PENDING' | 'EXECUTED' | 'REJECTED'; }

// --- Portfolio ---
export interface Holding { symbol: string; qty: number; avgPrice: number; ltp: number; }
export interface PortfolioSummary { totalValue: number; totalInvested: number; }
export interface PnLReport { realizedPnL: number; unrealizedPnL: number; }

// --- Market ---
export interface MutualFund { id: string; name: string; nav: number; }
export interface SIPRequest { fundId: string; amount: number; frequency: 'monthly' | 'weekly'; }
export interface MFInvestment { id: string; fundId: string; amount: number; date: string; }
export interface MarketQuote { symbol: string; ltp: number; change: number; }
export interface Candle { timestamp: string; open: number; high: number; low: number; close: number; }
export interface WatchlistItem { symbol: string; addedAt: string; }

// --- Social & Notifications ---
export interface Notification { id: string; title: string; body: string; read: boolean; }
export interface PriceAlert { id: string; symbol: string; targetPrice: number; }
export interface CommunityPost { id: string; title: string; authorId: string; }
export interface CommunityAnswer { id: string; postId: string; content: string; }