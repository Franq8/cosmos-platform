import { useState, useEffect, useRef } from 'react';
import { useFirebase } from '../lib/firebase/useFirebase';
import { useUser } from '../lib/firebase/userContext';
import { useNfts } from '../lib/context/NftContext';
import ImageWithFallback from '../components/ImageWithFallback';
import NextImage from 'next/image';

export default function NftModal({ nft, onClose }) {
  const [activeTab, setActiveTab] = useState('archetypes');
  const [archetypes, setArchetypes] = useState([]);
  const [stories, setStories] = useState([]);
  const [comments, setComments] = useState([]);
  const [newArchetype, setNewArchetype] = useState('');
  const [newStory, setNewStory] = useState('');
  const [archetypeVotes, setArchetypeVotes] = useState({});
  const [storyLikes, setStoryLikes] = useState({});
  const [animating, setAnimating] = useState(false);
  const [isReturning, setIsReturning] = useState(false);
  const [fromStoriesToArchetypes, setFromStoriesToArchetypes] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userVotes, setUserVotes] = useState({});
  const [isLiked, setIsLiked] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Hooks
  const firebase = useFirebase();
  const { getCurrentUserId, isAuthenticated } = useUser();
  const { getSecondaryArchetypesForNft, likeNft } = useNfts();
  
  // Per evitare di chiamare getSecondaryArchetypesForNft() ripetutamente,
  // memorizziamo il risultato in una variabile locale
  const secondaryArchetypes = getSecondaryArchetypesForNft(nft.id);
  
  // Gestisce il cambio di tab - ulteriormente semplificato
  const handleTabChange = (tab) => {
    if (tab === activeTab) return;
    
    // Store the previous tab before changing
    const prevTab = activeTab;
    
    setAnimating(true);
    setIsReturning(
      (tab === 'archetypes' && activeTab === 'stories') ||
      (tab === 'stories' && activeTab === 'comments') ||
      (tab === 'archetypes' && activeTab === 'comments')
    );
    
    // Set a flag when transitioning from stories to archetypes
    setFromStoriesToArchetypes(tab === 'archetypes' && prevTab === 'stories');
    
    setActiveTab(tab);
    
    // Reset dello stato di animazione dopo il completamento
    setTimeout(() => {
      setAnimating(false);
      setIsReturning(false);
      setFromStoriesToArchetypes(false);
    }, 1200); // Corrisponde alla durata dell'animazione (1.2s)
  };
  
  // Carica gli archetipi disponibili e i voti
  useEffect(() => {
    // Creiamo un flag per evitare caricamenti duplicati
    const isLoaded = { current: false };
    
    const loadArchetypesAndVotes = async () => {
      // Se è già stato caricato, usciamo subito
      if (isLoaded.current) return;
      
      setIsLoading(true);
      try {
        console.log("Iniziando a caricare i dati per NFT ID:", nft.id);
        isLoaded.current = true; // Impostiamo subito il flag
        
        // Carica tutti gli archetipi disponibili
        const allArchetypes = await firebase.getArchetypes();
        
        // Debug
        console.log("Archetipi caricati:", allArchetypes);
        
        if (!allArchetypes || allArchetypes.length === 0) {
          console.error("Nessun archetipo trovato o formato dati non valido");
          setIsLoading(false);
          return;
        }
        
        // Filtra l'archetipo principale dell'NFT
        const filteredArchetypes = allArchetypes.filter(a => 
          a.name && typeof a.name === 'string' && 
          nft.archetype && typeof nft.archetype === 'string' &&
          a.name.toLowerCase() !== nft.archetype.toLowerCase()
        );
        
        console.log("Archetipi filtrati:", filteredArchetypes);
        setArchetypes(filteredArchetypes);
        
        // Carica i voti per gli archetipi di questo NFT
        const votesData = await firebase.getArchetypeVotes(nft.id);
        console.log("Voti archetipi:", votesData);
        
        if (votesData) {
          setArchetypeVotes(votesData);
          
          // Memorizza i voti dell'utente corrente
          const userId = getCurrentUserId();
          if (userId) {
            const userVotesMap = {};
            
            Object.entries(votesData).forEach(([archetypeId, voteData]) => {
              if (voteData.userVotes && voteData.userVotes[userId]) {
                userVotesMap[archetypeId] = voteData.userVotes[userId];
              }
            });
            
            setUserVotes(userVotesMap);
          }
        }
        
        // Carica le storie (temporaneo)
    setStories([
      { id: 1, text: 'Questo NFT rappresenta l\'armonia cosmica...', likes: 5 },
      { id: 2, text: 'Una storia di esplorazione e scoperta...', likes: 3 },
    ]);
        
        console.log("Tutti i dati caricati con successo");
      } catch (error) {
        console.error('Errore nel caricamento dei dati:', error);
        // In caso di errore, impostiamo comunque degli archetipi vuoti per evitare il caricamento infinito
        setArchetypes([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadArchetypesAndVotes();
    
    // La funzione di pulizia
    return () => {
      // Se smontiamo il componente, possiamo impostare isLoaded.current = false
      // Tuttavia, poiché è una variabile locale, sarà comunque eliminata
    };
  // Dipendenze vuote, carica solo una volta al montaggio del componente
  }, []);
  
  // Mapping colori per archetipo
  const getArchetypeColor = (archetypeName) => {
    if (!archetypeName || typeof archetypeName !== 'string') {
      return { color: '#FF6A5A', textColor: 'white' };
    }
    
    const archetypeColorMap = {
      'Monster': { color: '#FF6A5A', textColor: 'white' },
      'Hunter': { color: '#E17A56', textColor: 'white' },
      'Shapeshifter': { color: '#FF8C94', textColor: 'white' },
      'Monk': { color: '#41BFB3', textColor: 'white' },
      'Enchanter': { color: '#5394D6', textColor: 'white' },
      'Spaceman': { color: '#7EA1E5', textColor: 'white' },
      'Engineer': { color: '#F8D575', textColor: '#333' },
      'Black_Star': { color: '#333333', textColor: 'white' },
      'Royalty': { color: '#9979C1', textColor: 'white' },
      'Sun': { color: '#FFA45C', textColor: '#333' },
      'Moon': { color: '#C0E5F2', textColor: '#333' },
      'Crystal_Children': { color: '#CDB4DB', textColor: '#333' },
      'Warlord': { color: '#7D1D3F', textColor: 'white' },
      'AI_Golem': { color: '#495057', textColor: 'white' },
      'Alien': { color: '#8FC93A', textColor: '#333' },
      'Starseed': { color: '#E0FBFC', textColor: '#333' },
      'Toy_Box': { color: '#F4ACB7', textColor: '#333' },
      'Glitch_Starfighter': { color: '#00B4D8', textColor: 'white' }
    };
    
    // Normalizziamo il nome dell'archetipo per il confronto
    const formattedName = typeof archetypeName === 'string' 
      ? archetypeName.replace(/ /g, '_') 
      : '';
      
    return archetypeColorMap[formattedName] || { color: '#FF6A5A', textColor: 'white' };
  };
  
  // Gestione voto archetipo
  const handleArchetypeVote = async (archetypeId, voteValue) => {
    if (!isAuthenticated || !getCurrentUserId()) {
      // In una versione completa, qui mostreremmo un popup per il login
      alert('Per votare devi essere autenticato');
      return;
    }
    
    const userId = getCurrentUserId();
    console.log(`Tentativo di voto: archetipo=${archetypeId}, valore=${voteValue}, utente=${userId}`);
    
    // Controllo regole di business:
    // 1. Non può votare l'archetipo originale (già filtrato in caricamento)
    // 2. Il pulsante "-" è disabilitato se somma totale è 0
    
    // Blocca il voto negativo se il totale è 0
    const currentVotes = archetypeVotes[archetypeId]?.totalVotes || 0;
    if (voteValue < 0 && currentVotes <= 0) {
      console.log("Voto negativo bloccato perché il totale è già 0 o negativo");
      return;
    }
    
    try {
      // Chiama Firebase per registrare il voto
      const success = await firebase.voteArchetype(nft.id, archetypeId, userId, voteValue);
      
      if (success) {
        // Aggiorna localmente lo stato dei voti
        setArchetypeVotes(prev => {
          const newVotes = {...prev};
          if (!newVotes[archetypeId]) {
            newVotes[archetypeId] = { totalVotes: 0, userVotes: {} };
          }
          
          // Calcola la differenza per il totale
          // Se l'utente aveva già votato, togliamo prima quel voto
          const oldVote = newVotes[archetypeId].userVotes[userId] || 0;
          const voteDiff = voteValue - oldVote;
          
          // Aggiorna il totale e il voto dell'utente
          newVotes[archetypeId].totalVotes += voteDiff;
          newVotes[archetypeId].userVotes[userId] = voteValue;
          
          return newVotes;
        });
        
        // Aggiorna lo stato dei voti dell'utente
        setUserVotes(prev => ({
      ...prev,
          [archetypeId]: voteValue
        }));
        
        // Aggiorna gli archetipi secondari se necessario
        // Otteniamo il valore aggiornato dopo la modifica
        const currentVote = archetypeVotes[archetypeId]?.totalVotes || 0;
        const oldUserVote = userVotes[archetypeId] || 0;
        const voteDiff = voteValue - oldUserVote;
        const votesAfterUpdate = currentVote + voteDiff;
        
        console.log(`Aggiornamento voti: attuale=${currentVote}, diff=${voteDiff}, nuovo totale=${votesAfterUpdate}`);
        
        if (votesAfterUpdate > 0) {
          // Se votiamo positivamente, aggiungiamo/aggiorniamo l'archetipo secondario
          const archetype = archetypes.find(a => a.id === archetypeId);
          if (archetype) {
            const existingIndex = secondaryArchetypes.findIndex(a => a.id === archetypeId);
            if (existingIndex >= 0) {
              // Aggiorna l'archetipo esistente
              setSecondaryArchetypes(prev => {
                const newList = [...prev];
                newList[existingIndex] = {
                  ...newList[existingIndex],
                  voteCount: votesAfterUpdate
                };
                return newList;
              });
            } else {
              // Aggiungi nuovo archetipo secondario
              setSecondaryArchetypes(prev => [
                ...prev,
                { id: archetype.id, name: archetype.name, voteCount: votesAfterUpdate }
              ]);
            }
          }
        } else if (votesAfterUpdate <= 0) {
          // Se votiamo negativamente e il totale è <= 0, rimuoviamo l'archetipo dai secondari
          setSecondaryArchetypes(prev => 
            prev.filter(a => a.id !== archetypeId)
          );
        }
      }
    } catch (error) {
      console.error('Errore nel voto:', error);
      alert('Si è verificato un errore durante il voto');
    }
  };
  
  const handleLikeStory = (storyId) => {
    // Evita like multipli alla stessa storia
    if (storyLikes[storyId]) return;
    
    // Aggiorna i like localmente
    setStoryLikes(prev => ({
      ...prev,
      [storyId]: true
    }));
    
    // Aggiorna le storie
    setStories(prev => 
      prev.map(s => 
        s.id === storyId 
          ? { ...s, likes: s.likes + 1 } 
          : s
      )
    );
  };
  
  const addArchetype = async () => {
    if (!newArchetype.trim()) return;
    
    try {
      // In una versione completa, qui chiameremmo Firebase per aggiungere l'archetipo
      // Per ora aggiungiamo solo localmente
      const newId = Math.random().toString(36).substr(2, 9);
      const newArchetypeObj = { id: newId, name: newArchetype };
      
      setArchetypes(prev => [...prev, newArchetypeObj]);
    setNewArchetype('');
    } catch (error) {
      console.error('Errore nell\'aggiunta dell\'archetipo:', error);
      alert('Si è verificato un errore durante l\'aggiunta dell\'archetipo');
    }
  };
  
  const addStory = () => {
    if (!newStory.trim()) return;
    
    // Simula l'aggiunta di una nuova storia
    const newId = stories.length + 1;
    setStories([
      ...stories,
      { id: newId, text: newStory, likes: 0 }
    ]);
    setNewStory('');
  };
  
  // Controllo se c'è una GIF per questo NFT
  const isGif = nft.id === 243 || nft.id === 231 || nft.id === 80 || nft.id === 70 || 
               nft.id === 76 || nft.id === 156 ||
               nft.id === 90 || nft.id === 101 || nft.id === 102 || nft.id === 111 || 
               nft.id === 112 || nft.id === 123 || nft.id === 125 || nft.id === 126 || 
               nft.id === 127 || nft.id === 129 ||
               (nft.image && nft.image.toLowerCase().endsWith('.gif'));
  
  // Normalizza l'archetipo per la generazione del nome file
  const normalizeArchetype = (archetype) => {
    if (!archetype) return 'Unknown';
    // Sostituisce gli spazi con underscore
    return archetype.replace(/\s+/g, '_');
  };
  
  // Genera pattern di possibili nomi file
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
  const fallbackPath = `/placeholder.png`;
  
  // Debug percorso immagine
  useEffect(() => {
    console.log(`Modal - NFT ${nft.id} (${nft.archetype}) - Pattern di percorsi possibili:`, possiblePaths);
  }, [nft.id, nft.archetype, possiblePaths]);
  
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
    console.log(`🔍 Modale - NFT ${nft.id} - Tentativo ${currentPathIndex + 1}/${possiblePaths.length}: ${testPath}`);
    
    // Uso il costruttore Image nativo di JavaScript
    const img = new window.Image();
    
    img.onload = () => {
      console.log(`✅ Modale: Immagine trovata per NFT ${nft.id}:`, testPath);
      setValidImagePath(testPath);
      setImageLoaded(true);
    };
    
    img.onerror = () => {
      console.warn(`❌ Modale: Percorso non valido per NFT ${nft.id}: ${testPath}`);
      if (!tryNextPath()) {
        console.error(`💥 Modale: Tutti i percorsi falliti per NFT ${nft.id}, usando fallback`);
        setImageLoaded(true); // Consideriamo comunque caricata l'immagine, anche se è il fallback
      }
    };
    
    img.src = testPath;
  }, [nft.id, currentPathIndex, possiblePaths]);
  
  // Gestisci click esterno per chiudere la modale
  const modalRef = useRef(null);
  useEffect(() => {
    function handleClickOutside(event) {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    }
    
    // Aggiungi listener quando la modale è attiva
    document.addEventListener("mousedown", handleClickOutside);
    
    // Previeni lo scroll del body
    document.body.style.overflow = 'hidden';
    
    // Cleanup
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = 'auto';
    };
  }, [onClose]);
  
  // Ottieni colori per archetipo
  const { color, textColor } = getArchetypeColor(nft.archetype);
  
  // Funzione helper per ottenere il contenuto del tab attivo
  const getTabContent = () => {
    switch (activeTab) {
      case 'archetypes':
        return (
          <div className={`tab-content ${animating ? 'animate-slide-in' : ''} ${isReturning && !fromStoriesToArchetypes ? 'animate-slide-return' : ''}`}>
            {isLoading ? (
              <div className="animate-pulse space-y-3">
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                <div className="h-6 bg-gray-200 rounded w-2/3"></div>
              </div>
            ) : (
              <>
                {/* Visualizzazione archetipi secondari attivi */}
                {secondaryArchetypes && secondaryArchetypes.length > 0 && (
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-100">
                    <h4 className="text-sm font-bold mb-3 text-[#444] uppercase tracking-wide">Archetipi secondari</h4>
                    <div className="flex flex-wrap gap-2">
                      {secondaryArchetypes.map(archetype => {
                        if (!archetype || !archetype.name) return null;
                        const { color, textColor } = getArchetypeColor(archetype.name);
                        return (
                          <span 
                            key={archetype.id}
                            className="inline-block px-3 py-1 rounded-md text-sm font-medium shadow-sm"
                            style={{ backgroundColor: color, color: textColor }}
                          >
                            {archetype.name} <span className="font-bold">+{archetype.voteCount || 0}</span>
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}
                
                {/* Visualizzazione griglia archetipi */}
                <div className="mb-6 p-4 bg-white rounded-lg border border-gray-100 shadow-sm">
                  <h4 className="text-sm font-bold mb-3 text-[#444] uppercase tracking-wide">Archetipi disponibili</h4>
                  <p className="text-xs text-gray-500 mb-3">Vota gli archetipi più adatti a rappresentare questo NFT</p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {archetypes.map(archetype => {
                      const archetypeId = archetype.id;
                      const totalVotes = archetypeVotes[archetypeId]?.totalVotes || 0;
                      const userVote = userVotes[archetypeId] || 0;
                      const { color, textColor } = getArchetypeColor(archetype.name);
                      
                      return (
                        <div 
                          key={archetypeId} 
                          className={`flex justify-between items-center p-3 rounded-lg border ${totalVotes > 0 ? 'border-green-100 bg-green-50' : totalVotes < 0 ? 'border-red-100 bg-red-50' : 'border-gray-100 bg-white'}`}
                        >
                          <div className="flex items-center gap-2">
                            <span 
                              className="w-5 h-5 rounded-full flex-shrink-0 shadow-inner"
                              style={{ backgroundColor: color }}
                            ></span>
                            <span className="text-sm font-medium" title={archetype.name}>
                              {archetype.name}
                            </span>
                          </div>
              
                          <div className="flex items-center gap-1">
                            <div className="flex border border-gray-200 rounded-md overflow-hidden">
                              <button 
                                onClick={() => handleArchetypeVote(archetypeId, userVote < 0 ? 0 : -1)}
                                className={`px-2 py-1 ${userVote < 0 ? 'bg-red-500 text-white' : 'bg-white text-red-500 hover:bg-red-50'} ${totalVotes <= 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                                disabled={totalVotes <= 0}
                                title="Voto negativo"
                              >
                                -
                              </button>
                              <span className={`flex items-center justify-center px-2 py-1 min-w-[28px] font-medium ${totalVotes > 0 ? 'text-green-600' : totalVotes < 0 ? 'text-red-600' : 'text-gray-500'}`}>
                                {totalVotes}
                              </span>
                              <button 
                                onClick={() => handleArchetypeVote(archetypeId, userVote > 0 ? 0 : 1)}
                                className={`px-2 py-1 ${userVote > 0 ? 'bg-green-500 text-white' : 'bg-white text-green-500 hover:bg-green-50'}`}
                                title="Voto positivo"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>
        );
      
      case 'stories':
        return (
          <div className={`tab-content ${animating ? (isReturning ? 'animate-slide-return' : 'animate-slide-in') : ''}`}>
            <h3 className="text-lg font-medium mb-4 text-[#333]">Storie</h3>
            
            <div className="space-y-4 mb-6">
              {stories.map(story => (
                <div key={story.id} className="p-3 bg-white rounded-lg border border-[#EFEFEF] shadow-sm">
                  <p className="text-sm mb-2">{story.text}</p>
                  <div className="flex justify-end">
                    <button
                      onClick={() => handleLikeStory(story.id)}
                      className={`text-sm ${storyLikes[story.id] ? 'text-red-500' : 'text-gray-400'} hover:text-red-500`}
                      disabled={storyLikes[story.id]}
                    >
                      ♥ {story.likes}
                    </button>
                  </div>
                </div>
              ))}
            </div>
                  
            <div className="mt-4">
              <textarea
                value={newStory}
                onChange={(e) => setNewStory(e.target.value)}
                placeholder="Scrivi una storia per questo NFT..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FF6A5A] min-h-[100px]"
              ></textarea>
              <div className="flex justify-end mt-2">
                <button
                  onClick={addStory}
                  disabled={!newStory.trim()}
                  className="px-3 py-2 bg-[#FF6A5A] text-white rounded-md hover:bg-[#E05A4A] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Aggiungi Storia
                </button>
              </div>
            </div>
          </div>
        );
      
      case 'comments':
        return (
          <div className={`tab-content ${animating ? 'animate-slide-in' : ''} ${isReturning ? 'animate-slide-return' : ''}`}>
            <h3 className="text-lg font-medium mb-4 text-[#333]">Commenti</h3>
            <p className="text-gray-500 italic">Funzionalità in fase di sviluppo</p>
          </div>
        );
      
      default:
        return null;
    }
  };
  
  return (
    <div className="fixed inset-0 z-50 flex items-center bg-black/70 backdrop-blur-sm overflow-x-auto w-screen" onClick={onClose}>
      <div 
        ref={modalRef}
        className="bg-white rounded-lg shadow-xl w-auto min-w-[992px] max-w-[90vw] h-[720px] relative my-4 mx-auto overflow-hidden flex"
        style={{ marginBottom: '0' }}
        onClick={e => e.stopPropagation()}
      >
        <style jsx>{`
          .tab-animation {
            transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          }
          
          @keyframes moveArchetypeTab {
            from {
              transform: translateX(500px);
            }
            to {
              transform: translateX(calc(-100% + 60px));
            }
          }
          
          @keyframes moveStoriesTab {
            from {
              transform: translateX(500px);
            }
            to {
              transform: translateX(calc(-100% + 60px));
            }
          }
          
          @keyframes returnArchetypeTab {
            0% {
              transform: translateX(-600px);
            }
            100% {
              transform: translateX(0);
            }
          }

          @keyframes returnStoriesTab {
            0% {
              transform: translateX(-600px);
            }
            100% {
              transform: translateX(0);
            }
          }
          
          .animate-slide-in {
            animation: slideIn 1.2s cubic-bezier(0.25, 0.1, 0.25, 1) forwards;
          }
          
          .animate-slide-return {
            animation: slideReturn 1.2s cubic-bezier(0.25, 0.1, 0.25, 1) forwards;
          }
          
          @keyframes slideIn {
            from {
              transform: translateX(100%);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }
          
          @keyframes slideReturn {
            from {
              transform: translateX(-100%);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }
          
          .animate-fadeIn {
            animation: fadeIn 0.5s ease-out forwards;
          }
          
          @keyframes fadeIn {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }
        `}</style>
        
        {/* Immagine NFT con stelle e informazioni */}
        <div className="relative flex items-start justify-center h-full bg-[#F5F5F5]">
          {/* Pulsante di chiusura */}
          <button 
            onClick={onClose}
            className="absolute top-3 right-3 z-20 bg-white/80 hover:bg-white rounded-full p-1.5 shadow-md text-gray-700 hover:text-gray-900 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          {/* ID dell'NFT */}
          <div className="absolute top-3 left-3 z-10 bg-black/60 text-white px-2 py-1 rounded text-xs font-medium">
            #{nft.id}
          </div>
          
          {/* Archetipo dell'NFT */}
          <div 
            className="absolute top-3 left-[50px] z-10 px-2 py-1 rounded text-xs font-medium shadow-sm"
            style={{ backgroundColor: color, color: textColor }}
          >
            {nft.archetype || 'Unknown'}
          </div>
          
          {/* Stelle */}
          {((nft.traits && nft.traits.find(trait => trait.trait_type === 'Stars')) || nft.stars) && (
            <div className="absolute top-2 right-2 z-10 text-xl">
              {nft.traits 
                ? nft.traits.find(trait => trait.trait_type === 'Stars')?.value
                : nft.stars
              }
            </div>
          )}
          
          {/* Placeholder durante il caricamento */}
          {!imageLoaded && (
            <div className="animate-pulse w-full h-full bg-gray-200 flex items-center justify-center">
              <div className="w-24 h-24 border-4 border-[#FF6A5A] border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
          
          {/* Immagine */}
          <img
            src={validImagePath}
            alt={`${nft.archetype || 'NFT'} #${nft.id}`}
            className="h-full object-contain max-h-[720px]"
            onLoad={() => setImageLoaded(true)}
            style={{ 
              display: imageLoaded ? 'block' : 'none',
              objectPosition: 'top'
            }}
            onError={(e) => {
              console.error(`Errore caricamento immagine nel modale per NFT ${nft.id}`);
              if (!tryNextPath()) {
                e.target.src = fallbackPath;
                setImageLoaded(true);
              }
            }}
          />
        </div>
        
        {/* Area dei tab laterali e contenuto a destra */}
        <div className="w-[780px] h-full relative" style={{ paddingRight: '180px' }}>
          {/* Tab laterali fissi a destra */}
          <div 
            className="absolute flex flex-col" 
            style={{ 
              right: '0', 
              top: 0, 
              bottom: 0, 
              width: '180px',
              height: '100%',
              margin: 0,
              padding: 0
            }}
          >
            {/* Tab Archetipi - sempre presente ma si sposta e cambia colore */}
            <div 
              className="cursor-pointer flex justify-center items-center h-full absolute top-0 bottom-0 left-0 tab-animation m-0 p-0"
              style={{ 
                width: '60px',
                backgroundColor: activeTab === 'archetypes' ? '#FF6A5A' : 'white',
                color: activeTab === 'archetypes' ? 'white' : '#333',
                transform: activeTab === 'stories' || activeTab === 'comments' ? 'translateX(-100%)' : 'translateX(0)',
                transition: 'none',
                opacity: activeTab === 'stories' || activeTab === 'comments' ? 0 : 1,
                pointerEvents: activeTab === 'stories' || activeTab === 'comments' ? 'none' : 'auto',
                animation: isReturning ? 'returnArchetypeTab 1.2s cubic-bezier(0.25, 0.1, 0.25, 1) forwards' : 'none',
                zIndex: activeTab === 'archetypes' ? 30 : 10,
                margin: 0,
                padding: 0,
                borderLeft: '1px solid #E5E5E5',
                borderRight: '1px solid #E5E5E5'
              }}
              onClick={(e) => {
                e.stopPropagation();
                handleTabChange('archetypes');
              }}
            >
              <span 
                className="whitespace-nowrap font-bold absolute pointer-events-none" 
                style={{ 
                  transform: 'rotate(-90deg)', 
                  transformOrigin: 'center',
                  fontSize: '15px',
                  letterSpacing: '0.5px'
                }}
              >
                Archetipi
              </span>
            </div>

            {/* Tab Racconti - non si muove, cambia solo colore */}
            <div 
              className="cursor-pointer flex justify-center items-center h-full absolute top-0 bottom-0 left-[60px]"
              style={{ 
                width: '60px',
                backgroundColor: activeTab === 'stories' ? '#FF6A5A' : 'white',
                color: activeTab === 'stories' ? 'white' : '#333',
                opacity: activeTab === 'comments' ? 0 : 1,
                pointerEvents: activeTab === 'comments' ? 'none' : 'auto',
                zIndex: fromStoriesToArchetypes ? 15 : 10,
                animation: isReturning && (activeTab === 'stories' || activeTab === 'archetypes') && !fromStoriesToArchetypes ? 'returnStoriesTab 1.2s cubic-bezier(0.25, 0.1, 0.25, 1) forwards' : 'none',
                borderLeft: '1px solid #E5E5E5',
                borderRight: '1px solid #E5E5E5'
              }}
              onClick={(e) => {
                e.stopPropagation();
                handleTabChange('stories');
              }}
            >
              <span 
                className="whitespace-nowrap font-bold absolute pointer-events-none" 
                style={{ 
                  transform: 'rotate(-90deg)', 
                  transformOrigin: 'center',
                  fontSize: '15px',
                  letterSpacing: '0.5px'
                }}
              >
                Racconti
              </span>
            </div>

            {/* Tab Commenti */}
            <div 
              className="cursor-pointer flex justify-center items-center h-full absolute top-0 bottom-0 left-[120px]"
              style={{ 
                width: '60px',
                backgroundColor: activeTab === 'comments' ? '#FF6A5A' : 'white',
                color: activeTab === 'comments' ? 'white' : '#333',
                zIndex: 10,
                borderLeft: '1px solid #E5E5E5',
                borderRight: '1px solid #E5E5E5'
              }}
              onClick={(e) => {
                e.stopPropagation();
                handleTabChange('comments');
              }}
            >
              <span 
                className="whitespace-nowrap font-bold absolute pointer-events-none" 
                style={{ 
                  transform: 'rotate(-90deg)', 
                  transformOrigin: 'center',
                  fontSize: '15px',
                  letterSpacing: '0.5px'
                }}
              >
                Commenti
              </span>
            </div>
          </div>
          
          {/* Tab duplicati che si spostano */}
          {/* Duplicato Archetipi - appare sia per stories che per comments */}
          {(activeTab === 'stories' || activeTab === 'comments') && !fromStoriesToArchetypes && (
            <div 
              className="cursor-pointer flex justify-center items-center h-full absolute top-0 bottom-0 left-0"
              style={{ 
                width: '60px',
                backgroundColor: 'white',
                color: '#555',
                animation: 'moveArchetypeTab 1.2s cubic-bezier(0.25, 0.1, 0.25, 1) forwards',
                zIndex: isReturning ? 30 : 20,
                borderLeft: '1px solid #E5E5E5',
                borderRight: '1px solid #E5E5E5'
              }}
              onClick={(e) => {
                e.stopPropagation();
                handleTabChange('archetypes');
              }}
            >
              <span 
                className="whitespace-nowrap font-bold absolute pointer-events-none" 
                style={{ 
                  transform: 'rotate(-90deg)', 
                  transformOrigin: 'center',
                  fontSize: '15px',
                  letterSpacing: '0.5px'
                }}
              >
                Archetipi
              </span>
            </div>
          )}
          
          {/* Duplicato Racconti - appare solo per comments e non durante la transizione da stories a archetypes */}
          {activeTab === 'comments' && !fromStoriesToArchetypes && (
            <div 
              className="cursor-pointer flex justify-center items-center h-full absolute top-0 bottom-0 left-[60px]"
              style={{ 
                width: '60px',
                backgroundColor: 'white',
                color: '#555',
                animation: 'moveStoriesTab 1.2s cubic-bezier(0.25, 0.1, 0.25, 1) forwards',
                zIndex: 20,
                borderLeft: '1px solid #E5E5E5',
                borderRight: '1px solid #E5E5E5'
              }}
              onClick={(e) => {
                e.stopPropagation();
                handleTabChange('stories');
              }}
            >
              <span 
                className="whitespace-nowrap font-bold absolute pointer-events-none" 
                style={{ 
                  transform: 'rotate(-90deg)', 
                  transformOrigin: 'center',
                  fontSize: '15px',
                  letterSpacing: '0.5px'
                }}
              >
                Racconti
              </span>
            </div>
          )}
          
          {/* Contenuto del tab attivo */}
          <div 
            className="max-h-[calc(720px-100px)] overflow-y-auto relative transition-all duration-[1200ms] py-6"
            style={{ 
              marginLeft: activeTab === 'comments' ? '120px' : 
                         activeTab === 'stories' ? '60px' : '0',
              marginRight: activeTab === 'comments' ? '-120px' : 
                          activeTab === 'stories' ? '-60px' : '0',
              paddingRight: '30px',
              paddingLeft: '30px'
            }}
          >
            {/* Contenuti dei tab */}
            {getTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
} 