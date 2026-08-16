import React, { useEffect, useRef, useState, useCallback } from 'react';

interface CinematicCanvasProps {
  isPlaying: boolean;
  onAnimationComplete: () => void;
  onEyeClick: () => void;
  isEyeClickable: boolean;
  onHeadbandClick: () => void;
}

const TOTAL_FRAMES = 80;
const ROTATE_BREAKPOINT = 900; // px, phones only

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
  onHeadbandClick,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isHoveringEye, setIsHoveringEye] = useState(false);
  const [isHoveringHeadband, setIsHoveringHeadband] = useState(false);

  // Real (actual) window size, tracked live
  const [realDims, setRealDims] = useState({
    w: typeof window !== 'undefined' ? window.innerWidth : 0,
    h: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  const particlesRef = useRef<Particle[]>([]);
  const lastTimeRef = useRef<number>(0);
  const frameProgressRef = useRef<number>(1);
  const hasTriggeredCompleteRef = useRef<boolean>(false);

  // Keep real window size up to date
  useEffect(() => {
    const handleResize = () => {
      setRealDims({ w: window.innerWidth, h: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  // Should we rotate the background to landscape? (narrow phone, held upright)
  const isPortraitPhone = realDims.w > 0 && realDims.w < ROTATE_BREAKPOINT && realDims.w < realDims.h;

  // "Effective" width/height the canvas draws with (swapped when rotated)
  const effW = isPortraitPhone ? realDims.h : realDims.w;
  const effH = isPortraitPhone ? realDims.w : realDims.h;

  useEffect(() => {
    const images: HTMLImageElement[] = [];

    for (let i = 1; i <= TOTAL_FRAMES; i++) {
      const frameNum = String(i).padStart(3, '0');
      const img = new Image();
      img.src = `/frames/ezgif-frame-${frameNum}.png`;
      images.push(img);
    }
    imagesRef.current = images;
  }, []);
  // Play the activation sound the moment the sequence starts
  useEffect(() => {
    if (isPlaying && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {
        // Autoplay can be blocked in rare cases — fail silently
      });
    }
  }, [isPlaying]);
  // Initialize ambient particle system (rain & crimson embers)
  useEffect(() => {
    const particles: Particle[] = [];
    const particleCount = 45;

    for (let i = 0; i < particleCount; i++) {
      const isEmber = Math.random() > 0.65;
      particles.push({
        x: Math.random() * effW,
        y: Math.random() * effH,
        speedY: isEmber ? -(0.3 + Math.random() * 0.7) : 3 + Math.random() * 5,
        speedX: isEmber ? (Math.random() - 0.5) * 0.6 : (Math.random() - 0.5) * 0.4,
        size: isEmber ? 1.5 + Math.random() * 2 : 1 + Math.random() * 1.5,
        opacity: isEmber ? 0.2 + Math.random() * 0.5 : 0.15 + Math.random() * 0.3,
        color: isEmber ? 'rgba(239, 68, 68, ' : 'rgba(220, 230, 242, ',
        type: isEmber ? 'ember' : 'rain',
      });
    }
    particlesRef.current = particles;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Main Render Loop (Canvas drawing + particles + sequence animation)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

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

        if (currentIdx >= TOTAL_FRAMES && !hasTriggeredCompleteRef.current) {
          hasTriggeredCompleteRef.current = true;
          onAnimationComplete();
        }
      }

      // Resize canvas to the effective (rotation-aware) size
      const width = effW;
      const height = effH;
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

      animationId = requestAnimationFrame(render);
    };

    let animationId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [isPlaying, onAnimationComplete, effW, effH]);

  // Helper to map screen coordinates to image coordinates (in effective space)
  const getCoverMetrics = useCallback(() => {
    const width = effW;
    const height = effH;
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
  }, [effW, effH]);

  // Convert a real click/tap point into the rotation-aware "local" coordinate
  // space that the canvas actually draws in.
  const toLocalPoint = useCallback(
    (clientX: number, clientY: number) => {
      if (!isPortraitPhone) {
        return { x: clientX, y: clientY };
      }
      // Background is rotated 90deg clockwise via CSS (transform-origin: top left,
      // rotate(90deg) translateY(-100%)). This is the matching inverse mapping.
      return {
        x: clientY,
        y: realDims.w - clientX,
      };
    },
    [isPortraitPhone, realDims.w]
  );

  // Shared normalized-position helper
  const getNormalizedPoint = useCallback(
    (clientX: number, clientY: number) => {
      const { x, y } = toLocalPoint(clientX, clientY);
      const { drawW, drawH, drawX, drawY } = getCoverMetrics();
      return {
        normX: (x - drawX) / drawW,
        normY: (y - drawY) / drawH,
      };
    },
    [getCoverMetrics, toLocalPoint]
  );

  // Hit test for Itachi's eyes
  const isPointInEyeRegion = useCallback(
    (clientX: number, clientY: number) => {
      const { normX, normY } = getNormalizedPoint(clientX, clientY);

      // In 1920x1080 frame:
      // Left eye (viewer left): X: 37% - 46%, Y: 41% - 48%
      // Right eye (viewer right): X: 54% - 63%, Y: 41% - 48%
      // Bridge & gaze area: X: 36% - 64%, Y: 40% - 49%
      const inX = normX >= 0.36 && normX <= 0.64;
      const inY = normY >= 0.39 && normY <= 0.50;

      return inX && inY;
    },
    [getNormalizedPoint]
  );

  // Hit test for the headband, just above the leaf-symbol cut mark
  const isPointInHeadbandRegion = useCallback(
    (clientX: number, clientY: number) => {
      const { normX, normY } = getNormalizedPoint(clientX, clientY);

      const inX = normX >= 0.40 && normX <= 0.60;
      const inY = normY >= 0.17 && normY <= 0.26;

      return inX && inY;
    },
    [getNormalizedPoint]
  );

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isPlaying) {
      if (isHoveringEye) setIsHoveringEye(false);
      if (isHoveringHeadband) setIsHoveringHeadband(false);
      return;
    }

    setIsHoveringEye(isEyeClickable && isPointInEyeRegion(e.clientX, e.clientY));
    setIsHoveringHeadband(isPointInHeadbandRegion(e.clientX, e.clientY));
  };

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isPlaying) return;

    if (isPointInHeadbandRegion(e.clientX, e.clientY)) {
      onHeadbandClick();
      return;
    }

    if (isEyeClickable && isPointInEyeRegion(e.clientX, e.clientY)) {
      onEyeClick();
    }
  };

  const isHovering = isHoveringEye || isHoveringHeadband;

  const wrapperStyle: React.CSSProperties = isPortraitPhone
    ? {
        position: 'fixed',
        top: 0,
        left: 0,
        width: `${effW}px`,
        height: `${effH}px`,
        transformOrigin: 'top left',
        transform: 'rotate(90deg) translateY(-100%)',
        cursor: isHovering && !isPlaying ? 'pointer' : 'default',
      }
    : {
        cursor: isHovering && !isPlaying ? 'pointer' : 'default',
      };

  return (
    <div
      className={isPortraitPhone ? 'overflow-hidden select-none' : 'relative w-full h-full overflow-hidden select-none'}
      onMouseMove={handleMouseMove}
      onClick={handleClick}
      style={wrapperStyle}
    >
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block" />
      <audio ref={audioRef} src="/mangekyo-sound.mp3" preload="auto" />
    </div>
  );
};
