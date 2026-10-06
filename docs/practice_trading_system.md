# PaiseWise Project – What I Worked On

## Practice Trading System: PracticeScreen Dashboard, Buy/Sell Modals & Trade Success

---

### 1. Practice Trading Architecture

First, I worked on the **Practice Trading (Paper Trading)** feature to give beginners a safe environment to learn stock trading without risking real money.

The basic idea I understood is:

> Instead of using real bank accounts and actual money, we give every user a virtual starting balance of **₹1,00,000**. Users can trade real Indian stocks (NSE) using live market prices, test their strategies, and see how their portfolio performs in real time.

For example, if a user wants to buy shares of Reliance:

> "I want to buy 5 shares of RELIANCE at ₹2,952.40."

The system checks if the user has enough virtual cash, executes the practice trade, deducts the virtual cost, adds the shares to their practice portfolio, logs the order receipt, and awards XP.

So the flow is:

```
User opens Practice Screen
↓
Views Virtual ₹1,00,000 Portfolio
↓
Browses Top Stocks & Live NSE Prices
↓
Taps ▲ BUY, ▼ SELL, or 💡 WHY
↓
Validates Balance & Customizes Order in Modal
↓
Confirms Practice Order
↓
Redux Updates Cash & Holdings
↓
Trade Success Screen with Confetti & Receipt
```

---

### 2. PracticeScreen Dashboard

Next, I designed and built the main **PracticeScreen Dashboard**.

I planned to include:

- A prominent green practice mode banner
- Cash, invested, and total portfolio summaries
- Returns percentage indicator
- Equity curve and stock trend sparklines
- Category filter chips (`All`, `Nifty 50`, `Top Gainers`, `Tech`, `Banking`)
- Practice open positions drawer with quick-sell actions
- Stock cards with live prices and `▲ BUY`, `▼ SELL`, and `💡 WHY` buttons

The purpose is to make sure beginners immediately know they are in a safe simulation mode, while still experiencing a realistic trading interface.

#### The Green Banner

At the top of the screen, I created an emerald green gradient hero banner:

```
● PRACTICE TRADING · NO REAL MONEY        [ 🔄 Reset ₹1L ]

Practice Trading
Learn by doing — safely!
```

The reason for the banner is simple:

> Users must never be confused about whether they are trading with real or practice funds. The banner clearly shows zero-risk status and includes a **Reset** button to start over with ₹1,00,000 anytime.

---

### 3. Portfolio Summaries & Returns Percentage

Inside the dashboard, I built the main practice summary card.

The system calculates:

- **Total Practice Value** = `Available Cash + Current Holdings Value`
- **Total Invested** = `Sum of (Average Purchase Price × Shares)`
- **Net Profit / Loss** = `Total Practice Value - ₹1,00,000 (Starting Seed)`

For example:

```
Total Practice Value:  ₹1,10,483
Available Cash:        ₹84,320
Total Invested:        ₹26,050
Holdings Value:        ₹26,163
Net Profit:           +₹10,483
```

#### Calculating Returns Percentage

I calculated the overall returns percentage using:

$$\text{Returns \%} = \frac{\text{Total Practice Value} - \text{Starting Capital}}{\text{Starting Capital}} \times 100$$

For example:

$$\frac{₹1,10,483 - ₹1,00,000}{₹1,00,000} \times 100 = \mathbf{+10.48\%}$$

- If returns are positive $\rightarrow$ Displayed in **Emerald Green** with an upward arrow (`▲ +10.48% Overall Return`).
- If returns are negative $\rightarrow$ Displayed in **Rose Red** with a downward arrow (`▼ -3.20%`).

---

### 4. Sparkline Trend Charts

To help users visualize price movement without cluttering the screen with heavy desktop charts, I implemented lightweight SVG **Sparklines**.

There are two types of sparklines on the dashboard:

#### 1. Portfolio Equity Curve Sparkline
Shows the overall account balance trajectory over time right inside the summary card.

#### 2. Stock Trend Sparklines
Each stock card has an individual sparkline showing its intraday price movement:

```
Stock Card
↓
Price points: [2910, 2925, 2918, 2935, 2930, 2948, 2942, 2952]
↓
Calculates (min, max, stepX)
↓
Draws smooth SVG line + gradient area fill
↓
Green for positive today / Red for negative today
```

---

### 5. BuyModal (Practice Buying)

When the user taps **`▲ BUY`** on any stock card, the `BuyModal` bottom sheet slides up.

In simple terms, this modal does five main things:

```
1. Mode Switcher → Switch between BUY and SELL instantly
2. Segmented Order Controls → MARKET | LIMIT | STOP LOSS & Delivery (CNC) vs Intraday (MIS)
3. Quantity Stepper → Minus / Plus buttons, text entry, and quick chips (+1, +5, +10, MAX)
4. Live Cost Checks → Live calculation of required capital vs available cash
5. Unique Order ID Generator → Generates a client order ID and places the order
```

#### The Stepper & MAX Chip

Instead of forcing users to only type, they can use:

- `−` and `+` stepper buttons
- Quick chips: `+1`, `+5`, `+10`, `+25`
- **`MAX` button**: Automatically calculates the maximum affordable shares:

$$\text{Max Affordable Shares} = \left\lfloor \frac{\text{Available Cash}}{\text{Stock Price}} \right\rfloor$$

For example, with ₹84,320 cash and Reliance at ₹2,952.40:

$$\left\lfloor \frac{84,320}{2,952.40} \right\rfloor = \mathbf{28\text{ shares}}$$

#### Live Cost & Affordability Check

Before the user can buy, the system performs a live validation check:

```
Quantity: 5 shares × ₹2,952.40 = ₹14,762 (Required Capital)
Virtual Cash Available:          ₹84,320
Brokerage & Taxes:               ₹0.00 (Practice Mode Zero Fee)
Estimated Cash Remaining:        ₹69,558
```

- **If Affordable** $\rightarrow$ Button turns green: `✓ Place Practice Buy · ₹14,762`.
- **If Unaffordable** $\rightarrow$ Warning alert displays: `⚠️ Insufficient Practice Cash: You need ₹X more`, and the button is disabled.

---

### 6. SellModal (Practice Selling)

When the user taps **`▼ SELL`** or switches tabs, the `SellModal` opens in sell mode with a rose-red theme.

The system performs three important checks:

#### 1. Holdings Check
Checks Redux to see how many shares the user actually owns of that stock.
Displays: `YOU OWN IN PRACTICE: 5 Shares · Avg Buy Price: ₹2,900`.

#### 2. Live Proceeds & P&L Calculation

$$\text{Total Proceeds} = \text{Shares} \times \text{Current Price}$$

$$\text{Estimated Realized P\&L} = \text{Proceeds} - (\text{Shares} \times \text{Average Buy Price})$$

For example, selling 5 shares bought at ₹2,900 for ₹2,952.40:

$$\text{Proceeds} = 5 \times 2,952.40 = ₹14,762$$

$$\text{P\&L} = ₹14,762 - ₹14,500 = \mathbf{+₹262\ (+1.8\%)}$$

#### 3. Validation Safeguards
- If user owns 0 shares $\rightarrow$ Blocks trade: `"You don't own any shares of this stock in your practice portfolio."`
- If user tries to sell 10 shares but only owns 5 $\rightarrow$ Blocks trade: `"You only own 5 shares. Cannot sell 10 shares."`
- **`SELL ALL` button** $\rightarrow$ Automatically sets quantity to the exact number of owned shares.

---

### 7. Client Order ID Generator

Every practice order generates a realistic, traceable **Client Order ID**.

The format I created:

```
PW-BUY-M12X9A-4B2K
PW-SELL-M12X9B-7C3F
```

#### What I Did

```typescript
export function generateClientOrderId(prefix: string = 'PW-ORD'): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const randomPart = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `${prefix}-${timestamp}-${randomPart}`;
}
```

#### Why Did I Do This?

> In real brokerage systems (like Zerodha or Groww), every trade has a unique `clientOrderId` sent to the exchange. Generating this ID gives beginners a realistic trading receipt and allows our Redux order ledger and analytics to track each transaction accurately.

---

### 8. TradeSuccessScreen with Confetti & Receipt

Once a practice order is confirmed, the app navigates to the **`TradeSuccessScreen`**.

This screen has three key parts:

#### 1. Confetti Celebration Burst
I built a 60fps native animated `ConfettiView` with 60 particles in gold, cyan, pink, emerald, and orange that burst outward and flutter downward.

#### 2. Official Practice Receipt

```
==================================================
              OFFICIAL PRACTICE RECEIPT
==================================================
ORDER ID:            PW-BUY-M12X9A-4B2K
STOCK SYMBOL:        RELIANCE
TRANSACTION:         PRACTICE BUY
QUANTITY:            5 Shares
EXECUTION PRICE:     ₹2,952.40
TOTAL INVESTED:      ₹14,762
PRODUCT / ORDER:     MARKET · DELIVERY (CNC)
BROKERAGE & TAXES:   ₹0.00 (Zero Fee Practice)
PRACTICE CASH LEFT:  ₹69,558
EXECUTION STATUS:    ● FILLED
==================================================
```

#### 3. Gamification Reward
- Awards **`⭐ +25 XP`** for completing a trade.
- Dual navigation buttons:
  - **`View Practice Portfolio →`** (navigates to Portfolio screen)
  - **`🎮 Trade More Stocks`** (returns to Practice dashboard)

---

### 9. Educational WhyModal

To make the app educational rather than just a dummy trading simulator, I added the **`💡 WHY`** button on every stock card.

When tapped, it opens an educational bottom sheet explaining:

- **Beginner Analysis**: Plain-English explanation of what the company does and why it's a foundational stock.
- **Key Metrics**:
  - P/E Ratio (Valuation comparison)
  - Market Cap (Large Cap blue-chip classification)
  - Risk Level (Moderate, Low, High)
- **Practice Tip**: Practical tip on how to observe price movement during market hours.

---

### 10. Automated Testing & Verification

To verify that the math, validation safeguards, and state updates work correctly, I created a dedicated test suite (`scripts/test-practice.js`).

#### Test Results

```
========================================
🧪 SUITE: Client Order ID Generation & Formatting
========================================
  ✅ PASS: generates unique client order IDs with default prefix
  ✅ PASS: supports custom prefixes like PW-BUY and PW-SELL
  ✅ PASS: generates IDs with expected hyphen-delimited segments

========================================
🧪 SUITE: Simulated Practice Trading Charges
========================================
  ✅ PASS: correctly calculates simulated delivery charges for ₹1,00,000 buy
  ✅ PASS: correctly computes simulated intraday charges for ₹50,000 sell
  ✅ PASS: handles zero or negative order values safely

========================================
🧪 SUITE: Order Live Validation Engine
========================================
  ✅ PASS: validates affordable buy orders correctly
  ✅ PASS: flags unaffordable buy orders with deficit error
  ✅ PASS: blocks sell orders when user owns 0 shares
  ✅ PASS: blocks sell orders when requested quantity exceeds owned shares
  ✅ PASS: allows valid sell orders when quantity is within owned shares

========================================
🧪 SUITE: Practice Portfolio Calculations & Reducer Logic
========================================
  ✅ PASS: correctly buys new stock and updates cash and holdings
  ✅ PASS: averages prices correctly when buying additional shares of existing stock
  ✅ PASS: correctly sells stock partially and credits cash proceeds
  ✅ PASS: removes holding completely when all shares are sold
  ✅ PASS: resets practice portfolio back to ₹1,00,000 cleanly

========================================
🧪 SUITE: Practice Stock Dataset & Sparklines
========================================
  ✅ PASS: ensures each practice stock has valid symbol, name, and positive price
  ✅ PASS: verifies all stocks contain valid sparkline trend points (>= 2 points)

========================================
📊 FINAL RESULTS: 18 / 18 PASSED
========================================
```

- **TypeScript Compilation**: `npx tsc --noEmit` exited with **0 errors**.
- **Regression Tests**: All 17 existing SIP & Mutual Fund portfolio tests passed without issues.

---

### 🎯 Overall What I Have Done

If your mentor asks *"What exactly did you work on in this task?"*, you can explain it like this:

> "I built the complete Practice (Paper) Trading module for PaiseWise. First, I created the **PracticeScreen Dashboard** featuring a green zero-risk banner, virtual ₹1,00,000 cash and invested summaries, overall returns percentage badge, and equity curve sparklines alongside top NSE stock cards.
> 
> Next, I built the **BuyModal and SellModal** bottom sheets with segmented controls for order types (Market, Limit, Stop Loss) and delivery options, a responsive quantity stepper with quick-add chips, real-time live cost calculations, affordability checks, and holdings safeguards. Every trade generates a unique `clientOrderId`.
> 
> Finally, I implemented the **TradeSuccessScreen** with a 60fps confetti animation, detailed order receipt, and XP rewards, along with an educational **WhyModal** explaining stock fundamentals. I integrated everything with Redux and Mixpanel analytics, and verified the entire module with 18 passing automated tests and zero TypeScript errors."

---

### ⭐ Super-short version for KT

If your senior asks *"What did you actually do?"*, say:

> "I built the Practice Trading dashboard and Buy/Sell modals. It gives users ₹1,00,000 in virtual cash with live cost checks, sparkline charts, and a confetti trade success receipt, allowing beginners to practice buying and selling Indian stocks safely with zero real money."

---

### Remember it like this 🧠

```
Practice Dashboard (₹1L Virtual Cash + Sparklines + Returns %)
↓
Buy / Sell Modal (Stepper + Live Cost Check + clientOrderId)
↓
Redux State (portfolioSlice + orderSlice updated)
↓
Trade Success (Confetti + Detailed Receipt + +25 XP)
```
