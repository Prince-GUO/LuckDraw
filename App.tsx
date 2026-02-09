
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { SetupPanel } from './components/SetupPanel';
import { LuckyDrawScene } from './components/LuckyDrawScene';
import { LuckyDrawUI } from './components/LuckyDrawUI';
import { Member, Award, AppState } from './types';
import { MusicPlayer } from './components/MusicPlayer';

const initialNames = Array.from({ length: 88 }, (_, i) => (i + 1).toString().padStart(2, '0'));

const DEFAULT_BG_IMAGE = "https://img.js.design/assets/static/f505492d6e3c5093557e0500d07521c7"; 

const App: React.FC = () => {
  const [members, setMembers] = useState<Member[]>(
    initialNames.map((name, index) => ({
      id: `init-${index}`,
      name: name
    }))
  );
  
  const [awards, setAwards] = useState<Award[]>([
    { 
      id: '3', 
      name: '三等奖 · 龙马精神', 
      count: 10, 
      batchSize: 3, // 分三轮：3 -> 3 -> 4
      winners: [], 
      images: [] // 去掉默认奖品图，由用户在后台自行上传
    },
    { 
      id: '2', 
      name: '二等奖 · 骏马奔腾', 
      count: 6, 
      batchSize: 2, // 每轮2人，分三轮
      winners: [] 
    },
    { 
      id: '1', 
      name: '一等奖 · 马到成功', 
      count: 3, 
      batchSize: 1, // 每轮1人，分三轮
      winners: [] 
    }
  ]);
  
  const [currentAwardIndex, setCurrentAwardIndex] = useState(0);
  const [appState, setAppState] = useState<AppState>(AppState.SETUP);
  
  const [bgImage, setBgImage] = useState<string | null>(DEFAULT_BG_IMAGE);
  const [bgMusic, setBgMusic] = useState<string | null>(null);
  const [allWinners, setAllWinners] = useState<Set<string>>(new Set());

  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [isMusicPaused, setIsMusicPaused] = useState(true);
  const [musicProgress, setMusicProgress] = useState({ current: 0, duration: 0 });
  const [seekTo, setSeekTo] = useState<number | null>(null);

  const availableMembers = useMemo(() => {
    return members.filter(m => !allWinners.has(m.id));
  }, [members, allWinners]);

  const handleWinnersSelect = useCallback((newWinners: Member[]) => {
    if (newWinners.length === 0) return;

    setAwards(prev => {
      const next = [...prev];
      const award = { ...next[currentAwardIndex] };
      const existingIds = new Set(award.winners.map(w => w.id));
      const filteredNewWinners = newWinners.filter(w => !existingIds.has(w.id));
      
      award.winners = [...award.winners, ...filteredNewWinners];
      next[currentAwardIndex] = award;
      return next;
    });

    setAllWinners(prev => {
      const next = new Set(prev);
      newWinners.forEach(w => next.add(w.id));
      return next;
    });
  }, [currentAwardIndex]);

  const handleRemoveWinner = useCallback((winnerId: string) => {
    setAwards(prev => prev.map(award => ({
      ...award,
      winners: award.winners.filter(w => w.id !== winnerId)
    })));
    setAllWinners(prev => {
      const next = new Set(prev);
      next.delete(winnerId);
      return next;
    });
  }, []);

  const handleClearAward = useCallback((awardId: string) => {
    setAwards(prev => {
      const targetAward = prev.find(a => a.id === awardId);
      if (!targetAward) return prev;
      
      const winnersToRelease = targetAward.winners.map(w => w.id);
      
      setAllWinners(currentAll => {
        const nextAll = new Set(currentAll);
        winnersToRelease.forEach(id => nextAll.delete(id));
        return nextAll;
      });

      return prev.map(a => a.id === awardId ? { ...a, winners: [] } : a);
    });
  }, []);

  const handleClearAll = useCallback(() => {
    setAwards(prev => prev.map(a => ({ ...a, winners: [] })));
    setAllWinners(new Set());
  }, []);

  const toggleView = useCallback(() => {
    if (appState === AppState.SETUP) {
      if (members.length === 0) {
        alert("请先导入或录入抽奖名单！");
        return;
      }
      setAppState(AppState.READY);
      setIsMusicPaused(false);
    } else {
      setAppState(AppState.SETUP);
      setIsMusicPaused(true);
    }
  }, [appState, members.length]);

  const handleMusicTimeUpdate = useCallback((current: number, duration: number) => {
    setMusicProgress({ current, duration });
    setSeekTo(null);
  }, []);

  const handleSeekMusic = useCallback((time: number) => {
    setSeekTo(time);
  }, []);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#d60000] text-white">
      <div className="absolute inset-0 z-0">
        {bgImage && (
          <div className="absolute inset-0 pointer-events-none transition-opacity duration-1000">
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${bgImage})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60" />
          </div>
        )}
      </div>

      {appState !== AppState.SETUP && (
        <LuckyDrawScene 
          members={availableMembers}
          appState={appState}
        />
      )}

      {appState === AppState.SETUP ? (
        <SetupPanel 
          members={members}
          setMembers={setMembers}
          awards={awards}
          setAwards={setAwards}
          bgImage={bgImage}
          setBgImage={setBgImage}
          bgMusic={bgMusic}
          setBgMusic={setBgMusic}
          onStart={toggleView}
        />
      ) : (
        <LuckyDrawUI 
          awards={awards}
          currentAwardIndex={currentAwardIndex}
          setCurrentAwardIndex={setCurrentAwardIndex}
          appState={appState}
          setAppState={setAppState}
          onExit={toggleView}
          allWinnersCount={allWinners.size}
          availableMembers={availableMembers}
          onWinnersSelect={handleWinnersSelect}
          onRemoveWinner={handleRemoveWinner}
          onClearAward={handleClearAward}
          onClearAll={handleClearAll}
          volume={volume}
          setVolume={setVolume}
          isMuted={isMuted}
          setIsMuted={setIsMuted}
          isMusicPaused={isMusicPaused}
          setIsMusicPaused={setIsMusicPaused}
          musicProgress={musicProgress}
          onSeekMusic={handleSeekMusic}
        />
      )}

      <MusicPlayer 
        musicUrl={bgMusic} 
        isPlaying={!isMusicPaused} 
        volume={volume}
        isMuted={isMuted}
        onTimeUpdate={handleMusicTimeUpdate}
        seekTime={seekTo}
      />
      
      <div className="absolute top-3 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 z-[50] pointer-events-none drop-shadow-2xl">
        <div className="flex items-center gap-6 bg-gradient-to-r from-transparent via-red-600/40 to-transparent backdrop-blur-md px-12 py-2 rounded-full border-y border-yellow-500/20">
          <div className="flex items-center gap-4 text-4xl font-bold font-chinese bg-gradient-to-b from-yellow-100 to-yellow-500 bg-clip-text text-transparent leading-none">
            <span className="tracking-[0.4rem]">正弘物业</span>
            <div className="w-10 h-10 flex items-center justify-center">
              <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-b from-yellow-100 to-yellow-600 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
            </div>
            <span className="tracking-[0.4rem]">马上添福</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
