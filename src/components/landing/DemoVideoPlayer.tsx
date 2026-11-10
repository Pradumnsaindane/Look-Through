import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Volume1,
  Maximize,
  Minimize,
  RotateCcw,
} from 'lucide-react';

export interface DemoVideoPlayerProps {
  src?: string;
  poster?: string;
  className?: string;
}

export const DemoVideoPlayer: React.FC<DemoVideoPlayerProps> = ({
  src = '/videos/6804109-uhd_4096_2160_25fps.mp4',
  poster = '/videos/poster.jpg',
  className = '',
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<number | null>(null);

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [hasStarted, setHasStarted] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolume] = useState<number>(1);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showControls, setShowControls] = useState<boolean>(true);
  const [isBuffering, setIsBuffering] = useState<boolean>(false);

  // Format seconds to mm:ss
  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Toggle Play / Pause
  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused || video.ended) {
      video.play().then(() => {
        setIsPlaying(true);
        setHasStarted(true);
      }).catch(() => {
        // Autoplay policy or playback error
      });
    } else {
      video.pause();
      setIsPlaying(false);
    }
  }, []);

  // Handle Seek Slider Change
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;
    const time = parseFloat(e.target.value);
    video.currentTime = time;
    setCurrentTime(time);
  };

  // Toggle Mute
  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    if (isMuted) {
      video.muted = false;
      setIsMuted(false);
      video.volume = volume || 0.5;
    } else {
      video.muted = true;
      setIsMuted(true);
    }
  };

  // Handle Volume Change
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;
    const val = parseFloat(e.target.value);
    video.volume = val;
    setVolume(val);
    if (val === 0) {
      video.muted = true;
      setIsMuted(true);
    } else if (isMuted) {
      video.muted = false;
      setIsMuted(false);
    }
  };

  // Toggle Fullscreen
  const toggleFullscreen = async () => {
    const container = containerRef.current;
    if (!container) return;

    if (!document.fullscreenElement) {
      try {
        await container.requestFullscreen();
        setIsFullscreen(true);
      } catch {
        // Fallback for Safari/iOS
        if (videoRef.current && 'webkitEnterFullscreen' in videoRef.current) {
          (videoRef.current as unknown as { webkitEnterFullscreen: () => void }).webkitEnterFullscreen();
        }
      }
    } else {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  // Update fullscreen state on browser change
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Controls visibility management
  const triggerUserActivity = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      window.clearTimeout(controlsTimeoutRef.current);
    }
    if (isPlaying) {
      controlsTimeoutRef.current = window.setTimeout(() => {
        setShowControls(false);
      }, 2500);
    }
  };

  // Keyboard navigation inside video player
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === ' ' || e.key === 'k') {
      e.preventDefault();
      togglePlay();
    } else if (e.key === 'f') {
      e.preventDefault();
      toggleFullscreen();
    } else if (e.key === 'm') {
      e.preventDefault();
      toggleMute();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      if (videoRef.current) videoRef.current.currentTime += 5;
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      if (videoRef.current) videoRef.current.currentTime -= 5;
    }
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      ref={containerRef}
      onMouseMove={triggerUserActivity}
      onMouseLeave={() => isPlaying && setShowControls(false)}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="region"
      aria-label="Look Through Product Demo Video Player"
      className={`group relative mx-auto w-full max-w-5xl overflow-hidden rounded-[18px] sm:rounded-[24px] bg-[#0c0e12] border border-[#2b303c] shadow-[0_25px_65px_-15px_rgba(0,0,0,0.85),0_0_45px_-8px_rgba(76,111,255,0.18),inset_0_1px_1px_rgba(255,255,255,0.12)] aspect-video select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4c6fff] ${className}`}
    >
      {/* HTML5 Video Element */}
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        preload="metadata"
        playsInline
        onClick={togglePlay}
        onTimeUpdate={() => {
          if (videoRef.current) {
            setCurrentTime(videoRef.current.currentTime);
          }
        }}
        onLoadedMetadata={() => {
          if (videoRef.current) {
            setDuration(videoRef.current.duration);
          }
        }}
        onPlay={() => {
          setIsPlaying(true);
          setHasStarted(true);
        }}
        onPause={() => setIsPlaying(false)}
        onWaiting={() => setIsBuffering(true)}
        onPlaying={() => setIsBuffering(false)}
        onEnded={() => {
          setIsPlaying(false);
          setShowControls(true);
        }}
        className="h-full w-full object-cover cursor-pointer"
      />

      {/* Pre-Play Poster Overlay with Central Play Button */}
      {!hasStarted && (
        <div
          onClick={togglePlay}
          className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-[2px] transition-opacity duration-300 cursor-pointer z-20 group/poster"
        >
          {/* Subtle ambient pulse ring */}
          <div className="relative flex items-center justify-center">
            <span
              className="absolute w-20 sm:w-24 h-20 sm:h-24 rounded-full bg-[#4c6fff]/25 animate-ping opacity-75 pointer-events-none"
              aria-hidden="true"
            />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                togglePlay();
              }}
              aria-label="Play Look Through Product Walkthrough Video"
              className="relative flex items-center justify-center w-16 sm:w-20 h-16 sm:h-20 rounded-full bg-gradient-to-tr from-[#1b2238] via-[#242f52] to-[#4c6fff] text-white shadow-[0_0_30px_rgba(76,111,255,0.5),inset_0_1px_2px_rgba(255,255,255,0.4)] border border-[#7a95ff]/60 group-hover/poster:scale-105 transition-transform duration-200"
            >
              <Play className="w-7 sm:w-8 h-7 sm:h-8 fill-white translate-x-0.5" />
            </button>
          </div>

          <div className="mt-4 sm:mt-5 text-center px-4">
            <span className="font-mono text-[11px] sm:text-xs font-semibold tracking-wider text-[#9cb4ff] uppercase block">
              Product Walkthrough Demo
            </span>
            <span className="text-white text-sm sm:text-base font-medium block mt-1">
              Click to Play High-Definition Recording
            </span>
            <span className="text-[11px] text-[#8b8e95] font-mono block mt-1">
              31s · 4K UHD · 25 FPS
            </span>
          </div>
        </div>
      )}

      {/* Buffering Indicator */}
      {isBuffering && isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 pointer-events-none z-10">
          <div className="w-10 h-10 border-2 border-white/20 border-t-[#4c6fff] rounded-full animate-spin" />
        </div>
      )}

      {/* Sleek Custom Media Controls Bar */}
      {hasStarted && (
        <div
          className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/70 to-transparent p-3 sm:p-4 pt-12 transition-opacity duration-300 z-30 ${
            showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          {/* Progress / Seek Bar */}
          <div className="relative flex items-center w-full mb-3 group/progress">
            {/* Visual Progress Bar Track */}
            <div className="relative w-full h-1.5 group-hover/progress:h-2.5 rounded-full bg-white/20 overflow-hidden cursor-pointer transition-all">
              <div
                className="absolute left-0 top-0 bottom-0 bg-[#4c6fff] rounded-full transition-all"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            {/* Native Slider Input for Seeking */}
            <input
              type="range"
              min={0}
              max={duration || 100}
              step={0.1}
              value={currentTime}
              onChange={handleSeek}
              aria-label="Video timeline seek slider"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>

          {/* Controls Row */}
          <div className="flex items-center justify-between text-white text-xs">
            {/* Left Controls: Play/Pause, Replay, Time Display */}
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                type="button"
                onClick={togglePlay}
                aria-label={isPlaying ? 'Pause video' : 'Play video'}
                className="p-1.5 sm:p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white" />}
              </button>

              <button
                type="button"
                onClick={() => {
                  if (videoRef.current) {
                    videoRef.current.currentTime = 0;
                    videoRef.current.play();
                  }
                }}
                aria-label="Replay from start"
                className="p-1.5 sm:p-2 rounded-lg bg-white/5 hover:bg-white/15 text-[#8b8e95] hover:text-white transition-colors hidden xs:inline-flex"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              <div className="font-mono text-[11px] sm:text-xs text-[#a0a5b3] tracking-wider">
                <span className="text-white font-medium">{formatTime(currentTime)}</span>
                <span className="mx-1 text-[#555a64]">/</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Right Controls: Volume & Fullscreen */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Volume Controller */}
              <div className="flex items-center gap-1.5 group/vol">
                <button
                  type="button"
                  onClick={toggleMute}
                  aria-label={isMuted ? 'Unmute audio' : 'Mute audio'}
                  className="p-1.5 sm:p-2 rounded-lg bg-white/5 hover:bg-white/15 text-[#a0a5b3] hover:text-white transition-colors"
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="w-4 h-4 text-rose-400" />
                  ) : volume < 0.5 ? (
                    <Volume1 className="w-4 h-4" />
                  ) : (
                    <Volume2 className="w-4 h-4" />
                  )}
                </button>

                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  aria-label="Volume adjustment slider"
                  className="w-14 sm:w-20 h-1 rounded-full bg-white/20 accent-[#4c6fff] cursor-pointer hidden sm:block"
                />
              </div>

              {/* Fullscreen Button */}
              <button
                type="button"
                onClick={toggleFullscreen}
                aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
                className="p-1.5 sm:p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DemoVideoPlayer;

