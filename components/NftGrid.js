import { useState, useEffect, useRef } from 'react';
import { useNfts } from '../lib/context/NftContext';
import NftCard from './NftCard';

export default function NftGrid() {
  // Utilizziamo più variabili di stato per una migliore gestione
  const [loadedImages, setLoadedImages] = useState({});
  const [visibleNfts, setVisibleNfts] = useState(0);
  const [totalNftsLoaded, setTotalNftsLoaded] = useState(0);
  const [failedLoads, setFailedLoads] = useState([]);
  const gridRef = useRef(null);

  // Recuperiamo i dati dal NftContext
  const { 
    nfts, 
    loading, 
    loadMore, 
    hasMore, 
    error, 
    isSelecting, 
    selectedArchetypes,
    showOnlyStarred
  } = useNfts();

  // Gestione migliore del conteggio NFT
  useEffect(() => {
    if (nfts) {
      setTotalNftsLoaded(nfts.length);
      
      // Calcola il numero di NFT attualmente visibili in base ai filtri e alle immagini caricate
      const newVisibleNfts = nfts.filter(nft => {
        // L'NFT è considerato visibile se:
        // 1. Non sono selezionati archetipi specifici OPPURE
        // 2. L'archetipo dell'NFT è tra quelli selezionati
        const matchesArchetypeFilter = !selectedArchetypes.length || 
          selectedArchetypes.includes(nft.archetype);
        
        // 3. Se showOnlyStarred è attivo, l'NFT deve avere stars
        const matchesStarFilter = !showOnlyStarred || 
          (nft.stars && nft.stars.includes('⭐'));
        
        return matchesArchetypeFilter && matchesStarFilter;
      }).length;
      
      setVisibleNfts(newVisibleNfts);
    }
  }, [nfts, selectedArchetypes, showOnlyStarred, loadedImages]);

  // Traccia le immagini caricate con successo
  const handleImageLoaded = (nftId) => {
    setLoadedImages(prev => ({
      ...prev,
      [nftId]: true
    }));
  };

  // Traccia le immagini che falliscono il caricamento
  const handleImageError = (nftId) => {
    if (!failedLoads.includes(nftId)) {
      setFailedLoads(prev => [...prev, nftId]);
    }
  };

  // Gestione dello scroll infinito
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && hasMore && !loading && !isSelecting) {
          loadMore();
        }
      },
      { threshold: 0.5 }
    );

    const currentRef = gridRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [hasMore, loading, loadMore, isSelecting]);

  return (
    <div className="w-full">
      {/* Informazioni di diagnostica - Visualizzate solo in modalità sviluppo */}
      <div className="mb-6 px-4 py-3 bg-gray-100 rounded-md text-sm">
        <h3 className="font-semibold mb-2">Informazioni di caricamento:</h3>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
          <div>NFT totali caricati:</div>
          <div>{totalNftsLoaded}</div>
          
          <div>NFT visibili (dopo i filtri):</div>
          <div>{visibleNfts}</div>
          
          <div>Archetipi selezionati:</div>
          <div>{selectedArchetypes.length ? selectedArchetypes.join(', ') : 'Tutti'}</div>
          
          <div>Altre pagine disponibili:</div>
          <div>{hasMore ? 'Sì' : 'No'}</div>
          
          {failedLoads.length > 0 && (
            <>
              <div>NFT con problemi di caricamento:</div>
              <div>{failedLoads.length} (IDs: {failedLoads.slice(0, 5).join(', ')}{failedLoads.length > 5 ? '...' : ''})</div>
            </>
          )}
        </div>
      </div>
      
      {/* NFT Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {/* Carte degli NFT */}
        {nfts.map((nft) => {
          // Se ci sono archetipi selezionati, mostra solo gli NFT con quegli archetipi
          if (selectedArchetypes.length > 0 && !selectedArchetypes.includes(nft.archetype)) {
            return null;
          }
          
          // Se showOnlyStarred è true, mostra solo NFT con stelle
          if (showOnlyStarred && (!nft.stars || !nft.stars.includes('⭐'))) {
            return null;
          }
          
          return (
            <NftCard 
              key={nft.id} 
              nft={nft} 
              onImageLoad={() => handleImageLoaded(nft.id)}
              onImageError={() => handleImageError(nft.id)}
            />
          );
        })}
        
        {/* Scheletri durante il caricamento */}
        {loading && Array.from({ length: 8 }).map((_, index) => (
          <div key={`loading-${index}`} className="rounded-lg overflow-hidden shadow-md bg-white animate-pulse">
            <div className="bg-gray-200 h-48 md:h-56 w-full"></div>
            <div className="p-3">
              <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-8"></div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Riferimento per l'intersezione dell'infinite scroll */}
      <div ref={gridRef} className="h-10 mt-4"></div>
      
      {/* Mostra errori di caricamento */}
      {error && (
        <div className="text-red-500 text-center py-4">
          Si è verificato un errore durante il caricamento degli NFT: {error}
        </div>
      )}
    </div>
  );
} 