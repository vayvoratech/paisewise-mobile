export interface PracticeStock {
  symbol: string;
  name: string;
  sector: string;
  price: number;
  changePct: number;
  trend: number[];
  emoji: string;
  whyReason: string;
  peRatio?: number;
  marketCap?: string;
  dayHigh?: number;
  dayLow?: number;
}

export const TOP_PRACTICE_STOCKS: PracticeStock[] = [
  {
    symbol: 'RELIANCE',
    name: 'Reliance Industries Ltd.',
    sector: 'Conglomerate',
    price: 2952.40,
    changePct: 1.25,
    trend: [2910, 2925, 2918, 2935, 2930, 2948, 2942, 2952.40],
    emoji: '🛢️',
    whyReason: "India's largest company by market cap. Consistent cash flow from oil, retail, and Jio telecom make it a foundational blue-chip stock for beginners.",
    peRatio: 26.4,
    marketCap: '₹19.9 Lakh Cr',
    dayHigh: 2965.00,
    dayLow: 2908.10,
  },
  {
    symbol: 'TCS',
    name: 'Tata Consultancy Services',
    sector: 'IT Services',
    price: 3842.10,
    changePct: -0.65,
    trend: [3890, 3880, 3865, 3870, 3855, 3848, 3840, 3842.10],
    emoji: '💻',
    whyReason: "Global IT leader with zero debt and reliable dividends. When tech stocks drop, long-term investors watch TCS closely for recovery opportunities.",
    peRatio: 29.8,
    marketCap: '₹13.8 Lakh Cr',
    dayHigh: 3895.00,
    dayLow: 3835.50,
  },
  {
    symbol: 'INFY',
    name: 'Infosys Limited',
    sector: 'IT Services',
    price: 1568.50,
    changePct: 2.10,
    trend: [1525, 1530, 1542, 1538, 1555, 1560, 1562, 1568.50],
    emoji: '⚡',
    whyReason: "Major tech exporter with large enterprise contracts. Benefiting from international cloud and AI modernization deals.",
    peRatio: 25.1,
    marketCap: '₹6.5 Lakh Cr',
    dayHigh: 1574.00,
    dayLow: 1520.00,
  },
  {
    symbol: 'HDFCBANK',
    name: 'HDFC Bank Ltd.',
    sector: 'Banking',
    price: 1645.20,
    changePct: 0.85,
    trend: [1620, 1625, 1632, 1628, 1636, 1640, 1638, 1645.20],
    emoji: '🏦',
    whyReason: "India's premier private bank with a massive branch network and low non-performing assets (NPAs). Essential for financial sector practice.",
    peRatio: 18.9,
    marketCap: '₹12.5 Lakh Cr',
    dayHigh: 1652.80,
    dayLow: 1618.00,
  },
  {
    symbol: 'ICICIBANK',
    name: 'ICICI Bank Ltd.',
    sector: 'Banking',
    price: 1128.90,
    changePct: 1.45,
    trend: [1105, 1112, 1115, 1120, 1118, 1124, 1122, 1128.90],
    emoji: '💳',
    whyReason: "Consistently delivering industry-leading Return on Assets (RoA) and digital loan growth across urban and rural markets.",
    peRatio: 17.6,
    marketCap: '₹7.9 Lakh Cr',
    dayHigh: 1134.00,
    dayLow: 1102.50,
  },
  {
    symbol: 'TATAMOTORS',
    name: 'Tata Motors Ltd.',
    sector: 'Automobile',
    price: 982.30,
    changePct: 3.12,
    trend: [945, 952, 960, 958, 970, 975, 978, 982.30],
    emoji: '🚗',
    whyReason: "Pioneer in India's electric vehicle (EV) revolution with over 70% passenger EV market share and profitable global Jaguar Land Rover business.",
    peRatio: 11.2,
    marketCap: '₹3.6 Lakh Cr',
    dayHigh: 988.50,
    dayLow: 942.00,
  },
  {
    symbol: 'ITC',
    name: 'ITC Limited',
    sector: 'FMCG',
    price: 432.80,
    changePct: -0.32,
    trend: [436, 435, 434, 435, 433, 432, 433, 432.80],
    emoji: '🌿',
    whyReason: "High dividend payout and strong cash reserves from FMCG, paperboards, and luxury hotels. Very low volatility, great for capital preservation.",
    peRatio: 27.2,
    marketCap: '₹5.4 Lakh Cr',
    dayHigh: 437.50,
    dayLow: 431.20,
  },
  {
    symbol: 'BHARTIARTL',
    name: 'Bharti Airtel Ltd.',
    sector: 'Telecom',
    price: 1412.00,
    changePct: 1.80,
    trend: [1380, 1385, 1392, 1398, 1402, 1405, 1410, 1412.00],
    emoji: '📶',
    whyReason: "Highest average revenue per user (ARPU) in Indian telecom, expanding 5G network coverage and growing enterprise cloud services.",
    peRatio: 42.1,
    marketCap: '₹8.1 Lakh Cr',
    dayHigh: 1418.00,
    dayLow: 1378.00,
  },
];
