import { db } from '../../../lib/firebase/firebase';
import { collection, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';

// API route per gestire gli archetipi
export default async function handler(req, res) {
  // Gestione delle richieste GET - Lista di tutti gli archetipi
  if (req.method === 'GET') {
    try {
      const archetypesCol = collection(db, 'archetypes');
      const archetypeSnapshot = await getDocs(archetypesCol);
      const archetypes = archetypeSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      return res.status(200).json({ archetypes });
    } catch (error) {
      console.error('Errore durante il recupero degli archetipi:', error);
      return res.status(500).json({ message: 'Errore interno del server', error: error.message });
    }
  }
  
  // Gestione delle richieste POST - Creazione di un nuovo archetipo
  if (req.method === 'POST') {
    try {
      const { name } = req.body;
      
      if (!name || typeof name !== 'string' || name.trim() === '') {
        return res.status(400).json({ message: 'Nome dell\'archetipo mancante o non valido' });
      }
      
      // Normalizza il nome (prima lettera maiuscola, resto minuscolo)
      const formattedName = name.trim();
      
      // Controlla se l'archetipo esiste già
      const archetypesCol = collection(db, 'archetypes');
      const archetypeSnapshot = await getDocs(archetypesCol);
      const existingArchetype = archetypeSnapshot.docs.find(
        doc => doc.data().name.toLowerCase() === formattedName.toLowerCase()
      );
      
      if (existingArchetype) {
        return res.status(409).json({ 
          message: 'Archetipo già esistente',
          archetype: {
            id: existingArchetype.id,
            ...existingArchetype.data()
          }
        });
      }
      
      // Crea un nuovo archetipo
      const newArchetype = await addDoc(collection(db, 'archetypes'), {
        name: formattedName,
        createdAt: serverTimestamp()
      });
      
      return res.status(201).json({ 
        message: 'Archetipo creato con successo',
        archetype: {
          id: newArchetype.id,
          name: formattedName
        }
      });
    } catch (error) {
      console.error('Errore durante la creazione dell\'archetipo:', error);
      return res.status(500).json({ message: 'Errore interno del server', error: error.message });
    }
  }
  
  // Metodo non consentito
  return res.status(405).json({ message: 'Metodo non consentito' });
} 