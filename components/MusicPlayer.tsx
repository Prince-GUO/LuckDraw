
import React, { useEffect, useRef, useState } from 'react';

interface Props {
  musicUrl: string | null;
  isPlaying: boolean;
  volume: number;
  isMuted: boolean;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
  seekTime?: number | null;
}

export const MusicPlayer: React.FC<Props> = ({ 
  musicUrl, 
  isPlaying, 
  volume, 
  isMuted, 
  onTimeUpdate,
  seekTime 
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isBlocked, setIsBlocked] = useState(false);
  
  // 默认使用与用户提供视频一致的《Go West》- Pet Shop Boys
  // 该曲目节奏明快，极具年会庆典氛围
  const defaultMusic = "https://paugram.com/static/music/gowest.mp3"; 

  const attemptPlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    try {
      if (isPlaying) {
        // 显式加载并播放，确保音源状态正确
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          await playPromise;
          setIsBlocked(false);
          console.log("背景音乐《Go West》已就绪并开始播放");
        }
      } else {
        audio.pause();
      }
    } catch (error) {
      // 浏览器通常会拦截自动播放，记录状态并在用户首次交互后触发
      console.warn("音频播放被拦截，等待用户交互解锁...", error);
      setIsBlocked(true);
    }
  };

  useEffect(() => {
    attemptPlay();
  }, [isPlaying, musicUrl]);

  useEffect(() => {
    // 监听全局交互以解锁被浏览器拦截的音频
    const unlock = () => {
      if (isPlaying && audioRef.current && isBlocked) {
        attemptPlay();
      }
    };
    
    window.addEventListener('mousedown', unlock);
    window.addEventListener('keydown', unlock);
    window.addEventListener('touchstart', unlock);
    
    return () => {
      window.removeEventListener('mousedown', unlock);
      window.removeEventListener('keydown', unlock);
      window.removeEventListener('touchstart', unlock);
    };
  }, [isPlaying, isBlocked]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
      audioRef.current.muted = isMuted;
    }
  }, [volume, isMuted]);

  useEffect(() => {
    if (audioRef.current && seekTime !== null && seekTime !== undefined) {
      audioRef.current.currentTime = seekTime;
    }
  }, [seekTime]);

  const handleTimeUpdate = () => {
    if (audioRef.current && onTimeUpdate) {
      onTimeUpdate(audioRef.current.currentTime, audioRef.current.duration);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current && onTimeUpdate) {
      onTimeUpdate(audioRef.current.currentTime, audioRef.current.duration);
    }
  };

  return (
    <>
      <audio 
        id="bg-audio-player"
        ref={audioRef} 
        src={musicUrl || defaultMusic} 
        loop 
        className="hidden"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
      />
    </>
  );
};
