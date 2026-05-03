import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  addDoc,
  onSnapshot, 
  query, 
  where,
  Timestamp
} from 'firebase/firestore';
import { db, auth } from '../firebase';
import { Match, UserProfile, Banner, AppSettings, Transaction } from '../types';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export const firestoreService = {
  async createUserProfile(profile: UserProfile) {
    const path = `users/${profile.uid}`;
    try {
      await setDoc(doc(db, 'users', profile.uid), {
        ...profile,
        walletBalance: profile.walletBalance || 0,
        referralCode: profile.uid.slice(0, 8).toUpperCase(),
        createdAt: Timestamp.now()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  async getUserByReferralCode(code: string): Promise<UserProfile | null> {
    const path = 'users';
    try {
      const q = query(collection(db, 'users'), where('referralCode', '==', code.toUpperCase()));
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) return null;
      return querySnapshot.docs[0].data() as UserProfile;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
      return null;
    }
  },

  async handleReferralReward(referrerUid: string) {
    const path = `users/${referrerUid}`;
    try {
      const referrerSnap = await getDoc(doc(db, 'users', referrerUid));
      if (referrerSnap.exists()) {
        const referrerData = referrerSnap.data() as UserProfile;
        const currentBalance = referrerData.walletBalance || 0;
        await updateDoc(doc(db, 'users', referrerUid), {
          walletBalance: currentBalance + 5
        });
        
        // Record transaction
        await addDoc(collection(db, 'transactions'), {
          userId: referrerUid,
          amount: 5,
          type: 'referral',
          status: 'completed',
          description: 'Referral Bonus',
          createdAt: Timestamp.now()
        });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  async addBalance(uid: string, amount: number) {
    const path = `users/${uid}`;
    try {
      const userSnap = await getDoc(doc(db, 'users', uid));
      if (!userSnap.exists()) throw new Error('User not found');
      
      const userData = userSnap.data() as UserProfile;
      const currentBalance = userData.walletBalance || 0;
      const currentDeposited = userData.depositedBalance || 0;
      
      const updates: any = {
        walletBalance: currentBalance + amount,
        depositedBalance: currentDeposited + amount
      };

      // Referral logic: If first deposit >= 10 and has a referrer
      if (!userData.firstDepositDone && amount >= 10 && userData.referredBy) {
        updates.firstDepositDone = true;
        await this.handleReferralReward(userData.referredBy);
      } else if (!userData.firstDepositDone && amount >= 10) {
        updates.firstDepositDone = true;
      }

      await updateDoc(doc(db, 'users', uid), updates);

      // Record transaction
      await addDoc(collection(db, 'transactions'), {
        userId: uid,
        amount: amount,
        type: 'deposit',
        status: 'completed',
        description: 'Wallet Deposit',
        createdAt: Timestamp.now()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  async updateWalletBalance(uid: string, amount: number) {
    const path = `users/${uid}`;
    try {
      console.log(`Updating wallet balance for ${uid} to ${amount}`);
      await updateDoc(doc(db, 'users', uid), {
        walletBalance: amount
      });
      console.log(`Successfully updated wallet balance for ${uid}`);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  async deductBalance(uid: string, amount: number, description: string = 'Balance Deduction') {
    const path = `users/${uid}`;
    try {
      const userSnap = await getDoc(doc(db, 'users', uid));
      if (!userSnap.exists()) throw new Error('User not found');
      
      const userData = userSnap.data() as UserProfile;
      const currentBalance = userData.walletBalance || 0;
      
      await updateDoc(doc(db, 'users', uid), {
        walletBalance: Math.max(0, currentBalance - amount)
      });

      // Record transaction
      await addDoc(collection(db, 'transactions'), {
        userId: uid,
        amount: amount,
        type: 'withdrawal',
        status: 'completed',
        description: description,
        createdAt: Timestamp.now()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  async updateUserBanStatus(uid: string, isBanned: boolean) {
    const path = `users/${uid}`;
    try {
      await updateDoc(doc(db, 'users', uid), {
        isBanned: isBanned
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  async updateUserProfile(uid: string, data: Partial<UserProfile>) {
    const path = `users/${uid}`;
    try {
      await updateDoc(doc(db, 'users', uid), data);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  async getUserProfile(uid: string): Promise<UserProfile | null> {
    const path = `users/${uid}`;
    try {
      const docSnap = await getDoc(doc(db, 'users', uid));
      return docSnap.exists() ? (docSnap.data() as UserProfile) : null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
      return null;
    }
  },

  subscribeToMatches(callback: (matches: Match[]) => void) {
    const path = 'matches';
    return onSnapshot(collection(db, path), (snapshot) => {
      const matches = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Match));
      callback(matches);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    });
  },

  async joinMatch(matchId: string, userId: string, ign: string, gameUid: string, entryFee: number, slot: number, team?: string) {
    const matchPath = `matches/${matchId}`;
    const userPath = `users/${userId}`;
    
    try {
      // 1. Get current match and user data
      const [matchSnap, userSnap] = await Promise.all([
        getDoc(doc(db, 'matches', matchId)),
        getDoc(doc(db, 'users', userId))
      ]);

      if (!matchSnap.exists() || !userSnap.exists()) {
        throw new Error('Match or User not found');
      }

      const matchData = matchSnap.data() as Match;
      const userData = userSnap.data() as UserProfile;

      // 2. Check if already joined
      const joinedUsers = matchData.joinedUsers || [];
      if (joinedUsers.includes(userId)) {
        throw new Error('Already joined this match');
      }

      // 3. Check if slot is taken
      const joinedPlayers = matchData.joinedPlayers || [];
      if (joinedPlayers.some(p => p.slot === slot)) {
        throw new Error('Slot already taken');
      }

      // 4. Check balance
      if (userData.walletBalance < entryFee) {
        throw new Error('Insufficient wallet balance');
      }

      // 5. Update both documents
      const newJoinedUsers = [...joinedUsers, userId];
      const newJoinedPlayers = [...joinedPlayers, { userId, ign, gameUid, slot, team }];
      
      await Promise.all([
        updateDoc(doc(db, 'matches', matchId), {
          joinedUsers: newJoinedUsers,
          joinedPlayers: newJoinedPlayers
        }),
        updateDoc(doc(db, 'users', userId), {
          walletBalance: userData.walletBalance - entryFee
        }),
        // Record transaction
        addDoc(collection(db, 'transactions'), {
          userId: userId,
          amount: entryFee,
          type: 'match_entry',
          status: 'completed',
          description: `Joined Match: ${matchData.title}`,
          createdAt: Timestamp.now()
        })
      ]);

      return true;
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, matchPath);
      throw error;
    }
  },

  async addMatch(match: Omit<Match, 'id'>) {
    const path = 'matches';
    try {
      const docRef = await addDoc(collection(db, path), match);
      return docRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  },

  async updateMatch(matchId: string, updates: Partial<Match>) {
    const path = `matches/${matchId}`;
    try {
      await updateDoc(doc(db, 'matches', matchId), updates);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  async updateScoreboard(matchId: string, scoreboard: Match['scoreboard']) {
    const path = `matches/${matchId}`;
    try {
      await updateDoc(doc(db, 'matches', matchId), { scoreboard });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  async deleteMatch(matchId: string) {
    const path = `matches/${matchId}`;
    try {
      await deleteDoc(doc(db, 'matches', matchId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  },

  subscribeToUsers(callback: (users: UserProfile[]) => void) {
    const path = 'users';
    return onSnapshot(collection(db, path), (snapshot) => {
      const users = snapshot.docs.map(doc => ({ ...doc.data(), uid: doc.id } as UserProfile));
      callback(users);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    });
  },

  async createWithdrawalRequest(userId: string, amount: number, method: string, details: string) {
    const path = 'withdrawals';
    try {
      const userSnap = await getDoc(doc(db, 'users', userId));
      if (!userSnap.exists()) throw new Error('User not found');
      
      const userData = userSnap.data() as UserProfile;
      if (userData.walletBalance < amount) throw new Error('Insufficient balance');

      await addDoc(collection(db, path), {
        userId,
        userEmail: userData.email,
        userName: userData.displayName || 'Player',
        amount,
        method,
        details,
        status: 'pending',
        createdAt: Timestamp.now()
      });

      await updateDoc(doc(db, 'users', userId), {
        walletBalance: userData.walletBalance - amount
      });

      // Record transaction
      await addDoc(collection(db, 'transactions'), {
        userId,
        amount,
        type: 'withdrawal',
        status: 'pending',
        description: `Withdrawal Request (${method})`,
        createdAt: Timestamp.now()
      });

      return true;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
      throw error;
    }
  },

  subscribeToWithdrawals(callback: (requests: any[]) => void) {
    const path = 'withdrawals';
    return onSnapshot(collection(db, path), (snapshot) => {
      const requests = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(requests);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    });
  },

  async updateWithdrawalStatus(requestId: string, status: 'completed' | 'rejected') {
    const path = `withdrawals/${requestId}`;
    try {
      await updateDoc(doc(db, 'withdrawals', requestId), { status });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  subscribeToRules(callback: (rules: string) => void) {
    const path = 'settings/rules';
    return onSnapshot(doc(db, 'settings', 'rules'), (snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.data().content);
      } else {
        callback('No rules defined yet.');
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    });
  },

  async updateRules(content: string) {
    const path = 'settings/rules';
    try {
      await setDoc(doc(db, 'settings', 'rules'), {
        content,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  subscribeToBanners(callback: (banners: Banner[]) => void) {
    const path = 'banners';
    return onSnapshot(collection(db, path), (snapshot) => {
      const banners = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Banner));
      callback(banners.sort((a, b) => a.order - b.order));
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    });
  },

  async addBanner(banner: Omit<Banner, 'id'>) {
    const path = 'banners';
    try {
      await addDoc(collection(db, path), banner);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  },

  async updateBanner(bannerId: string, banner: Partial<Banner>) {
    const path = `banners/${bannerId}`;
    try {
      await updateDoc(doc(db, 'banners', bannerId), banner);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  async deleteBanner(bannerId: string) {
    const path = `banners/${bannerId}`;
    try {
      await deleteDoc(doc(db, 'banners', bannerId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  },

  async deleteUser(uid: string) {
    const path = `users/${uid}`;
    try {
      await deleteDoc(doc(db, 'users', uid));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  },

  async updatePlayerDetails(matchId: string, userId: string, ign: string, gameUid: string) {
    const path = `matches/${matchId}`;
    try {
      const matchSnap = await getDoc(doc(db, 'matches', matchId));
      if (!matchSnap.exists()) throw new Error('Match not found');
      
      const matchData = matchSnap.data() as Match;
      const joinedPlayers = matchData.joinedPlayers || [];
      
      const newJoinedPlayers = joinedPlayers.map(p => 
        p.userId === userId ? { ...p, ign, gameUid } : p
      );

      await updateDoc(doc(db, 'matches', matchId), {
        joinedPlayers: newJoinedPlayers
      });
      return true;
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
      throw error;
    }
  },

  subscribeToAppSettings(callback: (settings: AppSettings) => void) {
    const path = 'settings/app';
    return onSnapshot(doc(db, 'settings', 'app'), (snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.data() as AppSettings);
      } else {
        // Default settings if not found
        callback({
          logoUrl: 'https://storage.googleapis.com/test-api-446285554400-static-content/2573229b-839f-43b9-a68b-90225134676a.png',
          qrCodeUrl: 'https://storage.googleapis.com/test-api-446285554400-static-content/762d6342-6e2a-4389-918c-c6f376829778.png',
          homeBoxImageUrl: 'https://storage.googleapis.com/test-api-446285554400-static-content/245802f0-7546-474d-9fde-0c460193e62a.png',
          matchBannerUrl: 'https://storage.googleapis.com/test-api-446285554400-static-content/245802f0-7546-474d-9fde-0c460193e62a.png'
        });
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    });
  },

  async updateAppSettings(settings: Partial<AppSettings>) {
    const path = 'settings/app';
    try {
      await setDoc(doc(db, 'settings', 'app'), settings, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  subscribeToTransactions(userId: string, callback: (transactions: Transaction[]) => void) {
    const path = 'transactions';
    const q = query(
      collection(db, path), 
      where('userId', '==', userId)
    );
    return onSnapshot(q, (snapshot) => {
      const transactions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction));
      callback(transactions.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)));
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    });
  }
};
