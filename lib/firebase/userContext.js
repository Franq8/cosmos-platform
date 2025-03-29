import { createContext, useState, useContext, useEffect } from 'react';
import { useSession } from 'next-auth/react';

// Creiamo un contesto per memorizzare e gestire lo stato dell'utente
const UserContext = createContext({
  user: null,
  loading: true,
  tempUserId: null, // Per test senza autenticazione
});

// Provider che rende disponibile lo stato utente a tutta l'app
export function UserProvider({ children }) {
  const { data: session, status } = useSession();
  const [tempUserId, setTempUserId] = useState(null);
  const isLoading = status === "loading";
  const isAuthenticated = status === "authenticated";
  const sessionUser = session?.user;

  // Effetto per generare un ID utente temporaneo per test
  useEffect(() => {
    // Generiamo un ID casuale se non esiste
    if (!tempUserId) {
      try {
        const storedTempId = localStorage.getItem('temp_user_id');
        if (storedTempId) {
          setTempUserId(storedTempId);
        } else {
          const newTempId = `temp_${Math.random().toString(36).substr(2, 9)}`;
          localStorage.setItem('temp_user_id', newTempId);
          setTempUserId(newTempId);
        }
      } catch (error) {
        console.error('Errore accesso localStorage:', error);
        setTempUserId(`temp_${Math.random().toString(36).substr(2, 9)}`);
      }
    }
    
    // Se siamo in modalità sviluppo senza localStorage, impostiamo comunque un ID temporaneo
    if (typeof window === 'undefined' && !tempUserId) {
      setTempUserId(`temp_${Math.random().toString(36).substr(2, 9)}`);
    }
  }, [tempUserId]);

  // Valore che verrà fornito dal contesto
  const value = {
    user: sessionUser,
    loading: isLoading,
    tempUserId,
    isAuthenticated,
    // Utilizziamo l'ID utente di Discord se autenticato, altrimenti l'ID temporaneo
    getCurrentUserId: () => sessionUser?.id || tempUserId
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

// Hook personalizzato per utilizzare il contesto
export function useUser() {
  return useContext(UserContext);
} 