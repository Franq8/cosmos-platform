import React from 'react';

// Componente per mostrare una card di caricamento (skeleton)
export default function LoadingCard() {
  return (
    <div className="rounded-lg overflow-hidden shadow-md bg-white animate-pulse">
      {/* Spazio per l'immagine */}
      <div className="bg-gray-200 h-48 md:h-56 w-full"></div>
      
      {/* Contenuto in caricamento */}
      <div className="p-3">
        {/* Spazio per il titolo */}
        <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
        
        {/* Spazio per l'archetipo */}
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
        
        {/* Spazio per il badge stelle */}
        <div className="h-4 bg-gray-200 rounded w-8"></div>
      </div>
    </div>
  );
} 