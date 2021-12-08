import { BN } from "@project-serum/anchor";
import { PublicKey, Keypair } from "@solana/web3.js";

export interface Post {
  publicKey: PublicKey;
  cardMint: PublicKey;
  body: string;
  link: string;
  timestamp: number;
  session: number;
  sessionScore: number;
  allTimeScore: number;
}
export interface Like {
  publicKey: PublicKey;
  authorityCardMint: PublicKey;
  votedForCardMint: PublicKey;
  session: number;
}
export interface Artifact {
  address: PublicKey;
  session: number;
  tokenMint: PublicKey;
  posts: ArtifactPost[];
  bump: number;
}

export interface ArtifactPost {
  cardMint: PublicKey;
  body: string;
  link: string;
  score: number;
}
export interface ArtifactAuction {
  address: PublicKey;
  session: number;
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
  session: number;
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
//only showing active or needs settled
export const AUCTION_PHASE = {
  isActive: "isActive", //1
  needsSettled: "needsSettled", //2
  historical: "historical", //3
};
