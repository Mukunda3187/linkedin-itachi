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
    </div>
  );
};
