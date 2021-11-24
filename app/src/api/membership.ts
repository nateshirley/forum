import {
  PublicKey,
  Keypair,
  SystemProgram,
  SYSVAR_CLOCK_PUBKEY,
} from "@solana/web3.js";
import { Provider, Program, utils } from "@project-serum/anchor";
import { TOKEN_PROGRAM_ID, Token, MintLayout } from "@solana/spl-token";
import { createAssociatedTokenAccountInstruction } from "./tokenHelpers";
import {
  getForumAddress,
  getForumAuthority,
  getMemberAddress,
} from "./addresses";
import { getMintConfig, MintConfig } from "./config";
import idl from "../idl.json";
import { Forum } from "./ForumType";
import { FORUM_PROGRAM_ID } from "../utils";

export const fetchMembershipAccount = async (
  forumProgram: Program<Forum>,
  cardMint: PublicKey
) => {
  let [memberAddress, _bump] = await getMemberAddress(cardMint);
  try {
    let membership = await forumProgram.account.member.fetch(memberAddress);
    return {
      publicKey: memberAddress,
      authority: membership.authority,
      cardMint: membership.cardMint,
      post: membership.post,
      vote: membership.vote,
      id: membership.id,
      bump: membership.bump,
    };
  } catch {
    return undefined;
  }
};

export const fetchMembershipCardMintForWallet = async (
  forumProgram: Program<Forum>,
  walletAddress: PublicKey | null
): Promise<PublicKey | undefined> => {
  if (walletAddress) {
    let [address, _bump] = await PublicKey.findProgramAddress(
      [utils.bytes.utf8.encode("memberattribution"), walletAddress.toBuffer()],
      forumProgram.programId
    );
    try {
      let attribution = await forumProgram.account.memberAttribution.fetch(
        address
      );
      return attribution.cardMint;
    } catch (e) {
      console.log("wallet is not a member");
      return undefined;
    }
  } else {
    return undefined;
  }
};
export const mintMembership = async (
  mintConfig: MintConfig,
  provider: Provider,
  signer?: Keypair
) => {
  let signers = signer ? [signer, mintConfig.cardMint] : [mintConfig.cardMint];
  let [forum, _forumBump] = await getForumAddress();
  let [forumAuthority, _forumAuthorityBump] = await getForumAuthority();
  const program = new Program(idl as any, FORUM_PROGRAM_ID, provider);

  const tx = await program.rpc.mintMembership(
    mintConfig.memberBump,
    mintConfig.memberAttributionBump,
    {
      accounts: {
        authority: mintConfig.authority,
        member: mintConfig.member,
        memberAttribution: mintConfig.memberAttribution,
        forum: forum,
        forumAuthority: forumAuthority,
        post: mintConfig.post,
        vote: mintConfig.vote,
        cardMint: mintConfig.cardMint.publicKey,
        cardTokenAccount: mintConfig.cardTokenAccount,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        clock: SYSVAR_CLOCK_PUBKEY,
      },
      instructions: [
        //create token mint account for member card nft
        SystemProgram.createAccount({
          fromPubkey: mintConfig.authority,
          newAccountPubkey: mintConfig.cardMint.publicKey,
          space: MintLayout.span,
          lamports: await provider.connection.getMinimumBalanceForRentExemption(
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
          lamports: await provider.connection.getMinimumBalanceForRentExemption(
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
          lamports: await provider.connection.getMinimumBalanceForRentExemption(
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
};
