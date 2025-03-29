import nftsData from '../../data/nfts_with_stars.json';

export default function handler(req, res) {
  // Estrai parametri dalla query
  const { archetype, page = 1, pageSize = 30, rerender } = req.query;
  const archetypes = archetype ? Array.isArray(archetype) ? archetype : [archetype] : null;
  
  console.log("API /nfts ricevuta:", { 
    archetype: archetypes, 
    page, 
    pageSize, 
    rerender,
    totalNFTs: nftsData.length 
  });
  
  // Verifica se ci sono NFT con dati image non validi
  const invalidImages = nftsData.filter(nft => !nft.image).map(nft => nft.id);
  if (invalidImages.length > 0) {
    console.warn(`⚠️ Trovati ${invalidImages.length} NFT senza campo image:`, invalidImages);
  }
  
  // Filtra NFT in base agli archetipi selezionati
  let filteredNfts = [...nftsData];
  
  if (archetypes && archetypes.length > 0) {
    console.log(`Filtrando per ${archetypes.length} archetipi:`, archetypes);
    
    // Normalizza i nomi degli archetipi (rimuove spazi extra, converte a lowercase)
    const normalizedArchetypes = archetypes.map(a => a.trim().toLowerCase());
    
    // IMPORTANTE: In questo momento, stiamo filtrando solo in base all'archetipo principale
    // poiché i dati secondari non sono ancora implementati nel database.
    // Quando implementiamo gli archetipi secondari basati sui voti, dovremo modificare questa logica
    // per considerare sia l'archetipo principale che quelli secondari.
    
    // NUOVA IMPLEMENTAZIONE: Logica AND per più archetipi
    filteredNfts = filteredNfts.filter(nft => {
      // Per il momento, consideriamo solo l'archetipo principale
      const nftArchetype = nft.archetype?.trim().toLowerCase();
      
      // Se l'NFT ha archetipi secondari (li avrà quando implementeremo il sistema di voti)
      // li dovremmo considerare qui.
      // Se secondaryArchetypes fosse un array presente nell'NFT, potremmo fare:
      //
      // const secondaryArchetypesLower = nft.secondaryArchetypes?.map(a => a.name?.trim().toLowerCase()) || [];
      // const allNftArchetypes = [nftArchetype, ...secondaryArchetypesLower];
      
      // Per ora, consideriamo solo l'archetipo principale
      const allNftArchetypes = [nftArchetype];
      
      // Per la logica AND, TUTTI gli archetipi selezionati devono essere presenti nell'NFT
      return normalizedArchetypes.every(selectedArchetype => 
        allNftArchetypes.includes(selectedArchetype)
      );
    });
    
    console.log(`Dopo filtraggio: ${filteredNfts.length} NFT corrispondono`);
    
    // NOTA: Con il sistema di voti, quando un NFT avrà archetipi secondari,
    // la logica sopra dovrà essere modificata per includere questi archetipi secondari
    // nella verifica. Attualmente, è impossibile trovare NFT con più archetipi diversi
    // perché ogni NFT ha un solo archetipo principale.
  }
  
  // Ordina per ID in ordine crescente
  filteredNfts.sort((a, b) => a.id - b.id);
  
  // Calcola informazioni di paginazione
  const startIndex = (parseInt(page) - 1) * parseInt(pageSize);
  const endIndex = startIndex + parseInt(pageSize);
  
  // Ottieni i risultati per la pagina corrente
  const results = filteredNfts.slice(startIndex, endIndex);
  
  // Verifica se ci sono più pagine
  const hasMore = endIndex < filteredNfts.length;
  
  // Log dei risultati per debugging
  console.log(`Restituendo ${results.length} NFT (pagina ${page}/${Math.ceil(filteredNfts.length/pageSize)})`);
  console.log(`IDs restituiti:`, results.map(nft => nft.id).join(', '));
  
  // Normalizza i nomi dei file immagine se mancano
  const resultsWithImages = results.map(nft => {
    // Se l'NFT non ha un campo image, aggiungilo
    if (!nft.image) {
      const normalizedArchetype = nft.archetype?.replace(/\s+/g, '_') || 'Unknown';
      
      // Controlla se è noto che questo NFT è un GIF
      const isGif = nft.id === 243 || nft.id === 231 || nft.id === 80 || nft.id === 70 || 
                   nft.id === 76 || nft.id === 156 ||
                   nft.id === 90 || nft.id === 101 || nft.id === 102 || nft.id === 111 || 
                   nft.id === 112 || nft.id === 123 || nft.id === 125 || nft.id === 126 || 
                   nft.id === 127 || nft.id === 129;
      
      // Costruisci il nome file corretto
      nft.image = `${normalizedArchetype}_${nft.id}${isGif ? '.gif' : '.png'}`;
      console.log(`⚠️ Aggiunto campo image mancante per NFT ${nft.id}: ${nft.image}`);
    }
    return nft;
  });
  
  // Restituisci i risultati con metadata di paginazione
  res.status(200).json({
    results: resultsWithImages,
    pagination: {
      page: parseInt(page),
      pageSize: parseInt(pageSize),
      totalItems: filteredNfts.length,
      hasMore
    }
  });
} 