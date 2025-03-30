import { db } from '../../lib/firebase/firebase';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';

export default async function handler(req, res) {
  // Estrai parametri dalla query
  const { page = 1, pageSize = 30, archetype, rerender = 0 } = req.query;
  
  console.log('API /nfts ricevuta:', { archetype, page, pageSize, rerender });
  
  try {
    // Costruisci la query base
    let nftsQuery = collection(db, 'nfts');
    
    // Esegui la query
    const snapshot = await getDocs(nftsQuery);
    const results = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Ordiniamo i risultati per ID numerico
    results.sort((a, b) => parseInt(a.id) - parseInt(b.id));
    
    // Filtra per archetipo se specificato
    let filteredResults = results;
    if (archetype) {
      const archetypes = Array.isArray(archetype) ? archetype : [archetype];
      console.log(`Filtrando per ${archetypes.length} archetipi:`, archetypes);
      
      filteredResults = results.filter(nft => 
        archetypes.every(a => 
          nft.archetype && 
          nft.archetype.toLowerCase() === a.toLowerCase()
        )
      );
      
      console.log(`Dopo filtraggio: ${filteredResults.length} NFT corrispondono`);
    }
    
    // Applichiamo la paginazione
    const startIndex = (parseInt(page) - 1) * parseInt(pageSize);
    const endIndex = startIndex + parseInt(pageSize);
    
    // Calcola se ci sono più pagine prima di applicare la paginazione
    const hasMore = endIndex < filteredResults.length;
    
    // Applica la paginazione
    filteredResults = filteredResults.slice(startIndex, endIndex);
    
    // Log degli ID restituiti
    console.log(`Restituendo ${filteredResults.length} NFT (pagina ${page})`);
    console.log('IDs restituiti:', filteredResults.map(n => n.id).join(', '));
    
    // Restituisci i risultati
    res.status(200).json({
      results: filteredResults,
      pagination: {
        page: parseInt(page),
        pageSize: parseInt(pageSize),
        hasMore
      }
    });
  } catch (error) {
    console.error('Errore nel recupero degli NFT:', error);
    res.status(500).json({ error: 'Errore nel recupero degli NFT' });
  }
} 