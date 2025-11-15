import React, { useEffect, useRef } from 'react';
import QRCode from 'qrcode';

interface QrCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const QrCodeModal: React.FC<QrCodeModalProps> = ({ isOpen, onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (isOpen && canvasRef.current) {
      // Generate URL without any query params for students/teachers
      const url = `${window.location.origin}${window.location.pathname}`;
      QRCode.toCanvas(canvasRef.current, url, { width: 256, margin: 2 }, (error) => {
        if (error) {
            console.error('Failed to generate QR Code:', error);
        }
      });
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-opacity duration-300"
      aria-labelledby="qrcode-modal-title"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg shadow-xl p-8 max-w-sm w-full text-center transform transition-all duration-300 scale-95 opacity-0 animate-fade-in-scale"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
      >
        <h2 id="qrcode-modal-title" className="text-2xl font-semibold text-slate-800 mb-4">
          QR Code per la Firma
        </h2>
        <p className="text-slate-600 mb-6">
          I docenti possono inquadrare questo codice con il loro smartphone per accedere al modulo di firma.
        </p>
        <div className="flex justify-center p-4 bg-slate-100 rounded-md">
          <canvas ref={canvasRef} aria-label="QR Code per la pagina di firma"></canvas>
        </div>
        <button
          onClick={onClose}
          type="button"
          className="mt-8 w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm"
        >
          Chiudi
        </button>
      </div>
      <style>{`
        @keyframes fade-in-scale {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fade-in-scale {
          animation: fade-in-scale 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
};

export default QrCodeModal;