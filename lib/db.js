import { db } from './firebase';
import { collection, getDocs, query, where, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

// Funzione per ottenere tutti gli NFT
export async function getAllNFTs() {
  const nftsRef = collection(db, 'nfts');
  const snapshot = await getDocs(nftsRef);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// Funzione per ottenere un singolo NFT
export async function getNFTById(id) {
  const nftRef = doc(db, 'nfts', id.toString());
  const nftDoc = await getDoc(nftRef);
  if (!nftDoc.exists()) return null;
  return { id: nftDoc.id, ...nftDoc.data() };
}

// Funzione per ottenere le stelle di un NFT
export async function getNFTStars(nftId) {
  const nft = await getNFTById(nftId);
  return nft ? nft.stars || 0 : 0;
}

// Funzione per aggiungere stelle a un NFT
export async function addStarsToNFT(nftId, stars) {
  const nftRef = doc(db, 'nfts', nftId.toString());
  await updateDoc(nftRef, { stars });
}

// Funzione per ottenere tutti gli NFT con le loro stelle
export async function getAllNFTsWithStars() {
  // Ora che le stelle sono parte dell'NFT, possiamo semplicemente restituire tutti gli NFT
  return getAllNFTs();
}

// Funzione per ottenere tutti gli archetipi
export async function getAllArchetypes() {
  const nfts = await getAllNFTs();
  const archetypes = [...new Set(nfts.map(nft => nft.archetype))];
  return archetypes;
}

// Funzione per ottenere NFT per archetipo
export async function getNftsByArchetypes(archetypes) {
  if (!archetypes || archetypes.length === 0) return [];
  
  const nftsRef = collection(db, 'nfts');
  const q = query(nftsRef, where('archetype', 'in', archetypes));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export default {
  getAllNFTs,
  getNFTById,
  getNFTStars,
  addStarsToNFT,
  getAllNFTsWithStars,
  getAllArchetypes,
  getNftsByArchetypes
}; 