import { useState, useEffect } from 'react';
import { useNfts } from '../lib/context/NftContext';

export default function ArchetypeSelector() {
  // Hooks
  const { selectedArchetypes, updateSelectedArchetypes, fetchArchetypes } = useNfts();
  const [archetypes, setArchetypes] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Carica la lista degli archetipi all'avvio
  useEffect(() => {
    const loadArchetypes = async () => {
      setLoading(true);
      try {
        const data = await fetchArchetypes();
        // Ordina alfabeticamente
        const sortedArchetypes = data.archetypes?.sort((a, b) => 
          a.name.localeCompare(b.name)
        ) || [];
        
        setArchetypes(sortedArchetypes);
      } catch (error) {
        console.error('Errore nel caricamento degli archetipi:', error);
        // Fallback con lista predefinita
        setArchetypes([
          { id: 1, name: 'Monster' },
          { id: 2, name: 'Hunter' },
          { id: 3, name: 'Shapeshifter' },
          { id: 4, name: 'Monk' },
          { id: 5, name: 'Enchanter' },
          { id: 6, name: 'Spaceman' },
          { id: 7, name: 'Engineer' },
          { id: 8, name: 'Black Star' },
          { id: 9, name: 'Royalty' },
          { id: 10, name: 'Sun' },
          { id: 11, name: 'Moon' },
          { id: 12, name: 'Crystal Children' },
          { id: 13, name: 'Warlord' },
          { id: 14, name: 'AI Golem' },
          { id: 15, name: 'Alien' },
          { id: 16, name: 'Starseed' },
          { id: 17, name: 'Toy Box' },
          { id: 18, name: 'Glitch Starfighter' }
        ]);
      } finally {
        setLoading(false);
      }
    };
    
    loadArchetypes();
  }, [fetchArchetypes]);
  
  // Gestisce il cambio di selezione di un archetipo
  const handleArchetypeToggle = (archetypeName) => {
    // Se l'archetipo è già selezionato, lo rimuoviamo
    if (selectedArchetypes.includes(archetypeName)) {
      const updated = selectedArchetypes.filter(a => a !== archetypeName);
      updateSelectedArchetypes(updated);
    } else {
      // Altrimenti lo aggiungiamo
      const updated = [...selectedArchetypes, archetypeName];
      updateSelectedArchetypes(updated);
    }
  };
  
  // Ottieni colori per archetipo
  const getArchetypeColor = (archetype) => {
    if (!archetype) {
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
      'Black Star': { color: '#333333', textColor: 'white' },
      'Royalty': { color: '#9979C1', textColor: 'white' },
      'Sun': { color: '#FFA45C', textColor: '#333' },
      'Moon': { color: '#C0E5F2', textColor: '#333' },
      'Crystal Children': { color: '#CDB4DB', textColor: '#333' },
      'Warlord': { color: '#7D1D3F', textColor: 'white' },
      'AI Golem': { color: '#495057', textColor: 'white' },
      'Alien': { color: '#8FC93A', textColor: '#333' },
      'Starseed': { color: '#E0FBFC', textColor: '#333' },
      'Toy Box': { color: '#F4ACB7', textColor: '#333' },
      'Glitch Starfighter': { color: '#00B4D8', textColor: 'white' }
    };
    
    return archetypeColorMap[archetype] || { color: '#FF6A5A', textColor: 'white' };
  };
  
  // Resetta tutti i filtri
  const resetFilters = () => {
    updateSelectedArchetypes([]);
  };
  
  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-semibold text-[#333]">Filtra per Archetipo</h2>
        
        {selectedArchetypes.length > 0 && (
          <button 
            onClick={resetFilters}
            className="text-sm text-[#FF6A5A] hover:text-[#E05A4A]"
          >
            Resetta filtri
          </button>
        )}
      </div>
      
      {loading ? (
        <div className="flex justify-center py-4">
          <div className="w-6 h-6 border-2 border-[#FF6A5A] border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {archetypes.map(archetype => {
            const isSelected = selectedArchetypes.includes(archetype.name);
            const { color, textColor } = getArchetypeColor(archetype.name);
            
            return (
              <button
                key={archetype.id || archetype.name}
                onClick={() => handleArchetypeToggle(archetype.name)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-all duration-200 ${
                  isSelected 
                    ? 'ring-2 ring-offset-2 ring-[#FF6A5A]'
                    : 'opacity-80 hover:opacity-100'
                }`}
                style={{ 
                  backgroundColor: color,
                  color: textColor
                }}
              >
                {archetype.name}
              </button>
            );
          })}
        </div>
      )}
      
      {/* Mostra archetipi selezionati */}
      {selectedArchetypes.length > 0 && (
        <div className="mt-3 p-2 bg-gray-50 rounded-md">
          <p className="text-sm text-gray-600 mb-1">
            {selectedArchetypes.length === 1 
              ? 'Filtrando per archetype:' 
              : 'Filtrando per archetipi (AND):'}
          </p>
          <div className="flex flex-wrap gap-1">
            {selectedArchetypes.map(archetype => {
              const { color, textColor } = getArchetypeColor(archetype);
              
              return (
                <div 
                  key={archetype}
                  className="flex items-center gap-1 px-2 py-1 rounded-md text-xs"
                  style={{ backgroundColor: color, color: textColor }}
                >
                  {archetype}
                  <button 
                    onClick={() => handleArchetypeToggle(archetype)}
                    className="ml-1 hover:opacity-70"
                  >
                    ✕
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
} 