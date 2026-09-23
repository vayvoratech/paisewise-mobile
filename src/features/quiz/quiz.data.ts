export type QuizOption = {
  key: string; // 'A' | 'B' | ...
  text: string;
  correct: boolean;
};

export type QuizQuestion = {
  id: string;
  prompt: string;
  options: QuizOption[];
  explanation: string;
  seconds: number;
  xp: number;
};

export const DAILY_QUIZ: QuizQuestion[] = [
  {
    id: 'q1',
    prompt: 'What does NAV stand for in mutual funds?',
    seconds: 25,
    xp: 50,
    options: [
      { key: 'A', text: 'Net Annual Value', correct: false },
      { key: 'B', text: 'Net Asset Value', correct: true },
      { key: 'C', text: 'New Account Value', correct: false },
      { key: 'D', text: 'National Average Value', correct: false },
    ],
    explanation: 'NAV = Net Asset Value — the per-unit price of a mutual fund.',
  },
  {
    id: 'q2',
    prompt: 'If NAV goes from ₹40 to ₹44, what is your return?',
    seconds: 25,
    xp: 50,
    options: [
      { key: 'A', text: '4% return on investment', correct: false },
      { key: 'B', text: '10% return on investment', correct: true },
      { key: 'C', text: 'Just ₹4 profit, no %', correct: false },
      { key: 'D', text: "Can't calculate without more info", correct: false },
    ],
    explanation: 'Correct! (44−40)÷40 × 100 = 10%. NAV se return nikalna easy hai — difference divide by original, times 100!',
  },
  {
    id: 'q3',
    prompt: 'What is a SIP?',
    seconds: 25,
    xp: 50,
    options: [
      { key: 'A', text: 'A one-time lump-sum investment', correct: false },
      { key: 'B', text: 'A regular fixed investment every month', correct: true },
      { key: 'C', text: 'A type of bank loan', correct: false },
      { key: 'D', text: 'A government tax', correct: false },
    ],
    explanation: 'SIP = Systematic Investment Plan. Thoda thoda har mahine — habit ban jaati hai!',
  },
  {
    id: 'q4',
    prompt: 'Which is generally lower risk for beginners?',
    seconds: 25,
    xp: 50,
    options: [
      { key: 'A', text: 'A single small-cap stock', correct: false },
      { key: 'B', text: 'A diversified index fund', correct: true },
      { key: 'C', text: 'Intraday trading', correct: false },
      { key: 'D', text: 'Penny stocks', correct: false },
    ],
    explanation: 'Diversified index funds spread risk across many companies — safer to start.',
  },
  {
    id: 'q5',
    prompt: 'What is the expense ratio?',
    seconds: 25,
    xp: 50,
    options: [
      { key: 'A', text: 'The fund manager + fund running fee', correct: true },
      { key: 'B', text: 'Your total profit', correct: false },
      { key: 'C', text: 'The stock market index', correct: false },
      { key: 'D', text: 'A type of dividend', correct: false },
    ],
    explanation: 'Expense ratio is the annual fee the fund charges. Lower is better for long-term returns.',
  },
];
