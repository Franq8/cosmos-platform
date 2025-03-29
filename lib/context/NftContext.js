import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { useFirebase } from '../firebase/useFirebase';
import { useUser } from '../firebase/userContext';

const NftContext = createContext();

export function NftProvider({ children }) {
  // Stato principale
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [selectedArchetypes, setSelectedArchetypes] = useState([]);
  const [refreshToken, setRefreshToken] = useState(0);
  const [secondaryArchetypes, setSecondaryArchetypes] = useState({});
  const [secondaryArchetypesLoading, setSecondaryArchetypesLoading] = useState(false);
  
  // Firebase
  const firebase = useFirebase();
  const user = useUser();
  
  // Contatore delle immagini caricate
  const [loadedImages, setLoadedImages] = useState(0);
  
  // Incrementa il contatore quando un'immagine è caricata
  const handleImageLoad = useCallback(() => {
    setLoadedImages(prev => prev + 1);
  }, []);
  
  // Ottiene tutti gli archetipi disponibili
  const fetchArchetypes = useCallback(async () => {
    try {
      const response = await fetch('/api/archetypes');
      if (!response.ok) throw new Error('Errore nel caricamento degli archetipi');
      const data = await response.json();
      return data;
    } catch (err) {
      console.error('Errore nel recupero degli archetipi:', err);
      return [];
    }
  }, []);
  
  // Recupera gli NFT dal server
  const fetchNfts = useCallback(async (page = 1, selectedArchetypes = [], reset = false) => {
    try {
      setLoading(true);
      console.log("Richiesta NFT:", { page, archetipi: selectedArchetypes });
      
      // Costruisci l'URL dell'API con parametri
      let url = `/api/nfts?page=${page}&rerender=${refreshToken}`;
      
      // Aggiungi gli archetipi selezionati, se presenti
      if (selectedArchetypes && selectedArchetypes.length > 0) {
        // Usiamo lo stesso parametro più volte per passare array
        selectedArchetypes.forEach(archetype => {
          url += `&archetype=${encodeURIComponent(archetype)}`;
        });
      }
      
      console.log("URL API:", url);
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Errore nella richiesta: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Risposta API:", { 
        nftCount: data.results?.length || 0, 
        totale: data.pagination?.totalItems || 0,
        hasMore: data.pagination?.hasMore || false 
      });
      
      // Resetta lo stato se richiesto
      if (reset) {
        setNfts(data.results || []);
        setLoadedImages(0); // Resetta il contatore delle immagini
      } else {
        // Altrimenti, aggiungi i nuovi NFT a quelli esistenti
        setNfts(prev => [...prev, ...(data.results || [])]);
      }
      
      setHasMore(data.pagination?.hasMore || false);
      setError(null);
    } catch (err) {
      console.error('Errore nel recupero degli NFT:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [refreshToken]);
  
  // Gestisce il like di un NFT
  const likeNft = useCallback((nftId) => {
    setNfts(prevNfts => 
      prevNfts.map(nft => 
        nft.id === nftId 
          ? { ...nft, likes: (nft.likes || 0) + 1 } 
          : nft
      )
    );
  }, []);
  
  // Carica la pagina successiva di NFT
  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchNfts(nextPage, selectedArchetypes);
    }
  }, [loading, hasMore, page, selectedArchetypes, fetchNfts]);
  
  // Aggiorna gli archetipi selezionati e ricarica gli NFT
  const updateSelectedArchetypes = useCallback((archetypes) => {
    console.log("Aggiornamento archetipi selezionati:", archetypes);
    setSelectedArchetypes(archetypes);
    setPage(1); // Torna alla prima pagina
    fetchNfts(1, archetypes, true); // Recupera nuovi NFT con reset
  }, [fetchNfts]);
  
  // Recupera gli archetipi secondari per un NFT specifico
  const getSecondaryArchetypesForNft = useCallback((nftId) => {
    return secondaryArchetypes[nftId] || [];
  }, [secondaryArchetypes]);
  
  // Carica gli archetipi secondari dal server se sono cambiati gli NFT o gli archetipi selezionati
  useEffect(() => {
    const loadSecondaryArchetypes = async () => {
      if (nfts.length === 0) return;
      
      setSecondaryArchetypesLoading(true);
      try {
        // Si potrebbe implementare un'API specifica per recuperare gli archetipi secondari
        // In questo esempio, simuliamo un delay e restituiamo dati vuoti
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Simulazione dati: ogni NFT ha gli stessi archetipi secondari
        const archetypesData = {};
        nfts.forEach(nft => {
          archetypesData[nft.id] = []; // Collezione vuota per ora
        });
        
        setSecondaryArchetypes(archetypesData);
      } catch (error) {
        console.error("Errore nel caricamento degli archetipi secondari:", error);
      } finally {
        setSecondaryArchetypesLoading(false);
      }
    };
    
    loadSecondaryArchetypes();
  }, [nfts]);
  
  // Carica gli NFT all'avvio o quando cambiano i filtri
  useEffect(() => {
    // Solo nel client, non durante SSR
    if (typeof window !== 'undefined') {
      fetchNfts(1, selectedArchetypes, true);
    }
  }, [fetchNfts, selectedArchetypes]);
  
  // Valore del contesto con tutti i metodi e gli stati
  const contextValue = {
    nfts,
    loading,
    error,
    hasMore,
    loadMore,
    selectedArchetypes,
    updateSelectedArchetypes,
    likeNft,
    loadedImages,
    handleImageLoad,
    fetchArchetypes,
    getSecondaryArchetypesForNft,
    secondaryArchetypesLoading,
    refreshData: () => setRefreshToken(prev => prev + 1)
  };
  
  return (
    <NftContext.Provider value={contextValue}>
      {children}
    </NftContext.Provider>
  );
}

export const useNfts = () => useContext(NftContext); 