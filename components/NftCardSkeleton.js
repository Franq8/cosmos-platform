export default function NftCardSkeleton() {
  return (
    <div className="group cosmic-card transform transition animate-pulse">
      <div className="relative overflow-hidden rounded-t-lg bg-[#F5F5F5]" style={{ aspectRatio: '1/1' }}>
        {/* Logo con cerchio di caricamento */}
        <div className="absolute inset-0 flex justify-center items-center">
          <div className="relative w-36 h-36 sm:w-40 sm:h-40 md:w-48 md:h-48">
            <img
              src="/logo-avatar copia.png"
              alt="Logo"
              width={240}
              height={240}
              className="object-contain"
              style={{ width: '100%', height: '100%' }}
            />
            {/* Cerchio di caricamento sopra il logo */}
            <div className="absolute inset-0 flex justify-center items-center">
              <div className="w-full h-full border-4 border-[#FF6A5A] border-t-transparent rounded-full animate-spin"></div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="p-4">
        {/* Testi dello scheletro */}
        <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
        
        <div className="flex justify-between items-center mt-2">
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-8"></div>
        </div>
      </div>
    </div>
  );
} 