
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Award, AppState, Member } from '../types';
import { Trophy, ChevronLeft, ChevronRight, Play, Pause, Square, Settings, Award as AwardIcon, X as CloseIcon, Trash2, Star, Music, Volume2, VolumeX } from 'lucide-react';

// GoldBrick3D component providing a realistic 3D golden ingot/brick appearance.
interface GoldBrick3DProps {
  name: string;
  size?: 'small' | 'large' | 'mini';
  style?: React.CSSProperties;
}

const GoldBrick3D: React.FC<GoldBrick3DProps> = ({ name, size = 'large', style = {} }) => {
  const isLarge = size === 'large';
  const isMini = size === 'mini';
  
  // Dimensions shortened as requested
  // Large: 150x64 (from 180) | Small: 75x32 (from 90) | Mini: 60x26 (from 70)
  let width = isLarge ? 150 : isMini ? 60 : 75; 
  let height = isLarge ? 64 : isMini ? 26 : 32;
  const depth = isMini ? 6 : 12;
  const halfDepth = depth / 2;

  const containerClasses = `gold-brick shadow-glow transition-transform hover:scale-110 ${isLarge ? 'animate-reveal' : ''}`;
  const faceClasses = "gold-face flex flex-col items-center justify-center font-bold text-red-950 overflow-hidden backface-hidden";

  return (
    <div 
      className={containerClasses}
      style={{ 
        width: `${width}px`, 
        height: `${height}px`,
        ...style 
      }}
    >
      {/* Front Face */}
      <div 
        className={`${faceClasses} gold-front rounded-md`}
        style={{ width: '100%', height: '100%', fontSize: isLarge ? '1.4rem' : isMini ? '0.65rem' : '0.8rem' }}
      >
        {!isMini && (
          <div className={`absolute top-0.5 left-2 opacity-30 font-black uppercase tracking-tighter pointer-events-none select-none ${isLarge ? 'text-[8px]' : 'text-[5px]'}`}>
            AU 99.9%
          </div>
        )}
        <span className="font-yahei tracking-wider z-10 drop-shadow-sm px-1 text-center truncate w-full">{name}</span>
        <div className={`absolute bottom-0.5 opacity-20 font-bold uppercase tracking-[0.2em] pointer-events-none select-none ${isLarge ? 'text-[7px]' : isMini ? 'text-[4px]' : 'text-[4px]'}`}>
          Fine Gold 2026
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 animate-shimmer pointer-events-none" />
      </div>

      {/* Back Face */}
      <div 
        className={`${faceClasses} gold-back rounded-md`}
        style={{ width: '100%', height: '100%' }}
      />

      {/* Top Face */}
      <div 
        className="gold-face gold-face-top absolute gold-top rounded-sm"
        style={{ width: '100%', height: `${depth}px`, top: `-${halfDepth}px`, left: 0 }}
      />

      {/* Bottom Face */}
      <div 
        className="gold-face gold-face-bottom absolute gold-bottom rounded-sm"
        style={{ width: '100%', height: `${depth}px`, bottom: `-${halfDepth}px`, left: 0 }}
      />

      {/* Left Face */}
      <div 
        className="gold-face gold-face-side absolute gold-left rounded-sm"
        style={{ width: `${depth}px`, height: '100%', left: `-${halfDepth}px`, top: 0 }}
      />

      {/* Right Face */}
      <div 
        className="gold-face gold-face-side absolute gold-right rounded-sm"
        style={{ width: `${depth}px`, height: '100%', right: `-${halfDepth}px`, top: 0 }}
      />
    </div>
  );
};

const DrawingDisplay = ({ 
  availableMembers, 
  slotsToDraw, 
  onStop 
}: { 
  availableMembers: Member[], 
  slotsToDraw: number, 
  onStop: (finalNames: string[]) => void 
}) => {
  const [tempNames, setTempNames] = useState<string[]>([]);
  const intervalRef = useRef<any>(null);

  useEffect(() => {
    if (slotsToDraw <= 0) return;
    intervalRef.current = setInterval(() => {
      const names: string[] = [];
      const tempPool = [...availableMembers];
      const count = Math.min(slotsToDraw, tempPool.length);
      for (let i = 0; i < count; i++) {
        const idx = Math.floor(Math.random() * tempPool.length);
        const member = tempPool.splice(idx, 1)[0];
        names.push(member.name);
      }
      setTempNames(names);
    }, 60);
    return () => clearInterval(intervalRef.current);
  }, [availableMembers, slotsToDraw]);

  return (
    <div className="flex flex-col items-center gap-10">
      <div className="flex flex-wrap justify-center gap-8 px-4 max-h-[350px] overflow-y-auto scrollbar-hide">
        {tempNames.map((name, i) => (
          <div key={i} className="text-4xl md:text-5xl font-chinese font-bold text-yellow-400 animate-pulse text-glow drop-shadow-[0_0_10px_rgba(251,191,36,0.5)]">
            {name}
          </div>
        ))}
      </div>
      <button 
        onClick={(e) => { e.stopPropagation(); onStop(tempNames); }}
        className="px-12 py-3 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full text-red-950 font-bold text-2xl shadow-xl hover:scale-105 active:scale-95 transition-all"
      >
        <span className="tracking-widest font-chinese">停止</span>
      </button>
    </div>
  );
};

const RollingNameWall = React.memo(({ members }: { members: Member[] }) => {
    const globeItems = useMemo(() => {
        const pool = [...members];
        if (pool.length === 0) return [];
        const targetCount = Math.max(pool.length, 60);
        while (pool.length < targetCount) {
          pool.push(...members.map(m => ({ ...m, id: `${m.id}-clone-${pool.length}` })));
        }
        
        // Reduced radius from 0.46 to 0.40 to ensure the globe is well-contained.
        const radius = Math.min(window.innerWidth, window.innerHeight) * 0.40;
        // Compression factor for the Y-axis (0.8) reduces the vertical spacing between bricks.
        const yScale = 0.8;
        
        const total = pool.length;
        return pool.map((member, i) => {
            const phi = Math.acos(-1 + (2 * i) / total);
            const theta = Math.sqrt(total * Math.PI) * phi;
            const rotateY = (theta * 180) / Math.PI;
            
            // Applying vertical compression
            const yOffset = radius * Math.cos(phi) * yScale;
            const horizontalRadius = radius * Math.sin(phi);
            
            return {
                ...member,
                style: {
                    position: 'absolute' as const,
                    left: '50%',
                    top: '50%',
                    transform: `translate(-50%, -50%) rotateY(${rotateY}deg) translateZ(${horizontalRadius}px) translateY(${yOffset}px)`,
                }
            };
        });
    }, [members]);

    return (
        <div className="relative w-full h-full flex items-center justify-center preserve-3d animate-spin-y-3d">
            {globeItems.map((m, i) => (
                <GoldBrick3D key={`${m.id}-${i}`} name={m.name} size="small" style={m.style} />
            ))}
        </div>
    );
});

interface Props {
  awards: Award[];
  currentAwardIndex: number;
  setCurrentAwardIndex: React.Dispatch<React.SetStateAction<number>>;
  appState: AppState;
  setAppState: React.Dispatch<React.SetStateAction<AppState>>;
  onExit: () => void;
  allWinnersCount: number;
  availableMembers: Member[];
  onWinnersSelect: (winners: Member[]) => void;
  onRemoveWinner: (id: string) => void;
  onClearAward: (id: string) => void;
  onClearAll: () => void;
  volume: number;
  setVolume: React.Dispatch<React.SetStateAction<number>>;
  isMuted: boolean;
  setIsMuted: React.Dispatch<React.SetStateAction<boolean>>;
  isMusicPaused: boolean;
  setIsMusicPaused: React.Dispatch<React.SetStateAction<boolean>>;
  musicProgress: { current: number; duration: number };
  onSeekMusic: (time: number) => void;
}

export const LuckyDrawUI: React.FC<Props> = ({ 
  awards, currentAwardIndex, setCurrentAwardIndex, appState, setAppState, onExit, 
  allWinnersCount, availableMembers, onWinnersSelect, onRemoveWinner, onClearAward, onClearAll,
  volume, setVolume, isMuted, setIsMuted, isMusicPaused, setIsMusicPaused, musicProgress, onSeekMusic
}) => {
  const [resultWinnerNames, setResultWinnerNames] = useState<string[]>([]);
  const [showWinnersModal, setShowWinnersModal] = useState(false);
  
  const award = awards[currentAwardIndex];
  const remainingTotal = Math.max(0, award.count - award.winners.length);

  // 核心逻辑：实现 3-3-4 等分批抽奖逻辑
  const slotsToDraw = useMemo(() => {
    if (!award.batchSize) return remainingTotal;
    
    // 如果是最后一轮（剩下的不多于 batchSize * 1.5），则全部抽完
    if (remainingTotal <= award.batchSize * 1.5) {
      return remainingTotal;
    }
    return award.batchSize;
  }, [award.batchSize, remainingTotal]);

  const stopDraw = useCallback((finalNames: string[]) => {
    const winners = availableMembers.filter(m => finalNames.includes(m.name)).slice(0, slotsToDraw);
    if (winners.length > 0) {
      onWinnersSelect(winners);
      setResultWinnerNames(winners.map(w => w.name));
      setAppState(AppState.RESULT);
    } else {
      setAppState(AppState.READY);
    }
  }, [slotsToDraw, availableMembers, onWinnersSelect, setAppState]);

  return (
    <div className="absolute inset-0 flex flex-col pointer-events-none z-20">
      <div className="flex items-center justify-between pt-4 px-8 pb-0 w-full">
         <div />
         <button 
           onClick={() => setShowWinnersModal(true)}
           className="pointer-events-auto flex items-center gap-3 px-8 py-3 bg-red-600/60 backdrop-blur-md rounded-full border border-yellow-500 shadow-xl text-white font-bold hover:scale-105 transition-all"
         >
           <AwardIcon size={24} className="text-yellow-400" />
           <span className="font-chinese tracking-widest text-xl">中奖榜 ({allWinnersCount})</span>
         </button>
      </div>

      <div className="flex-1 relative overflow-hidden">
        <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-1000 ${appState === AppState.RESULT ? 'opacity-90' : 'opacity-100'}`}>
           <RollingNameWall members={availableMembers} />
        </div>

        <div className={`absolute right-12 top-1/2 -translate-y-1/2 w-full max-sm:hidden max-w-sm flex flex-col items-center p-8 bg-red-950/80 backdrop-blur-lg rounded-3xl border-2 border-yellow-500/50 shadow-2xl transition-all pointer-events-auto ${appState === AppState.RESULT ? 'opacity-0' : 'opacity-100'}`}>
          <h2 className="text-3xl font-chinese text-yellow-400 mb-6 font-bold tracking-widest">{award.name}</h2>
          <div className="flex items-center gap-4 mb-8">
            <button onClick={() => setCurrentAwardIndex((currentAwardIndex - 1 + awards.length) % awards.length)} className="text-white hover:text-yellow-400 transition-colors"><ChevronLeft size={32}/></button>
            <div className="text-center min-w-[120px]">
              <span className="text-xs opacity-60 uppercase font-bold tracking-widest mb-1 block">已抽出 / 总数</span>
              <div className="text-3xl font-bold font-mono text-yellow-50">{award.winners.length} <span className="text-yellow-500/30">/</span> {award.count}</div>
            </div>
            <button onClick={() => setCurrentAwardIndex((currentAwardIndex + 1) % awards.length)} className="text-white hover:text-yellow-400 transition-colors"><ChevronRight size={32}/></button>
          </div>
          
          <div className="text-sm text-yellow-500/60 mb-6 italic">
            {remainingTotal > 0 ? `当前轮次将抽出 ${slotsToDraw} 位` : "本奖项已抽完"}
          </div>

          {appState === AppState.READY && remainingTotal > 0 && (
            <button onClick={() => setAppState(AppState.DRAWING)} className="w-full py-5 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-2xl text-red-950 font-bold text-3xl hover:scale-105 transition-all shadow-[0_0_30px_rgba(251,191,36,0.4)] animate-pulse">
              <span className="font-chinese tracking-widest">开始抽奖</span>
            </button>
          )}
          {appState === AppState.DRAWING && (
            <DrawingDisplay availableMembers={availableMembers} slotsToDraw={slotsToDraw} onStop={stopDraw} />
          )}
        </div>

        {appState === AppState.RESULT && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-auto bg-black/5 p-4">
            <div className="relative flex flex-col items-center max-w-6xl w-full p-12 bg-red-950/5 backdrop-blur-md rounded-[4rem] border border-yellow-500/30 shadow-[0_0_100px_rgba(251,191,36,0.2)] animate-reveal">
              <div className="absolute -top-12 bg-gradient-to-b from-yellow-300 to-yellow-600 px-16 py-5 rounded-full text-red-950 font-bold text-4xl shadow-xl flex items-center gap-5 border-4 border-red-900/40 backdrop-blur-xl">
                <Trophy size={40} />
                <span className="font-chinese tracking-widest">恭喜中奖</span>
              </div>
              {/* Increased gap further from 12 to 16 to ensure bricks don't touch */}
              <div className="flex flex-wrap justify-center gap-16 w-full mt-10 overflow-y-auto max-h-[60vh] p-8 scrollbar-hide">
                 {resultWinnerNames.map((name, i) => (
                   <GoldBrick3D key={i} name={name} size="large" />
                 ))}
              </div>
              <button onClick={() => setAppState(AppState.READY)} className="mt-14 px-20 py-4 bg-yellow-500 rounded-full font-bold text-red-950 text-3xl shadow-xl hover:scale-110 transition-all tracking-widest font-chinese">
                载入史册
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="px-10 py-6 flex items-center justify-between pointer-events-auto bg-gradient-to-t from-black/40 to-transparent relative">
        <div className="flex items-center gap-6 bg-red-950/60 p-2 px-6 rounded-2xl border border-yellow-500/20 shadow-lg z-10">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsMusicPaused(!isMusicPaused)} className="text-yellow-400 hover:scale-110 transition-all">
              {isMusicPaused ? <Play size={24} fill="currentColor"/> : <Pause size={24} fill="currentColor"/>}
            </button>
            
            <div className="flex items-center gap-2 px-3 py-1 bg-black/20 rounded-full border border-yellow-500/10">
              <button onClick={() => setIsMuted(!isMuted)} className="text-yellow-500/60 hover:text-yellow-400 transition-colors">
                {isMuted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
              </button>
              <input 
                type="range" 
                min="0" 
                max="1" 
                step="0.01" 
                value={isMuted ? 0 : volume} 
                onChange={(e) => {
                  setVolume(parseFloat(e.target.value));
                  if (isMuted) setIsMuted(false);
                }}
                className="w-20 h-1 bg-yellow-900 rounded-lg appearance-none cursor-pointer accent-yellow-500"
              />
            </div>
          </div>

          <div className="flex flex-col border-l border-yellow-500/10 pl-4">
            <div className="text-[10px] text-yellow-500/40 font-bold uppercase tracking-widest">BGM Playing</div>
          </div>
          <button onClick={onExit} className="p-1.5 text-white/30 hover:text-white hover:bg-white/10 rounded-full transition-all"><Settings size={20}/></button>
        </div>

        {/* 底部中间金色标语 */}
        <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 pointer-events-none text-center">
          <span className="text-3xl font-chinese font-bold bg-gradient-to-b from-yellow-100 to-yellow-500 bg-clip-text text-transparent tracking-[0.8rem] drop-shadow-[0_0_15px_rgba(251,191,36,0.6)]">
            好生活 住正弘
          </span>
        </div>

        <div className="bg-gradient-to-b from-yellow-100 to-yellow-500 bg-clip-text text-transparent text-xs uppercase tracking-[1rem] font-bold font-yahei z-10 drop-shadow-[0_0_8px_rgba(251,191,36,0.4)]">
          ZHENGHONG PROPERTY
        </div>
      </div>

      {showWinnersModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-8 pointer-events-auto bg-black/90 backdrop-blur-2xl">
          <div className="relative w-full max-w-5xl h-[85vh] bg-gradient-to-br from-red-900 via-red-800 to-red-950 rounded-[3rem] border-4 border-yellow-600 shadow-[0_0_120px_rgba(185,28,28,0.4)] flex flex-col overflow-hidden animate-reveal">
            
            <div className="p-10 border-b border-yellow-600/30 flex items-center justify-between bg-black/30 z-10">
              <div className="flex items-center gap-5">
                <div className="p-3 bg-yellow-500 rounded-2xl shadow-lg">
                    <AwardIcon size={32} className="text-red-900" />
                </div>
                <h3 className="text-4xl font-chinese text-yellow-500 tracking-[0.5rem] drop-shadow-md">荣誉中奖榜单</h3>
              </div>
              <button 
                onClick={() => setShowWinnersModal(false)} 
                className="text-yellow-500/60 hover:text-yellow-500 transition-all p-2 hover:bg-white/5 rounded-full"
              >
                <CloseIcon size={48}/>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-12 space-y-16 scrollbar-hide z-10">
                {awards.map((a) => (
                    <div key={a.id} className="space-y-8">
                        <div className="flex items-center gap-6 text-2xl font-chinese font-bold text-yellow-100 border-l-8 border-yellow-500 pl-8 bg-gradient-to-r from-yellow-500/20 to-transparent py-3 rounded-r-3xl">
                          <span className="tracking-widest">{a.name}</span>
                          <span className="text-yellow-500 bg-red-950/80 px-5 py-1 rounded-full text-xl font-mono shadow-inner border border-yellow-500/10">{a.winners.length} <span className="text-sm opacity-40">/ {a.count}</span></span>
                        </div>
                        {/* Increased gap from 10 to 12 for better spacing in the full list */}
                        <div className="flex flex-wrap gap-12 pl-8">
                          {a.winners.map(w => (
                            <div key={w.id} className="relative group animate-reveal">
                              <GoldBrick3D name={w.name} size="mini" />
                              <button 
                                onClick={() => onRemoveWinner(w.id)} 
                                className="absolute -top-3 -right-3 opacity-0 group-hover:opacity-100 bg-red-600 text-white rounded-full p-1.5 shadow-xl hover:bg-red-500 transition-all z-20 scale-75 group-hover:scale-100 border-2 border-white/20"
                              >
                                <Trash2 size={14}/>
                              </button>
                            </div>
                          ))}
                          {a.winners.length === 0 && (
                            <div className="px-10 py-6 bg-red-950/30 border border-yellow-500/10 rounded-3xl text-yellow-500/20 italic text-xl font-chinese tracking-widest">
                              虚位以待，好运即来...
                            </div>
                          )}
                        </div>
                    </div>
                ))}
            </div>

            <div className="p-5 bg-black/40 border-t border-yellow-600/10 text-center">
               <p className="text-yellow-500/30 text-[10px] tracking-[1.5rem] uppercase font-bold">2026 Annual Gala · Honor List</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
