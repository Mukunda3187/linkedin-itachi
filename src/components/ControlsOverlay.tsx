import React from 'react';
import { RotateCcw } from 'lucide-react';

interface ControlsOverlayProps {
  onReset: () => void;
  showReset: boolean;
}

export const ControlsOverlay: React.FC<ControlsOverlayProps> = ({
  onReset,
  showReset,
}) => {
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
    </div>
  );
};
