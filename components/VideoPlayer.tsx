"use client";

import React, { useState, useRef, useEffect } from "react";
import ReactPlayer from "react-player";
import Hls from "hls.js";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Card } from "@/components/ui/card";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Settings, 
  Maximize,
  SkipBack,
  SkipForward,
  RefreshCw,
  Loader,
  AlertCircle
} from "lucide-react";

// Dynamically import WebTorrent only on client side with error handling
let WebTorrent: any = null;
let webTorrentLoading = false;
let webTorrentError: any = null;

// Flag to completely disable WebTorrent if it causes issues
const DISABLE_WEBTORRENT = true;

if (typeof window !== 'undefined' && !DISABLE_WEBTORRENT) {
  webTorrentLoading = true;
  // Use the regular import which has type definitions
  import('webtorrent')
    .then((module) => {
      WebTorrent = module.default;
      webTorrentLoading = false;
    })
    .catch((err) => {
      console.error('Error loading WebTorrent:', err);
      webTorrentLoading = false;
      webTorrentError = err;
    });
}

// Source types
type SourceType = "embed" | "webtorrent" | "hls";

interface VideoSource {
  type: SourceType;
  url: string;
  quality?: string;
  label?: string;
  referer?: string; // For HLS streams that require a specific referer
}

// Add a proxy function for HLS streams
const proxyHlsStream = (url: string, referer?: string): string => {
  if (typeof window === 'undefined') return url;
  
  const baseUrl = window.location.origin;
  const encodedUrl = encodeURIComponent(url);
  const encodedReferer = referer ? encodeURIComponent(referer) : '';
  return `${baseUrl}/api/stream/proxy?url=${encodedUrl}&referer=${encodedReferer}`;
};

// Add a function to get video URL based on source type
const getVideoUrl = (source: VideoSource): string => {
  if (source.type === 'hls') {
    return source.referer ? proxyHlsStream(source.url, source.referer) : source.url;
  }
  // For WebTorrent sources, we need a fallback when WebTorrent is disabled
  if (source.type === 'webtorrent' && DISABLE_WEBTORRENT) {
    // When a WebTorrent source is magnet:? URL, we can't play it directly
    // So we'll handle this in the UI with an error message
    if (source.url.startsWith('magnet:')) {
      return source.url;
    }
    // If it's a direct file URL (not a magnet link), we can try to play it directly
    return source.url;
  }
  return source.url;
};

interface VideoPlayerProps {
  sources: VideoSource[];
  poster?: string;
  title?: string;
  autoPlay?: boolean;
  onProgress?: (progress: { played: number; playedSeconds: number }) => void;
  onEnded?: () => void;
}

export const VideoPlayer = ({
  sources,
  poster,
  title,
  autoPlay = false,
  onProgress,
  onEnded,
}: VideoPlayerProps) => {
  // Filter out webtorrent sources if WebTorrent isn't available or disabled
  const filteredSources = sources.filter(source => 
    !(source.type === 'webtorrent' && (DISABLE_WEBTORRENT || webTorrentError || !WebTorrent))
  );
  
  const [activeSource, setActiveSource] = useState<VideoSource>(() => {
    // Start with a non-webtorrent source if WebTorrent has issues
    const nonWebTorrentSource = filteredSources.find(s => s.type !== 'webtorrent');
    return nonWebTorrentSource || (filteredSources.length > 0 ? filteredSources[0] : sources[0]);
  });
  
  const [playing, setPlaying] = useState(autoPlay);
  const [volume, setVolume] = useState(0.7);
  const [muted, setMuted] = useState(false);
  const [played, setPlayed] = useState(0);
  const [loaded, setLoaded] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [torrentClient, setTorrentClient] = useState<any | null>(null);
  const [torrentInfo, setTorrentInfo] = useState<any | null>(null);
  const [availableQualities, setAvailableQualities] = useState<string[]>([]);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const playerRef = useRef<ReactPlayer>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);

  // Initialize WebTorrent client if needed (only if not disabled)
  useEffect(() => {
    // Skip if on server side or WebTorrent is disabled
    if (typeof window === 'undefined' || DISABLE_WEBTORRENT) return;
    
    // Only initialize WebTorrent if we have WebTorrent sources and the module loaded
    if (filteredSources.some(source => source.type === "webtorrent") && 
        !torrentClient && 
        WebTorrent && 
        !webTorrentLoading) {
      try {
        const client = new WebTorrent();
        setTorrentClient(client);
        
        return () => {
          try {
            client.destroy();
          } catch (err) {
            console.error('Error destroying WebTorrent client:', err);
          }
        };
      } catch (err) {
        console.error('Failed to initialize WebTorrent client:', err);
        setError('WebTorrent is not available in this browser');
      }
    }
  }, [filteredSources, webTorrentLoading]);

  // Effect to handle source change
  useEffect(() => {
    // Skip if on server side
    if (typeof window === 'undefined') return;
    
    // Reset states
    setIsLoading(true);
    setError(null);
    
    // Special handling for WebTorrent sources
    if (activeSource.type === "webtorrent") {
      // If WebTorrent is disabled completely, show an error and suggest other sources
      if (DISABLE_WEBTORRENT) {
        setError('WebTorrent is disabled in this version. Please select another source.');
        setIsLoading(false);
        return;
      }
      
      // If WebTorrent is not available, switch to another source or show error
      if (!WebTorrent || webTorrentError) {
        setError('WebTorrent is not available in this browser. Try another source.');
        setIsLoading(false);
        return;
      }
      
      // If we don't have a client yet, wait for it
      if (!torrentClient) {
        return;
      }
      
      // Handle WebTorrent
      setTorrentInfo(null); // Reset previous torrent info
      
      try {
        // Simple magnet URI validation to avoid cryptic errors
        if (!activeSource.url.startsWith('magnet:?xt=urn:btih:')) {
          throw new Error('Invalid magnet URI format');
        }
        
        // Use a timeout to catch hanging add operations
        const timeoutId = setTimeout(() => {
          setError('Torrent add operation timed out. Try another source.');
          setIsLoading(false);
        }, 10000);
        
        // Safely add the torrent
        const torrentAddOperation = torrentClient.add(
          activeSource.url, 
          { announce: [] }, // Minimize tracker requests
          (torrent: any) => {
            // Clear the timeout
            clearTimeout(timeoutId);
            
            // Safety check in case component unmounted
            if (!torrentClient) return;
            
            setTorrentInfo(torrent);
            
            // Find the largest video file in the torrent
            const videoFile = torrent.files.find((file: any) => {
              const name = file.name.toLowerCase();
              return name.endsWith('.mp4') || name.endsWith('.mkv') || 
                     name.endsWith('.webm') || name.endsWith('.avi');
            });
            
            // If a video file is found, create a URL for it
            if (videoFile) {
              // You can update the source URL here if needed
              console.log('WebTorrent streaming:', videoFile.name);
              
              // Track download progress
              torrent.on('download', () => {
                // You could update a download progress state here
                console.log('Progress:', (torrent.progress * 100).toFixed(1) + '%');
              });
              
              // Handle errors
              torrent.on('error', (err: any) => {
                console.error('Torrent error:', err);
                setError('Failed to load torrent');
              });
              
              setIsLoading(false);
            } else {
              console.error('No video files found in torrent');
              setError('No video files found in torrent');
              setIsLoading(false);
            }
          }
        );
        
        // Handle errors on the add operation directly
        if (torrentAddOperation && typeof torrentAddOperation.on === 'function') {
          torrentAddOperation.on('error', (err: any) => {
            clearTimeout(timeoutId);
            console.error('Error adding torrent:', err);
            setError('Failed to load torrent: ' + (err.message || 'Unknown error'));
            setIsLoading(false);
          });
        }
      } catch (err) {
        console.error('Error adding torrent:', err);
        setError('Failed to load torrent: ' + ((err as Error)?.message || 'Unknown error'));
        setIsLoading(false);
      }
      
      // Cleanup function
      return () => {
        if (torrentInfo) {
          try {
            torrentInfo.destroy();
          } catch (err) {
            console.error('Error destroying torrent:', err);
          }
        }
      };
    } else if (activeSource.type === "hls" && typeof window !== 'undefined' && Hls.isSupported()) {
      // HLS quality detection could be done here
      const hls = new Hls();
      const video = document.createElement('video');
      
      try {
        const url = getVideoUrl(activeSource);
        hls.loadSource(url);
        hls.attachMedia(video);
        
        hls.on(Hls.Events.MANIFEST_PARSED, (_event, data) => {
          const qualities = data.levels.map(level => `${level.height}p`);
          setAvailableQualities(qualities);
          setIsLoading(false);
        });
        
        hls.on(Hls.Events.ERROR, (_event, data) => {
          if (data.fatal) {
            console.error('HLS error:', data);
            setError('Failed to load HLS stream');
            setIsLoading(false);
          }
        });
      } catch (err) {
        console.error('Error loading HLS stream:', err);
        setError('Failed to load HLS stream');
        setIsLoading(false);
      }
      
      return () => {
        hls.destroy();
      };
    } else {
      // For embed sources, just wait for the player to load
      setTimeout(() => {
        setIsLoading(false);
      }, 2000);
    }
  }, [activeSource, torrentClient, webTorrentError]);

  // Toggle play/pause
  const handlePlayPause = () => {
    setPlaying(!playing);
  };

  // Toggle mute/unmute
  const handleMute = () => {
    setMuted(!muted);
  };

  // Handle volume change
  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0]);
    if (value[0] > 0 && muted) {
      setMuted(false);
    }
  };

  // Handle seeking
  const handleSeekChange = (value: number[]) => {
    setPlayed(value[0]);
    if (playerRef.current) {
      playerRef.current.seekTo(value[0]);
    }
  };

  // Handle progress updates
  const handleProgress = (state: { played: number; playedSeconds: number; loaded: number; loadedSeconds: number }) => {
    if (!playerRef.current) return;
    
    setPlayed(state.played);
    setLoaded(state.loaded);
    
    if (onProgress) {
      onProgress(state);
    }
  };

  // Handle video end
  const handleEnded = () => {
    setPlaying(false);
    if (onEnded) {
      onEnded();
    }
  };

  // Change video source
  const changeSource = (source: VideoSource) => {
    setActiveSource(source);
    setPlayed(0);
    setPlaying(true);
  };

  // Change playback rate
  const handlePlaybackRateChange = (rate: number) => {
    setPlaybackRate(rate);
  };

  // Format time (seconds -> MM:SS)
  const formatTime = (seconds: number) => {
    const date = new Date(seconds * 1000);
    const hh = date.getUTCHours();
    const mm = date.getUTCMinutes();
    const ss = date.getUTCSeconds().toString().padStart(2, "0");
    if (hh) {
      return `${hh}:${mm.toString().padStart(2, "0")}:${ss}`;
    }
    return `${mm}:${ss}`;
  };

  // Handle fullscreen toggle
  const toggleFullScreen = () => {
    if (!playerContainerRef.current) return;
    
    if (!document.fullscreenElement) {
      playerContainerRef.current.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  useEffect(() => {
    const handleFullScreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullScreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullScreenChange);
  }, []);

  // Handle player error
  const handlePlayerError = (error: any) => {
    console.error('Player error:', error);
    
    // Try to provide a more helpful error message
    let errorMessage = 'Failed to play video. Try another source.';
    
    if (activeSource.type === 'webtorrent') {
      errorMessage = 'WebTorrent streaming is not supported in this browser. Try another source.';
    } else if (activeSource.type === 'hls' && typeof window !== 'undefined' && !Hls.isSupported()) {
      errorMessage = 'HLS is not supported in this browser. Try another source.';
    }
    
    setError(errorMessage);
  };

  return (
    <Card className="overflow-hidden">
      <div ref={playerContainerRef} className="relative w-full aspect-video bg-black">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex flex-col items-center">
              <Loader className="h-10 w-10 text-primary animate-spin mb-2" />
              <p className="text-white">Loading {activeSource.type === 'webtorrent' ? 'torrent' : activeSource.type === 'hls' ? 'stream' : 'video'}...</p>
            </div>
          </div>
        ) : error ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex flex-col items-center text-center p-4">
              <AlertCircle className="h-10 w-10 text-red-500 mb-2" />
              <p className="text-white mb-4">{error}</p>
              <div className="flex flex-wrap justify-center gap-2">
                <Button variant="outline" onClick={() => setError(null)} className="mb-2">
                  Try Again
                </Button>
                {filteredSources.length > 1 && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline">
                        Try Another Source
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      {filteredSources
                        .filter(source => source.url !== activeSource.url)
                        .map((source, index) => (
                          <DropdownMenuItem 
                            key={index} 
                            onClick={() => {
                              setError(null);
                              changeSource(source);
                            }}
                          >
                            {source.label || source.type} {source.quality ? `(${source.quality})` : ''}
                          </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>
          </div>
        ) : (
          <ReactPlayer
            ref={playerRef}
            url={getVideoUrl(activeSource)}
            playing={playing}
            volume={volume}
            muted={muted}
            playbackRate={playbackRate}
            width="100%"
            height="100%"
            style={{ position: "absolute", top: 0, left: 0 }}
            onProgress={handleProgress}
            onDuration={setDuration}
            onEnded={handleEnded}
            onError={handlePlayerError}
            onReady={() => setIsLoading(false)}
            config={{
              file: {
                attributes: {
                  poster: poster,
                },
                forceVideo: true,
              },
              youtube: {
                playerVars: { showinfo: 1 }
              }
            }}
          />
        )}

        {/* Controls overlay - becomes visible on hover */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 opacity-0 hover:opacity-100 transition-opacity flex flex-col gap-2">
          {/* Title */}
          {title && <div className="text-white text-lg font-medium">{title}</div>}
          
          {/* Progress bar */}
          <div className="relative w-full">
            <Slider
              value={[played * 100]}
              min={0}
              max={100}
              step={0.1}
              onValueChange={(value: number[]) => handleSeekChange([value[0] / 100])}
              className="w-full cursor-pointer"
              disabled={isLoading || !!error}
            />
            <div className="absolute inset-0 pointer-events-none">
              <div 
                className="h-full bg-white/20 opacity-50" 
                style={{ width: `${loaded * 100}%` }}
              />
            </div>
          </div>
          
          {/* Time display and controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handlePlayPause} 
                className="text-white hover:bg-white/20"
                disabled={isLoading || !!error}
              >
                {playing ? <Pause size={20} /> : <Play size={20} />}
              </Button>
              
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => playerRef.current?.seekTo(played - 0.05)} 
                className="text-white hover:bg-white/20"
                disabled={isLoading || !!error}
              >
                <SkipBack size={20} />
              </Button>
              
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => playerRef.current?.seekTo(played + 0.05)} 
                className="text-white hover:bg-white/20"
                disabled={isLoading || !!error}
              >
                <SkipForward size={20} />
              </Button>
              
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={handleMute} 
                  className="text-white hover:bg-white/20"
                  disabled={isLoading || !!error}
                >
                  {muted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
                </Button>
                <Slider
                  value={[volume * 100]}
                  min={0}
                  max={100}
                  step={1}
                  onValueChange={(value: number[]) => handleVolumeChange([value[0] / 100])}
                  className="w-24"
                  disabled={isLoading || !!error}
                />
              </div>
              
              <span className="text-white/80 text-sm">
                {formatTime(played * duration)} / {formatTime(duration)}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Source selection */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                    Source
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {filteredSources.map((source, index) => (
                    <DropdownMenuItem 
                      key={index} 
                      onClick={() => changeSource(source)}
                      className={source.url === activeSource.url ? "bg-secondary" : ""}
                    >
                      {source.label || source.type} {source.quality ? `(${source.quality})` : ''}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              
              {/* Quality selection */}
              {availableQualities.length > 0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                      Quality
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {availableQualities.map((quality, index) => (
                      <DropdownMenuItem key={index}>
                        {quality}
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuItem>Auto</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
              
              {/* Playback speed */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-white hover:bg-white/20"
                    disabled={isLoading || !!error}
                  >
                    <RefreshCw size={20} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {[0.5, 0.75, 1, 1.25, 1.5, 2].map((rate) => (
                    <DropdownMenuItem 
                      key={rate} 
                      onClick={() => handlePlaybackRateChange(rate)}
                      className={playbackRate === rate ? "bg-secondary" : ""}
                    >
                      {rate}x
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              
              {/* Settings */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-white hover:bg-white/20"
                  >
                    <Settings size={20} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>Subtitles</DropdownMenuItem>
                  <DropdownMenuItem>Audio</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              {/* Fullscreen toggle */}
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={toggleFullScreen} 
                className="text-white hover:bg-white/20"
                disabled={isLoading || !!error}
              >
                <Maximize size={20} />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default VideoPlayer; 