import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  updateDoc, 
  doc, 
  getDoc, 
  deleteDoc, 
  setDoc,
  increment,
  arrayUnion,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './firebase';

export function useFirebase() {
  // Funzioni per gestire gli archetipi
  const getArchetypes = async () => {
    try {
      console.log("Inizio getArchetypes");
      const archetypesCol = collection(db, 'archetypes');
      const archetypeSnapshot = await getDocs(archetypesCol);
      const result = archetypeSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      console.log("Fine getArchetypes, trovati:", result.length);
      return result;
    } catch (error) {
      console.error("Errore in getArchetypes:", error);
      return [];
    }
  };

  // Funzione per ottenere i voti degli archetipi per un NFT
  const getArchetypeVotes = async (nftId) => {
    try {
      console.log(`Inizio getArchetypeVotes per NFT ${nftId}`);
      const votesCol = collection(db, 'archetype_votes');
      const votesQuery = query(votesCol, where("nftId", "==", nftId));
      const votesSnapshot = await getDocs(votesQuery);
      
      // Organizziamo i voti per archetipo
      const votes = {};
      votesSnapshot.docs.forEach(doc => {
        const data = doc.data();
        if (!votes[data.archetypeId]) {
          votes[data.archetypeId] = {
            totalVotes: 0,
            userVotes: {}
          };
        }
        votes[data.archetypeId].totalVotes += data.voteValue;
        votes[data.archetypeId].userVotes[data.userId] = data.voteValue;
      });
      
      console.log(`Fine getArchetypeVotes, trovati ${votesSnapshot.docs.length} voti`);
      return votes;
    } catch (error) {
      console.error(`Errore in getArchetypeVotes per NFT ${nftId}:`, error);
      return {};
    }
  };
  
  // Funzione per votare un archetipo
  const voteArchetype = async (nftId, archetypeId, userId, voteValue) => {
    try {
      console.log(`Inizio voteArchetype: NFT=${nftId}, archetype=${archetypeId}, user=${userId}, vote=${voteValue}`);
      
      // Verifica se l'utente ha già votato questo archetipo
      const votesCol = collection(db, 'archetype_votes');
      const votesQuery = query(
        votesCol, 
        where("nftId", "==", nftId),
        where("archetypeId", "==", archetypeId),
        where("userId", "==", userId)
      );
      const existingVotes = await getDocs(votesQuery);
      
      if (!existingVotes.empty) {
        // L'utente ha già votato, aggiorna il voto esistente
        const voteDoc = existingVotes.docs[0];
        const currentVote = voteDoc.data().voteValue;
        
        console.log(`L'utente ha già votato questo archetipo: voto attuale=${currentVote}, nuovo voto=${voteValue}`);
        
        // Se il valore del voto è uguale a quello esistente, non fare nulla
        if (currentVote === voteValue) {
          console.log(`Nessuna modifica al voto`);
          return false;
        }
        
        // Aggiorna il voto
        await updateDoc(doc(db, 'archetype_votes', voteDoc.id), {
          voteValue: voteValue,
          updatedAt: serverTimestamp()
        });
        
        console.log(`Voto aggiornato da ${currentVote} a ${voteValue}`);
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
        
        console.log(`Nuovo voto creato con ID: ${newVote.id}`);
      }
      
      // Aggiorna il conteggio totale sull'NFT
      const nftArchetypesRef = doc(db, 'nft_archetypes', `${nftId}_${archetypeId}`);
      const nftArchetypeDoc = await getDoc(nftArchetypesRef);
      
      if (nftArchetypeDoc.exists()) {
        // Aggiorna il conteggio esistente
        await updateDoc(nftArchetypesRef, {
          voteCount: increment(voteValue),
          updatedAt: serverTimestamp()
        });
        
        console.log(`Conteggio voti aggiornato per archetipo esistente`);
      } else {
        // Crea un nuovo documento se non esiste
        await setDoc(nftArchetypesRef, {
          nftId,
          archetypeId,
          voteCount: voteValue,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        
        console.log(`Creato nuovo conteggio voti per archetipo`);
      }
      
      console.log(`Fine voteArchetype con successo`);
      return true;
    } catch (error) {
      console.error(`Errore in voteArchetype:`, error);
      return false;
    }
  };
  
  // Funzione per ottenere gli archetipi secondari di un NFT - versione semplificata
  const getSecondaryArchetypes = async (nftId) => {
    try {
      // Usa una sola query semplice con nftId
      const archetypesCol = collection(db, 'nft_archetypes');
      const archetypesQuery = query(
        archetypesCol, 
        where("nftId", "==", nftId)
      );
      const archetypesSnapshot = await getDocs(archetypesQuery);
      
      // Filtra i documenti con voteCount > 0 in JavaScript
      const filteredDocs = archetypesSnapshot.docs.filter(doc => {
        const data = doc.data();
        return data.voteCount > 0;
      });
      
      // Otteniamo solo gli ID degli archetipi secondari
      const archetypeIds = filteredDocs.map(doc => {
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
      
      return archetypes;
    } catch (error) {
      console.error(`Errore in getSecondaryArchetypes per NFT ${nftId}:`, error);
      return [];
    }
  };

  return {
    getArchetypes,
    getArchetypeVotes,
    voteArchetype,
    getSecondaryArchetypes
  };
} 