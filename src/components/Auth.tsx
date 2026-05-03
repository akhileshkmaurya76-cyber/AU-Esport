import React, { useState, useEffect } from 'react';
import { 
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
  signInWithPopup,
  GoogleAuthProvider
} from 'firebase/auth';
import { auth } from '../firebase';
import { firestoreService } from '../services/firestoreService';
import { motion, AnimatePresence } from 'motion/react';
import { Gamepad2, Phone, User, LogIn, CheckCircle2, ShieldCheck } from 'lucide-react';

declare global {
  interface Window {
    recaptchaVerifier: RecaptchaVerifier | null;
  }
}

export default function Auth() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [name, setName] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [isNewUser, setIsNewUser] = useState(false);

  useEffect(() => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
        callback: () => {
          console.log('Recaptcha resolved');
        }
      });
    }
  }, []);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Format phone number if needed (assuming Indian numbers +91 if not provided)
    let formattedNumber = phoneNumber.trim();
    if (!formattedNumber.startsWith('+')) {
      formattedNumber = `+91${formattedNumber}`;
    }

    try {
      const verifier = window.recaptchaVerifier;
      const result = await signInWithPhoneNumber(auth, formattedNumber, verifier);
      setConfirmationResult(result);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to send OTP. Please try again.');
      // Reset recaptcha on error
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!confirmationResult) throw new Error('No confirmation result found');
      
      const result = await confirmationResult.confirm(verificationCode);
      const user = result.user;
      
      const existingProfile = await firestoreService.getUserProfile(user.uid);
      
      if (!existingProfile) {
        setIsNewUser(true);
      }
    } catch (err: any) {
      setError('Invalid verification code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }
    
    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('No user found');

      let referredByUid = '';
      if (referralCode.trim()) {
        const referrer = await firestoreService.getUserByReferralCode(referralCode.trim());
        if (referrer) {
          referredByUid = referrer.uid;
        }
      }

      await firestoreService.createUserProfile({
        uid: user.uid,
        phoneNumber: user.phoneNumber || undefined,
        displayName: name,
        role: 'user',
        walletBalance: 0,
        referralCode: user.uid.slice(0, 8).toUpperCase(),
        referredBy: referredByUid || undefined
      });
      
      setIsNewUser(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const existingProfile = await firestoreService.getUserProfile(user.uid);
      if (!existingProfile) {
        await firestoreService.createUserProfile({
          uid: user.uid,
          email: user.email!,
          displayName: user.displayName || 'Player',
          photoURL: user.photoURL || undefined,
          role: 'user',
          walletBalance: 0,
          referralCode: user.uid.slice(0, 8).toUpperCase()
        });
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div id="recaptcha-container"></div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-[#1a1a1a]/80 backdrop-blur-md rounded-2xl p-8 border border-red-500/20 shadow-2xl shadow-red-500/5"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-24 h-24 mb-4">
            <img 
              src="https://storage.googleapis.com/test-api-446285554400-static-content/77405943-2679-4089-9830-4963e6393563.png" 
              alt="AU Esport Logo" 
              className="w-full h-full object-contain"
              referrerPolicy="no-referrer"
              crossOrigin="anonymous"
            />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight uppercase">AU ESPORT</h1>
          <p className="text-gray-400 text-sm mt-2">Join the ultimate Free Fire arena</p>
        </div>

        <AnimatePresence mode="wait">
          {isNewUser ? (
            <motion.form 
              key="profile"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              onSubmit={handleCompleteProfile} 
              className="space-y-4"
            >
              <h2 className="text-xl font-bold text-white text-center mb-4">Complete Your Profile</h2>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="text"
                  placeholder="Your Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#2a2a2a] border border-gray-800 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-red-500 transition-colors"
                  required
                />
              </div>
              <div className="relative">
                <Gamepad2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="text"
                  placeholder="Referral Code (Optional)"
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value)}
                  className="w-full bg-[#2a2a2a] border border-gray-800 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-red-500 transition-colors"
                />
              </div>
              {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-3 rounded-xl transition-all transform active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Complete Registration'}
                <CheckCircle2 className="w-5 h-5" />
              </button>
            </motion.form>
          ) : !confirmationResult ? (
            <motion.form 
              key="phone"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              onSubmit={handleSendOTP} 
              className="space-y-4"
            >
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="tel"
                  placeholder="Phone Number (e.g. 9876543210)"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full bg-[#2a2a2a] border border-gray-800 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-red-500 transition-colors"
                  required
                />
              </div>
              {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-3 rounded-xl transition-all transform active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? 'Sending OTP...' : 'Send OTP'}
                <LogIn className="w-5 h-5" />
              </button>
            </motion.form>
          ) : (
            <motion.form 
              key="otp"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              onSubmit={handleVerifyOTP} 
              className="space-y-4"
            >
              <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-xl text-center mb-4">
                <p className="text-xs text-gray-400 uppercase font-bold">OTP sent to</p>
                <p className="text-white font-black">{phoneNumber}</p>
                <button 
                  type="button"
                  onClick={() => setConfirmationResult(null)}
                  className="text-red-500 text-[10px] font-bold uppercase mt-1 hover:underline"
                >
                  Change Number
                </button>
              </div>
              <div className="relative">
                <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="text"
                  placeholder="Enter 6-digit OTP"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  maxLength={6}
                  className="w-full bg-[#2a2a2a] border border-gray-800 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-red-500 transition-colors tracking-[0.5em] text-center font-black"
                  required
                />
              </div>
              {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-3 rounded-xl transition-all transform active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? 'Verifying...' : 'Verify & Login'}
                <CheckCircle2 className="w-5 h-5" />
              </button>
            </motion.form>
          )}
        </AnimatePresence>

        {!confirmationResult && !isNewUser && (
          <div className="mt-6">
            <div className="relative flex items-center py-4">
              <div className="flex-grow border-t border-gray-800"></div>
              <span className="flex-shrink mx-4 text-gray-500 text-sm">OR</span>
              <div className="flex-grow border-t border-gray-800"></div>
            </div>

            <button
              onClick={handleGoogleSignIn}
              className="w-full bg-white hover:bg-gray-100 text-black font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-3"
            >
              <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" referrerPolicy="no-referrer" crossOrigin="anonymous" />
              Continue with Google
            </button>
          </div>
        )}

        <p className="text-center text-gray-500 mt-8 text-[10px] font-bold uppercase tracking-widest">
          By continuing, you agree to our Terms & Conditions
        </p>
      </motion.div>
    </div>
  );
}
