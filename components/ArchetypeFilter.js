import { useNfts } from '../lib/context/NftContext';
import { useState, useEffect } from 'react';

export default function ArchetypeFilter({ className = '' }) {
  const { 
    selectedArchetypes, 
    updateSelectedArchetypes,
    fetchArchetypes
  } = useNfts();
  
  // Stato locale per gli archetipi disponibili
  const [allArchetypes, setAllArchetypes] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Carica gli archetipi all'avvio
  useEffect(() => {
    const loadArchetypes = async () => {
      setLoading(true);
      try {
        const data = await fetchArchetypes();
        // Verifica che archetypes esista e sia un array
        if (data && data.archetypes && Array.isArray(data.archetypes)) {
          setAllArchetypes(data.archetypes.map(a => a.name));
        } else {
          // Fallback con lista predefinita
          setAllArchetypes([
            'Monster', 'Hunter', 'Shapeshifter', 'Monk', 'Enchanter',
            'Spaceman', 'Engineer', 'Black Star', 'Royalty', 'Sun', 
            'Moon', 'Crystal Children', 'Warlord', 'AI Golem', 'Alien',
            'Starseed', 'Toy Box', 'Glitch Starfighter'
          ]);
        }
      } catch (error) {
        console.error('Errore caricamento archetipi:', error);
        // Fallback con lista predefinita
        setAllArchetypes([
          'Monster', 'Hunter', 'Shapeshifter', 'Monk', 'Enchanter',
          'Spaceman', 'Engineer', 'Black Star', 'Royalty', 'Sun', 
          'Moon', 'Crystal Children', 'Warlord', 'AI Golem', 'Alien',
          'Starseed', 'Toy Box', 'Glitch Starfighter'
        ]);
      } finally {
        setLoading(false);
      }
    };
    
    loadArchetypes();
  }, [fetchArchetypes]);
  
  // Stato per gli effetti di hover
  const [hoveredArchetype, setHoveredArchetype] = useState(null);
  
  // Funzione per formattare il nome dell'archetipo (rimuove gli underscore)
  const formatArchetypeName = (name) => {
    // Verifica che name sia una stringa
    if (!name || typeof name !== 'string') {
      return '';
    }
    return name.replace(/_/g, ' ');
  };
  
  // Mapping archetipi-colori fisso per mantenere coerenza visiva
  const getArchetypeColor = (archetype) => {
    // Mapping colori specifici per archetipo basati sul loro "carattere"
    const archetypeColorMap = {
      'Monster': { color: '#FF6A5A', textColor: 'white' },        // Rosso corallo
      'Hunter': { color: '#E17A56', textColor: 'white' },         // Rosso mattone
      'Shapeshifter': { color: '#FF8C94', textColor: 'white' },   // Rosa corallo
      'Monk': { color: '#41BFB3', textColor: 'white' },           // Turchese
      'Enchanter': { color: '#5394D6', textColor: 'white' },      // Blu
      'Spaceman': { color: '#7EA1E5', textColor: 'white' },       // Azzurro
      'Engineer': { color: '#F8D575', textColor: '#333' },        // Giallo
      'Black_Star': { color: '#333333', textColor: 'white' },     // Nero
      'Royalty': { color: '#9979C1', textColor: 'white' },        // Viola
      'Sun': { color: '#FFA45C', textColor: '#333' },             // Arancione
      'Moon': { color: '#C0E5F2', textColor: '#333' },            // Azzurro chiaro
      'Crystal_Children': { color: '#CDB4DB', textColor: '#333' }, // Lilla
      'Warlord': { color: '#7D1D3F', textColor: 'white' },        // Rosso scuro
      'AI_Golem': { color: '#495057', textColor: 'white' },       // Grigio scuro
      'Alien': { color: '#8FC93A', textColor: '#333' },           // Verde lime
      'Starseed': { color: '#E0FBFC', textColor: '#333' },        // Azzurro chiarissimo
      'Toy_Box': { color: '#F4ACB7', textColor: '#333' },          // Rosa chiaro
      'Glitch_Starfighter': { color: '#00B4D8', textColor: 'white' } // Azzurro ciano
    };
    
    // Verifica che archetype sia una stringa
    if (!archetype || typeof archetype !== 'string') {
      return { color: '#FF6A5A', textColor: 'white' }; // Colore di default
    }
    
    // Nome formattato per la ricerca nella mappa
    const formattedName = archetype.replace(/ /g, '_');
    
    // Restituisci colore specifico o default corallo
    return archetypeColorMap[formattedName] || { color: '#FF6A5A', textColor: 'white' };
  };

  // Gestisce il toggle di un archetipo nei filtri
  const handleArchetypeChange = (archetype) => {
    // Se l'archetipo è già selezionato, lo rimuoviamo
    if (selectedArchetypes.includes(archetype)) {
      updateSelectedArchetypes(selectedArchetypes.filter(a => a !== archetype));
    } else {
      // Altrimenti lo aggiungiamo
      updateSelectedArchetypes([...selectedArchetypes, archetype]);
    }
  };

  // Resetta i filtri
  const resetFilters = () => {
    updateSelectedArchetypes([]);
  };

  // Se stiamo caricando gli archetype, mostriamo un placeholder
  if (loading) {
    return (
      <div className="flex flex-col gap-2">
        <div className="h-8 w-full bg-[#F5F5F5] rounded-md animate-pulse"></div>
        <div className="h-8 w-full bg-[#F5F5F5] rounded-md animate-pulse"></div>
        <div className="h-8 w-full bg-[#F5F5F5] rounded-md animate-pulse"></div>
      </div>
    );
  }

  return (
    <>
      {/* Bottone Reset */}
      {selectedArchetypes.length > 0 && (
        <div className="flex justify-end mb-3">
          <button
            onClick={resetFilters}
            className="px-2 py-1 bg-[#FF6A5A] hover:bg-[#E05A4A] text-white rounded-md text-xs font-medium transition-colors"
          >
            Reset
          </button>
        </div>
      )}
      
      {/* Archetipi selezionati */}
      {selectedArchetypes.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-1">
          {selectedArchetypes.map(archetype => {
            const { color, textColor } = getArchetypeColor(archetype);
            return (
              <span 
                key={archetype}
                style={{ backgroundColor: color, color: textColor }}
                className="inline-flex items-center px-2 py-0.5 rounded-md text-xs"
              >
                <span className="font-medium">
                  {formatArchetypeName(archetype)}
                </span>
                <button
                  onClick={() => handleArchetypeChange(archetype)}
                  className="ml-1 opacity-80 hover:opacity-100"
                >
                  ×
                </button>
              </span>
            );
          })}
        </div>
      )}

      {/* Lista verticale di pulsanti per gli archetipi */}
      <div className="flex flex-col space-y-1">
        {allArchetypes.map((archetype) => {
          const isSelected = selectedArchetypes.includes(archetype);
          const isHovered = hoveredArchetype === archetype;
          const { color, textColor } = getArchetypeColor(archetype);
          
          return (
            <button
              key={archetype}
              onClick={() => handleArchetypeChange(archetype)}
              onMouseEnter={() => setHoveredArchetype(archetype)}
              onMouseLeave={() => setHoveredArchetype(null)}
              style={isSelected ? 
                { backgroundColor: color, color: textColor } : 
                isHovered ? 
                  { borderColor: color, color: '#333' } :
                  {}}
              className={`px-2 py-1 rounded-md transition-all duration-150 text-left ${
                isSelected 
                ? 'shadow-sm' 
                : 'bg-[#F9F9F9] hover:bg-[#F5F5F5] text-[#444] border border-[#EFEFEF]'
              }`}
            >
              <span className="font-medium text-xs">
                {formatArchetypeName(archetype)}
              </span>
            </button>
          );
        })}
      </div>
    </>
  );
} 