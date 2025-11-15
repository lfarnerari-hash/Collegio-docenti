
import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import SignatureForm from './components/SignatureForm';
import AttendanceList from './components/AttendanceList';
import QrCodeModal from './components/QrCodeModal';
import { Signature } from './types';

const SIGNATURES_STORAGE_KEY = 'collegio-docenti-signatures';

const App: React.FC = () => {
  const [signatures, setSignatures] = useState<Signature[]>([]);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);

  // Load signatures from localStorage and check admin status on initial render
  useEffect(() => {
    try {
      const storedSignatures = localStorage.getItem(SIGNATURES_STORAGE_KEY);
      if (storedSignatures) {
        const parsedSignatures = JSON.parse(storedSignatures);
        // Data migration for old format (single 'name' field)
        const migratedSignatures = parsedSignatures.map((sig: any): Signature => {
            if (typeof sig.name === 'string' && sig.lastName === undefined) {
                const lastSpaceIndex = sig.name.trim().lastIndexOf(' ');
                if (lastSpaceIndex === -1) {
                    // Only one word, treat as last name
                    return { lastName: sig.name.trim(), firstName: '', email: sig.email, timestamp: sig.timestamp };
                } else {
                    const sigFirstName = sig.name.substring(0, lastSpaceIndex).trim();
                    const sigLastName = sig.name.substring(lastSpaceIndex + 1).trim();
                    return { firstName: sigFirstName, lastName: sigLastName, email: sig.email, timestamp: sig.timestamp };
                }
            }
            return sig;
        });
        setSignatures(migratedSignatures);
      }
      const params = new URLSearchParams(window.location.search);
      if (params.get('admin') === 'true') {
        setIsAdmin(true);
      }
    } catch (err) {
      console.error("Failed to load signatures from local storage", err);
      setError("Impossibile caricare le firme salvate.");
    }
  }, []);

  // Save signatures to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(SIGNATURES_STORAGE_KEY, JSON.stringify(signatures));
    } catch (err) {
      console.error("Failed to save signatures to local storage", err);
      setError("Impossibile salvare la tua firma. Riprova.");
    }
  }, [signatures]);
  
  // Clear messages after a delay
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError(null);
        setSuccess(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  const validateEmail = (emailToValidate: string): boolean => {
    if (!emailToValidate) return false;
    return emailToValidate.toLowerCase().endsWith('@cine-tv.edu.it');
  };

  const handleAddSignature = useCallback((event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    const trimmedFirstName = firstName.trim();
    const trimmedLastName = lastName.trim();

    if (!trimmedFirstName || !trimmedLastName) {
      setError("I campi 'Nome' e 'Cognome' sono obbligatori.");
      return;
    }
    
    const nameRegex = /^[a-zA-Z\sÀ-ÖØ-öø-ÿ']+$/;
    if (!nameRegex.test(trimmedFirstName) || !nameRegex.test(trimmedLastName)) {
      setError("I campi 'Nome' e 'Cognome' possono contenere solo lettere, spazi e apostrofi.");
      return;
    }


    if (!email.trim()) {
      setError("Il campo 'Indirizzo Email' è obbligatorio.");
      return;
    }
    
    if (!validateEmail(email)) {
      setError("L'indirizzo email non è valido. Deve terminare con @cine-tv.edu.it");
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingSignature = signatures.find(sig => sig.email.toLowerCase() === normalizedEmail);
    if (existingSignature) {
      setError(`Questo indirizzo email risulta già utilizzato da ${existingSignature.lastName} ${existingSignature.firstName} in data ${existingSignature.timestamp}. Ogni docente può firmare una sola volta.`);
      return;
    }

    setIsLoading(true);

    // Simulate network delay
    setTimeout(() => {
      const newSignature: Signature = {
        firstName: trimmedFirstName,
        lastName: trimmedLastName,
        email: normalizedEmail,
        timestamp: new Date().toLocaleString('it-IT', { 
            dateStyle: 'short', 
            timeStyle: 'medium' 
        }),
      };

      setSignatures(prevSignatures => [...prevSignatures, newSignature].sort((a,b) => a.lastName.localeCompare(b.lastName) || a.firstName.localeCompare(b.firstName)));
      setFirstName('');
      setLastName('');
      setEmail('');
      setSuccess(`Grazie, ${newSignature.firstName} ${newSignature.lastName}. La tua presenza è stata registrata con successo.`);
      setIsLoading(false);
    }, 500);

  }, [firstName, lastName, email, signatures]);
  

  return (
    <div className="min-h-screen">
      <Header onShowQrCode={() => setIsQrModalOpen(true)} isAdmin={isAdmin} />
      <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="space-y-8">
          <SignatureForm 
            firstName={firstName}
            setFirstName={setFirstName}
            lastName={lastName}
            setLastName={setLastName}
            email={email}
            setEmail={setEmail}
            handleSubmit={handleAddSignature}
            error={error}
            success={success}
            isLoading={isLoading}
          />
          <AttendanceList signatures={signatures} isAdmin={isAdmin} />
        </div>
      </main>
      <footer className="text-center py-4 px-4 text-xs text-slate-500">
        <p>Applicazione creata per l'IIS R. Rossellini. Tutti i dati vengono salvati localmente sul tuo browser.</p>
        {isAdmin && <p className='font-semibold text-slate-700 mt-1'>Sei in modalità amministratore. Per uscire, ricarica la pagina senza <code>?admin=true</code> nell'URL.</p>}
      </footer>
      <QrCodeModal 
        isOpen={isQrModalOpen} 
        onClose={() => setIsQrModalOpen(false)} 
      />
    </div>
  );
};

export default App;
