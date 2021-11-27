import { Provider, Program } from "@project-serum/anchor";
import { PublicKey, Keypair, Connection, Commitment } from "@solana/web3.js";
import { WalletContextState } from "@solana/wallet-adapter-react";
import {
  getMemberAddress,
  getMemberAttributionAddress,
  getCardTokenAccount,
} from "./addresses";
import { Forum } from "./ForumType";

import idl from "../idl.json";
import { FORUM_ENDPOINT, FORUM_PROGRAM_ID } from "../utils";

export const getForumProgram = (wallet: WalletContextState): Program<Forum> => {
  const provider = getProvider(wallet);
  let myIdl: any = idl;
  return new Program(myIdl, FORUM_PROGRAM_ID, provider);
};
export const getProvider = (withWallet: WalletContextState) => {
  const commitment: Commitment = "processed";
  let confirmOptions = { preflightCommitment: commitment };
  let wallet: any = withWallet;
  const provider = new Provider(getConnection(), wallet, confirmOptions);
  return provider;
};
export const getConnection = () => {
  const endpoint = FORUM_ENDPOINT;
  const commitment: Commitment = "processed";
  return new Connection(endpoint, commitment);
};
