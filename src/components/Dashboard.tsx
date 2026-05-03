import React, { useState, useEffect } from 'react';
import { auth } from '../firebase';
import { firestoreService } from '../services/firestoreService';
import { Match, MatchStatus, UserProfile, Banner, AppSettings, Transaction } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy, 
  Calendar, 
  Clock, 
  Users, 
  LogOut, 
  ChevronRight,
  PlayCircle,
  CheckCircle2,
  Timer,
  Settings,
  Wallet,
  Share2,
  Home,
  User as UserIcon,
  PlusCircle,
  History,
  ArrowUpRight,
  ArrowDownLeft,
  X,
  ShieldAlert,
  MessageCircle,
  ListOrdered,
  ArrowLeft,
  FileText,
  Headset,
  Percent,
  Star,
  Edit3,
  Bell,
  Lock,
  Info,
  Camera
} from 'lucide-react';
import AdminPanel from './AdminPanel';
import { onSnapshot, doc } from 'firebase/firestore';
import { db } from '../firebase';

type View = 'home' | 'profile' | 'wallet' | 'withdraw' | 'rules' | 'offers' | 'matches' | 'edit-profile' | 'match-history' | 'settings' | 'transactions';

interface DashboardProps {
  user: any;
}

export default function Dashboard({ user }: DashboardProps) {
  const [matches, setMatches] = useState<Match[]>([]);
  const [activeTab, setActiveTab] = useState<MatchStatus>('upcoming');
  const [showMyMatches, setShowMyMatches] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [joiningMatch, setJoiningMatch] = useState<Match | null>(null);
  const [selectedMatchForDetail, setSelectedMatchForDetail] = useState<Match | null>(null);
  const [ign, setIgn] = useState('');
  const [gameUid, setGameUid] = useState('');
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<string>('');
  const [detailTab, setDetailTab] = useState<'description' | 'joined'>('description');
  const [isJoining, setIsJoining] = useState(false);
  const [editingJoinedMatch, setEditingJoinedMatch] = useState<Match | null>(null);
  const [currentView, setCurrentView] = useState<View>('home');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<{ category: string, subCategory: string, gameMode: string } | null>(null);

  // Withdrawal States
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawMethod, setWithdrawMethod] = useState<'UPI' | 'Redeem Code' | 'FamApp'>('UPI');
  const [withdrawDetails, setWithdrawDetails] = useState('');
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [appRules, setAppRules] = useState('');
  const [banners, setBanners] = useState<Banner[]>([]);
  const [appSettings, setAppSettings] = useState<AppSettings | null>(null);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [newDisplayName, setNewDisplayName] = useState('');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const getMatchCount = (category: string, subCategory: string, gameMode: string) => {
    return matches.filter(m => 
      m.category === category && 
      m.subCategory === subCategory && 
      m.gameMode === gameMode &&
      m.status === 'upcoming'
    ).length;
  };

  const adminEmails = [
    'akhileshkmaurya76@gmail.com',
    'nitineditz52@gmail.com',
    'makvanayash930@gmail.com',
    'aalokhaoge399@gmail.com',
    'yashmakvana161@gmail.com',
    'yash.admin123@gmail.com'
  ];
  const isAdmin = adminEmails.includes(user?.email?.toLowerCase() || '') || userProfile?.role === 'admin';

  useEffect(() => {
    const unsubscribeMatches = firestoreService.subscribeToMatches((data) => {
      setMatches(data);
    });

    let unsubscribeProfile = () => {};
    if (user) {
      unsubscribeProfile = onSnapshot(doc(db, 'users', user.uid), (doc) => {
        if (doc.exists()) {
          setUserProfile(doc.data() as UserProfile);
        }
      });
    }

    const unsubscribeRules = firestoreService.subscribeToRules(setAppRules);
    const unsubscribeBanners = firestoreService.subscribeToBanners(setBanners);
    const unsubscribeSettings = firestoreService.subscribeToAppSettings(setAppSettings);
    
    let unsubscribeTransactions = () => {};
    if (user) {
      unsubscribeTransactions = firestoreService.subscribeToTransactions(user.uid, setTransactions);
    }

    return () => {
      unsubscribeMatches();
      unsubscribeProfile();
      unsubscribeRules();
      unsubscribeBanners();
      unsubscribeSettings();
      unsubscribeTransactions();
    };
  }, [user]);

  useEffect(() => {
    const activeBanners = banners.filter(b => b.isActive);
    if (activeBanners.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentBannerIndex((prev) => (prev + 1) % activeBanners.length);
    }, 5000); // Change banner every 5 seconds

    return () => clearInterval(timer);
  }, [banners]);

  if (userProfile?.isBanned && !isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-[#2e1065]">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-[#1a1a1a]/80 backdrop-blur-md rounded-3xl p-10 border border-red-500/20 shadow-2xl max-w-md w-full"
        >
          <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldAlert className="w-10 h-10 text-red-500" />
          </div>
          <h1 className="text-3xl font-black text-white mb-4">ACCOUNT BANNED</h1>
          <p className="text-gray-400 mb-8 leading-relaxed">
            Your account has been suspended for violating our terms of service. 
            If you believe this is a mistake, please contact our support team.
          </p>
          <div className="space-y-3">
            <a 
              href="https://wa.me/91XXXXXXXXXX" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-500 text-white py-4 rounded-2xl font-bold transition-all"
            >
              <MessageCircle className="w-5 h-5" />
              Contact Support
            </a>
            <button 
              onClick={() => auth.signOut()}
              className="w-full flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-white py-4 rounded-2xl font-bold transition-all"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (showAdmin && isAdmin) {
    return <AdminPanel onBack={() => setShowAdmin(false)} />;
  }

  const filteredMatches = matches.filter(m => {
    if (showMyMatches) {
      const isJoined = m.joinedUsers?.includes(user?.uid || '');
      return isJoined && m.status === activeTab;
    }
    if (selectedFilter) {
      return m.category === selectedFilter.category && 
             m.subCategory === selectedFilter.subCategory && 
             m.gameMode === selectedFilter.gameMode;
    }
    return m.status === 'upcoming';
  });

  const handleJoinClick = (match: Match) => {
    if (!user) return;
    setSelectedMatchForDetail(match);
  };

  const confirmJoin = async () => {
    if (!user || !joiningMatch || !ign || !gameUid || selectedSlot === null) return;
    
    setIsJoining(true);
    try {
      await firestoreService.joinMatch(
        joiningMatch.id, 
        user.uid, 
        ign, 
        gameUid, 
        joiningMatch.entryFee,
        selectedSlot,
        selectedTeam
      );
      setJoiningMatch(null);
      setSelectedMatchForDetail(null);
      setIgn('');
      setGameUid('');
      setSelectedSlot(null);
      setSelectedTeam('');
      alert('Successfully joined the match!');
    } catch (error: any) {
      alert(error.message || 'Failed to join match');
    } finally {
      setIsJoining(false);
    }
  };

  const handleUpdateDetails = async () => {
    if (!user || !editingJoinedMatch || !ign || !gameUid) return;
    
    setIsJoining(true);
    try {
      await firestoreService.updatePlayerDetails(editingJoinedMatch.id, user.uid, ign, gameUid);
      setEditingJoinedMatch(null);
      setIgn('');
      setGameUid('');
    } catch (error) {
      console.error('Failed to update details:', error);
      alert('Failed to update details. Please try again.');
    } finally {
      setIsJoining(false);
    }
  };

  const renderHome = () => (
    <main className="max-w-2xl mx-auto p-4 space-y-6 pb-32">
      {/* Rules Button */}
      <button 
        onClick={() => setCurrentView('rules')}
        className="w-full py-4 rounded-2xl flex items-center justify-between px-6 transition-all transform active:scale-[0.98] backdrop-blur-sm bg-[#1a1a1a]/60 border border-gray-800 text-white"
      >
        <div className="flex items-center gap-3">
          <FileText className="w-6 h-6 text-red-500" />
          <span className="font-bold text-lg">Game Rules</span>
        </div>
        <ChevronRight className="w-6 h-6 text-gray-500" />
      </button>

      {/* Banners */}
      <div className="relative h-48 rounded-2xl overflow-hidden shadow-2xl shadow-red-500/10 bg-[#1a1a1a]">
        {banners.filter(b => b.isActive).length > 0 ? (
          <div className="h-full relative">
            <AnimatePresence mode="wait">
              {banners.filter(b => b.isActive).map((banner, index) => (
                index === currentBannerIndex && (
                  <motion.div 
                    key={banner.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.5 }}
                    className="absolute inset-0"
                  >
                    <img 
                      src={banner.imageUrl} 
                      alt={banner.title}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6">
                      <h2 className="text-2xl font-bold">{banner.title}</h2>
                      <p className="text-red-500 text-sm font-semibold">{banner.subtitle}</p>
                    </div>
                  </motion.div>
                )
              ))}
            </AnimatePresence>
            
            {/* Banner Indicators */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
              {banners.filter(b => b.isActive).map((_, i) => (
                <div 
                  key={i}
                  className={`h-1 rounded-full transition-all duration-300 ${
                    i === currentBannerIndex ? 'w-6 bg-red-600' : 'w-2 bg-white/30'
                  }`}
                />
              ))}
            </div>
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative h-full"
          >
            <img 
              src={appSettings?.homeBoxImageUrl || "https://storage.googleapis.com/test-api-446285554400-static-content/245802f0-7546-474d-9fde-0c460193e62a.png"} 
              alt="Tournament Banner"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6">
              <h2 className="text-2xl font-bold">FF Pro Championship</h2>
              <p className="text-red-500 text-sm font-semibold">Registration Open • Season 4</p>
            </div>
          </motion.div>
        )}
      </div>

      {/* My Matches Button */}
      <button 
        onClick={() => setShowMyMatches(!showMyMatches)}
        className={`w-full py-4 rounded-2xl flex items-center justify-between px-6 transition-all transform active:scale-[0.98] backdrop-blur-sm ${
          showMyMatches 
          ? 'bg-red-600 text-white shadow-lg shadow-red-500/20' 
          : 'bg-[#1a1a1a]/60 border border-gray-800 text-white'
        }`}
      >
        <div className="flex items-center gap-3">
          <Users className="w-6 h-6" />
          <span className="font-bold text-lg">My Matches</span>
        </div>
        <ChevronRight className={`w-6 h-6 transition-transform ${showMyMatches ? 'rotate-90' : ''}`} />
      </button>

      {!showMyMatches && !selectedFilter && (
        <div className="px-2 space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-1 h-6 bg-red-600 rounded-full"></div>
            <h3 className="text-xl font-bold tracking-tight uppercase">Full map</h3>
          </div>
          <p className="text-xs font-black text-red-500 uppercase tracking-[0.2em] pl-3">Survival</p>
        </div>
      )}

      {selectedFilter && !showMyMatches && (
        <div className="px-4 py-2 flex items-center justify-between bg-[#1a1a1a]/40 backdrop-blur-sm border-b border-gray-800 sticky top-0 z-10 rounded-xl mb-4">
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">{selectedFilter.category} • {selectedFilter.subCategory}</span>
            <h2 className="text-lg font-black uppercase">{selectedFilter.gameMode} Matches</h2>
          </div>
          <button 
            onClick={() => setSelectedFilter(null)}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      )}

      <AnimatePresence mode="wait">
        {showMyMatches || selectedFilter ? (
          <motion.div
            key={showMyMatches ? "my-matches-view" : "filtered-matches-view"}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Tabs - Only shown for My Matches */}
            {showMyMatches && (
              <div className="flex bg-[#1a1a1a]/60 backdrop-blur-sm p-1 rounded-xl border border-gray-800">
                {(['upcoming', 'ongoing', 'completed'] as MatchStatus[]).map((status) => {
                  const getTabColor = () => {
                    if (activeTab !== status) return 'text-gray-500 hover:text-gray-300';
                    switch(status) {
                      case 'upcoming': return 'bg-green-600 text-white shadow-md';
                      case 'ongoing': return 'bg-blue-600 text-white shadow-md';
                      case 'completed': return 'bg-purple-600 text-white shadow-md';
                      default: return 'bg-red-600 text-white shadow-md';
                    }
                  };
                  return (
                    <button
                      key={status}
                      onClick={() => setActiveTab(status)}
                      className={`flex-1 py-2.5 rounded-lg text-sm font-bold capitalize transition-all ${getTabColor()}`}
                    >
                      {status}
                    </button>
                  );
                })}
              </div>
            )}

            <div className="space-y-4 px-2">
              {filteredMatches.length > 0 ? (
                filteredMatches.map((match) => (
                  <MatchCard 
                    key={match.id} 
                    match={match} 
                    user={user} 
                    onJoin={() => handleJoinClick(match)} 
                    onEdit={() => {
                      const player = match.joinedPlayers?.find(p => p.userId === user?.uid);
                      if (player) {
                        setIgn(player.ign);
                        setGameUid(player.gameUid);
                        setEditingJoinedMatch(match);
                      }
                    }}
                  />
                ))
              ) : (
                <EmptyState message={showMyMatches ? `No ${activeTab} matches joined yet` : `No ${selectedFilter?.gameMode} matches found in ${selectedFilter?.category}`} />
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="all-matches-view"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Game Modes Grid */}
            <div className="space-y-6">
              {/* Survival Section */}
              <div className="grid grid-cols-3 gap-3 px-1">
                {[
                  { name: 'Solo', color: 'sepia(1) saturate(5) hue-rotate(-30deg)' },
                  { name: 'Duo', color: 'hue-rotate(180deg)' },
                  { name: 'Squad', color: 'hue-rotate(90deg)' },
                ].map((mode, i) => (
                  <motion.div
                    key={i}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedFilter({ category: 'Full map', subCategory: 'Survival', gameMode: mode.name })}
                    className="relative aspect-square rounded-xl overflow-hidden border border-gray-800 bg-[#1a1a1a] group cursor-pointer"
                  >
                    <img 
                      src={appSettings?.homeBoxImageUrl || "https://storage.googleapis.com/test-api-446285554400-static-content/245802f0-7546-474d-9fde-0c460193e62a.png"}
                      className="w-full h-full object-cover transition-opacity"
                      alt={mode.name}
                      referrerPolicy="no-referrer"
                    />
                    
                    {/* Match Count Indicator */}
                    <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/10">
                      <div className={`w-1.5 h-1.5 rounded-full ${getMatchCount('Full map', 'Survival', mode.name) > 0 ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`}></div>
                      <span className="text-[8px] font-bold text-white">{getMatchCount('Full map', 'Survival', mode.name)}</span>
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 bg-black py-1.5 text-center">
                      <span className="text-[8px] font-black uppercase tracking-tighter leading-none block px-1">{mode.name}</span>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Per Kill Section */}
              <div className="px-2 space-y-4">
                <p className="text-xs font-black text-red-500 uppercase tracking-[0.2em] pl-3">Per kill</p>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { name: 'Solo', color: 'hue-rotate(-60deg)' },
                    { name: 'Duo', color: 'hue-rotate(240deg)' },
                    { name: 'Squad', color: 'grayscale(1)' },
                  ].map((mode, i) => (
                    <motion.div
                      key={i}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedFilter({ category: 'Full map', subCategory: 'Per kill', gameMode: mode.name })}
                      className="relative aspect-square rounded-xl overflow-hidden border border-gray-800 bg-[#1a1a1a] group cursor-pointer"
                    >
                      <img 
                        src={appSettings?.homeBoxImageUrl || "https://storage.googleapis.com/test-api-446285554400-static-content/245802f0-7546-474d-9fde-0c460193e62a.png"}
                        className="w-full h-full object-cover transition-opacity"
                        alt={mode.name}
                        referrerPolicy="no-referrer"
                      />

                      {/* Match Count Indicator */}
                      <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/10">
                        <div className={`w-1.5 h-1.5 rounded-full ${getMatchCount('Full map', 'Per kill', mode.name) > 0 ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`}></div>
                        <span className="text-[8px] font-bold text-white">{getMatchCount('Full map', 'Per kill', mode.name)}</span>
                      </div>

                      <div className="absolute bottom-0 left-0 right-0 bg-black py-1.5 text-center">
                        <span className="text-[8px] font-black uppercase tracking-tighter leading-none block px-1">{mode.name}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Rush Hour Section */}
              <div className="space-y-4">
                <div className="px-2 space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-6 bg-red-600 rounded-full"></div>
                    <h3 className="text-xl font-bold tracking-tight uppercase">Rush Hour</h3>
                  </div>
                  <p className="text-xs font-black text-red-500 uppercase tracking-[0.2em] pl-3">Survival</p>
                </div>
                <div className="grid grid-cols-3 gap-3 px-1">
                  {[
                    { name: 'Solo', color: 'hue-rotate(300deg)' },
                    { name: 'Duo', color: 'brightness(1.5) grayscale(0.5)' },
                    { name: 'Squad', color: 'hue-rotate(120deg)' },
                  ].map((mode, i) => (
                    <motion.div
                      key={i}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedFilter({ category: 'Rush Hour', subCategory: 'Survival', gameMode: mode.name })}
                      className="relative aspect-square rounded-xl overflow-hidden border border-gray-800 bg-[#1a1a1a] group cursor-pointer"
                    >
                      <img 
                        src={appSettings?.homeBoxImageUrl || "https://storage.googleapis.com/test-api-446285554400-static-content/245802f0-7546-474d-9fde-0c460193e62a.png"}
                        className="w-full h-full object-cover transition-opacity"
                        alt={mode.name}
                        referrerPolicy="no-referrer"
                      />

                      {/* Match Count Indicator */}
                      <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/10">
                        <div className={`w-1.5 h-1.5 rounded-full ${getMatchCount('Rush Hour', 'Survival', mode.name) > 0 ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`}></div>
                        <span className="text-[8px] font-bold text-white">{getMatchCount('Rush Hour', 'Survival', mode.name)}</span>
                      </div>

                      <div className="absolute bottom-0 left-0 right-0 bg-black py-1.5 text-center">
                        <span className="text-[8px] font-black uppercase tracking-tighter leading-none block px-1">{mode.name}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Rush Hour Per Kill Section */}
                <div className="px-2 space-y-4">
                  <p className="text-xs font-black text-red-500 uppercase tracking-[0.2em] pl-3">Per kill</p>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { name: 'Solo', color: 'hue-rotate(60deg)' },
                      { name: 'Duo', color: 'hue-rotate(180deg)' },
                      { name: 'Squad', color: 'hue-rotate(240deg)' },
                    ].map((mode, i) => (
                      <motion.div
                        key={i}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setSelectedFilter({ category: 'Rush Hour', subCategory: 'Per kill', gameMode: mode.name })}
                        className="relative aspect-square rounded-xl overflow-hidden border border-gray-800 bg-[#1a1a1a] group cursor-pointer"
                      >
                        <img 
                          src={appSettings?.homeBoxImageUrl || "https://storage.googleapis.com/test-api-446285554400-static-content/245802f0-7546-474d-9fde-0c460193e62a.png"}
                          className="w-full h-full object-cover transition-opacity"
                          alt={mode.name}
                          referrerPolicy="no-referrer"
                        />

                        {/* Match Count Indicator */}
                        <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/10">
                          <div className={`w-1.5 h-1.5 rounded-full ${getMatchCount('Rush Hour', 'Per kill', mode.name) > 0 ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`}></div>
                          <span className="text-[8px] font-bold text-white">{getMatchCount('Rush Hour', 'Per kill', mode.name)}</span>
                        </div>

                        <div className="absolute bottom-0 left-0 right-0 bg-black py-1.5 text-center">
                          <span className="text-[8px] font-black uppercase tracking-tighter leading-none block px-1">{mode.name}</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Clash Squad Section */}
              <div className="space-y-4">
                <div className="px-2 space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-6 bg-red-600 rounded-full"></div>
                    <h3 className="text-xl font-bold tracking-tight uppercase">Clash Squad</h3>
                  </div>
                  <p className="text-xs font-black text-red-500 uppercase tracking-[0.2em] pl-3">Normal</p>
                </div>
                <div className="grid grid-cols-3 gap-3 px-1">
                  {[
                    { name: 'Solo', color: 'hue-rotate(45deg)' },
                    { name: 'Duo', color: 'hue-rotate(135deg)' },
                    { name: 'Squad', color: 'hue-rotate(225deg)' },
                  ].map((mode, i) => (
                    <motion.div
                      key={i}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedFilter({ category: 'Clash Squad', subCategory: 'Normal', gameMode: mode.name })}
                      className="relative aspect-square rounded-xl overflow-hidden border border-gray-800 bg-[#1a1a1a] group cursor-pointer"
                    >
                      <img 
                        src={appSettings?.homeBoxImageUrl || "https://storage.googleapis.com/test-api-446285554400-static-content/245802f0-7546-474d-9fde-0c460193e62a.png"}
                        className="w-full h-full object-cover transition-opacity"
                        alt={mode.name}
                        referrerPolicy="no-referrer"
                      />

                      {/* Match Count Indicator */}
                      <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/10">
                        <div className={`w-1.5 h-1.5 rounded-full ${getMatchCount('Clash Squad', 'Normal', mode.name) > 0 ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`}></div>
                        <span className="text-[8px] font-bold text-white">{getMatchCount('Clash Squad', 'Normal', mode.name)}</span>
                      </div>

                      <div className="absolute bottom-0 left-0 right-0 bg-black py-1.5 text-center">
                        <span className="text-[8px] font-black uppercase tracking-tighter leading-none block px-1">{mode.name}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Clash Squad First Loss Section */}
                <div className="px-2 space-y-4">
                  <p className="text-xs font-black text-red-500 uppercase tracking-[0.2em] pl-3">First loss to win</p>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { name: 'Solo', color: 'hue-rotate(15deg)' },
                      { name: 'Duo', color: 'hue-rotate(105deg)' },
                      { name: 'Squad', color: 'hue-rotate(195deg)' },
                    ].map((mode, i) => (
                      <motion.div
                        key={i}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setSelectedFilter({ category: 'Clash Squad', subCategory: 'First loss to win', gameMode: mode.name })}
                        className="relative aspect-square rounded-xl overflow-hidden border border-gray-800 bg-[#1a1a1a] group cursor-pointer"
                      >
                        <img 
                          src={appSettings?.homeBoxImageUrl || "https://storage.googleapis.com/test-api-446285554400-static-content/245802f0-7546-474d-9fde-0c460193e62a.png"}
                          className="w-full h-full object-cover transition-opacity"
                          alt={mode.name}
                          referrerPolicy="no-referrer"
                        />

                        {/* Match Count Indicator */}
                        <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/10">
                          <div className={`w-1.5 h-1.5 rounded-full ${getMatchCount('Clash Squad', 'First loss to win', mode.name) > 0 ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`}></div>
                          <span className="text-[8px] font-bold text-white">{getMatchCount('Clash Squad', 'First loss to win', mode.name)}</span>
                        </div>

                        <div className="absolute bottom-0 left-0 right-0 bg-black py-1.5 text-center">
                          <span className="text-[8px] font-black uppercase tracking-tighter leading-none block px-1">{mode.name}</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Lone Wolf Section */}
              <div className="space-y-4">
                <div className="px-2 space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-6 bg-red-600 rounded-full"></div>
                    <h3 className="text-xl font-bold tracking-tight uppercase">Lone Wolf</h3>
                  </div>
                  <p className="text-xs font-black text-red-500 uppercase tracking-[0.2em] pl-3">Normal</p>
                </div>
                <div className="grid grid-cols-3 gap-3 px-1">
                  {[
                    { name: 'Solo', color: 'hue-rotate(75deg)' },
                    { name: 'Duo', color: 'hue-rotate(165deg)' },
                  ].map((mode, i) => (
                    <motion.div
                      key={i}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedFilter({ category: 'Lone Wolf', subCategory: 'Normal', gameMode: mode.name })}
                      className="relative aspect-square rounded-xl overflow-hidden border border-gray-800 bg-[#1a1a1a] group cursor-pointer"
                    >
                      <img 
                        src={appSettings?.homeBoxImageUrl || "https://storage.googleapis.com/test-api-446285554400-static-content/245802f0-7546-474d-9fde-0c460193e62a.png"}
                        className="w-full h-full object-cover transition-opacity"
                        alt={mode.name}
                        referrerPolicy="no-referrer"
                      />

                      {/* Match Count Indicator */}
                      <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/10">
                        <div className={`w-1.5 h-1.5 rounded-full ${getMatchCount('Lone Wolf', 'Normal', mode.name) > 0 ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`}></div>
                        <span className="text-[8px] font-bold text-white">{getMatchCount('Lone Wolf', 'Normal', mode.name)}</span>
                      </div>

                      <div className="absolute bottom-0 left-0 right-0 bg-black py-1.5 text-center">
                        <span className="text-[8px] font-black uppercase tracking-tighter leading-none block px-1">{mode.name}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Lone Wolf First Loss Section */}
                <div className="px-2 space-y-4">
                  <p className="text-xs font-black text-red-500 uppercase tracking-[0.2em] pl-3">First loss to win</p>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { name: 'Solo', color: 'hue-rotate(255deg)' },
                      { name: 'Duo', color: 'hue-rotate(345deg)' },
                    ].map((mode, i) => (
                      <motion.div
                        key={i}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setSelectedFilter({ category: 'Lone Wolf', subCategory: 'First loss to win', gameMode: mode.name })}
                        className="relative aspect-square rounded-xl overflow-hidden border border-gray-800 bg-[#1a1a1a] group cursor-pointer"
                      >
                        <img 
                          src={appSettings?.homeBoxImageUrl || "https://storage.googleapis.com/test-api-446285554400-static-content/245802f0-7546-474d-9fde-0c460193e62a.png"}
                          className="w-full h-full object-cover transition-opacity"
                          alt={mode.name}
                          referrerPolicy="no-referrer"
                        />

                        {/* Match Count Indicator */}
                        <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/10">
                          <div className={`w-1.5 h-1.5 rounded-full ${getMatchCount('Lone Wolf', 'First loss to win', mode.name) > 0 ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`}></div>
                          <span className="text-[8px] font-bold text-white">{getMatchCount('Lone Wolf', 'First loss to win', mode.name)}</span>
                        </div>

                        <div className="absolute bottom-0 left-0 right-0 bg-black py-1.5 text-center">
                          <span className="text-[8px] font-black uppercase tracking-tighter leading-none block px-1">{mode.name}</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Weekly free matches Section */}
              <div className="space-y-4">
                <div className="px-2 space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-6 bg-red-600 rounded-full"></div>
                    <h3 className="text-xl font-bold tracking-tight uppercase">Weekly free matches</h3>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 px-1">
                  {[
                    { name: 'Solo', color: 'hue-rotate(30deg) saturate(2)' },
                  ].map((mode, i) => (
                    <motion.div
                      key={i}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedFilter({ category: 'Weekly free matches', subCategory: 'Normal', gameMode: mode.name })}
                      className="relative aspect-square rounded-xl overflow-hidden border border-gray-800 bg-[#1a1a1a] group cursor-pointer"
                    >
                      <img 
                        src={appSettings?.homeBoxImageUrl || "https://storage.googleapis.com/test-api-446285554400-static-content/245802f0-7546-474d-9fde-0c460193e62a.png"}
                        className="w-full h-full object-cover transition-opacity"
                        alt={mode.name}
                        referrerPolicy="no-referrer"
                      />

                      {/* Match Count Indicator */}
                      <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/10">
                        <div className={`w-1.5 h-1.5 rounded-full ${getMatchCount('Weekly free matches', 'Normal', mode.name) > 0 ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`}></div>
                        <span className="text-[8px] font-bold text-white">{getMatchCount('Weekly free matches', 'Normal', mode.name)}</span>
                      </div>

                      <div className="absolute bottom-0 left-0 right-0 bg-black py-1.5 text-center">
                        <span className="text-[8px] font-black uppercase tracking-tighter leading-none block px-1">{mode.name}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );

  const handleShare = async () => {
    const referralCode = user?.uid.slice(0, 8).toUpperCase() || 'AUESPORT';
    const shareData = {
      title: 'AU Esport',
      text: `Join AU Esport and earn rewards! Use my referral code: ${referralCode}`,
      url: window.location.origin
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
        alert('Referral link copied to clipboard!');
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  const handleWithdraw = async () => {
    if (!user || !withdrawAmount || !withdrawDetails) return;
    const amount = parseInt(withdrawAmount);
    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid amount');
      return;
    }
    if (amount > (userProfile?.walletBalance || 0)) {
      alert('Insufficient balance');
      return;
    }

    setIsWithdrawing(true);
    try {
      await firestoreService.createWithdrawalRequest(user.uid, amount, withdrawMethod, withdrawDetails);
      alert('Withdrawal request submitted successfully!');
      setWithdrawAmount('');
      setWithdrawDetails('');
      setCurrentView('wallet');
    } catch (error: any) {
      alert(error.message || 'Failed to submit withdrawal request');
    } finally {
      setIsWithdrawing(false);
    }
  };

  const renderWithdraw = () => (
    <motion.main 
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      className="fixed inset-0 z-[200] bg-[#1a0b2e] flex flex-col"
    >
      {/* Header */}
      <div className="p-4 flex items-center gap-4 border-b border-white/5 bg-[#1a0b2e]">
        <button onClick={() => setCurrentView('wallet')} className="p-1">
          <ArrowLeft className="w-6 h-6 text-white" />
        </button>
        <h2 className="text-xl font-bold text-white">Withdraw Coins</h2>
      </div>

      <div className="flex-1 p-8 space-y-12 flex flex-col items-center">
        <h3 className="text-xl font-bold text-white mt-8">Withdraw to {withdrawMethod === 'UPI' ? "UPI I'd" : withdrawMethod}</h3>

        <div className="w-full max-w-sm space-y-8">
          {/* Details Input */}
          <div className="relative">
            <input 
              type="text"
              value={withdrawDetails}
              onChange={e => setWithdrawDetails(e.target.value)}
              placeholder={withdrawMethod === 'UPI' ? "UPI Id" : withdrawMethod === 'Redeem Code' ? "Email for Code" : "FamApp Number"}
              className="w-full bg-transparent border-b border-gray-600 py-2 text-white outline-none focus:border-purple-500 transition-colors placeholder:text-gray-500"
            />
          </div>

          {/* Amount Input */}
          <div className="relative flex items-center gap-2 border-b border-gray-600 py-2">
            <div className="w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center">
              <span className="text-[10px] font-black text-black">₹</span>
            </div>
            <input 
              type="number"
              value={withdrawAmount}
              onChange={e => setWithdrawAmount(e.target.value)}
              placeholder="Amount"
              className="w-full bg-transparent text-white outline-none focus:border-purple-500 transition-colors placeholder:text-gray-500"
            />
          </div>

          {/* Method Selection */}
          <div className="space-y-4">
            <p className="text-white font-bold">Withdraw to</p>
            <div className="space-y-3">
              {[
                { id: 'UPI', label: "UPI I'd" },
                { id: 'Redeem Code', label: 'Redeem Code' },
                { id: 'FamApp', label: 'FamApp' }
              ].map((method) => (
                <label key={method.id} className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative flex items-center justify-center">
                    <input 
                      type="radio"
                      name="withdrawMethod"
                      checked={withdrawMethod === method.id}
                      onChange={() => setWithdrawMethod(method.id as any)}
                      className="sr-only"
                    />
                    <div className={`w-6 h-6 rounded-full border-2 transition-all ${withdrawMethod === method.id ? 'border-[#2dd4bf]' : 'border-gray-600'}`}>
                      {withdrawMethod === method.id && (
                        <div className="absolute inset-1.5 bg-[#2dd4bf] rounded-full" />
                      )}
                    </div>
                  </div>
                  <span className={`font-bold transition-colors ${withdrawMethod === method.id ? 'text-white' : 'text-gray-400'}`}>
                    {method.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <button 
            onClick={handleWithdraw}
            disabled={isWithdrawing || !withdrawAmount || !withdrawDetails}
            className="w-full bg-[#2dd4bf] hover:bg-[#2dd4bf]/90 text-black font-black py-4 rounded-xl transition-all shadow-lg shadow-cyan-500/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest mt-8"
          >
            {isWithdrawing ? 'Processing...' : 'WITHDRAW COINS'}
          </button>

          <p className="text-center text-sm text-gray-400 font-bold mt-12">
            You can only withdraw win Coins.
          </p>
        </div>
      </div>
    </motion.main>
  );

  const renderWallet = () => (
    <motion.main 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto p-4 space-y-6 pb-32"
    >
      <div className="bg-[#1a0b2e] border border-white/5 rounded-[2rem] p-8 shadow-2xl relative overflow-hidden">
        <div className="space-y-8">
          {/* Total Balance Row */}
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <p className="text-gray-400 text-sm font-bold uppercase tracking-wider">Total Balance</p>
              <h2 className="text-4xl font-black text-white">
                {(userProfile?.walletBalance || 0).toFixed(2)}
              </h2>
            </div>
            <button 
              onClick={() => setCurrentView('transactions')}
              className="bg-white/5 hover:bg-white/10 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-all border border-white/5"
            >
              <History className="w-4 h-4" />
              <span className="text-sm font-bold">Transactions</span>
            </button>
          </div>

          <div className="h-[1px] bg-white/10 w-full" />

          {/* Deposited Row */}
          <div className="flex justify-between items-center">
            <div className="space-y-1">
              <p className="text-gray-400 text-sm font-bold uppercase tracking-wider">Deposited</p>
              <h3 className="text-3xl font-black text-white">
                {(userProfile?.depositedBalance || 0).toFixed(2)}
              </h3>
            </div>
            <button 
              onClick={() => setShowQR(true)}
              className="bg-[#2dd4bf] hover:bg-[#2dd4bf]/90 text-black font-black px-6 py-3 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-cyan-500/20"
            >
              <PlusCircle className="w-5 h-5" />
              Add Coins
            </button>
          </div>

          <div className="h-[1px] bg-white/10 w-full" />

          {/* Winning Row */}
          <div className="flex justify-between items-center">
            <div className="space-y-1">
              <p className="text-gray-400 text-sm font-bold uppercase tracking-wider">Winning</p>
              <h3 className="text-3xl font-black text-white">
                {(userProfile?.winningBalance || 0).toFixed(2)}
              </h3>
            </div>
            <button 
              onClick={() => setCurrentView('withdraw')}
              className="bg-[#2dd4bf] hover:bg-[#2dd4bf]/90 text-black font-black px-6 py-3 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-cyan-500/20"
            >
              <Wallet className="w-5 h-5" />
              Withdraw
            </button>
          </div>

          <div className="h-[1px] bg-white/10 w-full" />

          {/* Earnings Row */}
          <div className="space-y-1">
            <p className="text-gray-400 text-sm font-bold uppercase tracking-wider">Earnings</p>
            <h3 className="text-3xl font-black text-white">
              {userProfile?.totalEarnings || 0}
            </h3>
          </div>

          <div className="h-[1px] bg-white/10 w-full" />

          {/* Payouts Row */}
          <div className="space-y-1">
            <p className="text-gray-400 text-sm font-bold uppercase tracking-wider">Payouts</p>
            <h3 className="text-3xl font-black text-white">
              {userProfile?.totalPayouts || 0}
            </h3>
          </div>

          {/* Footer Text */}
          <div className="pt-4 text-center space-y-2">
            <p className="text-xs text-gray-400 font-bold">Only winnings can be redeemed.</p>
            <p className="text-sm text-[#2dd4bf] font-black uppercase tracking-tight">
              Fast Withdrawals, Processed Within 24 Hours!
            </p>
          </div>
        </div>
      </div>
    </motion.main>
  );

  const renderTransactions = () => (
    <motion.main 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="max-w-2xl mx-auto p-4 space-y-6 pb-32"
    >
      <div className="flex items-center gap-4 mb-2">
        <button onClick={() => setCurrentView('wallet')} className="p-2 hover:bg-white/5 rounded-full transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h2 className="text-2xl font-black uppercase tracking-tight">Transaction History</h2>
      </div>

      <div className="space-y-4">
        {transactions.length === 0 ? (
          <div className="text-center py-20 bg-[#1a1a1a]/40 rounded-[2rem] border border-white/5">
            <History className="w-16 h-16 text-gray-700 mx-auto mb-4" />
            <p className="text-gray-500 font-bold">No transactions found</p>
          </div>
        ) : (
          transactions.map((tx) => (
            <div key={tx.id} className="bg-[#1a1a1a]/60 backdrop-blur-sm border border-white/5 p-4 rounded-2xl flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  tx.type === 'deposit' || tx.type === 'match_win' || tx.type === 'referral' 
                    ? 'bg-green-500/10 text-green-500' 
                    : 'bg-red-500/10 text-red-500'
                }`}>
                  {tx.type === 'deposit' || tx.type === 'match_win' || tx.type === 'referral' 
                    ? <ArrowDownLeft className="w-6 h-6" /> 
                    : <ArrowUpRight className="w-6 h-6" />
                  }
                </div>
                <div>
                  <h3 className="font-bold text-sm">{tx.description}</h3>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                    {tx.createdAt?.seconds ? new Date(tx.createdAt.seconds * 1000).toLocaleString() : 'Recent'}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className={`font-black ${
                  tx.type === 'deposit' || tx.type === 'match_win' || tx.type === 'referral' 
                    ? 'text-green-500' 
                    : 'text-red-500'
                }`}>
                  {tx.type === 'deposit' || tx.type === 'match_win' || tx.type === 'referral' ? '+' : '-'} ₹{tx.amount}
                </p>
                <p className={`text-[8px] font-black uppercase tracking-widest ${
                  tx.status === 'completed' ? 'text-green-500/50' : tx.status === 'pending' ? 'text-yellow-500/50' : 'text-red-500/50'
                }`}>
                  {tx.status}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </motion.main>
  );

  const renderOffers = () => (
    <motion.main 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-2xl mx-auto p-4 space-y-6 pb-32"
    >
      <div className="text-center py-20">
        <Percent className="w-16 h-16 text-gray-700 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-500">No Offers Available</h2>
        <p className="text-gray-600">Check back later for exclusive tournament offers!</p>
      </div>
    </motion.main>
  );

  const renderMatches = () => (
    <motion.main 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto p-4 space-y-8 pb-32 flex flex-col items-center justify-center min-h-[70vh]"
    >
      <div className="w-32 h-32 bg-red-600/10 rounded-full flex items-center justify-center mb-6 border border-red-600/20">
        <Share2 className="w-16 h-16 text-red-500" />
      </div>
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-black">Refer & Earn</h2>
        <p className="text-green-500 font-bold text-xl">Per Referral ₹5 INR</p>
      </div>
      
      <div className="w-full max-w-sm bg-[#1a1a1a]/60 backdrop-blur-sm border border-gray-800 p-6 rounded-3xl space-y-6">
        <div className="space-y-2">
          <h3 className="text-red-500 font-black uppercase tracking-widest text-sm text-center">HOW TO GET REWARD</h3>
          <p className="text-gray-300 text-center text-sm">When your friend deposit your first ₹10INR you will get your reward.</p>
        </div>

        <div className="space-y-4 pt-4 border-t border-gray-800">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest text-center">Your Referral Code</p>
          <div className="bg-black/40 p-4 rounded-xl border border-gray-800 text-center font-mono text-2xl font-black text-red-500 tracking-widest">
            {user?.uid.slice(0, 8).toUpperCase() || 'AUESPORT'}
          </div>
          <button 
            onClick={handleShare}
            className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-red-500/20 flex items-center justify-center gap-2"
          >
            <Share2 className="w-5 h-5" />
            Share Now
          </button>
        </div>
      </div>
    </motion.main>
  );

  const renderRules = () => (
    <motion.main 
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      className="fixed inset-0 z-[200] bg-[#1a0b2e] flex flex-col"
    >
      <div className="p-4 flex items-center gap-4 border-b border-white/5 bg-[#1a0b2e]">
        <button onClick={() => setCurrentView('home')} className="p-1">
          <ArrowLeft className="w-6 h-6 text-white" />
        </button>
        <h2 className="text-xl font-bold text-white">Game Rules</h2>
      </div>

      <div className="flex-1 p-6 overflow-y-auto">
        <div className="bg-[#1a1a1a]/60 backdrop-blur-sm border border-gray-800 rounded-3xl p-6 prose prose-invert max-w-none">
          <div className="whitespace-pre-wrap text-gray-300 leading-relaxed">
            {appRules || 'Loading rules...'}
          </div>
        </div>
      </div>
    </motion.main>
  );

  const handleUpdateProfile = async () => {
    if (!user || !newDisplayName.trim()) return;
    setIsUpdatingProfile(true);
    try {
      await firestoreService.updateUserProfile(user.uid, {
        displayName: newDisplayName.trim()
      });
      setCurrentView('profile');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const renderEditProfile = () => (
    <motion.main 
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      className="fixed inset-0 z-[200] bg-[#0f051a] flex flex-col"
    >
      <div className="p-4 flex items-center gap-4 border-b border-white/5 bg-[#0f051a]">
        <button onClick={() => setCurrentView('profile')} className="p-1">
          <ArrowLeft className="w-6 h-6 text-white" />
        </button>
        <h2 className="text-xl font-bold text-white">Edit Profile</h2>
      </div>

      <div className="flex-1 p-6 space-y-8 overflow-y-auto">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-32 h-32 rounded-full border-4 border-red-600 p-1">
              <img 
                src={userProfile?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.uid}`} 
                alt="Profile" 
                className="w-full h-full rounded-full object-cover bg-gray-800"
                referrerPolicy="no-referrer"
              />
            </div>
            <button className="absolute bottom-0 right-0 p-2 bg-red-600 rounded-full border-4 border-[#0f051a] text-white shadow-lg">
              <Camera className="w-5 h-5" />
            </button>
          </div>
          <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Change Profile Photo</p>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Display Name</label>
            <input 
              type="text"
              value={newDisplayName}
              onChange={(e) => setNewDisplayName(e.target.value)}
              placeholder={userProfile?.displayName || "Enter your name"}
              className="w-full bg-[#1a1a1a] border border-gray-800 rounded-2xl p-4 text-white focus:border-red-500 outline-none transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Email Address</label>
            <input 
              type="text"
              value={userProfile?.email || ''}
              disabled
              className="w-full bg-[#1a1a1a]/40 border border-gray-800 rounded-2xl p-4 text-gray-500 cursor-not-allowed"
            />
            <p className="text-[10px] text-gray-600 ml-1">Email cannot be changed</p>
          </div>

          <button 
            onClick={handleUpdateProfile}
            disabled={isUpdatingProfile || !newDisplayName.trim() || newDisplayName === userProfile?.displayName}
            className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest transition-all transform active:scale-95 flex items-center justify-center gap-2 ${
              !newDisplayName.trim() || newDisplayName === userProfile?.displayName
              ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
              : 'bg-red-600 text-white shadow-lg shadow-red-500/20 hover:bg-red-500'
            }`}
          >
            {isUpdatingProfile ? (
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              'Save Changes'
            )}
          </button>
        </div>
      </div>
    </motion.main>
  );

  const renderMatchHistory = () => (
    <motion.main 
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      className="fixed inset-0 z-[200] bg-[#0f051a] flex flex-col"
    >
      <div className="p-4 flex items-center gap-4 border-b border-white/5 bg-[#0f051a]">
        <button onClick={() => setCurrentView('profile')} className="p-1">
          <ArrowLeft className="w-6 h-6 text-white" />
        </button>
        <h2 className="text-xl font-bold text-white">Match History</h2>
      </div>

      <div className="flex-1 p-4 overflow-y-auto space-y-6">
        <div className="flex bg-[#1a1a1a]/60 backdrop-blur-sm p-1 rounded-xl border border-gray-800">
          {(['upcoming', 'ongoing', 'completed'] as MatchStatus[]).map((status) => (
            <button
              key={status}
              onClick={() => setActiveTab(status)}
              className={`flex-1 py-2.5 rounded-lg text-sm font-bold capitalize transition-all ${
                activeTab === status 
                ? 'bg-red-600 text-white shadow-md' 
                : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {matches.filter(m => m.joinedUsers?.includes(user?.uid || '') && m.status === activeTab).length > 0 ? (
            matches.filter(m => m.joinedUsers?.includes(user?.uid || '') && m.status === activeTab).map((match) => (
              <MatchCard 
                key={match.id} 
                match={match} 
                user={user} 
                onJoin={() => handleJoinClick(match)} 
                onEdit={() => {
                  const player = match.joinedPlayers?.find(p => p.userId === user?.uid);
                  if (player) {
                    setIgn(player.ign);
                    setGameUid(player.gameUid);
                    setEditingJoinedMatch(match);
                  }
                }}
              />
            ))
          ) : (
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-gray-800/30 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-800">
                <History className="w-10 h-10 text-gray-700" />
              </div>
              <p className="text-gray-500 font-medium">No {activeTab} matches found</p>
            </div>
          )}
        </div>
      </div>
    </motion.main>
  );

  const renderSettings = () => (
    <motion.main 
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      className="fixed inset-0 z-[200] bg-[#0f051a] flex flex-col"
    >
      <div className="p-4 flex items-center gap-4 border-b border-white/5 bg-[#0f051a]">
        <button onClick={() => setCurrentView('profile')} className="p-1">
          <ArrowLeft className="w-6 h-6 text-white" />
        </button>
        <h2 className="text-xl font-bold text-white">Settings</h2>
      </div>

      <div className="flex-1 p-6 space-y-6 overflow-y-auto">
        <div className="space-y-4">
          <h3 className="text-xs font-black text-red-500 uppercase tracking-[0.2em] ml-1">Preferences</h3>
          <div className="bg-[#1a1a1a]/60 backdrop-blur-sm border border-gray-800 rounded-3xl overflow-hidden divide-y divide-gray-800">
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold">Notifications</p>
                  <p className="text-[10px] text-gray-500">Get match updates</p>
                </div>
              </div>
              <div className="w-12 h-6 bg-red-600 rounded-full relative p-1 cursor-pointer">
                <div className="w-4 h-4 bg-white rounded-full absolute right-1"></div>
              </div>
            </div>
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold">Privacy Mode</p>
                  <p className="text-[10px] text-gray-500">Hide profile from others</p>
                </div>
              </div>
              <div className="w-12 h-6 bg-gray-800 rounded-full relative p-1 cursor-pointer">
                <div className="w-4 h-4 bg-gray-600 rounded-full absolute left-1"></div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-xs font-black text-red-500 uppercase tracking-[0.2em] ml-1">Support & Info</h3>
          <div className="bg-[#1a1a1a]/60 backdrop-blur-sm border border-gray-800 rounded-3xl overflow-hidden divide-y divide-gray-800">
            <button className="w-full p-4 flex items-center justify-between group">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center text-green-500">
                  <Info className="w-5 h-5" />
                </div>
                <p className="font-bold">About AU Esport</p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-red-500 transition-colors" />
            </button>
            <button className="w-full p-4 flex items-center justify-between group">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center text-yellow-500">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <p className="font-bold">Terms & Conditions</p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-red-500 transition-colors" />
            </button>
          </div>
        </div>

        <div className="pt-8 text-center">
          <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">Version 1.0.4 (Build 2024)</p>
          <p className="text-[10px] text-gray-700 mt-1">© 2024 AU Esport. All rights reserved.</p>
        </div>
      </div>
    </motion.main>
  );

  const renderProfile = () => (
    <motion.main 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto p-4 space-y-6 pb-32"
    >
      <div className="flex flex-col items-center py-8">
        <div className="w-24 h-24 rounded-full border-4 border-red-600 p-1 mb-4">
          <img 
            src={userProfile?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.uid}`} 
            alt="Profile" 
            className="w-full h-full rounded-full object-cover bg-gray-800"
            referrerPolicy="no-referrer"
          />
        </div>
        <h2 className="text-2xl font-black">{userProfile?.displayName || 'Player'}</h2>
        <p className="text-gray-500 text-sm">{userProfile?.email}</p>
      </div>

      <div className="space-y-3">
        {[
          { icon: <UserIcon className="w-5 h-5" />, title: 'Edit Profile', onClick: () => {
            setNewDisplayName(userProfile?.displayName || '');
            setCurrentView('edit-profile');
          }},
          { icon: <History className="w-5 h-5" />, title: 'Match History', onClick: () => setCurrentView('match-history') },
          { icon: <Settings className="w-5 h-5" />, title: 'Settings', onClick: () => setCurrentView('settings') },
          { icon: <LogOut className="w-5 h-5" />, title: 'Logout', color: 'text-red-500', onClick: () => auth.signOut() },
        ].map((item, i) => (
          <button 
            key={i}
            onClick={item.onClick}
            className="w-full bg-[#1a1a1a]/60 backdrop-blur-sm border border-gray-800 p-4 rounded-2xl flex items-center justify-between group hover:border-red-500/30 transition-all"
          >
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-gray-800/50 ${item.color || 'text-gray-400'}`}>
                {item.icon}
              </div>
              <span className={`font-bold ${item.color || 'text-white'}`}>{item.title}</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-red-500 transition-colors" />
          </button>
        ))}
      </div>
    </motion.main>
  );

  return (
    <div className="min-h-screen text-white pb-20">
      {/* Header */}
      <header className="p-4 flex justify-between items-center bg-[#0f051a] sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div 
            onClick={() => setCurrentView('home')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-purple-700 rounded-xl flex items-center justify-center shadow-lg shadow-red-500/20 border border-white/10 overflow-hidden">
              <img 
                src={appSettings?.logoUrl || "https://storage.googleapis.com/test-api-446285554400-static-content/36979216-9283-4923-9133-c2f82607996c.png"} 
                alt="AU ESPORT Logo" 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tighter text-white leading-none">AU Esport</h1>
              <p className="text-[8px] font-bold text-red-500 uppercase tracking-widest mt-0.5">Ultimate Gaming</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {isAdmin && (
            <button 
              onClick={() => setShowAdmin(true)}
              className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white flex items-center gap-2"
              title="Admin Panel"
            >
              <Settings className="w-5 h-5" />
            </button>
          )}
          
          <a 
            href="https://t.me/Aeroesportssupport" 
            target="_blank" 
            rel="noopener noreferrer"
            className="p-2 text-purple-500 hover:bg-white/5 rounded-full transition-colors"
            title="Customer Support"
          >
            <Headset className="w-6 h-6" />
          </a>
          
          <button 
            onClick={() => setCurrentView('wallet')}
            className="flex items-center gap-3 bg-[#1a0b2e] border border-white/10 px-4 py-2 rounded-2xl text-white hover:bg-white/5 transition-all"
          >
            <Wallet className="w-5 h-5 text-white" />
            <span className="font-black text-lg">{(userProfile?.walletBalance || 0).toFixed(2)}</span>
            <div className="h-4 w-[1px] bg-white/20 mx-1" />
            <PlusCircle className="w-5 h-5 text-white" />
          </button>
        </div>
      </header>

      <AnimatePresence mode="wait">
        {currentView === 'home' && renderHome()}
        {currentView === 'wallet' && renderWallet()}
        {currentView === 'transactions' && renderTransactions()}
        {currentView === 'withdraw' && renderWithdraw()}
        {currentView === 'rules' && renderRules()}
        {currentView === 'offers' && renderOffers()}
        {currentView === 'matches' && renderMatches()}
        {currentView === 'profile' && renderProfile()}
        {currentView === 'edit-profile' && renderEditProfile()}
        {currentView === 'match-history' && renderMatchHistory()}
        {currentView === 'settings' && renderSettings()}
      </AnimatePresence>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#0f051a] border-t border-white/5 p-4 flex justify-around items-center z-50">
        {[
          { id: 'offers', icon: <Percent className="w-6 h-6" />, label: 'Offers' },
          { id: 'matches', icon: <Share2 className="w-6 h-6" />, label: 'Refer' },
          { id: 'home', icon: <Home className="w-6 h-6" />, label: 'Home' },
          { id: 'wallet', icon: <Wallet className="w-6 h-6" />, label: 'Wallet' },
          { id: 'profile', icon: <UserIcon className="w-6 h-6" />, label: 'Profile' },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setCurrentView(item.id as View)}
            className={`flex flex-col items-center gap-1 transition-all ${
              currentView === item.id ? 'text-[#2dd4bf] scale-110' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            {item.icon}
            <span className="text-[10px] font-bold uppercase tracking-widest">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* QR Code Modal */}
      <AnimatePresence>
        {showQR && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowQR(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#1a1a1a] border border-gray-800 p-8 rounded-3xl max-w-sm w-full text-center space-y-6"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold">Scan to Add Cash</h3>
                <button onClick={() => setShowQR(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="bg-white p-4 rounded-2xl aspect-square flex items-center justify-center">
                <img 
                  src={appSettings?.qrCodeUrl || "https://storage.googleapis.com/test-api-446285554400-static-content/762d6342-6e2a-4389-918c-c6f376829778.png"} 
                  alt="Payment QR Code"
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
              
              <div className="space-y-2">
                <p className="text-gray-400 text-sm">Scan this QR code using any UPI app (PhonePe, Google Pay, Paytm) to add cash to your wallet.</p>
                <p className="text-red-500 text-xs font-bold uppercase tracking-widest">Minimum amount: ₹10</p>
              </div>
              
              <button 
                onClick={() => setShowQR(false)}
                className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-4 rounded-xl transition-all"
              >
                Done
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Match Detail View */}
      <AnimatePresence>
        {selectedMatchForDetail && (
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[150] bg-black flex flex-col overflow-y-auto"
          >
            {/* Header */}
            <div className="p-4 flex items-center gap-4 border-b border-gray-800 bg-[#1a1a1a] sticky top-0 z-10">
              <button onClick={() => setSelectedMatchForDetail(null)} className="p-1">
                <X className="w-6 h-6" />
              </button>
              <h2 className="text-lg font-bold uppercase truncate">{selectedMatchForDetail.title}</h2>
            </div>

            {/* Banner */}
            <div className="relative aspect-video w-full">
              <img 
                src={appSettings?.matchBannerUrl || "https://storage.googleapis.com/test-api-446285554400-static-content/245802f0-7546-474d-9fde-0c460193e62a.png"} 
                alt="Match Banner"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-800 bg-[#1a1a1a]">
              <button 
                onClick={() => setDetailTab('description')}
                className={`flex-1 py-4 text-sm font-black uppercase tracking-widest transition-colors ${detailTab === 'description' ? 'text-red-500 border-b-2 border-red-500' : 'text-gray-500'}`}
              >
                Description
              </button>
              <button 
                onClick={() => setDetailTab('joined')}
                className={`flex-1 py-4 text-sm font-black uppercase tracking-widest transition-colors ${detailTab === 'joined' ? 'text-red-500 border-b-2 border-red-500' : 'text-gray-500'}`}
              >
                Joined Member
              </button>
            </div>

            <div className="p-4 space-y-6 pb-32">
              {detailTab === 'description' ? (
                <>
                  <div className="space-y-4">
                    <h3 className="text-red-500 font-black uppercase tracking-widest text-sm">
                      {selectedMatchForDetail.title} - Match {selectedMatchForDetail.matchId}
                    </h3>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-[#1a1a1a] border border-gray-800 p-3 rounded-xl flex justify-between items-center">
                        <span className="text-xs text-gray-400 font-bold uppercase">Team</span>
                        <span className="font-black text-sm">{selectedMatchForDetail.gameMode}</span>
                      </div>
                      <div className="bg-[#1a1a1a] border border-gray-800 p-3 rounded-xl flex justify-between items-center">
                        <span className="text-xs text-gray-400 font-bold uppercase">Entry Fee</span>
                        <span className="font-black text-sm text-yellow-500">₹{selectedMatchForDetail.entryFee}</span>
                      </div>
                      <div className="bg-[#1a1a1a] border border-gray-800 p-3 rounded-xl flex justify-between items-center">
                        <span className="text-xs text-gray-400 font-bold uppercase">Match Type</span>
                        <span className="font-black text-sm">{selectedMatchForDetail.entryFee > 0 ? 'PAID' : 'FREE'}</span>
                      </div>
                      <div className="bg-[#1a1a1a] border border-gray-800 p-3 rounded-xl flex justify-between items-center">
                        <span className="text-xs text-gray-400 font-bold uppercase">Map</span>
                        <span className="font-black text-sm uppercase">{selectedMatchForDetail.map || 'Bermuda'}</span>
                      </div>
                    </div>

                    <div className="bg-[#1a1a1a] border border-gray-800 p-3 rounded-xl flex justify-between items-center">
                      <span className="text-xs text-gray-400 font-bold uppercase">Match Schedule</span>
                      <span className="font-black text-sm">{selectedMatchForDetail.date} {selectedMatchForDetail.time}</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-red-500 font-black uppercase tracking-widest text-sm">Price Details</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-[#1a1a1a] border border-gray-800 p-3 rounded-xl flex justify-between items-center">
                        <span className="text-xs text-gray-400 font-bold uppercase">Winning Prize</span>
                        <span className="font-black text-sm">₹{selectedMatchForDetail.prizePool}</span>
                      </div>
                      <div className="bg-[#1a1a1a] border border-gray-800 p-3 rounded-xl flex justify-between items-center">
                        <span className="text-xs text-gray-400 font-bold uppercase">Per Kill</span>
                        <span className="font-black text-sm">₹{selectedMatchForDetail.perKillPrize || '0'}</span>
                      </div>
                    </div>
                  </div>

                  {selectedMatchForDetail.status === 'ongoing' && selectedMatchForDetail.joinedUsers?.includes(user?.uid || '') && (
                    <div className="space-y-4">
                      <h4 className="text-green-500 font-black uppercase tracking-widest text-sm flex items-center gap-2">
                        <PlayCircle className="w-4 h-4" /> Room Details
                      </h4>
                      <div className="bg-green-500/10 border border-green-500/30 p-4 rounded-xl grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <p className="text-[10px] font-bold text-gray-400 uppercase">Room ID</p>
                          <p className="text-lg font-black text-white tracking-widest">{selectedMatchForDetail.roomId || 'TBD'}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] font-bold text-gray-400 uppercase">Password</p>
                          <p className="text-lg font-black text-white tracking-widest">{selectedMatchForDetail.roomPassword || 'TBD'}</p>
                        </div>
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText(`${selectedMatchForDetail.roomId} / ${selectedMatchForDetail.roomPassword}`);
                            alert('Room details copied!');
                          }}
                          className="col-span-2 bg-green-500 hover:bg-green-400 text-black font-black py-2 rounded-lg text-xs uppercase tracking-widest transition-colors"
                        >
                          Copy Details
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="space-y-4">
                    <h4 className="text-red-500 font-black uppercase tracking-widest text-sm">About this Match</h4>
                    <div className="bg-[#1a1a1a] border border-gray-800 p-4 rounded-xl space-y-4">
                      <div className="text-center space-y-1">
                        <p className="font-black uppercase tracking-widest text-sm">{selectedMatchForDetail.gameMode} RULES</p>
                        <p className="text-xs text-gray-400">Must Follow Given Rules</p>
                      </div>
                      <div className="text-xs text-gray-400 leading-relaxed whitespace-pre-wrap">
                        {selectedMatchForDetail.rules || 'No specific rules provided for this match.'}
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="space-y-4">
                  <h4 className="text-red-500 font-black uppercase tracking-widest text-sm">Joined Members</h4>
                  <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl overflow-hidden">
                    <table className="w-full text-left">
                      <thead className="bg-black/40 border-b border-gray-800">
                        <tr>
                          <th className="p-3 text-[10px] font-black uppercase text-gray-500">Slot</th>
                          <th className="p-3 text-[10px] font-black uppercase text-gray-500">Player</th>
                          <th className="p-3 text-[10px] font-black uppercase text-gray-500">Team</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-800">
                        {selectedMatchForDetail.joinedPlayers?.map((player, idx) => (
                          <tr key={idx} className="hover:bg-white/5 transition-colors">
                            <td className="p-3 text-sm font-bold">{player.slot}</td>
                            <td className="p-3 text-sm font-bold text-red-500">{player.ign}</td>
                            <td className="p-3 text-sm text-gray-400">{player.team || '-'}</td>
                          </tr>
                        ))}
                        {(!selectedMatchForDetail.joinedPlayers || selectedMatchForDetail.joinedPlayers.length === 0) && (
                          <tr>
                            <td colSpan={3} className="p-8 text-center text-gray-500 text-sm italic">No players joined yet</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Join Button */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-[#1a1a1a] border-t border-gray-800">
              {selectedMatchForDetail.joinedUsers.includes(user?.uid || '') ? (
                <button 
                  disabled
                  className="w-full py-4 rounded-xl bg-green-600/20 text-green-500 font-black uppercase tracking-widest border border-green-500/20"
                >
                  ALREADY JOINED
                </button>
              ) : selectedMatchForDetail.joinedUsers.length >= (selectedMatchForDetail.maxPlayers || 48) ? (
                <button 
                  disabled
                  className="w-full py-4 rounded-xl bg-gray-800 text-gray-500 font-black uppercase tracking-widest"
                >
                  MATCH FULL
                </button>
              ) : (
                <button 
                  onClick={() => setJoiningMatch(selectedMatchForDetail)}
                  className="w-full py-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black uppercase tracking-widest shadow-lg shadow-red-500/20 transition-all active:scale-95"
                >
                  JOIN NOW
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Details Modal */}
      <AnimatePresence>
        {editingJoinedMatch && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingJoinedMatch(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-[#1a1a1a] border border-gray-800 rounded-3xl p-8 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold">Edit Details</h3>
                <button onClick={() => setEditingJoinedMatch(null)} className="p-2 hover:bg-white/10 rounded-full">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase">In-Game Name (IGN)</label>
                    <input 
                      value={ign} onChange={e => setIgn(e.target.value)}
                      className="w-full bg-[#2a2a2a] border border-gray-800 rounded-xl p-4 focus:border-red-500 outline-none transition-colors"
                      placeholder="Enter your game name"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase">Game UID</label>
                    <input 
                      value={gameUid} onChange={e => setGameUid(e.target.value)}
                      className="w-full bg-[#2a2a2a] border border-gray-800 rounded-xl p-4 focus:border-red-500 outline-none transition-colors"
                      placeholder="Enter your game UID"
                    />
                  </div>
                </div>

                <button 
                  onClick={handleUpdateDetails}
                  disabled={isJoining || !ign || !gameUid}
                  className={`w-full py-4 rounded-2xl font-bold text-lg shadow-lg transition-all transform active:scale-95 flex items-center justify-center gap-2 ${
                    !ign || !gameUid
                    ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-500 shadow-blue-500/20'
                  }`}
                >
                  {isJoining ? (
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    'UPDATE DETAILS'
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Join Match Modal with Slot Selection */}
      <AnimatePresence>
        {joiningMatch && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setJoiningMatch(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-[#0a0414] border border-white/5 rounded-3xl p-8 shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-center items-center mb-8 relative">
                <h3 className="text-xl font-bold text-white">Select Match Position</h3>
                <button 
                  onClick={() => setJoiningMatch(null)} 
                  className="absolute right-0 p-2 hover:bg-white/10 rounded-full"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex justify-between items-center">
                  <div>
                    <p className="text-xs text-gray-400 uppercase font-bold">Entry Fee</p>
                    <p className="text-xl font-black text-red-500">₹{joiningMatch.entryFee}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400 uppercase font-bold">Your Balance</p>
                    <p className="text-xl font-black text-green-500">₹{userProfile?.walletBalance || 0}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase">In-Game Name (IGN)</label>
                    <input 
                      value={ign} onChange={e => setIgn(e.target.value)}
                      className="w-full bg-[#2a2a2a] border border-gray-800 rounded-xl p-4 focus:border-red-500 outline-none transition-colors"
                      placeholder="Enter your game name"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase">Game UID</label>
                    <input 
                      value={gameUid} onChange={e => setGameUid(e.target.value)}
                      className="w-full bg-[#2a2a2a] border border-gray-800 rounded-xl p-4 focus:border-red-500 outline-none transition-colors"
                      placeholder="Enter your game UID"
                    />
                  </div>

                  <div className="space-y-4">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Select Match Position</label>
                    
                    <div className="bg-black/40 rounded-2xl border border-gray-800 overflow-hidden">
                      {joiningMatch.gameMode !== 'Solo' && (
                        <div className="grid grid-cols-5 bg-gray-800/50 p-3 border-b border-gray-800">
                          <div className="text-[10px] font-black text-gray-400 uppercase">Team</div>
                          <div className="text-[10px] font-black text-gray-400 uppercase text-center">A</div>
                          <div className="text-[10px] font-black text-gray-400 uppercase text-center">B</div>
                          {joiningMatch.gameMode === 'Squad' && (
                            <>
                              <div className="text-[10px] font-black text-gray-400 uppercase text-center">C</div>
                              <div className="text-[10px] font-black text-gray-400 uppercase text-center">D</div>
                            </>
                          )}
                        </div>
                      )}
                      
                      <div className="max-h-64 overflow-y-auto divide-y divide-gray-800/50">
                        {joiningMatch.gameMode === 'Solo' ? (
                          <div className="grid grid-cols-4 gap-4 p-4">
                            {Array.from({ length: joiningMatch.maxPlayers || 48 }, (_, idx) => {
                              const slot = idx + 1;
                              const isTaken = joiningMatch.joinedPlayers?.some(p => p.slot === slot);
                              return (
                                <div key={slot} className="flex flex-col items-center gap-1">
                                  <span className="text-[10px] font-bold text-gray-600">{slot}</span>
                                  <button
                                    disabled={isTaken}
                                    onClick={() => setSelectedSlot(slot)}
                                    className={`w-10 h-10 rounded-xl border-2 transition-all flex items-center justify-center ${
                                      isTaken 
                                      ? 'bg-gray-800 border-gray-700 cursor-not-allowed' 
                                      : selectedSlot === slot
                                      ? 'bg-[#ff6b00] border-[#ff6b00] shadow-lg shadow-[#ff6b00]/40'
                                      : 'bg-transparent border-[#ff6b00]/60 hover:border-[#ff6b00]'
                                    }`}
                                  >
                                    {selectedSlot === slot && <CheckCircle2 className="w-5 h-5 text-white" />}
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          Array.from({ length: (joiningMatch.maxPlayers || 48) / (joiningMatch.gameMode === 'Duo' ? 2 : 4) }, (_, teamIdx) => (
                            <div key={teamIdx} className={`grid ${joiningMatch.gameMode === 'Duo' ? 'grid-cols-3' : 'grid-cols-5'} items-center p-3 hover:bg-white/5 transition-colors`}>
                              <div className="text-xs font-bold text-gray-500">Team {teamIdx + 1}</div>
                              {Array.from({ length: joiningMatch.gameMode === 'Duo' ? 2 : 4 }, (_, posIdx) => {
                                const playersPerTeam = joiningMatch.gameMode === 'Duo' ? 2 : 4;
                                const slot = (teamIdx * playersPerTeam) + posIdx + 1;
                                const isTaken = joiningMatch.joinedPlayers?.some(p => p.slot === slot);
                                return (
                                  <div key={posIdx} className="flex flex-col items-center gap-1">
                                    <span className="text-[10px] font-bold text-gray-600">{slot}</span>
                                    <button
                                      disabled={isTaken}
                                      onClick={() => setSelectedSlot(slot)}
                                      className={`w-6 h-6 rounded border-2 transition-all flex items-center justify-center ${
                                        isTaken 
                                        ? 'bg-gray-800 border-gray-700 cursor-not-allowed' 
                                        : selectedSlot === slot
                                        ? 'bg-[#ff6b00] border-[#ff6b00] shadow-lg shadow-[#ff6b00]/40'
                                        : 'bg-transparent border-[#ff6b00]/60 hover:border-[#ff6b00]'
                                      }`}
                                    >
                                      {selectedSlot === slot && <CheckCircle2 className="w-4 h-4 text-white" />}
                                    </button>
                                  </div>
                                );
                              })}
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>

                  {joiningMatch.gameMode !== 'Solo' && (
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-500 uppercase">Team Name (Optional)</label>
                      <input 
                        value={selectedTeam} onChange={e => setSelectedTeam(e.target.value)}
                        className="w-full bg-[#2a2a2a] border border-gray-800 rounded-xl p-4 focus:border-red-500 outline-none transition-colors"
                        placeholder="Enter your team name"
                      />
                    </div>
                  )}
                </div>

                <button 
                  onClick={confirmJoin}
                  disabled={isJoining || !ign || !gameUid || selectedSlot === null || (userProfile?.walletBalance || 0) < joiningMatch.entryFee}
                  className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all transform active:scale-95 flex items-center justify-center gap-2 ${
                    (userProfile?.walletBalance || 0) < joiningMatch.entryFee || selectedSlot === null
                    ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                    : 'bg-[#6336d9] text-white hover:bg-[#7c4dff] shadow-[#6336d9]/20'
                  }`}
                >
                  {isJoining ? (
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    (userProfile?.walletBalance || 0) < joiningMatch.entryFee 
                    ? 'INSUFFICIENT BALANCE' 
                    : selectedSlot === null 
                    ? 'SELECT A POSITION' 
                    : 'JOIN NOW'
                  )}
                </button>
                
                <p className="text-center text-[10px] text-gray-500 uppercase font-bold tracking-widest">
                  Entry fee will be deducted from your wallet
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MatchCard({ match, user, onJoin, onEdit }: { match: Match, user: any, onJoin: () => void, onEdit?: () => void }) {
  const [showScoreboard, setShowScoreboard] = useState(false);
  const getStatusColor = () => {
    switch(match.status) {
      case 'upcoming': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'ongoing': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'completed': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      default: return 'bg-red-500/10 text-red-500 border-red-500/20';
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      onClick={onJoin}
      className="bg-[#1a1a1a]/60 backdrop-blur-sm border border-gray-800 rounded-2xl p-5 space-y-4 hover:border-red-500/30 transition-colors group cursor-pointer"
    >
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-bold group-hover:text-red-500 transition-colors">{match.title}</h3>
            <span className="text-[10px] font-black text-gray-500 bg-gray-800/50 px-2 py-0.5 rounded uppercase tracking-widest">
              {match.matchId || `#${match.id.slice(0, 5)}`}
            </span>
          </div>
          <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {match.date}
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {match.time}
            </div>
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor()}`}>
          {match.status.toUpperCase()}
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-800">
        <div className="flex flex-col">
          <span className="text-xs text-gray-500 uppercase font-bold tracking-wider">Prize Pool</span>
          <span className="text-xl font-black text-red-500">₹{match.prizePool}</span>
        </div>

        <div className="flex flex-col items-center">
          <span className="text-xs text-gray-500 uppercase font-bold tracking-wider">Entry Fee</span>
          <span className="text-lg font-black text-green-500">₹{match.entryFee}</span>
        </div>
        
        {match.status === 'upcoming' && (
          <div className="flex items-center gap-2">
            {match.joinedUsers?.includes(user?.uid || '') && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  // We'll need a way to trigger editing from here
                  // Since MatchCard doesn't have access to setEditingJoinedMatch directly,
                  // we should pass a prop or use a custom event.
                  // Actually, I can pass an onEdit prop.
                  onEdit?.();
                }}
                className="p-2.5 bg-blue-600/10 text-blue-500 rounded-xl hover:bg-blue-600 hover:text-white transition-all border border-blue-500/20"
                title="Edit Entry Details"
              >
                <Edit3 className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onJoin();
              }}
              disabled={match.joinedUsers?.includes(user?.uid || '')}
              className={`px-6 py-2.5 rounded-xl font-bold transition-all transform active:scale-95 ${
                match.joinedUsers?.includes(user?.uid || '')
                ? 'bg-green-500/20 text-green-500 cursor-default'
                : 'bg-green-600 text-white hover:bg-green-500 shadow-lg shadow-green-500/20'
              }`}
            >
              {match.joinedUsers?.includes(user?.uid || '') ? 'JOINED' : 'JOIN NOW'}
            </button>
          </div>
        )}

        {match.status === 'ongoing' && (
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setShowScoreboard(!showScoreboard);
            }}
            className="flex items-center gap-2 text-blue-500 font-bold hover:bg-blue-500/10 px-4 py-2 rounded-lg transition-all"
          >
            <ListOrdered className="w-5 h-5" />
            SCOREBOARD
          </button>
        )}

        {match.status === 'completed' && (
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setShowScoreboard(!showScoreboard);
            }}
            className="flex items-center gap-2 text-purple-500 font-bold hover:bg-purple-500/10 px-4 py-2 rounded-lg transition-all"
          >
            <ListOrdered className="w-5 h-5" />
            RESULTS
          </button>
        )}
      </div>

      <AnimatePresence>
        {showScoreboard && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="pt-4 border-t border-gray-800 space-y-3">
              <div className="flex items-center justify-between text-[10px] font-black text-gray-500 uppercase tracking-widest px-2">
                <div className="flex gap-8">
                  <span>Rank</span>
                  <span>Player</span>
                </div>
                <span>Kills</span>
              </div>
              <div className="space-y-2">
                {match.scoreboard && match.scoreboard.length > 0 ? (
                  match.scoreboard.sort((a, b) => a.rank - b.rank).map((entry, i) => (
                    <div key={i} className="flex items-center justify-between bg-black/20 p-3 rounded-xl border border-gray-800/50">
                      <div className="flex items-center gap-4">
                        <span className={`w-6 h-6 rounded flex items-center justify-center text-xs font-black ${
                          entry.rank === 1 ? 'bg-yellow-500 text-black' : 
                          entry.rank === 2 ? 'bg-gray-300 text-black' :
                          entry.rank === 3 ? 'bg-amber-600 text-black' :
                          'bg-gray-800 text-gray-400'
                        }`}>
                          {entry.rank}
                        </span>
                        <span className="font-bold text-sm">{entry.username}</span>
                      </div>
                      <span className="font-black text-red-500">{entry.kills}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-center py-4 text-xs text-gray-500 italic">Scoreboard is being updated...</p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="text-center py-20 bg-[#1a1a1a]/40 backdrop-blur-sm rounded-2xl border border-dashed border-gray-800"
    >
      <Timer className="w-12 h-12 text-gray-700 mx-auto mb-4" />
      <p className="text-gray-500 font-medium">{message}</p>
    </motion.div>
  );
}
