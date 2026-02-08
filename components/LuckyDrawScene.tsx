
import React, { useMemo, useState, useEffect, useRef } from 'react';
import { AppState } from '../types';

interface FireworkProps {
  x: number;
  y: number;
  color: string;
  type?: 'aerial' | 'firecracker';
}

const AerialFirework: React.FC<FireworkProps> = ({ x, y, color }) => {
  const particles = useMemo(() => {
    // Increased particle count from 48 to 72 for a richer burst
    return Array.from({ length: 72 }).map((_, i) => {
      const angle = (i * (360 / 72)) * (Math.PI / 180);
      const isInner = i % 3 === 0;
      const distance = isInner ? (Math.random() * 60 + 30) : (Math.random() * 250 + 120);
      const isTrail = Math.random() > 0.6;
      return {
        id: i,
        tx: Math.cos(angle) * distance,
        ty: Math.sin(angle) * distance,
        size: isTrail ? { w: 12, h: 2.5 } : { w: 6, h: 6 },
        rotate: (angle * 180) / Math.PI,
        duration: 1.0 + Math.random() * 1.2,
        delay: Math.random() * 0.1
      };
    });
  }, []);

  return (
    <div className="absolute pointer-events-none" style={{ left: `${x}%`, top: `${y}%` }}>
      <div className="relative w-0 h-0 flex items-center justify-center">
        {/* Central Burst Flash */}
        <div className="absolute w-24 h-24 rounded-full blur-3xl bg-white/70 animate-firework-core" />
        {particles.map(p => (
          <div 
            key={p.id}
            className="absolute animate-spark-fancy"
            style={{ 
              width: `${p.size.w}px`, 
              height: `${p.size.h}px`, 
              backgroundColor: color,
              borderRadius: '50%',
              transform: `rotate(${p.rotate}deg)`,
              '--x': `${p.tx}px`,
              '--y': `${p.ty}px`,
              '--duration': `${p.duration}s`,
              boxShadow: `0 0 20px ${color}, 0 0 40px ${color}aa`,
              animationDelay: `${p.delay}s`
            } as any}
          >
            <div className="w-full h-full bg-white/60 rounded-full animate-twinkle" />
          </div>
        ))}
      </div>
    </div>
  );
};

const FirecrackerEffect: React.FC<FireworkProps> = ({ x, y, color }) => {
  const crackers = useMemo(() => {
    // Increased cracker count from 15 to 30 for higher density
    return Array.from({ length: 30 }).map((_, i) => ({
      id: i,
      offsetX: Math.random() * 60 - 30,
      offsetY: Math.random() * 150 - 75,
      delay: i * 0.04,
      size: Math.random() * 12 + 8
    }));
  }, []);

  return (
    <div className="absolute pointer-events-none" style={{ left: `${x}%`, top: `${y}%` }}>
      {crackers.map(c => (
        <div 
          key={c.id}
          className="absolute animate-crackle flex items-center justify-center"
          style={{ 
            left: `${c.offsetX}px`, 
            top: `${c.offsetY}px`,
            animationDelay: `${c.delay}s`
          }}
        >
          {/* Dynamic color glow (was hardcoded red) */}
          <div 
            className="w-6 h-6 rounded-full blur-md animate-pulse" 
            style={{ backgroundColor: color }}
          />
          {/* Inner white-yellow spark */}
          <div className="absolute w-3 h-3 rounded-full bg-white shadow-[0_0_15px_#fff,0_0_30px_#ffeb3b]" />
        </div>
      ))}
    </div>
  );
};

export const LuckyDrawScene = React.memo(({ appState }: { members: any[], appState: AppState }) => {
  const [activeEffects, setActiveEffects] = useState<{id: number, x: number, y: number, color: string, type: 'aerial' | 'firecracker'}[]>([]);
  const effectIdRef = useRef(0);
  const isDrawing = appState === AppState.DRAWING;
  const isResult = appState === AppState.RESULT;

  const stars = useMemo(() => {
    return Array.from({ length: 80 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      size: Math.random() * 5 + 1,
      duration: Math.random() * 1.5 + 1.0,
      delay: Math.random() * 5
    }));
  }, []);

  useEffect(() => {
    const colors = ['#FFD700', '#FF4500', '#00FFFF', '#FF00FF', '#ADFF2F', '#FFFFFF', '#E91E63', '#FFA500'];
    // Decreased interval times to increase density (more frequent triggers)
    const intervalTime = isResult ? 180 : (isDrawing ? 450 : 1200);

    const triggerEffect = () => {
      // Logic for selecting type based on state
      const type = (isResult || Math.random() > 0.3) ? 'aerial' : 'firecracker';
      
      const newEffect = {
        id: ++effectIdRef.current,
        x: Math.random() * 90 + 5,
        y: Math.random() * 70 + 5,
        color: colors[Math.floor(Math.random() * colors.length)],
        type: type as 'aerial' | 'firecracker'
      };
      
      // Increased buffer from 25 to 50 to allow more simultaneous visuals
      setActiveEffects(prev => [...prev.slice(-50), newEffect]);
      
      setTimeout(() => {
        setActiveEffects(prev => prev.filter(e => e.id !== newEffect.id));
      }, 3000);
    };

    const timer = setInterval(triggerEffect, intervalTime);
    return () => clearInterval(timer);
  }, [isResult, isDrawing]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 5 }}>
      {activeEffects.map(e => (
        e.type === 'aerial' ? (
          <AerialFirework key={e.id} x={e.x} y={e.y} color={e.color} />
        ) : (
          <FirecrackerEffect key={e.id} x={e.x} y={e.y} color={e.color} />
        )
      ))}

      {/* Dynamic Background Rays - slightly more opacity for festive feel */}
      <div className={`absolute inset-0 transition-opacity duration-1000 ${isDrawing || isResult ? 'opacity-60' : 'opacity-30'}`}>
        <div className="absolute top-[-50%] left-[-20%] w-[140%] h-[200%] bg-[conic-gradient(from_0deg_at_50%_50%,transparent_0deg,#ff4d4d_20deg,transparent_40deg,#fbbf24_60deg,transparent_80deg)] animate-spin-slow opacity-40" />
      </div>

      {/* Distant Stars */}
      {stars.map((star) => (
        <div
          key={star.id}
          className="absolute rounded-full bg-white opacity-0 animate-pulse"
          style={{
            left: star.left,
            top: star.top,
            width: `${star.size}px`,
            height: `${star.size}px`,
            animationDuration: `${star.duration}s`,
            animationDelay: `${star.delay}s`,
            boxShadow: star.size > 2 ? '0 0 20px rgba(255,255,255,1)' : 'none'
          }}
        />
      ))}

      {/* Floating Golden Particles */}
      <div className="absolute inset-0">
          {Array.from({ length: 70 }).map((_, i) => (
            <div
              key={i}
              className="absolute bg-yellow-400/30 blur-sm rounded-full animate-float-up"
              style={{
                left: `${Math.random() * 100}%`,
                bottom: '-40px',
                width: `${Math.random() * 18 + 5}px`,
                height: `${Math.random() * 18 + 5}px`,
                animationDuration: `${Math.random() * 7 + 5}s`,
                animationDelay: `${Math.random() * 10}s`
              }}
            />
          ))}
      </div>

      {/* Extra intensity during drawing or result */}
      {(isDrawing || isResult) && (
        <div className="absolute inset-0">
          {Array.from({ length: 60 }).map((_, i) => (
            <div
              key={i}
              className="absolute bg-yellow-300/50 blur-md rounded-full animate-float-up"
              style={{
                left: `${Math.random() * 100}%`,
                bottom: '-60px',
                width: `${Math.random() * 40 + 15}px`,
                height: `${Math.random() * 40 + 15}px`,
                animationDuration: `${Math.random() * 1.8 + 0.6}s`,
                animationDelay: `${Math.random() * 1.0}s`
              }}
            />
          ))}
        </div>
      )}
      
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_20%,rgba(0,0,0,0.4)_100%)]" />
    </div>
  );
});
