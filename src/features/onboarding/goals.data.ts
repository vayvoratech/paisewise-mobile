export type Goal = {
  id: string;
  emoji: string;
  title: string;
  subtitle: string; // Hinglish helper line
};

export const GOALS: Goal[] = [
  { id: 'house', emoji: '🏡', title: 'Buy a house / flat', subtitle: 'Ghar kharidna chahta/chahti hoon' },
  { id: 'kids', emoji: '📚', title: "Kids' education", subtitle: 'Bachchon ki padhai ke liye' },
  { id: 'retire', emoji: '🌴', title: 'Retire early', subtitle: 'Jaldi retire hona chahta hoon' },
  { id: 'learn', emoji: '📱', title: 'Just learn — no goal yet', subtitle: 'Abhi sirf seekhna chahta hoon' },
  { id: 'wedding', emoji: '💍', title: 'Wedding / celebration', subtitle: 'Shaadi ya koi bada kharcha' },
];
