import { db } from '../../../../lib/firebase/firebase';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';

// API route per ottenere gli archetipi secondari di un NFT
export default async function handler(req, res) {
  // Permettiamo solo richieste GET
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Metodo non consentito' });
  }

  try {
    const { id } = req.query;
    
    if (!id) {
      return res.status(400).json({ message: 'ID NFT mancante' });
    }
    
    // Ottieni archetipo primario dell'NFT
    const nftDoc = await getDoc(doc(db, 'nfts', id));
    if (!nftDoc.exists()) {
      return res.status(404).json({ message: 'NFT non trovato' });
    }
    
    const primaryArchetype = nftDoc.data().archetype;
    
    // Ottieni gli archetipi secondari (quelli con voti positivi)
    const archetypesCol = collection(db, 'nft_archetypes');
    const archetypesQuery = query(
      archetypesCol, 
      where("nftId", "==", id),
      where("voteCount", ">", 0)
    );
    const archetypesSnapshot = await getDocs(archetypesQuery);
    
    // Otteniamo solo gli ID degli archetipi secondari
    const archetypeIds = archetypesSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        archetypeId: data.archetypeId,
        voteCount: data.voteCount
      };
    });
    
    // Ora otteniamo i dettagli completi di ciascun archetipo
    const archetypes = [];
    for (const archetype of archetypeIds) {
      const archetypeDoc = await getDoc(doc(db, 'archetypes', archetype.archetypeId));
      if (archetypeDoc.exists()) {
        archetypes.push({
          id: archetypeDoc.id,
          name: archetypeDoc.data().name,
          voteCount: archetype.voteCount
        });
      }
    }
    
    // Restituisci entrambi i dati
    return res.status(200).json({ 
      primary: primaryArchetype,
      secondary: archetypes
    });
  } catch (error) {
    console.error('Errore durante il recupero degli archetipi secondari:', error);
    return res.status(500).json({ message: 'Errore interno del server', error: error.message });
  }
} 