import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';

export default function ErrorPage() {
  const router = useRouter();
  const { error } = router.query;

  const errors = {
    Configuration: "C'è un problema con la configurazione del server.",
    AccessDenied: "Accesso negato. Non hai i permessi necessari.",
    Verification: "Il link di verifica è scaduto o è già stato utilizzato.",
    Default: "Si è verificato un errore durante l'autenticazione."
  };

  const errorMessage = errors[error] || errors.Default;

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 to-black flex flex-col justify-center items-center p-4">
      <Head>
        <title>Errore di Autenticazione - Cosmos Platform</title>
      </Head>
      
      <div className="bg-slate-800 p-8 rounded-xl shadow-2xl max-w-md w-full text-center">
        <h1 className="text-3xl font-bold text-red-500 mb-4">
          Autenticazione Fallita
        </h1>
        
        <p className="text-white mb-6">
          {errorMessage}
        </p>
        
        <div className="flex flex-col space-y-4">
          <Link href="/auth/signin" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-white font-medium transition-colors">
            Riprova a accedere
          </Link>
          
          <Link href="/" className="px-4 py-2 bg-transparent border border-gray-500 hover:border-gray-400 rounded-lg text-gray-300 hover:text-white font-medium transition-colors">
            Torna alla home
          </Link>
        </div>
      </div>
    </div>
  );
} 