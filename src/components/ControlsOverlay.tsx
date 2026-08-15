import React, { useState } from 'react';
import { Volume2, VolumeX, RotateCcw } from 'lucide-react';
import { audioEngine } from '../services/audioEngine';

interface ControlsOverlayProps {
  onReset: () => void;
  showReset: boolean;
}

export const ControlsOverlay: React.FC<ControlsOverlayProps> = ({
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
