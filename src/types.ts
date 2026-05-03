export type MatchStatus = 'upcoming' | 'ongoing' | 'completed';

export interface ScoreboardEntry {
  userId: string;
  username: string;
  kills: number;
  rank: number;
}

export interface JoinedPlayer {
  userId: string;
  ign: string;
  gameUid: string;
  slot: number;
  team?: string;
}

export interface Match {
  id: string;
  title: string;
  date: string;
  time: string;
  prizePool: string;
  perKillPrize?: string;
  entryFee: number;
  status: MatchStatus;
  joinedUsers: string[];
  joinedPlayers?: JoinedPlayer[];
  scoreboard?: ScoreboardEntry[];
  category: string;
  subCategory: string;
  gameMode: string;
  map?: string;
  rules?: string;
  maxPlayers?: number;
  matchId?: string; // Display ID like #57932
  roomId?: string;
  roomPassword?: string;
}

export interface UserProfile {
  uid: string;
  email?: string;
  phoneNumber?: string;
  displayName?: string;
  photoURL?: string;
  role?: 'admin' | 'user';
  walletBalance: number;
  depositedBalance?: number;
  winningBalance?: number;
  totalEarnings?: number;
  totalPayouts?: number;
  isBanned?: boolean;
  referralCode: string;
  referredBy?: string;
  firstDepositDone?: boolean;
}

export interface WithdrawalRequest {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  amount: number;
  method: 'UPI' | 'Redeem Code' | 'FamApp';
  details: string;
  status: 'pending' | 'completed' | 'rejected';
  createdAt: any;
}

export interface AppRules {
  content: string;
  updatedAt: any;
}

export interface Banner {
  id: string;
  imageUrl: string;
  title: string;
  subtitle: string;
  order: number;
  isActive: boolean;
}

export interface AppSettings {
  logoUrl: string;
  qrCodeUrl: string;
  homeBoxImageUrl: string;
  matchBannerUrl: string;
}

export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  type: 'deposit' | 'withdrawal' | 'match_entry' | 'match_win' | 'referral';
  status: 'pending' | 'completed' | 'failed';
  description: string;
  createdAt: any;
}
