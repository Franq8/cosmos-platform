import { db } from '../../lib/firebase';
import { collection, doc, setDoc } from 'firebase/firestore';
import fs from 'fs';
import path from 'path';

const nfts = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'data/nfts_with_stars.json'), 'utf8'));

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Metodo non consentito' });
  }

  try {
    console.log('Iniziando importazione...');
    
    for (const nft of nfts) {
      console.log(`Importando NFT ${nft.id}...`);
      const nftRef = doc(db, 'nfts', nft.id.toString());
      await setDoc(nftRef, {
        archetype: nft.archetype,
        image: nft.image,
        stars: nft.stars,
        createdAt: new Date()
      });
    }
    
    return res.status(200).json({ message: 'Importazione completata con successo!' });
  } catch (error) {
    console.error('Errore durante l\'importazione:', error);
    return res.status(500).json({ error: 'Errore durante l\'importazione' });
  }
} 