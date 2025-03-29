import { useState } from 'react';
import Head from 'next/head';
import Header from '../components/Header';
import NftGrid from '../components/NftGrid';
import ArchetypeFilter from '../components/ArchetypeFilter';
import { NftProvider } from '../lib/context/NftContext';

export default function Home() {
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);

  return (
    <NftProvider>
      <div className="min-h-screen bg-[#F8F7F5] text-[#333]">
        <Head>
          <title>Cosmic NFT Gallery</title>
          <meta name="description" content="Esplora la collezione di NFT cosmici" />
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <Header />
        
        {/* Pulsante mobile per mostrare/nascondere filtri */}
        <div className="px-4 py-3 md:hidden">
          <button
            onClick={() => setShowFiltersMobile(!showFiltersMobile)}
            className="cosmic-button w-full flex items-center justify-center"
          >
            {showFiltersMobile ? 'Nascondi filtri' : 'Mostra filtri'}
          </button>
        </div>
        
        <div className="flex flex-col md:flex-row mt-6 md:gap-4 md:px-4">
          {/* Sidebar filtri - aderente al bordo sinistro */}
          <div className={`
            w-full md:w-64 lg:w-72 px-0 md:sticky md:top-20 md:self-start md:max-h-[calc(100vh-100px)] md:overflow-auto
            ${showFiltersMobile ? 'block' : 'hidden md:block'}
          `}>
            <div className="bg-white rounded-lg shadow">
              <h2 className="text-[#FF6A5A] text-xl font-bold p-3">Archetipi</h2>
              <div className="px-3 pb-3">
                <ArchetypeFilter />
              </div>
            </div>
          </div>
          
          {/* Contenuto principale */}
          <div className="w-full flex-1 px-0 mt-4 md:mt-0">
            <div className="bg-white rounded-lg shadow">
              <h2 className="text-[#FF6A5A] text-xl font-bold p-3">Galleria NFT</h2>
              <div className="px-3 pb-3">
                <NftGrid />
              </div>
            </div>
          </div>
        </div>
        
        <footer className="mt-12 border-t border-[#EFEFEF] pt-6 pb-12 text-center text-[#666]">
          <p>© {new Date().getFullYear()} Cosmic NFT Gallery</p>
        </footer>
      </div>
    </NftProvider>
  );
} 