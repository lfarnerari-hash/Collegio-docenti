
import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import SignatureForm from './components/SignatureForm';
import AttendanceList from './components/AttendanceList';
import QrCodeModal from './components/QrCodeModal';
import { Signature } from './types';
import { TEACHERS } from './api/teachers';

const App: React.FC = () => {
  const [signatures, setSignatures] = useState<Signature[]>([]);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isListLoading, setIsListLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);

  const fetchSignatures = useCallback(async () => {
    setIsListLoading(true);
    try {
      const response = await fetch('/api/signatures');
      if (!response.ok) {
        throw new Error('Errore di rete nel caricamento delle firme.');
      }
      const data: Signature[] = await response.json();
      setSignatures(data.sort((a,b) => a.lastName.localeCompare(b.lastName) || a.firstName.localeCompare(b.firstName)));
    } catch (err) {
      console.error("Failed to fetch signatures", err);
      setError("Impossibile caricare l'elenco delle firme dal server. Riprova più tardi.");
    } finally {
      setIsListLoading(false);
    }
  }, []);

  // Load signatures from API on initial render
  useEffect(() => {
    fetchSignatures();
    const params = new URLSearchParams(window.location.search);
    if (params.get('admin') === 'true') {
      setIsAdmin(true);
    }
  }, [fetchSignatures]);

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

  const handleAddSignature = useCallback(async (event: React.FormEvent<HTMLFormElement>) => {
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

    if (!TEACHERS.includes(normalizedEmail)) {
      setError("L'indirizzo email non è presente nel registro ufficiale dell'istituto. Verificare di aver inserito l'email corretta.");
      return;
    }
    
    setIsLoading(true);

    try {
        const response = await fetch('/api/signatures', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                firstName: trimmedFirstName,
                lastName: trimmedLastName,
                email: normalizedEmail,
            }),
        });
        
        if (response.status === 409) {
            setError(`Questo indirizzo email risulta già utilizzato. Ogni docente può firmare una sola volta.`);
            setIsLoading(false);
            return;
        }

        if (!response.ok) {
            throw new Error('Si è verificato un errore durante la registrazione della firma.');
        }

        const newSignature: Signature = await response.json();

        setSignatures(prevSignatures => [...prevSignatures, newSignature].sort((a,b) => a.lastName.localeCompare(b.lastName) || a.firstName.localeCompare(b.firstName)));
        setFirstName('');
        setLastName('');
        setEmail('');
        setSuccess(`Grazie, ${newSignature.firstName} ${newSignature.lastName}. La tua presenza è stata registrata con successo.`);
    } catch (err) {
        setError(err instanceof Error ? err.message : 'Impossibile salvare la tua firma. Controlla la connessione e riprova.');
        console.error("Failed to save signature", err);
    } finally {
        setIsLoading(false);
    }
  }, [firstName, lastName, email]);
  
  const handleResetSignatures = useCallback(async () => {
    const confirmation = window.confirm("Sei sicuro di voler eliminare TUTTE le firme presenti? Questa azione è irreversibile.");
    if (!confirmation) {
        return;
    }

    setIsListLoading(true);
    setError(null);
    setSuccess(null);

    try {
        const response = await fetch('/api/signatures', { method: 'DELETE' });

        if (!response.ok) {
            throw new Error("Errore durante la cancellazione delle firme.");
        }
        
        setSignatures([]);
        setSuccess("Tutte le firme sono state cancellate con successo.");

    } catch (err) {
        setError(err instanceof Error ? err.message : "Impossibile resettare le firme. Riprova più tardi.");
        console.error("Failed to reset signatures", err);
    } finally {
        setIsListLoading(false);
    }
  }, []);

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
          <AttendanceList 
            signatures={signatures} 
            isAdmin={isAdmin} 
            isLoading={isListLoading}
            onResetSignatures={handleResetSignatures}
          />
        </div>
      </main>
      <footer className="text-center py-4 px-4 text-xs text-slate-500">
        <p>Applicazione creata per l'IIS R. Rossellini.</p>
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
