import { BN } from "@project-serum/anchor";
import { PublicKey, Keypair } from "@solana/web3.js";

export interface Post {
  publicKey: PublicKey;
  cardMint: PublicKey;
  body: string;
  link: string;
  timestamp: number;
  epoch: number;
  epochScore: number;
  allTimeScore: number;
}
export interface Artifact {
  address: PublicKey;
  epoch: number;
  cardMint: PublicKey;
  posts: ArtifactPost[];
  bump: number;
}

export interface ArtifactPost {
  cardMint: PublicKey;
  body: string;
  link: string;
  score: number;
}
export interface Auction {
  address: PublicKey;
  epoch: number;
  endTimestamp: number;
  leadingBidder: PublicKey;
  bidLamports: number;
  bump: number;
}
export interface Pda {
  address: PublicKey;
  bump: number;
}
export interface ForumInfo {
  publicKey: PublicKey;
  membership: number;
  epoch: number;
  state: number;
  lastDawn: BN;
  bump: number;
}
export interface Membership {
  publicKey: PublicKey;
  authority: PublicKey;
  cardMint: PublicKey;
  post: PublicKey;
  vote: PublicKey;
  id: number;
  bump: number;
}
