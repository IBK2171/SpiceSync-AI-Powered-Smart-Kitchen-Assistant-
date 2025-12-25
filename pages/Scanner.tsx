
import React, { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera as CameraIcon, X, Loader2, Sparkles, Plus, Check, RefreshCw } from 'lucide-react';
import { scanImageForIngredients } from '../services/geminiService';
import { Ingredient } from '../types';

interface ScannerProps {
  onScanComplete: (items: Ingredient[]) => void;
}

const Scanner: React.FC<ScannerProps> = ({ onScanComplete }) => {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [scannedItems, setScannedItems] = useState<Ingredient[]>([]);
  const [mode, setMode] = useState<'camera' | 'review'>('camera');

  const startCamera = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' }, 
        audio: false 
      });
      setStream(s);
      if (videoRef.current) {
        videoRef.current.srcObject = s;
      }
      setIsCapturing(true);
      setMode('camera');
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("Please allow camera access to use the scanner.");
    }
  };

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCapturing(false);
  }, [stream]);

  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0);
    const base64 = canvas.toDataURL('image/jpeg', 0.8).split(',')[1];
    
    stopCamera();
    setIsProcessing(true);
    setMode('review');

    try {
      const items = await scanImageForIngredients(base64);
      setScannedItems(items);
    } catch (err) {
      console.error("AI scanning error:", err);
      alert("Failed to scan ingredients. Please try again.");
      setMode('camera');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDone = () => {
    onScanComplete(scannedItems);
    navigate('/pantry');
  };

  return (
    <div className="fixed inset-0 z-[60] bg-slate-900 flex flex-col md:relative md:inset-auto md:bg-transparent md:h-auto overflow-hidden">
      {mode === 'camera' && (
        <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden">
          {!isCapturing ? (
            <div className="text-center p-8 space-y-6">
              <div className="w-20 h-20 bg-orange-500 rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-orange-500/20">
                <CameraIcon className="text-white w-10 h-10" />
              </div>
              <div className="space-y-2">
                <h2 className="text-white text-2xl font-bold font-serif">Kitchen Scanner</h2>
                <p className="text-slate-400 max-w-xs mx-auto">Point your camera at your ingredients to automatically add them to your pantry.</p>
              </div>
              <button 
                onClick={startCamera}
                className="w-full bg-white text-slate-900 font-bold py-4 rounded-2xl flex items-center justify-center gap-2"
              >
                Launch Camera
              </button>
              <button onClick={() => navigate(-1)} className="text-slate-500 font-medium">Cancel</button>
            </div>
          ) : (
            <>
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 pointer-events-none border-[30px] border-black/40">
                <div className="w-full h-full border-2 border-white/20 rounded-3xl relative">
                   {/* Scanning animation lines */}
                   <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-orange-500/50 shadow-[0_0_15px_rgba(249,115,22,0.5)] animate-scan"></div>
                </div>
              </div>
              <div className="absolute bottom-10 left-0 right-0 flex items-center justify-center px-8 gap-8">
                <button 
                  onClick={stopCamera}
                  className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/20"
                >
                  <X className="w-6 h-6" />
                </button>
                <button 
                  onClick={capturePhoto}
                  className="w-20 h-20 bg-orange-500 rounded-full flex items-center justify-center border-4 border-white shadow-2xl shadow-orange-500/40 active:scale-95 transition-transform"
                >
                  <CameraIcon className="text-white w-10 h-10" />
                </button>
                <div className="w-14 h-14" /> {/* Spacer */}
              </div>
              <div className="absolute top-6 left-0 right-0 text-center">
                <p className="bg-black/40 backdrop-blur-md inline-block px-4 py-2 rounded-full text-white text-sm font-medium">
                  Scan Fridge or Pantry
                </p>
              </div>
            </>
          )}
          <canvas ref={canvasRef} className="hidden" />
        </div>
      )}

      {mode === 'review' && (
        <div className="flex-1 bg-white flex flex-col md:rounded-3xl overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-800 font-serif">Review Scanned Items</h2>
            <button 
              onClick={() => setMode('camera')}
              className="text-slate-400"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {isProcessing ? (
              <div className="flex flex-col items-center justify-center h-64 space-y-4">
                <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
                <div className="text-center">
                  <p className="font-bold text-slate-800">AI is analyzing...</p>
                  <p className="text-sm text-slate-500">Recognizing produce, spices, and more.</p>
                </div>
              </div>
            ) : scannedItems.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-slate-500">No ingredients identified. Try a clearer photo.</p>
                <button 
                  onClick={() => setMode('camera')}
                  className="mt-4 text-orange-500 font-bold"
                >
                  Try Again
                </button>
              </div>
            ) : (
              scannedItems.map((item, idx) => (
                <div key={idx} className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center justify-between animate-in slide-in-from-bottom-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800">{item.name}</h4>
                      <div className="flex gap-2">
                        <span className="text-[10px] uppercase font-bold text-slate-400">{item.category}</span>
                        <span className="text-[10px] uppercase font-bold text-emerald-600">{item.freshness}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-sm font-medium text-slate-600">{item.quantity}</div>
                </div>
              ))
            )}
          </div>

          <div className="p-6 bg-slate-50 border-t border-slate-200">
            <button 
              onClick={handleDone}
              disabled={isProcessing || scannedItems.length === 0}
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-slate-300 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20"
            >
              Add to Pantry <Check className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes scan {
          0% { top: 10%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 90%; opacity: 0; }
        }
        .animate-scan {
          animation: scan 3s infinite linear;
        }
      `}</style>
    </div>
  );
};

export default Scanner;
