/** Lessons + jargon dictionary. Mock content matching the provided screens. */

export type JargonTerm = {
  term: string;
  definition: string;
  analogy: string;
  example: string;
};

export type LessonSegment =
  | { type: 'text'; content: string }
  | { type: 'emoji'; content: string }
  | { type: 'callout'; title: string; content: string };

export type Lesson = {
  id: string;
  chapter: string;
  chapterNo: number;
  index: number; // lesson n of total
  total: number;
  title: string;
  segments: LessonSegment[];
  /** Words in the body that link to the Jargon Buster. */
  jargonWords: string[];
  quizXp: number;
};

export const JARGON: Record<string, JargonTerm> = {
  'Fund Manager': {
    term: 'Fund Manager',
    definition:
      "A SEBI-registered professional who decides which stocks or bonds to buy using your pooled money. They're paid from the expense ratio of the fund.",
    analogy:
      "Like a master chef who decides what vegetables to buy at the market using everyone's money. You don't cook — they do it for you!",
    example: "A Nifty 50 fund manager buys shares in India's top 50 companies. You own a tiny piece of all 50 with just ₹500.",
  },
  'dal bhat pot': {
    term: 'Dal Bhat Pot',
    definition: 'A simple way to picture pooling money: many people contribute to one shared pot, then a professional invests the whole pot.',
    analogy: '1,000 people each put ₹500 into one big pot — ₹5 lakh total — and a chef (fund manager) cooks the best meal with it.',
    example: 'That shared pot, professionally managed, is exactly what a Mutual Fund is.',
  },
  'Mutual Fund': {
    term: 'Mutual Fund',
    definition: 'Group investment + professional management. Returns even when you know nothing about stocks.',
    analogy: 'Imagine 1,000 people put ₹500 each. A professional fund manager uses all ₹5 lakh to buy the best ingredients. You get your share.',
    example: 'A SIP of ₹500/month into a mutual fund slowly builds wealth without you picking any stocks.',
  },
};

export const TODAYS_LESSON: Lesson = {
  id: 'mf-3',
  chapter: 'Mutual Funds',
  chapterNo: 3,
  index: 3,
  total: 5,
  title: 'What exactly is a Mutual Fund?',
  jargonWords: ['dal bhat pot', 'Fund Manager', 'Mutual Fund'],
  quizXp: 50,
  segments: [
    { type: 'emoji', content: '🍲' },
    {
      type: 'text',
      content:
        'Imagine a dal bhat pot where 1,000 people put in ₹500 each. A professional Fund Manager uses all ₹5 lakh to buy the best ingredients. You get your share of the meal — without knowing how to cook.',
    },
    { type: 'text', content: "That's a Mutual Fund!" },
    {
      type: 'callout',
      title: 'EASY WAY TO REMEMBER',
      content:
        'Mutual Fund = Group investment + Professional management. Returns even when you know nothing about stocks.',
    },
  ],
};
