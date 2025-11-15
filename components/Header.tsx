import React from 'react';

interface HeaderProps {
  onShowQrCode: () => void;
  isAdmin: boolean;
}

const Header: React.FC<HeaderProps> = ({ onShowQrCode, isAdmin }) => {
  return (
    <header className="bg-white shadow-md">
      <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex-1 min-w-0 text-center md:text-left">
            <h1 className="text-3xl font-bold leading-tight text-slate-900">
              Registro Firme Collegio Docenti
            </h1>
            <p className="mt-2 text-sm text-slate-600">Istituto Cine-TV Roberto Rossellini</p>
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4 justify-center items-center space-x-3">
             {isAdmin && (
                <span className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800" aria-label="Modalità amministratore attiva">
                  Admin
                </span>
              )}
            <button
              onClick={onShowQrCode}
              type="button"
              className="inline-flex items-center px-4 py-2 border border-slate-300 text-sm font-medium rounded-md shadow-sm text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              aria-label="Mostra QR code per accedere al modulo di firma"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7"></rect>
                <rect x="14" y="3" width="7" height="7"></rect>
                <rect x="3" y="14" width="7" height="7"></rect>
                <line x1="14" y1="14" x2="14" y2="14.01"></line>
                <line x1="17.5" y1="14" x2="17.5" y2="14.01"></line>
                <line x1="14" y1="17.5" x2="14" y2="17.5"></line>
                <line x1="17.5" y1="17.5" x2="17.5" y2="17.5"></line>
                <line x1="21" y1="14" x2="21" y2="14.01"></line>
                <line x1="14" y1="21" x2="14" y2="21"></line>
                <line x1="17.5" y1="21" x2="17.5" y2="21"></line>
                <line x1="21" y1="17.5" x2="21" y2="17.5"></line>
                <line x1="21" y1="21" x2="21" y2="21"></line>
              </svg>
              Mostra QR Code
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;