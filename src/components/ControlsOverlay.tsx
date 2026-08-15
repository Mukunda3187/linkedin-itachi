import React, { useState } from 'react';
import { Volume2, VolumeX, Key, RotateCcw } from 'lucide-react';
import { audioEngine } from '../services/audioEngine';

interface ControlsOverlayProps {
  onOpenApiKeyModal: () => void;
  onReset: () => void;
  showReset: boolean;
}

export const ControlsOverlay: React.FC<ControlsOverlayProps> = ({
  onOpenApiKeyModal,
  onReset,
  showReset,
}) => {
  const [isMuted, setIsMuted] = useState(audioEngine.getIsMuted());

  const toggleMute = () => {
    const nextMute = !isMuted;
    audioEngine.setMuted(nextMute);
    setIsMuted(nextMute);
    if (!nextMute) {
      audioEngine.playClickTick();
    }
  };

  return (
    <div className="fixed top-5 right-5 z-30 flex items-center space-x-3 pointer-events-auto">
      {showReset && (
        <button
          onClick={onReset}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full glass-panel border border-red-500/20 text-neutral-300 hover:text-white hover:border-red-500/50 text-xs transition-all duration-300 shadow-md backdrop-blur-md group"
          title="Awaken Again"
        >
          <RotateCcw className="w-3.5 h-3.5 text-red-400 group-hover:rotate-180 transition-transform duration-500" />
          <span className="font-serif tracking-wider text-[11px] uppercase">Awaken Again</span>
        </button>
      )}

      <button
        onClick={onOpenApiKeyModal}
        className="p-2 rounded-full glass-panel border border-white/10 text-neutral-400 hover:text-neutral-200 hover:border-white/30 transition-all duration-200"
        title="Gemini API Key Settings"
      >
        <Key className="w-4 h-4" />
      </button>

      <button
        onClick={toggleMute}
        className="p-2 rounded-full glass-panel border border-white/10 text-neutral-400 hover:text-neutral-200 hover:border-white/30 transition-all duration-200"
        title={isMuted ? 'Unmute Cinematic Audio' : 'Mute Audio'}
      >
        {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-neutral-300" />}
      </button>
    </div>
  );
};
