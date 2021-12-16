import * as anchor from "@project-serum/anchor";
import { BN, Program } from "@project-serum/anchor";
import * as web3 from "@solana/web3.js";
import {
  PublicKey,
  Keypair,
  SystemProgram,
  Transaction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import { Forum } from "../target/types/forum";
import { TOKEN_PROGRAM_ID, Token, MintLayout } from "@solana/spl-token";
import * as assert from "assert";
import { TextDecoder } from "util";
import {
  getForumAddress,
  getForumAuthority,
  getMintConfig,
  mintMembership,
  fetchMemberAttribution,
  newPost,
  getPostAddress,
  getVoteAddress,
  submitVote,
  getArtifactAddress,
  getArtifactAttributionAddress,
  getArtifactAuctionAddress,
  getArtifactAuctionHouseAddress,
} from "./helpers/execution";
import { getAssociatedTokenAccountAddress } from "../app/src/api/tokenHelpers";
import { createAssociatedTokenAccountInstruction } from "./helpers/tokenHelpers";
import { TOKEN_METADATA_PROGRAM_ID } from "../app/src/api/addresses";
const base58 = require("base58-encode");

//1 lamp =  0.000000001 sol

describe("forum", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.Provider.env();
  anchor.setProvider(provider);
  const authority = provider.wallet;
  const program = anchor.workspace.Forum as Program<Forum>;

  let forum = null;
  let forumBump = null;
  let forumAuthority = null;
  let forumAuthorityBump = null;
  let leaderboard = null;
  let leaderboardBump = null;
  let fakeLeader = null;
  let providerMintConfig = null;
  let artifactAuction = null;
  let artifactAuctionBump = null;
  let artifactCardMint = Keypair.generate();

  let forumTreasury = new PublicKey(
    "GUH6vc8SJ2DtWJndjz7Y9984zAqAsFYEuLUBFX8jdopK"
  );
  let yelllowTreasury = new PublicKey(
    "nAFRh5zcrsiRka8hNTM4Auu6prBKvpv6zPLMefHFB8x"
  );

  it("config", async () => {
    let [_forum, _forumBump] = await getForumAddress();
    forum = _forum;
    forumBump = _forumBump;
    let [_forumAuthority, _forumAuthorityBump] = await getForumAuthority();
    forumAuthority = _forumAuthority;
    forumAuthorityBump = _forumAuthorityBump;
    let [_board, _boardBump] = await PublicKey.findProgramAddress(
      [anchor.utils.bytes.utf8.encode("leaderboard")],
      program.programId
    );
    leaderboard = _board;
    leaderboardBump = _boardBump;
    providerMintConfig = await getMintConfig(authority.publicKey);
    let [_a_auction, _abump] = await getArtifactAuctionAddress();
    artifactAuction = _a_auction;
    artifactAuctionBump = _abump;
  });

  it("transfer to auction house", async () => {
    let [auctionHouse, auctionHouseBump] =
      await getArtifactAuctionHouseAddress();

    const airdropSignature = await provider.connection.requestAirdrop(
      auctionHouse,
      0.9 * web3.LAMPORTS_PER_SOL
    );
    // let payer: any = provider.wallet.payer;
    // await sendAndConfirmTransaction(
    //   provider.connection,
    //   transferTransaction,
    //   []
    // );
  });

  //can put init and leaderboard into one later on
  it("initialize forum", async () => {
    const tx = await program.rpc.initializeForum(
      forumBump,
      forumAuthorityBump,
      artifactAuctionBump,
      {
        accounts: {
          initializer: authority.publicKey,
          forum: forum,
          forumAuthority: forumAuthority,
          leaderboard: leaderboard,
          clock: web3.SYSVAR_CLOCK_PUBKEY,
          artifactAuction: artifactAuction,
          systemProgram: SystemProgram.programId,
        },
        instructions: [
          program.instruction.createLeaderboard(leaderboardBump, {
            accounts: {
              initializer: authority.publicKey,
              leaderboard: leaderboard,
              systemProgram: SystemProgram.programId,
            },
          }),
        ],
      }
    );
    //everyth looks good. should write tests but too lazy rn
    // let newForum = await program.account.forum.fetch(forum);
    // console.log(newForum);
    // let auction = await program.account.artifactAuction.fetch(artifactAuction);
    // console.log(auction);
    // let auth = await program.account.forumAuthority.fetch(forumAuthority);
    // console.log(auth);
    // let lb = await program.account.leaderboard.fetch(leaderboard);
    // console.log(lb);
  });

  it("mint membership", async () => {
    await mintMembership(providerMintConfig);

    let newMember = await program.account.membership.fetch(
      providerMintConfig.member
    );
    //console.log(newMember);
    assert.ok(newMember.cardMint.equals(providerMintConfig.cardMint.publicKey));
    let cardTokenAccountBalance =
      await provider.connection.getTokenAccountBalance(
        providerMintConfig.cardTokenAccount
      );
    assert.ok(cardTokenAccountBalance.value.uiAmount === 1);
  });

  it("new post", async () => {
    const newBody = "fuuuuuuuuck yeah";
    const newLink = "https://yelllow.xyz/";
    await newPost(authority.publicKey, newBody, newLink);
    let updatedPost = await program.account.post.fetch(providerMintConfig.post);
    //console.log(updatedPost);
    let updatedBody = numberArrayToString(updatedPost.body);
    assert.ok(updatedBody === newBody);
  });

  it("submit vote", async () => {
    let post = await getPostAddress(providerMintConfig.cardMint.publicKey);
    await submitVote(post, providerMintConfig.authority, forum, leaderboard);

    // let vote = await getVoteAddress(providerMintConfig.cardMint.publicKey);
    // let updatedVote = await program.account.vote.fetch(vote);
    // console.log(updatedVote);
  });
  const numberArrayToString = (rawNumber: number[]) => {
    let numbers = new Uint8Array(rawNumber);
    while (numbers[numbers.length - 1] === 0) {
      numbers = numbers.slice(0, -1);
    }
    return new TextDecoder("utf-8").decode(new Uint8Array(numbers));
  };

  it("bid for artifact", async () => {
    let [auctionHouse, auctionHouseBump] =
      await getArtifactAuctionHouseAddress();
    let auctionState = await program.account.artifactAuction.fetch(
      artifactAuction
    );
    let newestLoser = auctionState.leadingBid.bidder;
    const tx = await program.rpc.placeBidForArtifact(
      auctionHouseBump,
      new BN(10 * web3.LAMPORTS_PER_SOL),
      {
        accounts: {
          bidder: authority.publicKey,
          newestLoser: newestLoser,
          artifactAuction: artifactAuction,
          artifactAuctionHouse: auctionHouse,
          clock: web3.SYSVAR_CLOCK_PUBKEY,
          systemProgram: web3.SystemProgram.programId,
        },
      }
    );
  });

  it("wrap session", async () => {
    let _forumAccount = await program.account.forum.fetch(forum);
    let [artifact, artifactBump] = await getArtifactAddress(
      _forumAccount.session
    );
    let auctionState = await program.account.artifactAuction.fetch(
      artifactAuction
    );
    let winner = auctionState.leadingBid.bidder;
    let artifactTokenAccount = await getAssociatedTokenAccountAddress(
      winner,
      artifactCardMint.publicKey
    );
    let [artifactAttribution, artifactAttributionBump] =
      await getArtifactAttributionAddress(artifactCardMint.publicKey);
    console.log(artifactCardMint.publicKey.toBase58());
    let [auctionHouse, auctionHouseBump] =
      await getArtifactAuctionHouseAddress();
    const tx = await program.rpc.assertArtifactDiscriminator({
      accounts: {
        artifact: artifact,
      },
      instructions: [
        //create artifact mint
        SystemProgram.createAccount({
          fromPubkey: authority.publicKey,
          newAccountPubkey: artifactCardMint.publicKey,
          space: MintLayout.span,
          lamports: await provider.connection.getMinimumBalanceForRentExemption(
            MintLayout.span
          ),
          programId: TOKEN_PROGRAM_ID,
        }),
        //init the mint
        Token.createInitMintInstruction(
          TOKEN_PROGRAM_ID,
          artifactCardMint.publicKey,
          0,
          forumAuthority,
          forumAuthority
        ),
        //create token account for winner
        createAssociatedTokenAccountInstruction(
          artifactCardMint.publicKey,
          artifactTokenAccount,
          winner,
          authority.publicKey
        ),
        program.instruction.wrapSession(
          auctionHouseBump,
          artifactAttributionBump,
          artifactBump,
          {
            accounts: {
              initializer: authority.publicKey,
              artifact: artifact,
              artifactMint: artifactCardMint.publicKey,
              artifactMetadata: artifactCardMint.publicKey,
              artifactTokenAccount: artifactTokenAccount,
              winner: winner,
              artifactAuction: artifactAuction,
              artifactAttribution: artifactAttribution,
              artifactAuctionHouse: auctionHouse,
              forum: forum,
              forumAuthority: forumAuthority,
              leaderboard: leaderboard,
              forumTreasury: forumTreasury,
              yelllowTreasury: yelllowTreasury,
              rent: web3.SYSVAR_RENT_PUBKEY,
              clock: web3.SYSVAR_CLOCK_PUBKEY,
              tokenProgram: TOKEN_PROGRAM_ID,
              tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
              systemProgram: SystemProgram.programId,
            },
          }
        ),
      ],
      signers: [artifactCardMint],
    });

    let yelllowBalance = await provider.connection.getBalance(yelllowTreasury);
    console.log("yelllow balance: ", lampsToSol(yelllowBalance));
    let forumBalance = await provider.connection.getBalance(forumTreasury);
    console.log("forum balance:", lampsToSol(forumBalance));
  });

  const lampsToSol = (lamps: number) => {
    return lamps * 0.000000001;
  };

  /*
  it("mint dif", async () => {
    let wallet = Keypair.generate();
    await provider.connection.confirmTransaction(
      await provider.connection.requestAirdrop(
        wallet.publicKey,
        5 * web3.LAMPORTS_PER_SOL
      ),
      "confirmed"
    );

    let mintConfig = await getMintConfig(wallet.publicKey);
    await mintMembership(mintConfig, wallet);

    let fristPost = await getPostAddress(providerMintConfig.cardMint.publicKey);
    await submitVote(
      fristPost,
      mintConfig.authority,
      forum,
      leaderboard,
      wallet
    );

    await newPost(
      mintConfig.authority,
      "hu asjdkfj skdjfha kdjf",
      "https://www.espn.com/",
      wallet
    );

    let secondPost = await getPostAddress(mintConfig.cardMint.publicKey);
    await submitVote(
      secondPost,
      mintConfig.authority,
      forum,
      leaderboard,
      wallet
    );

    await submitVote(
      fristPost,
      mintConfig.authority,
      forum,
      leaderboard,
      wallet
    );

    let lb: any = await program.account.leaderboard.fetch(leaderboard);
    // console.log(lb);
    // lb.posts.map((post) => {
    //   let body = numberArrayToString(post.body);
    //   console.log(body);
    // });
  });
  */

  /*
  it("fetch all posts", async () => {
    let accounts = await fetchAllActiveEpochPosts();
    //console.log(accounts);
    //let ogPost = await program.account.post.fetch(accounts[0].pubkey);
    //assert.ok(ogPost.score == 2);
    //console.log(ogPost);
  });
  
  
  const fetchAllActiveEpochPosts = async () => {
    console.log(program.account.post.size);
    let activeForum = await program.account.forum.fetch(forum);
    let toArrayLike = new Int32Array([activeForum.epoch + 1]).buffer;
    let toUint8 = new Uint8Array(toArrayLike);
    let byteString: string = base58(toUint8);
    let config = {
      filters: [
        {
          dataSize: program.account.post.size,
        },
        {
          memcmp: {
            bytes: byteString,
            offset: 276,
          },
        },
      ],
    };
    let accounts = await provider.connection.getProgramAccounts(
      program.programId,
      config
    );
    return accounts;
  };


  /*

  some queries i need to write

  - fetch all posts from current epoch
  - fetch all forum members

  components on front end


  */
});

//making an array out of the pubkey in numbers
// let arr = forumTreasury.toBytes();
// let g = Array.from(arr);
// console.log(g);
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
