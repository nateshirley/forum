import { PublicKey } from "@solana/web3.js";
import * as anchor from "@project-serum/anchor";
import { getAssociatedTokenAccountAddress } from "./tokenHelpers";

import idl from "../idl.json";
import { FORUM_PROGRAM_ID } from "../utils";

export const getMemberAddress = (cardMint: PublicKey) => {
  return PublicKey.findProgramAddress(
    [anchor.utils.bytes.utf8.encode("member"), cardMint.toBuffer()],
    FORUM_PROGRAM_ID
  );
};
export const getMemberAttributionAddress = (authority: PublicKey) => {
  return PublicKey.findProgramAddress(
    [anchor.utils.bytes.utf8.encode("memberattribution"), authority.toBuffer()],
    FORUM_PROGRAM_ID
  );
};

export const getCardTokenAccount = (
  authority: PublicKey,
  cardMint: PublicKey
) => {
  return getAssociatedTokenAccountAddress(authority, cardMint);
};
export const getPostAddress = async (cardMint: PublicKey) => {
  return await PublicKey.createWithSeed(cardMint, "post", FORUM_PROGRAM_ID);
};
export const getVoteAddress = async (cardMint: PublicKey) => {
  return await PublicKey.createWithSeed(cardMint, "vote", FORUM_PROGRAM_ID);
};
export const getForumAddress = () => {
  return PublicKey.findProgramAddress(
    [anchor.utils.bytes.utf8.encode("forum")],
    FORUM_PROGRAM_ID
  );
};
export const getForumAuthority = () => {
  return PublicKey.findProgramAddress(
    [anchor.utils.bytes.utf8.encode("authority")],
    FORUM_PROGRAM_ID
  );
};
export const getLeaderboard = async () => {
  return await PublicKey.findProgramAddress(
    [anchor.utils.bytes.utf8.encode("leaderboard")],
    FORUM_PROGRAM_ID
  );
};
