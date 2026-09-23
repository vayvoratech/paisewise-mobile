export type Reply = {
  author: string;
  verifiedHelper: boolean;
  text: string;
};

export type CommunityPost = {
  id: string;
  author: string;
  initial: string;
  location: string;
  ago: string;
  tag: string;
  avatarColor: string;
  text: string;
  replies: Reply[];
};

export const COMMUNITY_POSTS: CommunityPost[] = [
  {
    id: 'p1',
    author: 'Priya',
    initial: 'P',
    location: 'Jaipur, Rajasthan',
    ago: '2h ago',
    tag: '#MutualFunds',
    avatarColor: '#EF4444',
    text: 'SIP mein ₹500 se start kar sakti hoon? Kya itna kam kaafi hai? 😅',
    replies: [
      {
        author: 'Amit K.',
        verifiedHelper: true,
        text: 'Haan bilkul! ₹100 se bhi SIP hoti hai. Small se shuru karo, habit banao! 🙌',
      },
    ],
  },
  {
    id: 'p2',
    author: 'Rajan',
    initial: 'R',
    location: 'Indore, MP',
    ago: '5h ago',
    tag: '#Stocks',
    avatarColor: '#3B82F6',
    text: 'Market crash ho jaye toh mera paisa dub jayega kya? Bahut darr lagta hai 😨',
    replies: [
      {
        author: 'Kavya M.',
        verifiedHelper: true,
        text: 'Long term mein Sensex hamesha upar gaya hai! Practice mode mein try karo pehle 💪',
      },
    ],
  },
];

export const ONLINE_COUNT = 143;
