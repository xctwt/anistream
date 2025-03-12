"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { VideoPlayer } from "@/components/VideoPlayer";
import { useSession } from "next-auth/react";
import { Film, Play, List, TrendingUp } from "lucide-react";

// Sample data for featured anime
const featuredAnime = {
  id: 1,
  title: "Demon Slayer: Kimetsu no Yaiba",
  description: "A family is attacked by demons and only two members survive - Tanjiro and his sister Nezuko, who is turning into a demon slowly. Tanjiro sets out to become a demon slayer to avenge his family and cure his sister.",
  coverImage: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx101922-PEn1CTc93blC.jpg",
  bannerImage: "https://s4.anilist.co/file/anilistcdn/media/anime/banner/101922-YfZhKBUDDS6L.jpg",
  episodes: 26,
  genres: ["Action", "Fantasy", "Drama"],
  season: "Spring 2019",
  status: "Completed",
  rating: 86,
};

// Sample trending anime
const trendingAnime = [
  {
    id: 2,
    title: "Jujutsu Kaisen",
    coverImage: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx113415-979nF72r8JLj.jpg",
    episodes: 24,
  },
  {
    id: 3,
    title: "Attack on Titan: The Final Season",
    coverImage: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx110277-qDRIhu50PXzz.jpg",
    episodes: 16,
  },
  {
    id: 4,
    title: "My Hero Academia",
    coverImage: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx100166-UMXNnW1mUgGR.jpg",
    episodes: 25,
  },
  {
    id: 5,
    title: "One Piece",
    coverImage: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/nx21-tXMN3Y20PIL9.jpg",
    episodes: 1000,
  },
];

// Sample video sources for demo
const videoSources = [
  {
    type: "embed" as const,
    url: "https://www.youtube.com/watch?v=VQGCKyvzIM4", // Demon Slayer trailer
    label: "YouTube",
    quality: "1080p",
  },
  {
    type: "embed" as const,
    url: "https://www.youtube.com/watch?v=VQGCKyvzIM4", // Same trailer but as a different source option
    label: "Alternative",
    quality: "720p",
  },
];

export default function Home() {
  const { data: session } = useSession();
  const [showPlayer, setShowPlayer] = useState(false);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero section with featured anime */}
      <section className="relative rounded-lg overflow-hidden mb-12">
        <div className="relative h-[500px] w-full">
          {showPlayer ? (
            <VideoPlayer 
              sources={videoSources}
              title={featuredAnime.title}
              poster={featuredAnime.bannerImage}
            />
          ) : (
            <>
              <Image
                src={featuredAnime.bannerImage}
                alt={featuredAnime.title}
                fill
                style={{ objectFit: "cover" }}
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
              <div className="absolute bottom-0 left-0 p-8 w-full md:w-2/3">
                <h1 className="text-4xl font-bold text-white mb-2">{featuredAnime.title}</h1>
                <p className="text-white/80 mb-4 line-clamp-3">{featuredAnime.description}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {featuredAnime.genres.map((genre) => (
                    <span key={genre} className="bg-primary/20 text-primary px-2 py-1 rounded text-xs">
                      {genre}
                    </span>
                  ))}
                </div>
                <div className="flex gap-4">
                  <Button onClick={() => setShowPlayer(true)}>
                    <Play className="mr-2 h-4 w-4" /> Watch Trailer
                  </Button>
                  <Button variant="outline">
                    <Film className="mr-2 h-4 w-4" /> View Details
                  </Button>
                  {session && (
                    <Button variant="secondary">
                      <List className="mr-2 h-4 w-4" /> Add to Watchlist
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Trending anime section */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">
            <TrendingUp className="inline mr-2 h-5 w-5" /> Trending Now
          </h2>
          <Link href="/anime" className="text-primary hover:underline">
            View All
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {trendingAnime.map((anime) => (
            <Card key={anime.id} className="overflow-hidden">
              <div className="relative aspect-[3/4]">
                <Image
                  src={anime.coverImage}
                  alt={anime.title}
                  fill
                  style={{ objectFit: "cover" }}
                />
                <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                  {anime.episodes} EP
                </div>
              </div>
              <CardContent className="p-4">
                <h3 className="font-medium line-clamp-2">{anime.title}</h3>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Features section */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Why Choose AniStream?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="mb-4 h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                <Film className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-medium mb-2">Multiple Sources</h3>
              <p className="text-muted-foreground">
                Watch anime from various sources including embeds, WebTorrent, and HLS streams.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="mb-4 h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                <List className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-medium mb-2">AniList Integration</h3>
              <p className="text-muted-foreground">
                Sync with your AniList account to track your progress and manage your watchlist.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="mb-4 h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                <Play className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-medium mb-2">Advanced Player</h3>
              <p className="text-muted-foreground">
                Enjoy a feature-rich video player with quality controls, playback speed, and more.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA section */}
      {!session && (
        <section className="bg-primary/10 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to Start Watching?</h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Sign in with your AniList account to sync your watchlist, track your progress, and get personalized recommendations.
          </p>
          <Button asChild size="lg">
            <Link href="/auth/signin">Sign In with AniList</Link>
          </Button>
        </section>
      )}
    </div>
  );
}
