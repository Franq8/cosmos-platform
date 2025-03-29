#!/bin/bash

# Crea una directory temporanea per le GIF ottimizzate
mkdir -p temp_optimized

# Ottimizza ogni GIF nella cartella original_gifs
for gif in original_gifs/*.gif; do
    if [ -f "$gif" ]; then
        filename=$(basename "$gif")
        echo "Ottimizzando $filename..."
        
        # Ottimizzazione più aggressiva:
        # --optimize=3: massima ottimizzazione
        # --colors 64: riduce la palette a 64 colori
        # --lossy=80: compressione lossy aggressiva
        # --scale 0.8: riduce le dimensioni dell'80%
        gifsicle -O3 --colors 64 --lossy=80 --scale 0.8 "$gif" > "temp_optimized/$filename"
        
        # Mostra le dimensioni prima e dopo
        original_size=$(stat -f%z "$gif")
        optimized_size=$(stat -f%z "temp_optimized/$filename")
        original_mb=$(echo "scale=2; $original_size/1048576" | bc)
        optimized_mb=$(echo "scale=2; $optimized_size/1048576" | bc)
        reduction=$(echo "scale=2; (1 - $optimized_size/$original_size) * 100" | bc)
        
        echo "✓ $filename:"
        echo "  - Originale: ${original_mb}MB"
        echo "  - Ottimizzato: ${optimized_mb}MB"
        echo "  - Riduzione: ${reduction}%"
        echo ""
    fi
done

echo "Ottimizzazione completata! Le GIF ottimizzate sono nella cartella temp_optimized" 