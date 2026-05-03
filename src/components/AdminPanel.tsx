import React, { useState, useEffect } from 'react';
import { firestoreService } from '../services/firestoreService';
import { Match, MatchStatus, UserProfile, ScoreboardEntry, WithdrawalRequest, Banner, AppSettings } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  Save, 
  X, 
  ArrowLeft,
  Trophy,
  Calendar,
  Clock,
  CheckCircle2,
  PlayCircle,
  Timer,
  ListOrdered,
  Users,
  Search,
  Wallet,
  Coins,
  UserPlus,
  Ban,
  ShieldAlert,
  ShieldCheck,
  Image as ImageIcon,
  Eye,
  EyeOff,
  Upload,
  Settings,
  Link as LinkIcon
} from 'lucide-react';

interface AdminPanelProps {
  onBack: () => void;
}

export default function AdminPanel({ onBack }: AdminPanelProps) {
  const [matches, setMatches] = useState<Match[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingScoreboardId, setEditingScoreboardId] = useState<string | null>(null);
  const [viewPlayersId, setViewPlayersId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deletingUserUid, setDeletingUserUid] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'tournaments' | 'users' | 'withdrawals' | 'rules' | 'banners' | 'settings'>('tournaments');
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [rulesContent, setRulesContent] = useState('');
  const [banners, setBanners] = useState<Banner[]>([]);
  const [appSettings, setAppSettings] = useState<AppSettings | null>(null);
  const [isUpdatingSettings, setIsUpdatingSettings] = useState(false);
  const [isAddingBanner, setIsAddingBanner] = useState(false);
  const [editingBannerId, setEditingBannerId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [updatingWalletUid, setUpdatingWalletUid] = useState<string | null>(null);
  const [walletAmount, setWalletAmount] = useState('');
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  
  // Scoreboard Form State
  const [scoreboardEntries, setScoreboardEntries] = useState<ScoreboardEntry[]>([]);
  const [newEntry, setNewEntry] = useState<Omit<ScoreboardEntry, 'userId'>>({ username: '', kills: 0, rank: 0 });
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [prizePool, setPrizePool] = useState('');
  const [entryFee, setEntryFee] = useState('');
  const [status, setStatus] = useState<MatchStatus>('upcoming');
  const [category, setCategory] = useState('Full map');
  const [subCategory, setSubCategory] = useState('Survival');
  const [gameMode, setGameMode] = useState('Solo');
  const [map, setMap] = useState('Bermuda');
  const [rules, setRules] = useState('');
  const [perKillPrize, setPerKillPrize] = useState('0');
  const [maxPlayers, setMaxPlayers] = useState('48');
  const [displayMatchId, setDisplayMatchId] = useState('');
  const [roomId, setRoomId] = useState('');
  const [roomPassword, setRoomPassword] = useState('');

  // Banner Form State
  const [bannerTitle, setBannerTitle] = useState('');
  const [bannerSubtitle, setBannerSubtitle] = useState('');
  const [bannerImageUrl, setBannerImageUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [bannerOrder, setBannerOrder] = useState('0');
  const [bannerIsActive, setBannerIsActive] = useState(true);

  const categories = ['Full map', 'Rush Hour', 'Clash Squad', 'Lone Wolf', 'Weekly free matches'];
  const subCategories: Record<string, string[]> = {
    'Full map': ['Survival', 'Per kill'],
    'Rush Hour': ['Survival', 'Per kill'],
    'Clash Squad': ['Normal', 'First loss to win'],
    'Lone Wolf': ['Normal', 'First loss to win'],
    'Weekly free matches': ['Normal']
  };
  const gameModes = ['Solo', 'Duo', 'Squad'];

  useEffect(() => {
    const unsubscribeMatches = firestoreService.subscribeToMatches(setMatches);
    const unsubscribeUsers = firestoreService.subscribeToUsers(setUsers);
    const unsubscribeWithdrawals = firestoreService.subscribeToWithdrawals(setWithdrawals);
    const unsubscribeRules = firestoreService.subscribeToRules(setRulesContent);
    const unsubscribeBanners = firestoreService.subscribeToBanners(setBanners);
    const unsubscribeSettings = firestoreService.subscribeToAppSettings(setAppSettings);
    return () => {
      unsubscribeMatches();
      unsubscribeUsers();
      unsubscribeWithdrawals();
      unsubscribeRules();
      unsubscribeBanners();
      unsubscribeSettings();
    };
  }, []);

  const resetForm = () => {
    setTitle('');
    setDate('');
    setTime('');
    setPrizePool('');
    setEntryFee('');
    setStatus('upcoming');
    setCategory('Full map');
    setSubCategory('Survival');
    setGameMode('Solo');
    setMap('Bermuda');
    setRules('');
    setPerKillPrize('0');
    setMaxPlayers('48');
    setDisplayMatchId('');
    setRoomId('');
    setRoomPassword('');
    setIsAdding(false);
    setEditingId(null);
    setEditingScoreboardId(null);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    await firestoreService.addMatch({
      title,
      date,
      time,
      prizePool,
      entryFee: parseInt(entryFee) || 0,
      status,
      category,
      subCategory,
      gameMode,
      map,
      rules,
      perKillPrize,
      maxPlayers: parseInt(maxPlayers) || 48,
      matchId: displayMatchId || `#${Math.floor(10000 + Math.random() * 90000)}`,
      roomId,
      roomPassword,
      joinedUsers: [],
      joinedPlayers: []
    });
    resetForm();
  };

  const handleUpdate = async (id: string) => {
    await firestoreService.updateMatch(id, {
      title,
      date,
      time,
      prizePool,
      entryFee: parseInt(entryFee) || 0,
      status,
      category,
      subCategory,
      gameMode,
      map,
      rules,
      perKillPrize,
      maxPlayers: parseInt(maxPlayers) || 48,
      matchId: displayMatchId,
      roomId,
      roomPassword
    });
    resetForm();
  };

  const startEdit = (match: Match) => {
    setEditingId(match.id);
    setTitle(match.title);
    setDate(match.date);
    setTime(match.time);
    setPrizePool(match.prizePool);
    setEntryFee(match.entryFee?.toString() || '0');
    setStatus(match.status);
    setCategory(match.category || 'Full map');
    setSubCategory(match.subCategory || 'Survival');
    setGameMode(match.gameMode || 'Solo');
    setMap(match.map || 'Bermuda');
    setRules(match.rules || '');
    setPerKillPrize(match.perKillPrize || '0');
    setMaxPlayers(match.maxPlayers?.toString() || '48');
    setDisplayMatchId(match.matchId || '');
    setRoomId(match.roomId || '');
    setRoomPassword(match.roomPassword || '');
    setIsAdding(false);
  };

  const startScoreboardEdit = (match: Match) => {
    setEditingScoreboardId(match.id);
    setScoreboardEntries(match.scoreboard || []);
    setIsAdding(false);
    setEditingId(null);
  };

  const addScoreboardEntry = () => {
    if (!newEntry.username) return;
    const entry: ScoreboardEntry = {
      ...newEntry,
      userId: Math.random().toString(36).substr(2, 9) // Mock userId for manually added entries
    };
    setScoreboardEntries([...scoreboardEntries, entry]);
    setNewEntry({ username: '', kills: 0, rank: 0 });
  };

  const removeScoreboardEntry = (index: number) => {
    setScoreboardEntries(scoreboardEntries.filter((_, i) => i !== index));
  };

  const saveScoreboard = async () => {
    if (!editingScoreboardId) return;
    await firestoreService.updateScoreboard(editingScoreboardId, scoreboardEntries);
    resetForm();
  };

  const handleDelete = async (id: string) => {
    await firestoreService.deleteMatch(id);
    setDeletingId(null);
  };

  const handleDeleteUser = async (uid: string) => {
    try {
      await firestoreService.deleteUser(uid);
      showFeedback('User account deleted successfully!');
      setDeletingUserUid(null);
    } catch (error) {
      showFeedback('Failed to delete user account', 'error');
    }
  };

  const showFeedback = (message: string, type: 'success' | 'error' = 'success') => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleUpdateWallet = async (uid: string, currentBalance: number, amount: string, type: 'add' | 'remove') => {
    const val = parseInt(amount) || 0;
    if (val <= 0) {
      showFeedback('Please enter a valid amount', 'error');
      return;
    }
    
    const balance = currentBalance || 0;
    const newBalance = type === 'add' ? balance + val : Math.max(0, balance - val);
    
    try {
      if (type === 'add') {
        await firestoreService.addBalance(uid, val);
      } else {
        await firestoreService.deductBalance(uid, val, 'Admin Adjustment');
      }
      showFeedback(`Successfully ${type === 'add' ? 'added' : 'removed'} ₹${val}.`);
      setUpdatingWalletUid(null);
      setWalletAmount('');
    } catch (error) {
      showFeedback('Failed to update balance', 'error');
      console.error('Failed to update balance:', error);
    }
  };

  const handleToggleBan = async (uid: string, currentStatus: boolean) => {
    const action = currentStatus ? 'unban' : 'ban';
    console.log(`Attempting to ${action} user: ${uid}`);
    
    try {
      await firestoreService.updateUserBanStatus(uid, !currentStatus);
      showFeedback(`User successfully ${currentStatus ? 'unbanned' : 'banned'}.`);
    } catch (error) {
      showFeedback('Failed to update ban status', 'error');
      console.error('Failed to update ban status:', error);
    }
  };

  const handleUpdateWithdrawal = async (id: string, status: 'completed' | 'rejected') => {
    await firestoreService.updateWithdrawalStatus(id, status);
  };

  const handleSaveRules = async () => {
    try {
      await firestoreService.updateRules(rulesContent);
      setFeedback({ message: 'Rules updated successfully!', type: 'success' });
      setTimeout(() => setFeedback(null), 3000);
    } catch (error) {
      setFeedback({ message: 'Failed to update rules', type: 'error' });
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 500 * 1024) {
      alert('Image size should be less than 500KB');
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      setBannerImageUrl(reader.result as string);
      setIsUploading(false);
    };
    reader.onerror = () => {
      alert('Failed to read file');
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveBanner = async () => {
    const bannerData = {
      title: bannerTitle,
      subtitle: bannerSubtitle,
      imageUrl: bannerImageUrl,
      order: parseInt(bannerOrder) || 0,
      isActive: bannerIsActive
    };

    try {
      if (editingBannerId) {
        await firestoreService.updateBanner(editingBannerId, bannerData);
        showFeedback('Banner updated successfully!');
      } else {
        await firestoreService.addBanner(bannerData);
        showFeedback('Banner added successfully!');
      }
      setIsAddingBanner(false);
      setEditingBannerId(null);
      setBannerTitle('');
      setBannerSubtitle('');
      setBannerImageUrl('');
      setBannerOrder('0');
      setBannerIsActive(true);
    } catch (error) {
      showFeedback('Failed to save banner', 'error');
    }
  };

  const handleDeleteBanner = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this banner?')) {
      try {
        await firestoreService.deleteBanner(id);
        showFeedback('Banner deleted successfully!');
      } catch (error) {
        showFeedback('Failed to delete banner', 'error');
      }
    }
  };

  const startEditingBanner = (banner: Banner) => {
    setEditingBannerId(banner.id);
    setBannerTitle(banner.title);
    setBannerSubtitle(banner.subtitle);
    setBannerImageUrl(banner.imageUrl);
    setBannerOrder(banner.order.toString());
    setBannerIsActive(banner.isActive);
    setIsAddingBanner(true);
  };

  const handleAppImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: keyof AppSettings) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1024 * 1024) {
      alert('Image size should be less than 1MB');
      return;
    }

    setIsUpdatingSettings(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      try {
        await firestoreService.updateAppSettings({ [field]: base64 });
        showFeedback('Image updated successfully!');
      } catch (error) {
        showFeedback('Failed to update image', 'error');
      } finally {
        setIsUpdatingSettings(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const renderSettings = () => (
    <div className="space-y-6">
      <div className="bg-[#1a1a1a]/80 backdrop-blur-md rounded-2xl border border-gray-800 p-6">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <Settings className="w-5 h-5 text-red-500" />
          App Image Management
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* App Logo */}
          <div className="space-y-3 p-4 bg-black/20 rounded-2xl border border-gray-800">
            <label className="text-sm font-bold text-gray-400 uppercase tracking-widest">App Logo</label>
            <div className="aspect-square w-32 mx-auto rounded-2xl overflow-hidden bg-white/5 border border-gray-800 flex items-center justify-center p-2">
              <img 
                src={appSettings?.logoUrl} 
                alt="App Logo" 
                className="max-w-full max-h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <input 
              type="file" 
              accept="image/*" 
              onChange={(e) => handleAppImageUpload(e, 'logoUrl')} 
              className="hidden" 
              id="logo-upload" 
            />
            <label 
              htmlFor="logo-upload"
              className="w-full flex items-center justify-center gap-2 py-3 bg-red-600 hover:bg-red-500 rounded-xl cursor-pointer font-bold transition-all text-sm"
            >
              <Upload className="w-4 h-4" />
              Change Logo
            </label>
          </div>

          {/* Payment QR */}
          <div className="space-y-3 p-4 bg-black/20 rounded-2xl border border-gray-800">
            <label className="text-sm font-bold text-gray-400 uppercase tracking-widest">Payment QR Code</label>
            <div className="aspect-square w-32 mx-auto rounded-2xl overflow-hidden bg-white border border-gray-800 flex items-center justify-center p-2">
              <img 
                src={appSettings?.qrCodeUrl} 
                alt="QR Code" 
                className="max-w-full max-h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <input 
              type="file" 
              accept="image/*" 
              onChange={(e) => handleAppImageUpload(e, 'qrCodeUrl')} 
              className="hidden" 
              id="qr-upload" 
            />
            <label 
              htmlFor="qr-upload"
              className="w-full flex items-center justify-center gap-2 py-3 bg-red-600 hover:bg-red-500 rounded-xl cursor-pointer font-bold transition-all text-sm"
            >
              <Upload className="w-4 h-4" />
              Change QR Code
            </label>
          </div>

          {/* Home Box Image */}
          <div className="space-y-3 p-4 bg-black/20 rounded-2xl border border-gray-800">
            <label className="text-sm font-bold text-gray-400 uppercase tracking-widest">Home Box Background</label>
            <div className="aspect-video w-full rounded-2xl overflow-hidden bg-white/5 border border-gray-800">
              <img 
                src={appSettings?.homeBoxImageUrl} 
                alt="Home Box" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <input 
              type="file" 
              accept="image/*" 
              onChange={(e) => handleAppImageUpload(e, 'homeBoxImageUrl')} 
              className="hidden" 
              id="homebox-upload" 
            />
            <label 
              htmlFor="homebox-upload"
              className="w-full flex items-center justify-center gap-2 py-3 bg-red-600 hover:bg-red-500 rounded-xl cursor-pointer font-bold transition-all text-sm"
            >
              <Upload className="w-4 h-4" />
              Change Box Image
            </label>
          </div>

          {/* Match Banner */}
          <div className="space-y-3 p-4 bg-black/20 rounded-2xl border border-gray-800">
            <label className="text-sm font-bold text-gray-400 uppercase tracking-widest">Match Details Banner</label>
            <div className="aspect-video w-full rounded-2xl overflow-hidden bg-white/5 border border-gray-800">
              <img 
                src={appSettings?.matchBannerUrl} 
                alt="Match Banner" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <input 
              type="file" 
              accept="image/*" 
              onChange={(e) => handleAppImageUpload(e, 'matchBannerUrl')} 
              className="hidden" 
              id="matchbanner-upload" 
            />
            <label 
              htmlFor="matchbanner-upload"
              className="w-full flex items-center justify-center gap-2 py-3 bg-red-600 hover:bg-red-500 rounded-xl cursor-pointer font-bold transition-all text-sm"
            >
              <Upload className="w-4 h-4" />
              Change Match Banner
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  const filteredUsers = users.filter(u => 
    u.displayName.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen text-white pb-20">
      <header className="p-4 flex items-center gap-4 border-b border-gray-800 bg-[#2e1065]/80 backdrop-blur-md sticky top-0 z-50">
        <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-full transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold">Admin Panel</h1>

        <AnimatePresence>
          {feedback && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              className={`absolute left-1/2 -translate-x-1/2 px-6 py-2 rounded-full text-sm font-bold shadow-2xl z-[60] border ${
                feedback.type === 'success' 
                  ? 'bg-green-600/90 border-green-400 text-white' 
                  : 'bg-red-600/90 border-red-400 text-white'
              }`}
            >
              {feedback.message}
            </motion.div>
          )}
        </AnimatePresence>
        
        <div className="flex bg-black/20 p-1 rounded-xl ml-auto">
          <button 
            onClick={() => setActiveTab('tournaments')}
            className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'tournaments' ? 'bg-red-600 text-white' : 'text-gray-400 hover:text-white'}`}
          >
            Tournaments
          </button>
          <button 
            onClick={() => setActiveTab('users')}
            className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'users' ? 'bg-red-600 text-white' : 'text-gray-400 hover:text-white'}`}
          >
            Users
          </button>
          <button 
            onClick={() => setActiveTab('withdrawals')}
            className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'withdrawals' ? 'bg-red-600 text-white' : 'text-gray-400 hover:text-white'}`}
          >
            Withdrawals
          </button>
          <button 
            onClick={() => setActiveTab('rules')}
            className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'rules' ? 'bg-red-600 text-white' : 'text-gray-400 hover:text-white'}`}
          >
            Rules
          </button>
          <button 
            onClick={() => setActiveTab('banners')}
            className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'banners' ? 'bg-red-600 text-white' : 'text-gray-400 hover:text-white'}`}
          >
            Banners
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'settings' ? 'bg-red-600 text-white' : 'text-gray-400 hover:text-white'}`}
          >
            App Settings
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 space-y-8">
        {activeTab === 'tournaments' ? (
          <>
            {/* Add Match Section */}
        <div className="bg-[#1a1a1a]/80 backdrop-blur-md rounded-2xl border border-gray-800 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Plus className="w-5 h-5 text-red-500" />
              {editingId ? 'Edit Match' : 'Add New Match'}
            </h2>
            {(isAdding || editingId) && (
              <button onClick={resetForm} className="text-gray-500 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            )}
          </div>

          {!isAdding && !editingId ? (
            <button 
              onClick={() => setIsAdding(true)}
              className="w-full py-4 border-2 border-dashed border-gray-800 rounded-xl text-gray-500 hover:text-red-500 hover:border-red-500/50 transition-all flex items-center justify-center gap-2 font-bold"
            >
              <Plus className="w-6 h-6" />
              Create New Tournament
            </button>
          ) : (
            <form onSubmit={editingId ? (e) => { e.preventDefault(); handleUpdate(editingId); } : handleAdd} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase">Match Title</label>
                <input 
                  value={title} onChange={e => setTitle(e.target.value)}
                  className="w-full bg-[#2a2a2a] border border-gray-800 rounded-xl p-3 focus:border-red-500 outline-none"
                  placeholder="e.g. Sunday Solo Showdown" required
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase">Prize Pool (₹)</label>
                <input 
                  value={prizePool} onChange={e => setPrizePool(e.target.value)}
                  className="w-full bg-[#2a2a2a] border border-gray-800 rounded-xl p-3 focus:border-red-500 outline-none"
                  placeholder="e.g. 5000" required
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase">Entry Fee (₹)</label>
                <input 
                  type="number"
                  value={entryFee} onChange={e => setEntryFee(e.target.value)}
                  className="w-full bg-[#2a2a2a] border border-gray-800 rounded-xl p-3 focus:border-red-500 outline-none"
                  placeholder="e.g. 50" required
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase">Date</label>
                <input 
                  type="date" value={date} onChange={e => setDate(e.target.value)}
                  className="w-full bg-[#2a2a2a] border border-gray-800 rounded-xl p-3 focus:border-red-500 outline-none"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase">Time</label>
                <input 
                  type="time" value={time} onChange={e => setTime(e.target.value)}
                  className="w-full bg-[#2a2a2a] border border-gray-800 rounded-xl p-3 focus:border-red-500 outline-none"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase">Category</label>
                <select 
                  value={category} onChange={e => {
                    setCategory(e.target.value);
                    setSubCategory(subCategories[e.target.value][0]);
                  }}
                  className="w-full bg-[#2a2a2a] border border-gray-800 rounded-xl p-3 focus:border-red-500 outline-none"
                >
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase">Sub Category</label>
                <select 
                  value={subCategory} onChange={e => setSubCategory(e.target.value)}
                  className="w-full bg-[#2a2a2a] border border-gray-800 rounded-xl p-3 focus:border-red-500 outline-none"
                >
                  {subCategories[category].map(sc => <option key={sc} value={sc}>{sc}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase">Game Mode</label>
                <select 
                  value={gameMode} onChange={e => setGameMode(e.target.value)}
                  className="w-full bg-[#2a2a2a] border border-gray-800 rounded-xl p-3 focus:border-red-500 outline-none"
                >
                  {gameModes.map(gm => <option key={gm} value={gm}>{gm}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase">Map</label>
                <input 
                  value={map} onChange={e => setMap(e.target.value)}
                  className="w-full bg-[#2a2a2a] border border-gray-800 rounded-xl p-3 focus:border-red-500 outline-none"
                  placeholder="e.g. Bermuda"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase">Per Kill Prize (₹)</label>
                <input 
                  value={perKillPrize} onChange={e => setPerKillPrize(e.target.value)}
                  className="w-full bg-[#2a2a2a] border border-gray-800 rounded-xl p-3 focus:border-red-500 outline-none"
                  placeholder="e.g. 10"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase">Max Players</label>
                <input 
                  type="number" value={maxPlayers} onChange={e => setMaxPlayers(e.target.value)}
                  className="w-full bg-[#2a2a2a] border border-gray-800 rounded-xl p-3 focus:border-red-500 outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase">Match ID (Display)</label>
                <input 
                  value={displayMatchId} onChange={e => setDisplayMatchId(e.target.value)}
                  className="w-full bg-[#2a2a2a] border border-gray-800 rounded-xl p-3 focus:border-red-500 outline-none"
                  placeholder="e.g. #57932"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-bold text-gray-500 uppercase">Rules & Description</label>
                <textarea 
                  value={rules} onChange={e => setRules(e.target.value)}
                  className="w-full bg-[#2a2a2a] border border-gray-800 rounded-xl p-3 focus:border-red-500 outline-none min-h-[100px]"
                  placeholder="Enter match rules and eligibility..."
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-bold text-gray-500 uppercase">Status</label>
                <div className="flex gap-2">
                  {(['upcoming', 'ongoing', 'completed'] as MatchStatus[]).map(s => (
                    <button
                      key={s} type="button" onClick={() => setStatus(s)}
                      className={`flex-1 py-2 rounded-lg text-sm font-bold capitalize border transition-all ${
                        status === s ? 'bg-red-600 border-red-600 text-white' : 'border-gray-800 text-gray-500'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {status === 'ongoing' && (
                <>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase">Room ID</label>
                    <input 
                      value={roomId} onChange={e => setRoomId(e.target.value)}
                      className="w-full bg-[#2a2a2a] border border-gray-800 rounded-xl p-3 focus:border-red-500 outline-none"
                      placeholder="Enter Room ID"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase">Room Password</label>
                    <input 
                      value={roomPassword} onChange={e => setRoomPassword(e.target.value)}
                      className="w-full bg-[#2a2a2a] border border-gray-800 rounded-xl p-3 focus:border-red-500 outline-none"
                      placeholder="Enter Room Password"
                      required
                    />
                  </div>
                </>
              )}
              <button 
                type="submit"
                className="md:col-span-2 bg-red-600 hover:bg-red-500 py-4 rounded-xl font-bold flex items-center justify-center gap-2 mt-4"
              >
                {editingId ? <Save className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                {editingId ? 'Save Changes' : 'Create Tournament'}
              </button>
            </form>
          )}
        </div>

        {/* Scoreboard Management Section */}
        {editingScoreboardId && (
          <div className="bg-[#1a1a1a]/80 backdrop-blur-md rounded-2xl border border-blue-500/30 p-6 space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <ListOrdered className="w-5 h-5 text-blue-500" />
                Manage Scoreboard
              </h2>
              <button onClick={resetForm} className="text-gray-500 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-[#2a2a2a] p-4 rounded-xl">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase">Player Name</label>
                <input 
                  value={newEntry.username} onChange={e => setNewEntry({...newEntry, username: e.target.value})}
                  className="w-full bg-[#1a1a1a] border border-gray-800 rounded-lg p-2 text-sm outline-none focus:border-blue-500"
                  placeholder="Username"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase">Kills</label>
                <input 
                  type="number" value={newEntry.kills} onChange={e => setNewEntry({...newEntry, kills: parseInt(e.target.value) || 0})}
                  className="w-full bg-[#1a1a1a] border border-gray-800 rounded-lg p-2 text-sm outline-none focus:border-blue-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase">Rank</label>
                <input 
                  type="number" value={newEntry.rank} onChange={e => setNewEntry({...newEntry, rank: parseInt(e.target.value) || 0})}
                  className="w-full bg-[#1a1a1a] border border-gray-800 rounded-lg p-2 text-sm outline-none focus:border-blue-500"
                />
              </div>
              <div className="flex items-end">
                <button 
                  onClick={addScoreboardEntry}
                  className="w-full bg-blue-600 hover:bg-blue-500 py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-2"
                >
                  <UserPlus className="w-4 h-4" /> Add Player
                </button>
              </div>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
              {scoreboardEntries.sort((a,b) => a.rank - b.rank).map((entry, i) => (
                <div key={i} className="flex items-center justify-between bg-black/20 p-3 rounded-lg border border-gray-800">
                  <div className="flex items-center gap-4">
                    <span className="w-6 h-6 bg-blue-600/20 text-blue-500 rounded flex items-center justify-center text-xs font-bold">#{entry.rank}</span>
                    <span className="font-bold">{entry.username}</span>
                  </div>
                  <div className="flex items-center gap-6">
                    <span className="text-sm text-gray-400 font-bold">{entry.kills} Kills</span>
                    <button onClick={() => removeScoreboardEntry(i)} className="text-red-500 hover:text-red-400 p-1">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              {scoreboardEntries.length === 0 && (
                <p className="text-center text-gray-500 py-4 text-sm italic">No players added to scoreboard yet.</p>
              )}
            </div>

            <button 
              onClick={saveScoreboard}
              className="w-full bg-green-600 hover:bg-green-500 py-3 rounded-xl font-bold flex items-center justify-center gap-2"
            >
              <Save className="w-5 h-5" /> Save Scoreboard
            </button>
          </div>
        )}

        {/* Joined Players View Modal */}
        {viewPlayersId && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-[#1a1a1a] border border-gray-800 rounded-3xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto space-y-6"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold">Joined Players</h3>
                <button onClick={() => setViewPlayersId(null)} className="p-2 hover:bg-white/10 rounded-full">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="bg-black/40 rounded-xl border border-gray-800 overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-black/60 border-b border-gray-800">
                    <tr>
                      <th className="p-3 text-[10px] font-black uppercase text-gray-500">Slot</th>
                      <th className="p-3 text-[10px] font-black uppercase text-gray-500">IGN</th>
                      <th className="p-3 text-[10px] font-black uppercase text-gray-500">UID</th>
                      <th className="p-3 text-[10px] font-black uppercase text-gray-500">Team</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {matches.find(m => m.id === viewPlayersId)?.joinedPlayers?.sort((a, b) => a.slot - b.slot).map((player, idx) => (
                      <tr key={idx} className="hover:bg-white/5 transition-colors">
                        <td className="p-3 text-sm font-bold text-yellow-500">{player.slot}</td>
                        <td className="p-3 text-sm font-bold">{player.ign}</td>
                        <td className="p-3 text-xs text-gray-500 font-mono">{player.gameUid}</td>
                        <td className="p-3 text-sm text-gray-400">{player.team || '-'}</td>
                      </tr>
                    ))}
                    {(!matches.find(m => m.id === viewPlayersId)?.joinedPlayers || matches.find(m => m.id === viewPlayersId)?.joinedPlayers?.length === 0) && (
                      <tr>
                        <td colSpan={4} className="p-8 text-center text-gray-500 text-sm italic">No players have joined this match yet.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <button 
                onClick={() => setViewPlayersId(null)}
                className="w-full bg-red-600 hover:bg-red-500 py-3 rounded-xl font-bold"
              >
                Close
              </button>
            </motion.div>
          </div>
        )}

        {/* Manage Matches Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold px-2">Manage Tournaments</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {matches.map(match => (
              <div key={match.id} className="bg-[#1a1a1a]/60 backdrop-blur-sm border border-gray-800 rounded-2xl p-5 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-lg">{match.title}</h3>
                    <div className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                      <Calendar className="w-3 h-3" /> {match.date}
                      <Clock className="w-3 h-3 ml-2" /> {match.time}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setViewPlayersId(match.id)}
                      className="p-2 hover:bg-yellow-500/20 text-yellow-500 rounded-lg transition-colors"
                      title="View Joined Players"
                    >
                      <Users className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => startScoreboardEdit(match)}
                      className="p-2 hover:bg-green-500/20 text-green-500 rounded-lg transition-colors"
                      title="Manage Scoreboard"
                    >
                      <ListOrdered className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => startEdit(match)}
                      className="p-2 hover:bg-blue-500/20 text-blue-500 rounded-lg transition-colors"
                    >
                      <Edit3 className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => setDeletingId(match.id)}
                      className="p-2 hover:bg-red-500/20 text-red-500 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t border-gray-800">
                  <div className="flex items-center gap-2">
                    {match.status === 'upcoming' && <Timer className="w-4 h-4 text-green-500" />}
                    {match.status === 'ongoing' && <PlayCircle className="w-4 h-4 text-blue-500 animate-pulse" />}
                    {match.status === 'completed' && <CheckCircle2 className="w-4 h-4 text-purple-500" />}
                    <span className="text-xs font-bold uppercase tracking-wider">{match.status}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-black text-red-500">P: ₹{match.prizePool}</span>
                    <span className="font-black text-green-500">E: ₹{match.entryFee}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </>
    ) : activeTab === 'withdrawals' ? (
      <div className="space-y-6">
        <h2 className="text-xl font-bold px-2">Withdrawal Requests</h2>
        <div className="grid grid-cols-1 gap-4">
          {withdrawals.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)).map(req => (
            <div key={req.id} className="bg-[#1a1a1a]/60 backdrop-blur-sm border border-gray-800 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-500">
                  <Wallet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold">{req.userName} <span className="text-xs text-gray-500 font-normal">({req.userEmail})</span></h3>
                  <p className="text-xs text-gray-400">Method: <span className="text-white font-bold">{req.method}</span> | Details: <span className="text-white font-bold">{req.details}</span></p>
                </div>
              </div>

              <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 border-gray-800 pt-4 md:pt-0">
                <div className="flex flex-col items-end">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Amount</span>
                  <span className="text-lg font-black text-yellow-500">₹{req.amount}</span>
                </div>
                
                <div className="flex gap-2">
                  {req.status === 'pending' ? (
                    <>
                      <button 
                        onClick={() => handleUpdateWithdrawal(req.id, 'completed')}
                        className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all"
                      >
                        Approve
                      </button>
                      <button 
                        onClick={() => handleUpdateWithdrawal(req.id, 'rejected')}
                        className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all"
                      >
                        Reject
                      </button>
                    </>
                  ) : (
                    <span className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest ${req.status === 'completed' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                      {req.status}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
          {withdrawals.length === 0 && (
            <p className="text-center text-gray-500 py-12 italic">No withdrawal requests found.</p>
          )}
        </div>
      </div>
    ) : activeTab === 'rules' ? (
      <div className="space-y-6">
        <div className="flex justify-between items-center px-2">
          <h2 className="text-xl font-bold">Edit Game Rules</h2>
          <button 
            onClick={handleSaveRules}
            className="bg-red-600 hover:bg-red-500 text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-red-500/20"
          >
            <Save className="w-4 h-4" />
            Save Rules
          </button>
        </div>
        <div className="bg-[#1a1a1a]/60 backdrop-blur-sm border border-gray-800 rounded-3xl p-6">
          <textarea 
            value={rulesContent}
            onChange={e => setRulesContent(e.target.value)}
            className="w-full bg-transparent border-none outline-none text-gray-300 min-h-[500px] resize-none leading-relaxed"
            placeholder="Write game rules here..."
          />
        </div>
      </div>
    ) : activeTab === 'banners' ? (
      <div className="space-y-6">
        <div className="flex justify-between items-center px-2">
          <h2 className="text-xl font-bold">Manage Banners</h2>
          <button 
            onClick={() => {
              setIsAddingBanner(true);
              setEditingBannerId(null);
              setBannerTitle('');
              setBannerSubtitle('');
              setBannerImageUrl('');
              setBannerOrder('0');
              setBannerIsActive(true);
            }}
            className="bg-red-600 hover:bg-red-500 text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-red-500/20"
          >
            <Plus className="w-4 h-4" />
            Add New Banner
          </button>
        </div>

        {isAddingBanner && (
          <div className="bg-[#1a1a1a]/60 backdrop-blur-sm border border-gray-800 rounded-3xl p-6 space-y-4">
            <h3 className="text-lg font-bold">{editingBannerId ? 'Edit Banner' : 'Add New Banner'}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Title</label>
                <input 
                  type="text" 
                  value={bannerTitle}
                  onChange={e => setBannerTitle(e.target.value)}
                  className="w-full bg-black/40 border border-gray-800 rounded-xl px-4 py-2 text-white outline-none focus:border-red-500 transition-all"
                  placeholder="Banner Title"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Subtitle</label>
                <input 
                  type="text" 
                  value={bannerSubtitle}
                  onChange={e => setBannerSubtitle(e.target.value)}
                  className="w-full bg-black/40 border border-gray-800 rounded-xl px-4 py-2 text-white outline-none focus:border-red-500 transition-all"
                  placeholder="Banner Subtitle"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Banner Image</label>
                <div className="flex flex-col gap-3">
                  {bannerImageUrl && (
                    <div className="relative w-full h-32 rounded-xl overflow-hidden border border-gray-800">
                      <img 
                        src={bannerImageUrl} 
                        alt="Preview" 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <button 
                        onClick={() => setBannerImageUrl('')}
                        className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-lg shadow-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  <div className="relative">
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="banner-upload"
                    />
                    <label 
                      htmlFor="banner-upload"
                      className={`w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-800 rounded-xl cursor-pointer hover:border-red-500 hover:bg-red-500/5 transition-all ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
                    >
                      <Upload className="w-5 h-5 text-gray-500" />
                      <span className="text-sm font-bold text-gray-400">
                        {isUploading ? 'Uploading...' : bannerImageUrl ? 'Change Image' : 'Upload Image'}
                      </span>
                    </label>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <LinkIcon className="w-4 h-4 text-gray-500" />
                    </div>
                    <input 
                      type="text" 
                      value={bannerImageUrl}
                      onChange={e => setBannerImageUrl(e.target.value)}
                      className="w-full bg-black/40 border border-gray-800 rounded-xl pl-10 pr-4 py-2 text-white outline-none focus:border-red-500 transition-all text-sm"
                      placeholder="Or paste image URL here..."
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Display Order</label>
                <input 
                  type="number" 
                  value={bannerOrder}
                  onChange={e => setBannerOrder(e.target.value)}
                  className="w-full bg-black/40 border border-gray-800 rounded-xl px-4 py-2 text-white outline-none focus:border-red-500 transition-all"
                  placeholder="0"
                />
              </div>
            </div>
            <div className="flex items-center gap-4 pt-2">
              <button 
                onClick={() => setBannerIsActive(!bannerIsActive)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all ${bannerIsActive ? 'bg-green-600/20 text-green-500 border border-green-500/20' : 'bg-gray-800 text-gray-500 border border-gray-700'}`}
              >
                {bannerIsActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                {bannerIsActive ? 'Active' : 'Inactive'}
              </button>
              <div className="ml-auto flex gap-2">
                <button 
                  onClick={() => setIsAddingBanner(false)}
                  className="px-6 py-2 rounded-xl font-bold text-sm text-gray-400 hover:text-white transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSaveBanner}
                  className="bg-red-600 hover:bg-red-500 text-white px-8 py-2 rounded-xl font-bold text-sm transition-all shadow-lg shadow-red-500/20"
                >
                  {editingBannerId ? 'Update' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4">
          {banners.map(banner => (
            <div key={banner.id} className="bg-[#1a1a1a]/60 backdrop-blur-sm border border-gray-800 rounded-2xl overflow-hidden flex flex-col md:flex-row">
              <div className="w-full md:w-48 h-32 relative">
                <img 
                  src={banner.imageUrl} 
                  alt={banner.title}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                {!banner.isActive && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <span className="text-xs font-bold text-white uppercase tracking-widest bg-red-600 px-2 py-1 rounded">Inactive</span>
                  </div>
                )}
              </div>
              <div className="p-4 flex-1 flex flex-col justify-center">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-lg">{banner.title}</h3>
                    <p className="text-sm text-gray-500">{banner.subtitle}</p>
                    <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mt-1">Order: {banner.order}</p>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => startEditingBanner(banner)}
                      className="p-2 bg-blue-600/10 text-blue-500 rounded-lg hover:bg-blue-600 hover:text-white transition-all"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDeleteBanner(banner.id)}
                      className="p-2 bg-red-600/10 text-red-500 rounded-lg hover:bg-red-600 hover:text-white transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {banners.length === 0 && !isAddingBanner && (
            <div className="text-center py-20 bg-[#1a1a1a]/40 rounded-3xl border border-dashed border-gray-800">
              <ImageIcon className="w-12 h-12 text-gray-700 mx-auto mb-4" />
              <p className="text-gray-500 italic">No banners found. Add one to show on the home page.</p>
            </div>
          )}
        </div>
      </div>
    ) : activeTab === 'settings' ? (
      renderSettings()
    ) : (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h2 className="text-xl font-bold px-2">User Management</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input 
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="bg-[#1a1a1a] border border-gray-800 rounded-xl py-2 pl-10 pr-4 text-sm focus:border-red-500 outline-none w-full md:w-64"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {filteredUsers.map(u => (
            <div key={u.uid} className="bg-[#1a1a1a]/60 backdrop-blur-sm border border-gray-800 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full border-2 border-red-600/20 p-0.5">
                  <img 
                    src={u.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.uid}`} 
                    alt={u.displayName}
                    className="w-full h-full rounded-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div>
                  <h3 className="font-bold flex items-center gap-2">
                    {u.displayName}
                    {u.isBanned && (
                      <span className="bg-red-500/20 text-red-500 text-[10px] px-2 py-0.5 rounded-full border border-red-500/20 flex items-center gap-1">
                        <ShieldAlert className="w-3 h-3" /> BANNED
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-gray-500">{u.email || u.phoneNumber || 'No contact info'}</p>
                </div>
              </div>

              <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 border-gray-800 pt-4 md:pt-0">
                <div className="flex flex-col items-end">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Balance</span>
                  <span className="text-lg font-black text-green-500">₹{u.walletBalance || 0}</span>
                </div>
                
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleToggleBan(u.uid, !!u.isBanned)}
                    className={`p-2 rounded-xl border transition-all flex items-center gap-2 text-sm font-bold ${
                      u.isBanned 
                        ? 'bg-green-600/10 hover:bg-green-600 text-green-500 hover:text-white border-green-600/20' 
                        : 'bg-orange-600/10 hover:bg-orange-600 text-orange-500 hover:text-white border-orange-600/20'
                    }`}
                    title={u.isBanned ? "Unban User" : "Ban User"}
                  >
                    {u.isBanned ? <ShieldCheck className="w-5 h-5" /> : <Ban className="w-5 h-5" />}
                  </button>
                  <button 
                    onClick={() => setUpdatingWalletUid(updatingWalletUid === u.uid ? null : u.uid)}
                    className="bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white p-2 rounded-xl border border-red-600/20 transition-all flex items-center gap-2 text-sm font-bold"
                  >
                    <Coins className="w-4 h-4" />
                    Manage Coins
                  </button>
                  <button 
                    onClick={() => setDeletingUserUid(u.uid)}
                    className="bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white p-2 rounded-xl border border-red-600/20 transition-all flex items-center gap-2 text-sm font-bold"
                    title="Delete User Account"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {updatingWalletUid === u.uid && (
                <div className="w-full mt-4 p-4 bg-black/40 rounded-xl border border-gray-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold">Update Balance</span>
                    <button onClick={() => setUpdatingWalletUid(null)}><X className="w-4 h-4 text-gray-500" /></button>
                  </div>
                  <div className="flex gap-2">
                    <input 
                      type="number"
                      value={walletAmount}
                      onChange={e => setWalletAmount(e.target.value)}
                      placeholder="Amount"
                      className="flex-1 bg-[#1a1a1a] border border-gray-800 rounded-lg p-2 text-sm outline-none focus:border-red-500"
                    />
                    <button 
                      onClick={() => handleUpdateWallet(u.uid, u.walletBalance || 0, walletAmount, 'add')}
                      className="bg-green-600 hover:bg-green-500 px-4 py-2 rounded-lg text-xs font-bold"
                    >
                      Add
                    </button>
                    <button 
                      onClick={() => handleUpdateWallet(u.uid, u.walletBalance || 0, walletAmount, 'remove')}
                      className="bg-red-600 hover:bg-red-500 px-4 py-2 rounded-lg text-xs font-bold"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
          {filteredUsers.length === 0 && (
            <div className="text-center py-12 bg-[#1a1a1a]/40 rounded-2xl border border-gray-800 border-dashed">
              <p className="text-gray-500">No users found matching your search.</p>
            </div>
          )}
        </div>
      </div>
    )}
      </main>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deletingId && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeletingId(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm bg-[#1a1a1a] border border-gray-800 rounded-3xl p-8 shadow-2xl text-center"
            >
              <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-2">Delete Tournament?</h3>
              <p className="text-gray-400 text-sm mb-8">This action cannot be undone. All match data and joined players will be removed.</p>
              
              <div className="flex gap-3">
                <button 
                  onClick={() => setDeletingId(null)}
                  className="flex-1 py-3 bg-gray-800 hover:bg-gray-700 rounded-xl font-bold transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => handleDelete(deletingId)}
                  className="flex-1 py-3 bg-red-600 hover:bg-red-500 rounded-xl font-bold transition-colors shadow-lg shadow-red-500/20"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* User Delete Confirmation Modal */}
      <AnimatePresence>
        {deletingUserUid && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeletingUserUid(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm bg-[#1a1a1a] border border-gray-800 rounded-3xl p-8 shadow-2xl text-center"
            >
              <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-2">Delete User Account?</h3>
              <p className="text-gray-400 text-sm mb-8">This will permanently delete the user's profile and data from the database. This action cannot be undone.</p>
              
              <div className="flex gap-3">
                <button 
                  onClick={() => setDeletingUserUid(null)}
                  className="flex-1 py-3 bg-gray-800 hover:bg-gray-700 rounded-xl font-bold transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => handleDeleteUser(deletingUserUid)}
                  className="flex-1 py-3 bg-red-600 hover:bg-red-500 rounded-xl font-bold transition-colors shadow-lg shadow-red-500/20"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
