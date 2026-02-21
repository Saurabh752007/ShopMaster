import React from 'react';
import { useZxing } from 'react-zxing';

interface BarcodeScannerProps {
  onScan: (result: string) => void;
  onClose: () => void;
  lastScannedMessage?: string | null;
}

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ onScan, onClose, lastScannedMessage }) => {
  const { ref } = useZxing({
    onDecodeResult(result) {
      onScan(result.getText());
    },
    constraints: { video: { facingMode: "environment" } },
    onError(error) {
        // Ignore minor errors during scanning
        if (error.name === 'NotFoundException') return;
        console.error(error);
    }
  });

  return (
    <div className="fixed inset-0 z-[150] bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="relative w-full max-w-sm bg-black rounded-[2.5rem] overflow-hidden aspect-[3/4] shadow-2xl border border-white/10 ring-1 ring-white/20">
        <video ref={ref} className="w-full h-full object-cover" />
        
        {/* Scanner Overlay */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-64 h-64 border-2 border-sky-500/50 rounded-3xl relative">
                <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-sky-500 rounded-tl-xl"></div>
                <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-sky-500 rounded-tr-xl"></div>
                <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-sky-500 rounded-bl-xl"></div>
                <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-sky-500 rounded-br-xl"></div>
                <div className="absolute inset-0 bg-sky-500/10 animate-pulse"></div>
            </div>
        </div>
        
        {/* Feedback Message */}
        {lastScannedMessage && (
          <div className="absolute bottom-20 left-0 right-0 flex justify-center pointer-events-none animate-in slide-in-from-bottom-4 fade-in duration-300">
            <div className="bg-black/60 backdrop-blur-md text-white px-6 py-3 rounded-full font-bold shadow-lg border border-white/10 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              {lastScannedMessage}
            </div>
          </div>
        )}

        <button 
            onClick={onClose} 
            className="absolute top-6 right-6 p-3 bg-black/40 text-white rounded-full backdrop-blur-md hover:bg-black/60 transition-colors z-10"
        >
           <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>
      <p className="text-white/80 mt-8 font-medium text-lg tracking-tight">Point camera at a barcode</p>
      <button onClick={onClose} className="mt-4 text-sm text-gray-400 hover:text-white transition-colors">Cancel Scanning</button>
    </div>
  );
};

export default BarcodeScanner;
