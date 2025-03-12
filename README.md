# AniStream

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
