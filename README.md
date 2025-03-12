# AniStream

AniStream is a modern anime streaming platform built with Next.js, featuring AniList integration, multiple video sources, and a feature-rich video player.

## Features

- **Multiple Video Sources**: Watch anime from various sources including embeds, WebTorrent, and HLS streams
- **Advanced Video Player**: Feature-rich player with quality controls, playback speed, and more
- **AniList Integration**: Sign in with your AniList account to sync your watchlist and track your progress
- **Responsive Design**: Beautiful UI that works on all devices

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **UI**: shadcn/ui components with Tailwind CSS
- **Authentication**: NextAuth.js with AniList OAuth
- **Video Player**: react-player with custom controls
- **Package Manager**: pnpm

## Getting Started

### Prerequisites

- Node.js 18.17 or later
- pnpm

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/anistream.git
   cd anistream
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Create a `.env.local` file in the root directory with the following variables:
   ```
   ANILIST_CLIENT_ID=your_anilist_client_id
   ANILIST_CLIENT_SECRET=your_anilist_client_secret
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your_nextauth_secret
   ```

4. Start the development server:
   ```bash
   pnpm dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

- `app/`: Next.js App Router pages and layouts
- `components/`: Reusable React components
  - `ui/`: shadcn/ui components
  - `VideoPlayer.tsx`: Custom video player component
- `public/`: Static assets
- `types/`: TypeScript type definitions

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Disclaimer

This project is for educational purposes only. AniStream is not affiliated with AniList or any anime streaming service. Please support the official releases of anime content.
