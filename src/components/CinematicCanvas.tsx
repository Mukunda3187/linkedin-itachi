import React, { useEffect, useRef, useState, useCallback } from 'react';
import { audioEngine } from '../services/audioEngine';

interface CinematicCanvasProps {
  isPlaying: boolean;
  onAnimationComplete: () => void;
  onEyeClick: () => void;
  currentFrameIndex: number;
  onFrameUpdate: (frame: number) => void;
}

const TOTAL_FRAMES = 73;

interface Particle {
  x: number;
  y: number;
  speedY: number;
  speedX: number;
  size: number;
  opacity: number;
  color: string;
  type: 'rain' | 'ember';
}

export const CinematicCanvas: React.FC<CinematicCanvasProps> = ({
  isPlaying,
  onAnimationComplete,
  onEyeClick,
  isEyeClickable,
  currentFrameIndex,
  onFrameUpdate,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const [loadedCount, setLoadedCount] = useState(0);
  const [isHoveringEye, setIsHoveringEye] = useState(false);
  const [hoverEyeCoords, setHoverEyeCoords] = useState<{ x: number; y: number } | null>(null);
  
  const animationFrameIdRef = useRef<number | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const lastTimeRef = useRef<number>(0);
  const frameProgressRef = useRef<number>(1);
  const hasTriggeredCompleteRef = useRef<boolean>(false);

  // Preload all 73 frames
  useEffect(() => {
    let mounted = true;
    const images: HTMLImageElement[] = [];
    let loaded = 0;

    for (let i = 1; i <= TOTAL_FRAMES; i++) {
      const frameNum = String(i).padStart(3, '0');
      const img = new Image();
      img.src = `/frames/ezgif-frame-${frameNum}.jpg`;

      img.onload = () => {
        if (!mounted) return;
        loaded++;
        setLoadedCount(loaded);
      };
      img.onerror = () => {
        if (!mounted) return;
        loaded++;
        setLoadedCount(loaded);
      };
      images.push(img);
    }
    imagesRef.current = images;

    return () => {
      mounted = false;
    };
  }, []);

  // Initialize ambient particle system (rain & crimson embers)
  useEffect(() => {
    const particles: Particle[] = [];
    const particleCount = 45;

    for (let i = 0; i < particleCount; i++) {
      const isEmber = Math.random() > 0.65;
      particles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        speedY: isEmber ? -(0.3 + Math.random() * 0.7) : 3 + Math.random() * 5,
        speedX: isEmber ? (Math.random() - 0.5) * 0.6 : (Math.random() - 0.5) * 0.4,
        size: isEmber ? 1.5 + Math.random() * 2 : 1 + Math.random() * 1.5,
        opacity: isEmber ? 0.2 + Math.random() * 0.5 : 0.15 + Math.random() * 0.3,
        color: isEmber ? 'rgba(239, 68, 68, ' : 'rgba(220, 230, 242, ',
        type: isEmber ? 'ember' : 'rain',
      });
    }
    particlesRef.current = particles;
  }, []);

  // Reset frame when requested from parent
  useEffect(() => {
    frameProgressRef.current = currentFrameIndex;
    if (currentFrameIndex === 1) {
      hasTriggeredCompleteRef.current = false;
    }
  }, [currentFrameIndex]);

  // Main Render Loop (Canvas drawing + particles + sequence animation)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let animId: number;

    const render = (time: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = time;
      const delta = time - lastTimeRef.current;
      lastTimeRef.current = time;

      // Handle sequence playback
      if (isPlaying && frameProgressRef.current < TOTAL_FRAMES) {
        // Targeted playback duration: ~2.4 seconds across 73 frames (~30 fps)
        const frameIncrement = (delta / 1000) * 30.5;
        frameProgressRef.current = Math.min(TOTAL_FRAMES, frameProgressRef.current + frameIncrement);
        const currentIdx = Math.floor(frameProgressRef.current);
        onFrameUpdate(currentIdx);

        if (currentIdx >= TOTAL_FRAMES && !hasTriggeredCompleteRef.current) {
          hasTriggeredCompleteRef.current = true;
          onAnimationComplete();
        }
      }

      // Resize canvas to window
      const width = window.innerWidth;
      const height = window.innerHeight;
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }

      // Determine active frame image
      const activeIdx = Math.max(1, Math.min(TOTAL_FRAMES, Math.floor(frameProgressRef.current)));
      const activeImg = imagesRef.current[activeIdx - 1];

      // Draw background image with object-fit: cover
      if (activeImg && activeImg.complete && activeImg.naturalWidth > 0) {
        const imgRatio = activeImg.naturalWidth / activeImg.naturalHeight;
        const screenRatio = width / height;

        let drawW: number;
        let drawH: number;
        let drawX: number;
        let drawY: number;

        if (screenRatio > imgRatio) {
          drawW = width;
          drawH = width / imgRatio;
          drawX = 0;
          drawY = (height - drawH) / 2;
        } else {
          drawH = height;
          drawW = height * imgRatio;
          drawX = (width - drawW) / 2;
          drawY = 0;
        }

        ctx.drawImage(activeImg, drawX, drawY, drawW, drawH);
      } else {
        // Fallback dark canvas
        ctx.fillStyle = '#050507';
        ctx.fillRect(0, 0, width, height);
      }

      // Subtle ambient vignette
      const gradient = ctx.createRadialGradient(
        width / 2,
        height / 2,
        Math.min(width, height) * 0.35,
        width / 2,
        height / 2,
        Math.max(width, height) * 0.75
      );
      gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
      gradient.addColorStop(0.7, 'rgba(0, 0, 0, 0.45)');
      gradient.addColorStop(1, 'rgba(3, 3, 5, 0.85)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Render atmospheric embers & rain
      const particles = particlesRef.current;
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.y += p.speedY;
        p.x += p.speedX;

        // Wrap around
        if (p.type === 'ember') {
          if (p.y < 0) {
            p.y = height + 10;
            p.x = Math.random() * width;
          }
        } else {
          if (p.y > height) {
            p.y = -10;
            p.x = Math.random() * width;
          }
        }

        ctx.fillStyle = `${p.color}${p.opacity})`;
        if (p.type === 'rain') {
          ctx.fillRect(p.x, p.y, p.size, p.size * 4);
        } else {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    animationFrameIdRef.current = animId;

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [isPlaying, onAnimationComplete, onFrameUpdate]);

  // Helper to map screen coordinates to image coordinates
  const getCoverMetrics = useCallback(() => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const imgRatio = 1920 / 1080;
    const screenRatio = width / height;

    let drawW: number;
    let drawH: number;
    let drawX: number;
    let drawY: number;

    if (screenRatio > imgRatio) {
      drawW = width;
      drawH = width / imgRatio;
      drawX = 0;
      drawY = (height - drawH) / 2;
    } else {
      drawH = height;
      drawW = height * imgRatio;
      drawX = (width - drawW) / 2;
      drawY = 0;
    }

    return { drawW, drawH, drawX, drawY };
  }, []);

  // Hit test for Itachi's eyes
  const isPointInEyeRegion = useCallback(
    (clientX: number, clientY: number) => {
      const { drawW, drawH, drawX, drawY } = getCoverMetrics();
      const normX = (clientX - drawX) / drawW;
      const normY = (clientY - drawY) / drawH;

      // In 1920x1080 frame:
      // Left eye (viewer left): X: 37% - 46%, Y: 41% - 48%
      // Right eye (viewer right): X: 54% - 63%, Y: 41% - 48%
      // Bridge & gaze area: X: 36% - 64%, Y: 40% - 49%
      const inX = normX >= 0.36 && normX <= 0.64;
      const inY = normY >= 0.39 && normY <= 0.50;

      return inX && inY;
    },
    [getCoverMetrics]
  );

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isEyeClickable || isPlaying) {
      if (isHoveringEye) setIsHoveringEye(false);
      return;
    }

    const inEye = isPointInEyeRegion(e.clientX, e.clientY);
    if (inEye) {
      if (!isHoveringEye) {
        audioEngine.playEyeHover();
      }
      setIsHoveringEye(true);
      setHoverEyeCoords({ x: e.clientX, y: e.clientY });
    } else {
      setIsHoveringEye(false);
    }
  };

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isEyeClickable || isPlaying) return;

    const inEye = isPointInEyeRegion(e.clientX, e.clientY);
    if (inEye) {
      audioEngine.playSharinganActivation();
      onEyeClick();
    }
  };

  const loadingPercentage = Math.round((loadedCount / TOTAL_FRAMES) * 100);

  return (
    <div
      className="relative w-full h-full overflow-hidden select-none"
      onMouseMove={handleMouseMove}
      onClick={handleClick}
      style={{
        cursor: isHoveringEye && isEyeClickable && !isPlaying ? 'pointer' : 'default',
      }}
    >
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block" />

      {/* Subtle eye hover glow indicator */}
      {isHoveringEye && hoverEyeCoords && isEyeClickable && !isPlaying && (
        <div
          className="eye-glow-ring pointer-events-none"
          style={{
            left: `${hoverEyeCoords.x}px`,
            top: `${hoverEyeCoords.y}px`,
            width: '140px',
            height: '140px',
            opacity: 1,
            transform: 'translate(-50%, -50%) scale(1.15)',
          }}
        />
      )}
    </div>
  );
};
