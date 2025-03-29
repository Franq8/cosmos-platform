import React, { useState, useEffect } from 'react';
import Image from 'next/image';

const ImageWithFallback = ({ 
  src, 
  alt, 
  fallbackSrc = '/placeholder.png',
  width,
  height,
  className,
  layout,
  style,
  priority = false,
  onLoad,
  onError,
  ...rest 
}) => {
  const [imgSrc, setImgSrc] = useState(src);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  
  // Aggiorna il src quando cambia la prop
  useEffect(() => {
    setImgSrc(src);
    setIsLoading(true);
    setHasError(false);
  }, [src]);
  
  const handleError = () => {
    console.log(`❌ Errore caricamento immagine: ${src}`);
    setHasError(true);
    setImgSrc(fallbackSrc);
    setIsLoading(false);
    
    if (onError) {
      onError();
    }
  };
  
  const handleLoad = (e) => {
    console.log(`✅ Immagine caricata: ${imgSrc}`);
    setIsLoading(false);
    
    if (onLoad && e) {
      onLoad(e);
    }
  };
  
  // Per immagini non Next/Image
  if (!width && !height && !layout) {
    return (
      <div className={`relative ${className || ''}`} style={style}>
        {isLoading && (
          <div 
            className="absolute inset-0 flex items-center justify-center bg-gray-100 animate-pulse"
            style={{ zIndex: 1 }}
          >
            <div className="w-8 h-8 border-2 border-[#FF6A5A] border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
        
        <img
          src={imgSrc}
          alt={alt || 'Immagine'}
          className={className}
          style={{
            ...style,
            opacity: isLoading ? 0 : 1,
            transition: 'opacity 0.3s'
          }}
          onError={handleError}
          onLoad={handleLoad}
          {...rest}
        />
      </div>
    );
  }
  
  // Per Next/Image
  return (
    <div className={`relative ${className || ''}`} style={style}>
      {isLoading && (
        <div 
          className="absolute inset-0 flex items-center justify-center bg-gray-100 animate-pulse"
          style={{ zIndex: 1 }}
        >
          <div className="w-8 h-8 border-2 border-[#FF6A5A] border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      
      <Image
        src={imgSrc}
        alt={alt || 'Immagine'}
        className={className}
        width={width}
        height={height}
        layout={layout}
        priority={priority}
        style={{
          ...style,
          opacity: isLoading ? 0 : 1,
          transition: 'opacity 0.3s'
        }}
        onError={handleError}
        onLoad={handleLoad}
        {...rest}
      />
    </div>
  );
};

export default ImageWithFallback; 