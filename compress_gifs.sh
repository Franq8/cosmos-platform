#!/bin/bash

# Directory con le GIF originali
ORIG_PATH="../cosmos_platform copia 2/public/thumbnails"
# Directory per le GIF compresse
COMP_PATH="./compressed_gifs"
# Directory per le miniature
THUMB_PATH="./public/thumbnails"

# Crea directory se non esistono
mkdir -p "$COMP_PATH"

# Comprime tutte le GIF
for gif in "$ORIG_PATH"/*.gif; do
  filename=$(basename "$gif")
  echo "Comprimendo $filename..."
  
  # Ottimizza e ridimensiona la GIF mantenendo la qualità
  convert "$gif" -layers optimize -resize "300x300>" "$COMP_PATH/$filename"
  
  # Copia il file compresso nella directory delle miniature
  cp "$COMP_PATH/$filename" "$THUMB_PATH/$filename"
done

echo "Compressione completata. Le GIF compresse sono in $COMP_PATH"
echo "Le GIF sono state copiate in $THUMB_PATH"
