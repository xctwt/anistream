"use client";

// Add process polyfill for client side
if (typeof window !== 'undefined' && !window.process) {
  window.process = { env: {} } as any;
}

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { VideoPlayer } from "@/components/VideoPlayer";
import { Button } from "@/components/ui/button";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { useSession } from "next-auth/react";
import { 
  Play, 
  List, 
  Star, 
  Calendar, 
  Clock, 
  Info, 
  MessageCircle,
  User,
  Film
} from "lucide-react";
import useAnimeSources from "@/hooks/useAnimeSources";

// Sample anime data
const animeData = {
  id: "101922",
  title: {
    english: "Demon Slayer: Kimetsu no Yaiba",
    romaji: "Kimetsu no Yaiba",
    native: "鬼滅の刃",
  },
  description: "Ever since the death of his father, the burden of supporting the family has fallen upon Tanjirou Kamado's shoulders. Though living impoverished on a remote mountain, the Kamado family are able to enjoy a relatively peaceful and happy life. One day, Tanjirou decides to go down to the local village to make a little money selling charcoal. On his way back, night falls, forcing Tanjirou to take shelter in the house of a strange man, who warns him of the existence of flesh-eating demons that lurk in the woods at night. When he finally arrives back home the next day, he is met with a horrifying sight—his whole family has been slaughtered. Worse still, the sole survivor is his sister Nezuko, who has been turned into a bloodthirsty demon. Consumed by rage and hatred, Tanjirou swears to avenge his family and stay by his only remaining sibling. Alongside the mysterious group calling themselves the Demon Slayer Corps, Tanjirou will do whatever it takes to slay the demons and protect the remnants of his beloved sister's humanity.",
  coverImage: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx101922-PEn1CTc93blC.jpg",
  bannerImage: "https://s4.anilist.co/file/anilistcdn/media/anime/banner/101922-YfZhKBUDDS6L.jpg",
  episodes: 26,
  duration: 24,
  genres: ["Action", "Adventure", "Drama", "Fantasy", "Supernatural"],
  season: "Spring",
  seasonYear: 2019,
  status: "FINISHED",
  averageScore: 84,
  popularity: 250000,
  nextAiringEpisode: null,
  studios: ["ufotable"],
  characters: [
    {
      id: 126071,
      name: {
        full: "Tanjirou Kamado",
      },
      image: "https://s4.anilist.co/file/anilistcdn/character/large/b126071-BpbEkRyuiPdS.jpg",
      role: "MAIN",
    },
    {
      id: 127518,
      name: {
        full: "Nezuko Kamado",
      },
      image: "https://s4.anilist.co/file/anilistcdn/character/large/b127518-NRlq5ld0JDG0.png",
      role: "MAIN",
    },
  ],
};

// Sample video sources
const videoSources = [
  {
    type: "embed" as const,
    url: "https://www.youtube.com/watch?v=VQGCKyvzIM4", // Demon Slayer trailer
    label: "Source 1",
    quality: "1080p",
  },
  {
    type: "embed" as const,
    url: "https://www.youtube.com/watch?v=VQGCKyvzIM4", // Same trailer but as a different source option
    label: "Source 2",
    quality: "720p",
  },
  {
    type: "embed" as const,
    url: "https://www.youtube.com/watch?v=VQGCKyvzIM4", // Same trailer but as a different source option
    label: "Source 3",
    quality: "480p",
  },
];

export default function AnimePage() {
  const params = useParams();
  const animeId = params.id as string;

  const { data: session } = useSession();
  const [currentEpisode, setCurrentEpisode] = useState(1);
  const [isWatching, setIsWatching] = useState(false);
  
  // Use our custom hook to get anime sources
  const { 
    sources, 
    isLoading: isLoadingSources, 
    error: sourcesError,
    getAllSources 
  } = useAnimeSources({
    animeId: animeId,
    title: animeData.title.english
  });
  
  // Load sources when episode changes or when starting to watch
  useEffect(() => {
    if (isWatching) {
      try {
        getAllSources(animeId, currentEpisode.toString(), animeData.title.english);
      } catch (error) {
        console.error("Error loading sources:", error);
      }
    }
  }, [isWatching, currentEpisode, animeId, getAllSources, animeData.title.english]);
  
  // Generate a list of episodes
  const episodes = Array.from({ length: animeData.episodes }, (_, i) => i + 1);

  return (
    <div className="container mx-auto px-4 py-8">
      {isWatching ? (
        <div className="mb-8">
          {isLoadingSources ? (
            <div className="aspect-video bg-black flex items-center justify-center">
              <div className="text-white">Loading sources...</div>
            </div>
          ) : sourcesError ? (
            <div className="aspect-video bg-black flex items-center justify-center">
              <div className="text-red-500">{sourcesError}</div>
            </div>
          ) : sources.length > 0 ? (
            <VideoPlayer 
              sources={sources}
              title={`${animeData.title.english} - Episode ${currentEpisode}`}
              poster={animeData.bannerImage}
            />
          ) : (
            <div className="aspect-video bg-black flex items-center justify-center">
              <div className="text-white">No sources available. Try another episode.</div>
            </div>
          )}
          <div className="flex justify-between items-center mt-4">
            <Button 
              variant="outline" 
              onClick={() => setIsWatching(false)}
            >
              Back to Details
            </Button>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                disabled={currentEpisode === 1}
                onClick={() => setCurrentEpisode(prev => Math.max(1, prev - 1))}
              >
                Previous Episode
              </Button>
              <Button 
                variant="outline" 
                disabled={currentEpisode === animeData.episodes}
                onClick={() => setCurrentEpisode(prev => Math.min(animeData.episodes, prev + 1))}
              >
                Next Episode
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative h-[400px] rounded-lg overflow-hidden mb-8">
          <Image
            src={animeData.bannerImage}
            alt={animeData.title.english}
            fill
            style={{ objectFit: "cover" }}
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
          <div className="absolute bottom-0 left-0 p-8 flex items-end gap-6">
            <div className="hidden md:block relative h-48 w-32 rounded-lg overflow-hidden border-4 border-background">
              <Image
                src={animeData.coverImage}
                alt={animeData.title.english}
                fill
                style={{ objectFit: "cover" }}
              />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                {animeData.title.english}
              </h1>
              <h2 className="text-xl text-white/80 mb-4">
                {animeData.title.native} ({animeData.title.romaji})
              </h2>
              <div className="flex flex-wrap gap-2 mb-4">
                {animeData.genres.map((genre) => (
                  <span key={genre} className="bg-primary/20 text-primary px-2 py-1 rounded text-xs">
                    {genre}
                  </span>
                ))}
              </div>
              <div className="flex gap-4">
                <Button onClick={() => {
                  setCurrentEpisode(1);
                  setIsWatching(true);
                }}>
                  <Play className="mr-2 h-4 w-4" /> Watch Now
                </Button>
                {session && (
                  <Button variant="secondary">
                    <List className="mr-2 h-4 w-4" /> Add to Watchlist
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <Tabs defaultValue="info">
            <TabsList className="mb-4">
              <TabsTrigger value="info">
                <Info className="h-4 w-4 mr-2" /> Information
              </TabsTrigger>
              <TabsTrigger value="episodes">
                <Play className="h-4 w-4 mr-2" /> Episodes
              </TabsTrigger>
              <TabsTrigger value="characters">
                <User className="h-4 w-4 mr-2" /> Characters
              </TabsTrigger>
              <TabsTrigger value="comments">
                <MessageCircle className="h-4 w-4 mr-2" /> Comments
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="info" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Synopsis</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{animeData.description}</p>
                </CardContent>
              </Card>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="p-4">
                    <CardTitle className="text-sm flex items-center">
                      <Star className="h-4 w-4 mr-2 text-yellow-500" /> Rating
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <p className="text-2xl font-bold">{animeData.averageScore}%</p>
                    <p className="text-xs text-muted-foreground">{animeData.popularity.toLocaleString()} users</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="p-4">
                    <CardTitle className="text-sm flex items-center">
                      <Calendar className="h-4 w-4 mr-2" /> Released
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <p className="text-2xl font-bold">{animeData.seasonYear}</p>
                    <p className="text-xs text-muted-foreground">{animeData.season} Season</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="p-4">
                    <CardTitle className="text-sm flex items-center">
                      <Film className="h-4 w-4 mr-2" /> Episodes
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <p className="text-2xl font-bold">{animeData.episodes}</p>
                    <p className="text-xs text-muted-foreground">{animeData.status}</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="p-4">
                    <CardTitle className="text-sm flex items-center">
                      <Clock className="h-4 w-4 mr-2" /> Duration
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <p className="text-2xl font-bold">{animeData.duration} min</p>
                    <p className="text-xs text-muted-foreground">per episode</p>
                  </CardContent>
                </Card>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle>Studios</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {animeData.studios.map((studio) => (
                      <span key={studio} className="bg-secondary px-3 py-1 rounded-full text-sm">
                        {studio}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="episodes">
              <Card>
                <CardHeader>
                  <CardTitle>Episodes</CardTitle>
                  <CardDescription>
                    {animeData.episodes} episodes available
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {episodes.map((episode) => (
                      <Button 
                        key={episode} 
                        variant={currentEpisode === episode ? "default" : "outline"}
                        className="h-auto py-6"
                        onClick={() => {
                          setCurrentEpisode(episode);
                          setIsWatching(true);
                        }}
                      >
                        Episode {episode}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="characters">
              <Card>
                <CardHeader>
                  <CardTitle>Characters</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {animeData.characters.map((character) => (
                      <div key={character.id} className="flex items-center gap-4">
                        <div className="relative h-16 w-16 rounded-full overflow-hidden">
                          <Image
                            src={character.image}
                            alt={character.name.full}
                            fill
                            style={{ objectFit: "cover" }}
                          />
                        </div>
                        <div>
                          <p className="font-medium">{character.name.full}</p>
                          <p className="text-xs text-muted-foreground">{character.role}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="comments">
              <Card>
                <CardHeader>
                  <CardTitle>Comments</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-center text-muted-foreground py-8">
                    No comments yet. Be the first to comment!
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Recommended</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-center text-muted-foreground py-4">
                Sign in with AniList to get personalized recommendations.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 