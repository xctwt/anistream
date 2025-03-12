"use client";

import { useState, useCallback } from 'react';

// Flag to completely disable WebTorrent
const DISABLE_WEBTORRENT = true;

interface VideoSource {
  type: 'embed' | 'webtorrent' | 'hls';
  url: string;
  quality?: string;
  label?: string;
  server?: string;
  referer?: string;
  headers?: Record<string, string>;
}

interface TorrentSource {
  title: string;
  type: 'webtorrent';
  quality: string;
  size: string;
  seeds: number;
  peers: number;
  url: string;
  date: string;
}

interface UseAnimeSourcesProps {
  animeId?: string;
  title?: string;
}

export default function useAnimeSources({ animeId, title }: UseAnimeSourcesProps) {
  const [hlsSources, setHlsSources] = useState<VideoSource[]>([]);
  const [torrentSources, setTorrentSources] = useState<VideoSource[]>([]);
  const [embedSources, setEmbedSources] = useState<VideoSource[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Function to fetch HLS sources
  const fetchHlsSources = useCallback(async (animeId: string, episodeNumber: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/stream/hls?id=${animeId}&episode=${episodeNumber}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch HLS sources: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.sources && Array.isArray(data.sources)) {
        setHlsSources(data.sources);
      } else {
        setHlsSources([]);
      }
    } catch (err) {
      console.error('Error fetching HLS sources:', err);
      setError('Failed to load streaming sources');
      setHlsSources([]);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Function to search for torrent sources
  const searchTorrentSources = useCallback(async (query: string) => {
    // Skip if WebTorrent is disabled
    if (DISABLE_WEBTORRENT) {
      setTorrentSources([]);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/stream/torrent?query=${encodeURIComponent(query)}`);
      
      if (!response.ok) {
        throw new Error(`Failed to search torrents: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.torrents && Array.isArray(data.torrents)) {
        // Convert torrent sources to video sources
        const sources: VideoSource[] = data.torrents.map((torrent: TorrentSource) => ({
          type: 'webtorrent',
          url: torrent.url,
          quality: torrent.quality,
          label: `${torrent.quality} (${torrent.size} - S:${torrent.seeds} P:${torrent.peers})`,
        }));
        
        setTorrentSources(sources);
      } else {
        setTorrentSources([]);
      }
    } catch (err) {
      console.error('Error searching torrents:', err);
      setError('Failed to load torrent sources');
      setTorrentSources([]);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Function to get all sources
  const getAllSources = useCallback((animeId: string, episodeNumber: string, title?: string) => {
    // Fetch HLS sources
    fetchHlsSources(animeId, episodeNumber);
    
    // Search for torrents if title is provided and WebTorrent is not disabled
    if (title && !DISABLE_WEBTORRENT) {
      const query = `${title} Episode ${episodeNumber}`;
      searchTorrentSources(query);
    } else {
      // Clear torrent sources if WebTorrent is disabled
      setTorrentSources([]);
    }
    
    // For embed sources, we could add a similar function
    // but for now we'll use a sample embed
    setEmbedSources([
      {
        type: 'embed',
        url: 'https://www.youtube.com/watch?v=VQGCKyvzIM4', // Sample embed (Demon Slayer trailer)
        quality: '1080p',
        label: 'YouTube',
      }
    ]);
  }, [fetchHlsSources, searchTorrentSources]);
  
  // Get all sources combined
  const allSources = [...hlsSources, ...torrentSources, ...embedSources];
  
  return {
    sources: allSources,
    hlsSources,
    torrentSources,
    embedSources,
    isLoading,
    error,
    fetchHlsSources,
    searchTorrentSources,
    getAllSources,
  };
} 