"use client";

// Add process polyfill for client side
if (typeof window !== 'undefined' && !window.process) {
  window.process = { env: {} } as any;
}

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Film, ListFilter } from "lucide-react";

// Sample anime data - in a real app, you would fetch this from an API
const animeList = [
  {
    id: "101922",
    title: "Demon Slayer: Kimetsu no Yaiba",
    coverImage: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx101922-PEn1CTc93blC.jpg",
    episodes: 26,
  },
  {
    id: "113415",
    title: "Jujutsu Kaisen",
    coverImage: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx113415-979nF72r8JLj.jpg",
    episodes: 24,
  },
  {
    id: "110277",
    title: "Attack on Titan: The Final Season",
    coverImage: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx110277-qDRIhu50PXzz.jpg",
    episodes: 16,
  },
  {
    id: "100166",
    title: "My Hero Academia",
    coverImage: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx100166-UMXNnW1mUgGR.jpg",
    episodes: 25,
  },
  {
    id: "21",
    title: "One Piece",
    coverImage: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/nx21-tXMN3Y20PIL9.jpg",
    episodes: 1000,
  },
  {
    id: "1535",
    title: "Death Note",
    coverImage: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx1535-lawCwhzhi96X.jpg",
    episodes: 37,
  },
  {
    id: "20605",
    title: "Tokyo Ghoul",
    coverImage: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/nx20605-fmnHdfurM7m5.jpg",
    episodes: 12,
  },
  {
    id: "11757",
    title: "Sword Art Online",
    coverImage: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/nx11757-Q9P2zjCPICq5.jpg",
    episodes: 25,
  },
  {
    id: "5114",
    title: "Fullmetal Alchemist: Brotherhood",
    coverImage: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx5114-KJTQz9AIm6Wk.jpg",
    episodes: 64,
  },
  {
    id: "16498",
    title: "Shingeki no Kyojin",
    coverImage: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx16498-C6FPmWm59CyP.jpg",
    episodes: 25,
  },
  {
    id: "20958",
    title: "Haikyu!!",
    coverImage: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx20958-HhwArts87jHG.jpg",
    episodes: 25,
  },
  {
    id: "97940",
    title: "Black Clover",
    coverImage: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx97940-5ZrEXAqeK4q4.jpg",
    episodes: 170,
  },
];

// Filter categories
const categories = ["All", "Action", "Adventure", "Comedy", "Drama", "Fantasy", "Horror", "Romance", "Sci-Fi", "Slice of Life"];

export default function AnimePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  
  // Filter anime based on search query and category
  const filteredAnime = animeList.filter(anime => 
    anime.title.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-6">Browse Anime</h1>
        
        {/* Search and filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search anime..."
              className="pl-10"
              value={searchQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-2">
            <Button 
              variant="ghost" 
              className={selectedCategory === "All" ? "bg-secondary" : ""}
              onClick={() => setSelectedCategory("All")}
            >
              <ListFilter className="h-4 w-4 mr-2" />
              All
            </Button>
            
            {categories.slice(1).map(category => (
              <Button 
                key={category} 
                variant="ghost"
                className={selectedCategory === category ? "bg-secondary" : ""}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
        
        {/* Anime grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {filteredAnime.map((anime) => (
            <Link href={`/anime/${anime.id}`} key={anime.id}>
              <Card className="overflow-hidden transition-all hover:scale-105 hover:shadow-lg">
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
            </Link>
          ))}
        </div>
        
        {filteredAnime.length === 0 && (
          <div className="text-center py-12">
            <Film className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-medium mb-2">No anime found</h3>
            <p className="text-muted-foreground">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  );
} 