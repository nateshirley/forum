import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import * as web3 from "@solana/web3.js";
import { PublicKey, Keypair, SystemProgram } from "@solana/web3.js";
import { Zine } from "../target/types/zine";
import { TOKEN_PROGRAM_ID, Token, MintLayout } from "@solana/spl-token";
import {
  createAssociatedTokenAccountInstruction,
  getAssociatedTokenAccountAddress,
} from "./helpers/tokenHelpers";
import * as assert from "assert";

describe("zine", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.Provider.env();
  anchor.setProvider(provider);
  const authority = provider.wallet;

  const program = anchor.workspace.Zine as Program<Zine>;

  let forum = null;
  let forumBump = null;
  let forumAuthority = null;
  let forumAuthorityBump = null;
  let member = null;
  let memberBump = null;
  let post = null;
  let vote = null;
  let cardMint = Keypair.generate();

  it("config", async () => {
    let [_forum, _forumBump] = await getForumAddress();
    forum = _forum;
    forumBump = _forumBump;
    let [_forumAuthority, _forumAuthorityBump] = await getForumAuthority();
    forumAuthority = _forumAuthority;
    forumAuthorityBump = _forumAuthorityBump;
    let [_member, _memberBump] = await getMemberAddress();
    member = _member;
    memberBump = _memberBump;
    post = await PublicKey.createWithSeed(
      cardMint.publicKey,
      "post",
      program.programId
    );
    vote = await PublicKey.createWithSeed(
      cardMint.publicKey,
      "vote",
      program.programId
    );
  });

  it("initialize forum", async () => {
    const tx = await program.rpc.initializeForum(
      forumBump,
      forumAuthorityBump,
      {
        accounts: {
          initializer: authority.publicKey,
          forum: forum,
          forumAuthority: forumAuthority,
          clock: web3.SYSVAR_CLOCK_PUBKEY,
          systemProgram: SystemProgram.programId,
        },
      }
    );
    console.log("init forum sig", tx);
  });

  it("mint membership", async () => {
    let [memberAttribution, memberAttributionBump] =
      await getMemberAttributionAddress(authority.publicKey);
    let cardTokenAccount = await getCardTokenAccount();
    const tx = await program.rpc.mintMembership(
      memberBump,
      memberAttributionBump,
      {
        accounts: {
          authority: authority.publicKey,
          member: member,
          memberAttribution: memberAttribution,
          forum: forum,
          forumAuthority: forumAuthority,
          post: post,
          vote: vote,
          cardMint: cardMint.publicKey,
          cardTokenAccount: cardTokenAccount,
          systemProgram: SystemProgram.programId,
          tokenProgram: TOKEN_PROGRAM_ID,
        },
        instructions: [
          //create token mint account for member card nft
          SystemProgram.createAccount({
            fromPubkey: authority.publicKey,
            newAccountPubkey: cardMint.publicKey,
            space: MintLayout.span,
            lamports:
              await provider.connection.getMinimumBalanceForRentExemption(
                MintLayout.span
              ),
            programId: TOKEN_PROGRAM_ID,
          }),
          //init the mint
          Token.createInitMintInstruction(
            TOKEN_PROGRAM_ID,
            cardMint.publicKey,
            0,
            forumAuthority,
            forumAuthority
          ),
          //create token account for new member card
          createAssociatedTokenAccountInstruction(
            cardMint.publicKey,
            cardTokenAccount,
            authority.publicKey,
            authority.publicKey
          ),
          //create post account
          SystemProgram.createAccountWithSeed({
            basePubkey: cardMint.publicKey,
            fromPubkey: authority.publicKey,
            lamports:
              await provider.connection.getMinimumBalanceForRentExemption(
                program.account.post.size
              ),
            newAccountPubkey: post,
            programId: program.programId,
            seed: "post",
            space: program.account.post.size,
          }),
          //create vote account
          SystemProgram.createAccountWithSeed({
            basePubkey: cardMint.publicKey,
            fromPubkey: authority.publicKey,
            lamports:
              await provider.connection.getMinimumBalanceForRentExemption(
                program.account.vote.size
              ),
            newAccountPubkey: vote,
            programId: program.programId,
            seed: "vote",
            space: program.account.vote.size,
          }),
        ],
        signers: [cardMint],
      }
    );
    console.log("mint member sig", tx);

    let newMember = await program.account.member.fetch(member);
    assert.ok(newMember.cardMint.equals(cardMint.publicKey));

    let cardTokenAccountBalance =
      await provider.connection.getTokenAccountBalance(cardTokenAccount);
    assert.ok(cardTokenAccountBalance.value.uiAmount === 1);

    let newVote = await program.account.vote.fetch(vote);
    console.log(newVote);
  });

  it("new post", async () => {
    const newBody = "fuuuuuuuuck yeah";
    const newLink = "https://yelllow.xyz/";
    let cardTokenAccount = await getCardTokenAccount();
    const tx = await program.rpc.newPost(newBody, newLink, {
      accounts: {
        authority: authority.publicKey,
        member: member,
        forum: forum,
        post: post,
        cardMint: cardMint.publicKey,
        cardTokenAccount: cardTokenAccount,
      },
    });

    let updatedPost = await program.account.post.fetch(post);
    //console.log(updatedPost);
    let updatedBody = numberArrayToString(updatedPost.body);
    assert.ok(updatedBody === newBody);
  });

  it("submit vote", async () => {
    let cardTokenAccount = await getCardTokenAccount();
    const tx = await program.rpc.submitVote({
      accounts: {
        authority: authority.publicKey,
        member: member,
        forum: forum,
        post: post,
        vote: vote,
        cardMint: cardMint.publicKey,
        cardTokenAccount: cardTokenAccount,
      },
    });

    let updatedVote = await program.account.vote.fetch(vote);
    console.log(updatedVote);
  });

  const numberArrayToString = (rawNumber: number[]) => {
    let numbers = new Uint8Array(rawNumber);
    while (numbers[numbers.length - 1] === 0) {
      numbers = numbers.slice(0, -1);
    }
    return new TextDecoder("utf-8").decode(new Uint8Array(numbers));
  };

  /*
  it("advance epoch", async () => {
    setTimeout(async () => {
      const tx = await program.rpc.advanceEpoch({
        accounts: {
          forum: forum,
          clock: web3.SYSVAR_CLOCK_PUBKEY,
        },
      });

      let _forum = await program.account.forum.fetch(forum);
      console.log(_forum);
    }, 2000);
  });
  */

  const getMemberAddress = () => {
    return PublicKey.findProgramAddress(
      [anchor.utils.bytes.utf8.encode("member"), cardMint.publicKey.toBuffer()],
      program.programId
    );
  };

  const getMemberAttributionAddress = (authority: PublicKey) => {
    return PublicKey.findProgramAddress(
      [
        anchor.utils.bytes.utf8.encode("memberattribution"),
        authority.toBuffer(),
      ],
      program.programId
    );
  };

  const getForumAddress = () => {
    return PublicKey.findProgramAddress(
      [anchor.utils.bytes.utf8.encode("forum")],
      program.programId
    );
  };

  const getForumAuthority = () => {
    return PublicKey.findProgramAddress(
      [anchor.utils.bytes.utf8.encode("authority")],
      program.programId
    );
  };

  const getCardTokenAccount = () => {
    return getAssociatedTokenAccountAddress(
      authority.publicKey,
      cardMint.publicKey
    );
  };
});

/*
  it("claim membership auth", async () => {
    let cardTokenAccount = await getCardTokenAccount();
    let [memberAttribution, memberAttributionBump] =
      await getMemberAttributionAddress(authority.publicKey);
    const tx = await program.rpc.claimMembershipAuthority(
      memberAttributionBump,
      {
        accounts: {
          authority: authority.publicKey,
          member: member,
          cardMint: cardMint.publicKey,
          cardTokenAccount: cardTokenAccount,
          memberAttribution: memberAttribution,
          systemProgram: SystemProgram.programId,
        },
      }
    );
  });
  */
