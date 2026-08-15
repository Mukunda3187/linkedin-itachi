import React, { useState, useEffect, useRef } from 'react';
import { Copy, Check, Sparkles, Clock } from 'lucide-react';
import { audioEngine } from '../services/audioEngine';

interface LinkedInPostCardProps {
  postText: string;
  onAutoDismiss: () => void;
  durationSeconds?: number;
}

export const LinkedInPostCard: React.FC<LinkedInPostCardProps> = ({
  postText,
  onAutoDismiss,
  durationSeconds = 15,
}) => {
  const [copied, setCopied] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(durationSeconds);
  const startTimeRef = useRef<number>(Date.now());
  const timerIdRef = useRef<number | null>(null);

  // 15-second automatic countdown
  useEffect(() => {
    startTimeRef.current = Date.now();
    setTimeLeft(durationSeconds);
    setIsExiting(false);

    const interval = window.setInterval(() => {
      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      const remaining = Math.max(0, durationSeconds - elapsed);
      setTimeLeft(Math.ceil(remaining));

      if (remaining <= 0.6 && !isExiting) {
        setIsExiting(true);
      }

      if (remaining <= 0) {
        window.clearInterval(interval);
        onAutoDismiss();
      }
    }, 100);

    timerIdRef.current = interval;

    return () => {
      window.clearInterval(interval);
    };
  }, [durationSeconds, onAutoDismiss]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(postText);
      setCopied(true);
      audioEngine.playCopySuccess();
      setTimeout(() => {
        setCopied(false);
      }, 3000);
    } catch {
      // Fallback
      const textArea = document.createElement('textarea');
      textArea.value = postText;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      audioEngine.playCopySuccess();
      setTimeout(() => {
        setCopied(false);
      }, 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 md:p-6 pointer-events-auto select-text">
      {/* Centered Glassmorphic Modal Card */}
      <div
        className={`relative w-full max-w-2xl max-h-[85vh] flex flex-col rounded-2xl glass-card-crimson text-neutral-100 overflow-hidden transition-all duration-500 shadow-2xl ${
          isExiting ? 'card-exit' : 'card-enter'
        }`}
        style={{
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.95), 0 0 40px rgba(220, 38, 38, 0.15)',
        }}
      >
        {/* Top Progress countdown bar */}
        <div className="w-full h-1 bg-neutral-900/60 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-red-700 via-red-500 to-red-400"
            style={{
              width: `${(timeLeft / durationSeconds) * 100}%`,
              transition: 'width 0.1s linear',
            }}
          />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-black/40 backdrop-blur-md">
          <div className="flex items-center space-x-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
            <span className="font-serif tracking-widest text-xs uppercase text-neutral-300 font-semibold">
              Mangekyō Generated • LinkedIn Post
            </span>
          </div>

          <div className="flex items-center space-x-2 text-xs text-neutral-400 font-mono">
            <Clock className="w-3.5 h-3.5 text-red-400" />
            <span>{timeLeft}s auto-dismiss</span>
          </div>
        </div>

        {/* Scrollable Post Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5 custom-scrollbar font-sans text-sm md:text-base leading-relaxed text-neutral-200 whitespace-pre-wrap selection:bg-red-900 selection:text-white">
          {postText}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-white/10 bg-black/50 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-neutral-400 flex items-center space-x-1.5">
            <Sparkles className="w-3.5 h-3.5 text-red-400" />
            <span>Ready for 1-click LinkedIn publishing</span>
          </div>

          {/* Copy Button */}
          <button
            onClick={handleCopy}
            className={`w-full sm:w-auto px-6 py-2.5 rounded-xl font-medium text-xs md:text-sm tracking-wider uppercase transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg ${
              copied
                ? 'bg-emerald-600/90 text-white shadow-emerald-900/50 scale-[1.02]'
                : 'bg-gradient-to-r from-red-700 to-red-600 hover:from-red-600 hover:to-red-500 text-white shadow-red-950/80 hover:shadow-red-800/40 active:scale-95'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-white animate-scale-check" />
                <span className="font-bold">POST COPIED ✓</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-red-200" />
                <span>COPY WHOLE TEXT</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
