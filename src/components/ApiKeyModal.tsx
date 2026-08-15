import React, { useState } from 'react';
import { Key, X, Check, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { getStoredApiKey, setStoredApiKey } from '../services/geminiVision';
import { audioEngine } from '../services/audioEngine';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose }) => {
  const [apiKey, setApiKey] = useState(getStoredApiKey());
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setStoredApiKey(apiKey);
    setSaved(true);
    audioEngine.playClickTick();
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-md p-6 rounded-2xl glass-card-crimson text-neutral-100 shadow-2xl border border-red-500/30">
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center space-x-2.5">
            <Key className="w-4 h-4 text-red-400" />
            <h3 className="font-serif text-sm font-semibold tracking-wider text-neutral-200 uppercase">
              Google Gemini Vision API Key
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSave} className="mt-4 space-y-4">
          <p className="text-xs text-neutral-300 leading-relaxed">
            Enter your Google Gemini API key to enable live AI vision analysis of your uploaded project screenshots. If left blank, the app will use our built-in intelligent contextual vision engine.
          </p>

          <div className="relative">
            <input
              type={showKey ? 'text' : 'password'}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full px-4 py-2.5 pr-10 text-xs bg-black/60 border border-neutral-700 rounded-xl focus:outline-none focus:border-red-500 text-neutral-100 font-mono"
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-200"
            >
              {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center space-x-1 text-[11px] text-neutral-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Stored locally in browser</span>
            </div>

            <button
              type="submit"
              className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-wider uppercase transition-all duration-300 flex items-center space-x-1.5 ${
                saved
                  ? 'bg-emerald-600 text-white'
                  : 'bg-red-700 hover:bg-red-600 text-white'
              }`}
            >
              {saved ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Saved</span>
                </>
              ) : (
                <span>Save Key</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
