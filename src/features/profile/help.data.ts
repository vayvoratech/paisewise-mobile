/**
 * help.data.ts — Data definitions for FAQs, SEBI SCORES portal, and 6 supported Indian languages.
 */

export interface FaqItem {
  id: string;
  category: 'GENERAL' | 'TRADING' | 'LEARNING' | 'DPDP' | 'SEBI';
  question: string;
  answer: string;
  highlights?: string[];
}

export interface SupportedLanguage {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  tag: string;
  description: string;
}

export const SUPPORTED_LANGUAGES: SupportedLanguage[] = [
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇬🇧',
    tag: 'Default',
    description: 'Learn finance in simple, clear English',
  },
  {
    code: 'hi',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    flag: '🇮🇳',
    tag: 'लोकप्रिय',
    description: 'सरल हिन्दी में वित्तीय शिक्षा और निवेश समझें',
  },
  {
    code: 'ta',
    name: 'Tamil',
    nativeName: 'தமிழ்',
    flag: '🇮🇳',
    tag: 'தென்னிந்தியா',
    description: 'எளிய தமிழில் நிதி கல்வி மற்றும் பங்குச் சந்தை',
  },
  {
    code: 'te',
    name: 'Telugu',
    nativeName: 'తెలుగు',
    flag: '🇮🇳',
    tag: 'తెలుగు',
    description: 'సులభమైన తెలుగులో ఆర్థిక విద్య మరియు స్టాక్ మార్కెట్',
  },
  {
    code: 'kn',
    name: 'Kannada',
    nativeName: 'ಕನ್ನಡ',
    flag: '🇮🇳',
    tag: 'ಕರ್ನಾಟಕ',
    description: 'ಸರಳ ಕನ್ನಡದಲ್ಲಿ ಹಣಕಾಸು ಜ್ಞಾನ ಮತ್ತು ಹೂಡಿಕೆ ತರಬೇತಿ',
  },
  {
    code: 'bn',
    name: 'Bengali',
    nativeName: 'বাংলা',
    flag: '🇮🇳',
    tag: 'বাংলা',
    description: 'সহজ বাংলায় আর্থিক শিক্ষা ও শেয়ার বাজার শিখুন',
  },
];

export const FAQ_CATEGORIES: { label: string; value: 'ALL' | FaqItem['category'] }[] = [
  { label: 'All FAQs', value: 'ALL' },
  { label: 'General & Account', value: 'GENERAL' },
  { label: 'Paper Trading', value: 'TRADING' },
  { label: 'Learning & Badges', value: 'LEARNING' },
  { label: 'DPDP & Privacy', value: 'DPDP' },
  { label: 'SEBI & Grievances', value: 'SEBI' },
];

export const FAQS: FaqItem[] = [
  {
    id: 'faq-1',
    category: 'GENERAL',
    question: 'What is PaiseWise and how does it help beginner investors?',
    answer:
      'PaiseWise is a gamified financial education platform tailored for Indian retail investors. We bridge the gap between classroom theory and real market dynamics through bite-sized interactive modules, instant jargon busting, and 100% risk-free virtual paper trading.',
    highlights: [
      'Bite-sized micro-lessons and quizzes',
      'Virtual ₹1,00,000 practice trading account',
      'Gamified streak tracking and skill badges',
    ],
  },
  {
    id: 'faq-2',
    category: 'TRADING',
    question: 'Does virtual paper trading require real money or bank accounts?',
    answer:
      'No! Practice paper trading uses strictly virtual capital (starting with ₹1,00,000 demo cash). You never need to link your bank account, transfer funds, or deposit real money. It is an educational sandbox to test strategies without financial risk.',
    highlights: [
      'Zero financial liability or real-money risk',
      'Live market feeds simulated with actual NSE/BSE quotes',
      'Realistic order execution, charges, and P&L tracking',
    ],
  },
  {
    id: 'faq-3',
    category: 'LEARNING',
    question: 'How do I earn XP, increase my level, and unlock achievement badges?',
    answer:
      'You earn Experience Points (XP) every time you complete a bite-sized lesson (+50 XP), pass a quiz (+100 XP), execute a practice order (+25 XP), or maintain your daily streak. Higher XP levels unlock learner tiers from Novice to Market Analyst and reward you with badges.',
    highlights: [
      '50 XP for completing a concept lesson',
      '100 XP bonus for scoring 100% in chapter quizzes',
      'Special milestone badges viewable in your profile',
    ],
  },
  {
    id: 'faq-4',
    category: 'LEARNING',
    question: 'What happens if I miss a day in my daily learning streak?',
    answer:
      'Daily streaks measure your consistency. If you do not complete at least one lesson or quiz within a 24-hour cycle, your streak resets to Day 1. However, your total accumulated XP and earned badges will always remain intact.',
  },
  {
    id: 'faq-5',
    category: 'DPDP',
    question: 'How does PaiseWise protect my personal data under the DPDP Act 2023?',
    answer:
      'PaiseWise strictly complies with the Digital Personal Data Protection Act, 2023 (DPDP Act). We act as a Data Fiduciary and process only the minimal data required for educational personalization. Your data is stored on encrypted Indian servers and is never sold to third-party telemarketers.',
    highlights: [
      'Strict adherence to DPDP Act 2023 consent protocols',
      'End-to-end encryption for phone and email credentials',
      'Full right to data access and right to erasure (Section 11 & 12)',
    ],
  },
  {
    id: 'faq-6',
    category: 'DPDP',
    question: 'How do I export my personal data or permanently delete my account?',
    answer:
      'Under DPDP Section 11 & 12, you have the right to data portability and erasure. Go to Profile → Settings → "Export Personal Data (DPDP)" to generate and download a comprehensive JSON archive. To permanently delete your account and revoke all processing consent, select "Delete Account" in Settings.',
    highlights: [
      'Instant DPDP-compliant JSON data export package',
      'Irreversible account wipe with complete data erasure',
    ],
  },
  {
    id: 'faq-7',
    category: 'GENERAL',
    question: 'How do I change or recover my 4-digit security MPIN?',
    answer:
      'Go to Profile → Security & MPIN. If you know your current MPIN, select "Change MPIN". If you have forgotten it, tap "Forgot MPIN" to receive an OTP verification code on your registered email address and set a new secure 4-digit code.',
  },
  {
    id: 'faq-8',
    category: 'TRADING',
    question: 'How often are stock quotes and mutual fund NAVs updated?',
    answer:
      'Stock quotes update in real-time or near-real-time during Indian market trading hours (9:15 AM - 3:30 PM IST on weekdays). Mutual fund NAVs are updated once daily post-market closing in alignment with AMFI reporting.',
  },
  {
    id: 'faq-9',
    category: 'SEBI',
    question: 'Is PaiseWise a registered stockbroker or SEBI investment advisor?',
    answer:
      'PaiseWise is an educational technology (EdTech) platform designed to spread financial literacy. It is NOT a SEBI-registered broker, research analyst, or portfolio management service. All investment simulations and practice trades are purely for learning and educational purposes.',
    highlights: [
      'Not a registered broker or SEBI investment adviser',
      'No financial advisory or stock tips are offered',
      'Virtual trades do not execute on stock exchanges',
    ],
  },
  {
    id: 'faq-10',
    category: 'SEBI',
    question: 'What should I do if I have a grievance or complaint regarding PaiseWise?',
    answer:
      'We follow a transparent 3-tier grievance redressal framework. First, write to our internal Grievance Officer at grievance@paisewise.in. If your grievance is unresolved within 30 days, you may escalate to the official SEBI SCORES portal (scores.sebi.gov.in) or SMART ODR platform.',
    highlights: [
      'Level 1: Internal Support (resolution within 48-72 hours)',
      'Level 2: PaiseWise Compliance Officer (compliance@paisewise.in)',
      'Level 3: SEBI SCORES Portal (scores.sebi.gov.in)',
    ],
  },
];

export const SEBI_SCORES_INFO = {
  portalName: 'SEBI Complaints Redress System (SCORES 2.0)',
  portalUrl: 'https://scores.sebi.gov.in',
  smartOdrUrl: 'https://smartodr.in',
  tollFreeHelpline1: '1800 22 7575',
  tollFreeHelpline2: '1800 266 7575',
  hours: '9:00 AM – 6:00 PM IST (Monday to Friday, 14 Indian languages)',
  grievanceOfficer: {
    name: 'Grievance Redressal Officer',
    designation: 'Head of Regulatory Compliance',
    company: 'PaiseWise Financial Technologies Pvt. Ltd.',
    email: 'grievance@paisewise.in',
    supportEmail: 'support@paisewise.in',
    tat: '48 to 72 business hours',
  },
  escalationSteps: [
    {
      step: '1',
      title: 'Contact PaiseWise In-App Support',
      desc: 'Raise a ticket or write to support@paisewise.in for technical, content, or account issues. Standard turnaround is 48 hours.',
      badge: 'Step 1 • Internal',
    },
    {
      step: '2',
      title: 'Escalate to Grievance Redressal Officer',
      desc: 'If not resolved satisfactorily within 7 days, email grievance@paisewise.in citing your ticket reference ID.',
      badge: 'Step 2 • Compliance',
    },
    {
      step: '3',
      title: 'Lodge Complaint on SEBI SCORES Portal',
      desc: 'If the complaint remains unresolved after 30 days, file an official grievance on SEBI SCORES 2.0 (scores.sebi.gov.in) or SMART ODR.',
      badge: 'Step 3 • Regulatory',
    },
  ],
};
