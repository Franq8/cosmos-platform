import { db } from '../../../lib/firebase/firebase';
import { collection, query, where, getDocs, addDoc, updateDoc, doc, getDoc, setDoc, increment, serverTimestamp } from 'firebase/firestore';

// API route per gestire i voti agli archetipi
export default async function handler(req, res) {
  // Permettiamo solo richieste POST
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Metodo non consentito' });
  }

  try {
    const { nftId, archetypeId, userId, voteValue } = req.body;

    // Validazione dei dati
    if (!nftId || !archetypeId || !userId || voteValue === undefined) {
      return res.status(400).json({ message: 'Dati mancanti. Richiesti: nftId, archetypeId, userId, voteValue' });
    }

    // Verifica se l'utente ha già votato questo archetipo
    const votesCol = collection(db, 'archetype_votes');
    const votesQuery = query(
      votesCol, 
      where("nftId", "==", nftId),
      where("archetypeId", "==", archetypeId),
      where("userId", "==", userId)
    );
    const existingVotes = await getDocs(votesQuery);
    
    let result;
    
    if (!existingVotes.empty) {
      // L'utente ha già votato, aggiorna il voto esistente
      const voteDoc = existingVotes.docs[0];
      const currentVote = voteDoc.data().voteValue;
      
      // Se il valore del voto è uguale a quello esistente, non fare nulla
      if (currentVote === voteValue) {
        return res.status(200).json({ 
          message: 'Nessuna modifica al voto',
          success: false
        });
      }
      
      // Aggiorna il voto
      await updateDoc(doc(db, 'archetype_votes', voteDoc.id), {
        voteValue: voteValue,
        updatedAt: serverTimestamp()
      });
      
      result = {
        updated: true,
        oldValue: currentVote,
        newValue: voteValue
      };
    } else {
      // L'utente non ha ancora votato, crea un nuovo voto
      const newVote = await addDoc(collection(db, 'archetype_votes'), {
        nftId,
        archetypeId,
        userId,
        voteValue,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      result = {
        created: true,
        id: newVote.id,
        value: voteValue
      };
    }
    
    // Aggiorna il conteggio totale sull'NFT
    const nftArchetypesRef = doc(db, 'nft_archetypes', `${nftId}_${archetypeId}`);
    const nftArchetypeDoc = await getDoc(nftArchetypesRef);
    
    if (nftArchetypeDoc.exists()) {
      // Aggiorna il conteggio esistente
      await updateDoc(nftArchetypesRef, {
        voteCount: increment(result.updated ? voteValue - result.oldValue : voteValue)
      });
    } else {
      // Crea un nuovo documento se non esiste
      await setDoc(nftArchetypesRef, {
        nftId,
        archetypeId,
        voteCount: voteValue,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    }
    
    return res.status(200).json({ 
      message: 'Voto registrato con successo',
      result,
      success: true
    });
  } catch (error) {
    console.error('Errore durante la gestione del voto:', error);
    return res.status(500).json({ message: 'Errore interno del server', error: error.message });
  }
} 