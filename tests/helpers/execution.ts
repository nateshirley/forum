import * as anchor from "@project-serum/anchor";
import { Program, Provider } from "@project-serum/anchor";
import * as web3 from "@solana/web3.js";
import {
  PublicKey,
  Keypair,
  SystemProgram,
  Commitment,
  Connection,
} from "@solana/web3.js";
import { Forum } from "../../target/types/forum";
import idl from "../../target/idl/forum.json";
import { TOKEN_PROGRAM_ID, Token, MintLayout } from "@solana/spl-token";
import {
  createAssociatedTokenAccountInstruction,
  getAssociatedTokenAccountAddress,
} from "./tokenHelpers";
import { FORUM_ENDPOINT, FORUM_PROGRAM_ID } from "../../app/src/utils";

const getForumProgram = (wallet: any): Program<Forum> => {
  const provider = getProvider(wallet);
  let myIdl: any = idl;
  return new Program(myIdl, FORUM_PROGRAM_ID, provider);
};
const getProvider = (withWallet: Keypair) => {
  const commitment: Commitment = "processed";
  let confirmOptions = { preflightCommitment: commitment };
  let wallet: any = withWallet;
  const provider = new Provider(getConnection(), wallet, confirmOptions);
  return provider;
};
const getConnection = () => {
  const endpoint = FORUM_ENDPOINT;
  const commitment: Commitment = "processed";
  return new Connection(endpoint, commitment);
};
const envProgram = anchor.Provider.env();
const program = getForumProgram(anchor.Provider.env().wallet);
const provider = anchor.Provider.env();

// const provider = anchor.Provider.env();
// const program = anchor.workspace.Forum as Program<Forum>;

interface MintConfig {
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

export const getArtifactAddress = async (session: number) => {
  let toArrayLike = new Int32Array([session]).buffer;
  let sessionArray = new Uint8Array(toArrayLike);
  return await PublicKey.findProgramAddress(
    [anchor.utils.bytes.utf8.encode("artifact"), sessionArray], //
    program.programId
  );
};

export const getArtifactAttributionAddress = async (cardMint: PublicKey) => {
  return await PublicKey.findProgramAddress(
    [anchor.utils.bytes.utf8.encode("artifact"), cardMint.toBuffer()], //
    program.programId
  );
};

export const getMintConfig = async (authority: PublicKey) => {
  let cardMint = Keypair.generate();
  let cardTokenAccount = await getCardTokenAccount(
    authority,
    cardMint.publicKey
  );
  let [member, memberBump] = await getMemberAddress(cardMint.publicKey);
  let [memberAttribution, memberAttributionBump] =
    await getMemberAttributionAddress(authority);
  let post = await PublicKey.createWithSeed(
    cardMint.publicKey,
    "post",
    program.programId
  );
  let vote = await PublicKey.createWithSeed(
    cardMint.publicKey,
    "vote",
    program.programId
  );
  return {
    authority: authority,
    cardMint: cardMint,
    cardTokenAccount: cardTokenAccount,
    member: member,
    memberBump: memberBump,
    memberAttribution: memberAttribution,
    memberAttributionBump: memberAttributionBump,
    post: post,
    vote: vote,
  };
};

export const mintMembership = async (
  mintConfig: MintConfig,
  signer?: Keypair
) => {
  let signers = signer ? [signer, mintConfig.cardMint] : [mintConfig.cardMint];
  let [forum, _forumBump] = await getForumAddress();
  let [forumAuthority, _forumAuthorityBump] = await getForumAuthority();

  const tx = await program.rpc.mintMembership(
    mintConfig.memberBump,
    mintConfig.memberAttributionBump,
    {
      accounts: {
        authority: mintConfig.authority,
        membership: mintConfig.member,
        membershipAttribution: mintConfig.memberAttribution,
        forum: forum,
        forumAuthority: forumAuthority,
        post: mintConfig.post,
        vote: mintConfig.vote,
        cardMint: mintConfig.cardMint.publicKey,
        cardTokenAccount: mintConfig.cardTokenAccount,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        clock: web3.SYSVAR_CLOCK_PUBKEY,
      },
      instructions: [
        //create token mint account for member card nft
        SystemProgram.createAccount({
          fromPubkey: mintConfig.authority,
          newAccountPubkey: mintConfig.cardMint.publicKey,
          space: MintLayout.span,
          lamports:
            await program.provider.connection.getMinimumBalanceForRentExemption(
              MintLayout.span
            ),
          programId: TOKEN_PROGRAM_ID,
        }),
        //init the mint
        Token.createInitMintInstruction(
          TOKEN_PROGRAM_ID,
          mintConfig.cardMint.publicKey,
          0,
          forumAuthority,
          forumAuthority
        ),
        //create token account for new member card
        createAssociatedTokenAccountInstruction(
          mintConfig.cardMint.publicKey,
          mintConfig.cardTokenAccount,
          mintConfig.authority,
          mintConfig.authority
        ),
        //create post account
        SystemProgram.createAccountWithSeed({
          basePubkey: mintConfig.cardMint.publicKey,
          fromPubkey: mintConfig.authority,
          lamports:
            await program.provider.connection.getMinimumBalanceForRentExemption(
              program.account.post.size
            ),
          newAccountPubkey: mintConfig.post,
          programId: program.programId,
          seed: "post",
          space: program.account.post.size,
        }),
        //create vote account
        SystemProgram.createAccountWithSeed({
          basePubkey: mintConfig.cardMint.publicKey,
          fromPubkey: mintConfig.authority,
          lamports:
            await program.provider.connection.getMinimumBalanceForRentExemption(
              program.account.vote.size
            ),
          newAccountPubkey: mintConfig.vote,
          programId: program.programId,
          seed: "vote",
          space: program.account.vote.size,
        }),
      ],
      signers: signers,
    }
  );
  console.log(
    "minted membership for wallet address: ",
    mintConfig.authority.toBase58()
  );
  let p = await program.account.post.fetch(mintConfig.post);
  console.log(p);
};

export const fetchMemberAttribution = async (authority: PublicKey) => {
  let [address, bump] = await PublicKey.findProgramAddress(
    [anchor.utils.bytes.utf8.encode("memberattribution"), authority.toBuffer()],
    program.programId
  );
  return await program.account.membershipAttribution.fetch(address);
};

export const newPost = async (
  authority: PublicKey,
  newBody: string,
  newLink: string,
  signer?: Keypair
) => {
  let [forum, _forumBump] = await getForumAddress();
  let memberAttribution = await fetchMemberAttribution(authority);
  let cardTokenAccount = await getCardTokenAccount(
    authority,
    memberAttribution.cardMint
  );
  let [artifactAuction, aBump] = await getArtifactAuctionAddress();

  let post = await getPostAddress(memberAttribution.cardMint);
  let signers = signer ? [signer] : [];
  const tx = await program.rpc.newPost(newBody, newLink, {
    accounts: {
      authority: authority,
      membership: memberAttribution.membership,
      forum: forum,
      artifactAuction: artifactAuction,
      post: post,
      cardMint: memberAttribution.cardMint,
      cardTokenAccount: cardTokenAccount,
      clock: web3.SYSVAR_CLOCK_PUBKEY,
    },
    signers: signers,
  });
};
export const submitVote = async (
  forPost: PublicKey,
  authority: PublicKey,
  forum: PublicKey,
  leaderboard: PublicKey,
  amount: number,
  signer?: Keypair
) => {
  let memberAttribution = await fetchMemberAttribution(authority);
  let cardTokenAccount = await getCardTokenAccount(
    authority,
    memberAttribution.cardMint
  );
  let [artifactAuction, aBump] = await getArtifactAuctionAddress();
  let vote = await getVoteAddress(memberAttribution.cardMint);
  let signers = signer ? [signer] : [];
  const tx = await program.rpc.submitVote(amount, {
    accounts: {
      authority: authority,
      membership: memberAttribution.membership,
      forum: forum,
      leaderboard: leaderboard,
      artifactAuction: artifactAuction,
      post: forPost,
      vote: vote,
      cardMint: memberAttribution.cardMint,
      cardTokenAccount: cardTokenAccount,
      clock: web3.SYSVAR_CLOCK_PUBKEY,
    },
    signers: signers,
  });
};

export const getArtifactAuctionAddress = async () => {
  return PublicKey.findProgramAddress(
    [anchor.utils.bytes.utf8.encode("a_auction")],
    program.programId
  );
};

export const getArtifactAuctionHouseAddress = async () => {
  return PublicKey.findProgramAddress(
    [anchor.utils.bytes.utf8.encode("a_aux_house")],
    program.programId
  );
};

export const getMemberAddress = (cardMint: PublicKey) => {
  return PublicKey.findProgramAddress(
    [anchor.utils.bytes.utf8.encode("member"), cardMint.toBuffer()],
    program.programId
  );
};
export const getMemberAttributionAddress = (authority: PublicKey) => {
  return PublicKey.findProgramAddress(
    [anchor.utils.bytes.utf8.encode("memberattribution"), authority.toBuffer()],
    program.programId
  );
};
export const getCardTokenAccount = (
  authority: PublicKey,
  cardMint: PublicKey
) => {
  return getAssociatedTokenAccountAddress(authority, cardMint);
};
export const getPostAddress = async (cardMint: PublicKey) => {
  return await PublicKey.createWithSeed(cardMint, "post", program.programId);
};
export const getVoteAddress = async (cardMint: PublicKey) => {
  return await PublicKey.createWithSeed(cardMint, "vote", program.programId);
};
export const getForumAddress = () => {
  return PublicKey.findProgramAddress(
    [anchor.utils.bytes.utf8.encode("forum")],
    program.programId
  );
};
export const getForumAuthority = () => {
  return PublicKey.findProgramAddress(
    [anchor.utils.bytes.utf8.encode("authority")],
    program.programId
  );
};
