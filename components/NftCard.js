import { useState, useEffect } from 'react';
// Rimuovo o rinomino l'import di Image da next/image che causa conflitto
// import Image from 'next/image';
import { useNfts } from '../lib/context/NftContext';

export default function NftCard({ nft, onImageLoad, onImageError }) {
  const [loaded, setLoaded] = useState(false);
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  const [showModal, setShowModal] = useState(false);
  const { getSecondaryArchetypesForNft, likeNft } = useNfts();
  
  // Memorizziamo i secondaryArchetypes per evitare chiamate ripetute
  const secondaryArchetypes = getSecondaryArchetypesForNft(nft?.id);
  
  // Controlla se c'è una GIF per questo NFT (casi specifici)
  const isGif = nft.id === 243 || nft.id === 231 || nft.id === 80 || nft.id === 70 || 
               nft.id === 76 || nft.id === 156 ||
               nft.id === 90 || nft.id === 101 || nft.id === 102 || nft.id === 111 || 
               nft.id === 112 || nft.id === 123 || nft.id === 125 || nft.id === 126 || 
               nft.id === 127 || nft.id === 129 ||
               (nft.image && nft.image.toLowerCase().endsWith('.gif'));
  
  // Normalizza l'archetipo per la generazione del nome file
  const normalizeArchetype = (archetype) => {
    if (!archetype) return 'Unknown';
    return archetype.replace(/\s+/g, '_');
  };
  
  // Genera diversi pattern di possibili percorsi immagine
  const generatePossiblePaths = () => {
    const patterns = [];
    
    // Pattern 1: Usa direttamente il campo image se disponibile
    if (nft.image) {
      patterns.push(`/thumbnails/${nft.image}`);
    }
    
    const normalizedArchetype = normalizeArchetype(nft.archetype);
    const fileExt = isGif ? '.gif' : '.png';
    
    // Pattern 2: Archetipo normalizzato (spazi -> underscore)
    patterns.push(`/thumbnails/${normalizedArchetype}_${nft.id}${fileExt}`);
    
    // Pattern 3: Archetipo originale con spazi
    if (nft.archetype && nft.archetype !== normalizedArchetype) {
      patterns.push(`/thumbnails/${nft.archetype}_${nft.id}${fileExt}`);
    }
    
    // Pattern 4: Solo ID 
    patterns.push(`/thumbnails/${nft.id}${fileExt}`);
    
    // Pattern 5: Archetipo senza spazi (senza underscore)
    if (nft.archetype) {
      const noSpaceArchetype = nft.archetype.replace(/\s+/g, '');
      patterns.push(`/thumbnails/${noSpaceArchetype}_${nft.id}${fileExt}`);
    }
    
    // Pattern 6: Archetipo tutto lowercase
    if (nft.archetype) {
      const lowercaseArchetype = normalizedArchetype.toLowerCase();
      patterns.push(`/thumbnails/${lowercaseArchetype}_${nft.id}${fileExt}`);
    }
    
    // Rimuovi duplicati
    return [...new Set(patterns)];
  };
  
  const possiblePaths = generatePossiblePaths();
  const fallbackPath = '/placeholder.png';
  
  // Debug percorso immagine
  useEffect(() => {
    console.log(`Card - NFT ${nft.id} (${nft.archetype}) - Pattern di percorsi possibili:`, possiblePaths);
  }, [nft.id, nft.archetype, possiblePaths]);
  
  // Gestisce l'apertura della modale
  const handleOpenModal = () => {
    // Carica dinamicamente il componente modale
    import('./NftModal').then(modal => {
      // Una volta caricato il componente, mostra la modale
      setShowModal(true);
    });
  };
  
  // Usa una strategia a cascata per il percorso dell'immagine
  const [validImagePath, setValidImagePath] = useState(possiblePaths[0] || fallbackPath);
  const [currentPathIndex, setCurrentPathIndex] = useState(0);
  
  // Gestisce il tentativo di caricamento del percorso corrente
  const tryNextPath = () => {
    if (currentPathIndex < possiblePaths.length - 1) {
      // Prova il prossimo percorso
      const nextIndex = currentPathIndex + 1;
      setCurrentPathIndex(nextIndex);
      setValidImagePath(possiblePaths[nextIndex]);
      return true;
    }
    // Non ci sono più percorsi da provare
    setValidImagePath(fallbackPath);
    return false;
  };
  
  // Verifica l'esistenza dell'immagine
  useEffect(() => {
    if (!possiblePaths[currentPathIndex]) {
      setValidImagePath(fallbackPath);
      return;
    }
    
    const testPath = possiblePaths[currentPathIndex];
    console.log(`🔍 Card - NFT ${nft.id} - Tentativo ${currentPathIndex + 1}/${possiblePaths.length}: ${testPath}`);
    
    // Uso il costruttore Image nativo di JavaScript
    const img = new window.Image();
    
    img.onload = () => {
      console.log(`✅ Card: Immagine trovata per NFT ${nft.id}:`, testPath);
      setValidImagePath(testPath);
      setLoaded(true);
      // Salva le dimensioni reali per mantenere il rapporto
      setImageDimensions({
        width: img.naturalWidth,
        height: img.naturalHeight
      });
      if (onImageLoad) onImageLoad(nft.id);
    };
    
    img.onerror = () => {
      console.warn(`❌ Card: Percorso non valido per NFT ${nft.id}: ${testPath}`);
      if (!tryNextPath()) {
        console.error(`💥 Card: Tutti i percorsi falliti per NFT ${nft.id}, usando fallback`);
        if (onImageError) onImageError(nft.id);
        setLoaded(true); // Consideriamo comunque caricata l'immagine, anche se è il fallback
      }
    };
    
    img.src = testPath;
  }, [nft.id, currentPathIndex, possiblePaths, onImageLoad, onImageError]);
  
  // Aggiunge una class per evidenziare NFT con stelle
  const hasStars = nft.stars && nft.stars.includes('⭐');
  
  return (
    <>
      <div 
        className={`cosmic-card rounded-lg overflow-hidden shadow-md bg-white hover:shadow-lg transition-shadow duration-300 cursor-pointer transform hover:scale-105 ${hasStars ? 'cosmic-starred' : ''}`} 
        onClick={handleOpenModal}
      >
        {/* Contenitore immagine con proporzioni fisse */}
        <div 
          className="relative w-full overflow-hidden bg-[#F5F5F5]"
          style={{
            paddingBottom: '100%', // Mantiene un rapporto quadrato 1:1 di default
            aspectRatio: imageDimensions.width && imageDimensions.height 
              ? `${imageDimensions.width} / ${imageDimensions.height}` 
              : '1 / 1' // Rapporto predefinito se non abbiamo dimensioni
          }}
        >
          {/* Mostra skeleton finché l'immagine non è caricata */}
          {!loaded && (
            <div className="absolute inset-0 animate-pulse bg-gray-200"></div>
          )}
          
          {/* ID dell'NFT sempre visibile per debug */}
          <div className="absolute top-2 left-2 z-10 bg-black/60 text-white px-1 rounded text-xs">
            #{nft.id}
          </div>
          
          {/* Stelle in alto a destra */}
          {hasStars && (
            <div className="absolute top-2 right-2 z-10 text-xl">
              {nft.stars}
            </div>
          )}
          
          {/* Immagine effettiva */}
          <img
            src={validImagePath}
            alt={`${nft.archetype || 'NFT'} #${nft.id}`}
            className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-200 ${loaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={(e) => {
              setLoaded(true);
              // Salva le dimensioni reali per calcolare il corretto aspect ratio
              if (e.target) {
                setImageDimensions({
                  width: e.target.naturalWidth,
                  height: e.target.naturalHeight
                });
              }
              if (onImageLoad) onImageLoad(nft.id);
            }}
            onError={(e) => {
              // Prova con il prossimo percorso
              if (!tryNextPath()) {
                // In caso di errore e nessun altro percorso disponibile, imposta il fallback
                console.error(`Fallimento finale per NFT ${nft.id}, usando fallback`);
                e.target.src = fallbackPath;
                if (onImageError) onImageError(nft.id);
                setLoaded(true);
              }
            }}
          />
        </div>
        
        {/* Dettagli dell'NFT */}
        <div className="p-3">
          <h3 className="text-[#333] font-semibold text-md mb-1 truncate">
            {nft.archetype || 'NFT'} #{nft.id}
          </h3>
          
          {/* Archetipi */}
          <div className="flex flex-wrap gap-1 mb-2">
            {/* Archetipo principale */}
            <span className={`text-xs px-2 py-0.5 rounded-full ${getArchetypeColor(nft.archetype)}`}>
              {nft.archetype || 'Unknown'}
            </span>
            
            {/* Archetipi secondari (se presenti) */}
            {secondaryArchetypes && secondaryArchetypes.slice(0, 1).map(archetype => (
              <span 
                key={archetype.id}
                className={`text-xs px-2 py-0.5 rounded-full ${getArchetypeColor(archetype.name)}`}
              >
                {archetype.name}
              </span>
            ))}
            
            {/* Indicatore di più archetipi */}
            {secondaryArchetypes && secondaryArchetypes.length > 1 && (
              <span className="text-xs text-gray-500">+{secondaryArchetypes.length - 1}</span>
            )}
          </div>
          
          {/* Pulsante cuore/like */}
          <div className="flex justify-end items-center">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                likeNft(nft.id);
              }}
              className="text-[#FF6A5A] hover:text-[#E05A4A]"
            >
              ♥ {nft.likes || 0}
            </button>
          </div>
        </div>
      </div>
      
      {/* Modale NFT */}
      {showModal && (
        <div id={`modal-${nft.id}`} style={{ display: 'block' }}>
          {/* Carica il modale dinamicamente */}
          {(() => {
            const NftModal = require('./NftModal').default;
            return <NftModal nft={nft} onClose={() => setShowModal(false)} />;
          })()}
        </div>
      )}
    </>
  );
}

// Funzione helper per ottenere il colore dell'archetipo
function getArchetypeColor(archetype) {
  // Mappa di colori per archetipi
  const colorMap = {
    'AI Golem': 'bg-[#6B46C1] text-white',
    'Alien': 'bg-[#3B82F6] text-white',
    'Angel': 'bg-[#FBBF24] text-black',
    'Black Star': 'bg-[#111111] text-white',
    'Crystal Children': 'bg-[#A78BFA] text-white',
    'Enchanter': 'bg-[#EC4899] text-white',
    'Engineer': 'bg-[#F59E0B] text-black',
    'Glitch Starfighter': 'bg-[#10B981] text-white',
    'Hunter': 'bg-[#059669] text-white',
    'Monk': 'bg-[#D97706] text-white',
    'Monster': 'bg-[#DC2626] text-white',
    'Moon': 'bg-[#6B7280] text-white',
    'Royalty': 'bg-[#8B5CF6] text-white',
    'Shapeshifter': 'bg-[#0284C7] text-white',
    'Spaceman': 'bg-[#4B5563] text-white',
    'Starseed': 'bg-[#7C3AED] text-white',
    'Sun': 'bg-[#F59E0B] text-black',
    'Toy Box': 'bg-[#EF4444] text-white',
    'Warlord': 'bg-[#B91C1C] text-white'
  };
  
  return colorMap[archetype] || 'bg-gray-500 text-white';
} 