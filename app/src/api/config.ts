import { Provider, Program } from "@project-serum/anchor";
import { PublicKey, Keypair, Connection, Commitment } from "@solana/web3.js";
import { WalletContextState } from "@solana/wallet-adapter-react";
import {
  getMemberAddress,
  getMemberAttributionAddress,
  getCardTokenAccount,
} from "./addresses";
import { Zine } from "./ZineType";

import idl from "../idl.json";
const forumProgramId = new PublicKey(idl.metadata.address);

export const getForumProgram = (wallet: WalletContextState): Program<Zine> => {
  const provider = getProvider(wallet);
  let myIdl: any = idl;
  return new Program(myIdl, forumProgramId, provider);
};
export const getProvider = (withWallet: WalletContextState) => {
  const commitment: Commitment = "processed";
  let confirmOptions = { preflightCommitment: commitment };
  let wallet: any = withWallet;
  const provider = new Provider(getConnection(), wallet, confirmOptions);
  return provider;
};
export const getConnection = () => {
  const endpoint = "http://127.0.0.1:8899";
  //"https://lingering-lingering-mountain.solana-devnet.quiknode.pro/fbbd36836095686bd9f580212e675aaab88204c9/";
  //clusterApiUrl('devnet');
  const commitment: Commitment = "processed";
  return new Connection(endpoint, commitment);
};

export interface MintConfig {
  authority: PublicKey;
  cardMint: Keypair;
  cardTokenAccount: PublicKey;
  member: PublicKey;
  memberBump: number;
  memberAttribution: PublicKey;
  memberAttributionBump: number;
  post: PublicKey;
  vote: PublicKey;
}
export const getMintConfig = async (authority: PublicKey) => {
  let cardMint = Keypair.generate();
  let cardTokenAccount = await getCardTokenAccount(
    authority,
    cardMint.publicKey
  );
  //these should be promise all
  let memberAddress = getMemberAddress(cardMint.publicKey);
  let memberAttribution = getMemberAttributionAddress(authority);
  let post = PublicKey.createWithSeed(
    cardMint.publicKey,
    "post",
    forumProgramId
  );
  let vote = PublicKey.createWithSeed(
    cardMint.publicKey,
    "vote",
    forumProgramId
  );
  return await Promise.all([memberAddress, memberAttribution, post, vote]).then(
    (values) => {
      return {
        authority: authority,
        cardMint: cardMint,
        cardTokenAccount: cardTokenAccount,
        member: values[0][0],
        memberBump: values[0][1],
        memberAttribution: values[1][0],
        memberAttributionBump: values[1][1],
        post: values[2],
        vote: values[3],
      };
    }
  );
};
