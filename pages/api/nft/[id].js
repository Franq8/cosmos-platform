import { getNftById } from '../../../lib/db';

export default async function handler(req, res) {
  const { id } = req.query;
  
  if (!id || isNaN(parseInt(id))) {
    return res.status(400).json({ message: 'ID NFT non valido' });
  }
  
  try {
    const nft = await getNftById(parseInt(id));
    
    if (!nft) {
      return res.status(404).json({ message: 'NFT non trovato' });
    }
    
    res.status(200).json(nft);
  } catch (error) {
    console.error(`Errore nell'ottenere l'NFT ${id}:`, error);
    res.status(500).json({ message: 'Errore nel recupero dell\'NFT' });
  }
} 