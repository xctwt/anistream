"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";

export default function SignIn() {
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async () => {
    setIsLoading(true);
    await signIn("anilist", { callbackUrl: "/" });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 to-gray-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">Welcome to AniStream</CardTitle>
          <CardDescription>
            Sign in with your AniList account to sync your watchlist and track your progress
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-6">
          <div className="relative w-40 h-40">
            <Image 
              src="/anilist-logo.png" 
              alt="AniList Logo"
              fill
              style={{ objectFit: "contain" }}
              priority
            />
          </div>
          <div className="text-center text-sm text-gray-500 space-y-2">
            <p>By signing in, you'll be able to:</p>
            <ul className="list-disc list-inside">
              <li>Sync with your AniList watchlist</li>
              <li>Update your watch progress</li>
              <li>Rate and review anime</li>
              <li>Get personalized recommendations</li>
            </ul>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            className="w-full"
            onClick={handleSignIn}
            disabled={isLoading}
          >
            {isLoading ? "Signing in..." : "Sign in with AniList"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
} 