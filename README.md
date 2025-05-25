# Cairofy Frontend

Cairofy is a decentralized music NFT platform built on StarkNet, allowing artists to register, upload music, and listeners to purchase and collect music as NFTs.

## Environment Setup

Before running the application, you need to set up environment variables:

1. Copy the `.env-example` file to create a new `.env` file:
   ```bash
   cp .env-example .env
   ```

2. Update the values in the `.env` file with your actual credentials:
   ```
   # Pinata (IPFS) Configuration
   PINATA_JWT="your_pinata_jwt_here"
   
   # Optional: StarkNet Configuration
   NEXT_PUBLIC_STARKNET_RPC_URL="your_starknet_rpc_url_here"
   ```

You need to get a JWT from [Pinata](https://www.pinata.cloud/) for IPFS file uploads. The StarkNet RPC URL is optional and will default to public endpoints if not provided.

## Getting Started

First, install dependencies:

```bash
npm install
# or
yarn
# or
pnpm install
```

Then, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Features

- **Artist Registration**: Register as an artist with profile details and upload a profile image
- **Song Management**: Upload and manage your songs as NFTs with metadata
- **Marketplace**: Browse, filter, search, and purchase songs
- **Web3 Integration**: Connect with StarkNet wallet for transactions
- **Music Player**: Preview and play full versions of purchased songs
- **Decentralized Storage**: IPFS integration for storing music files and metadata
- **User Subscriptions**: Option to subscribe for unlimited access to music

## Pages

- **Home**: Landing page with featured content
- **Dashboard**: View your owned songs and artist information
- **Marketplace**: Browse and buy music NFTs
- **Upload**: For artists to upload new songs
- **Song Details**: Detailed view of a song with playback and purchase options
- **Artist Registration**: Register as an artist on the platform
- **Fetch**: Direct access to play and interact with songs

## Architecture

### Frontend
- **Next.js App Router**: For routing and page structure
- **React**: UI components and state management
- **TypeScript**: Type-safe code
- **Tailwind CSS**: Styling
- **Shadcn UI**: UI component library

### Blockchain Integration
- **StarkNet.js**: Interaction with StarkNet blockchain
- **StarkNet React**: React hooks for StarkNet
- **Cairo Smart Contracts**: Backend logic on StarkNet

### Storage
- **IPFS (via Pinata)**: Decentralized storage for music files and images

## Contract Integration

The application connects to a StarkNet smart contract for:
- Artist registration
- Song uploads
- NFT purchases
- Song listing management
- Subscription management

The contract address is configured in `constants/contrat.ts`.

## Building for Production

To build the application for production:

```bash
npm run build
# or
yarn build
# or
pnpm build
```

Then, to start the production server:

```bash
npm start
# or
yarn start
# or
pnpm start
```

## Troubleshooting

If you encounter linting errors during build, you can disable specific rules in the `.eslintrc.json` file or run the build with ESLint disabled:

```bash
NEXT_DISABLE_ESLINT=1 npm run build
```

## Learn More

To learn more about the technologies used:

- [Next.js Documentation](https://nextjs.org/docs)
- [StarkNet Documentation](https://docs.starknet.io/)
- [IPFS Documentation](https://docs.ipfs.io/)
- [Pinata Documentation](https://docs.pinata.cloud/)

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
