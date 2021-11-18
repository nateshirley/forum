import { PublicKey } from "@solana/web3.js";
import * as anchor from "@project-serum/anchor";
import { getAssociatedTokenAccountAddress } from "./tokenHelpers";

import idl from "../idl.json";
const forumProgramId = new PublicKey(idl.metadata.address);

export const getMemberAddress = (cardMint: PublicKey) => {
  return PublicKey.findProgramAddress(
    [anchor.utils.bytes.utf8.encode("member"), cardMint.toBuffer()],
    forumProgramId
  );
};
export const getMemberAttributionAddress = (authority: PublicKey) => {
  return PublicKey.findProgramAddress(
    [anchor.utils.bytes.utf8.encode("memberattribution"), authority.toBuffer()],
    forumProgramId
  );
};

export const getCardTokenAccount = (
  authority: PublicKey,
  cardMint: PublicKey
) => {
  return getAssociatedTokenAccountAddress(authority, cardMint);
};
export const getPostAddress = async (cardMint: PublicKey) => {
  return await PublicKey.createWithSeed(cardMint, "post", forumProgramId);
};
export const getVoteAddress = async (cardMint: PublicKey) => {
  return await PublicKey.createWithSeed(cardMint, "vote", forumProgramId);
};
export const getForumAddress = () => {
  return PublicKey.findProgramAddress(
    [anchor.utils.bytes.utf8.encode("forum")],
    forumProgramId
  );
};
export const getForumAuthority = () => {
  return PublicKey.findProgramAddress(
    [anchor.utils.bytes.utf8.encode("authority")],
    forumProgramId
  );
};
export const getLeaderboard = async () => {
  return await PublicKey.findProgramAddress(
    [anchor.utils.bytes.utf8.encode("leaderboard")],
    forumProgramId
  );
};
