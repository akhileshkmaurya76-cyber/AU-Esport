import { collection, getDocs, addDoc, setDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';

const SAMPLE_MATCHES = [
  {
    title: "Sunday Solo Showdown",
    date: "2026-04-12",
    time: "10:00 AM",
    prizePool: "5000",
    status: "upcoming",
    joinedUsers: []
  },
  {
    title: "Pro Squad Battle",
    date: "2026-04-12",
    time: "02:00 PM",
    prizePool: "10000",
    status: "upcoming",
    joinedUsers: []
  },
  {
    title: "Elite Duo Cup",
    date: "2026-04-09",
    time: "06:00 PM",
    prizePool: "3000",
    status: "ongoing",
    joinedUsers: []
  },
  {
    title: "Midnight Scrims",
    date: "2026-04-08",
    time: "11:00 PM",
    prizePool: "2000",
    status: "completed",
    joinedUsers: []
  }
];

export const seedMatches = async () => {
  const matchesCol = collection(db, 'matches');
  const snapshot = await getDocs(matchesCol);
  
  if (snapshot.empty) {
    console.log('Seeding sample matches...');
    for (const match of SAMPLE_MATCHES) {
      await addDoc(matchesCol, match);
    }
    console.log('Seeding complete.');
  }
};
