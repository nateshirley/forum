import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import * as web3 from "@solana/web3.js";
import { PublicKey, Keypair, SystemProgram } from "@solana/web3.js";
import { Zine } from "../target/types/zine";
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
} from "./helpers/execution";
const base58 = require("base58-encode");

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
  let leaderboard = null;
  let fakeLeader = null;
  let providerMintConfig = null;

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
    providerMintConfig = await getMintConfig(authority.publicKey);
  });

  //can put init and leaderboard into one later on
  it("initialize forum", async () => {
    const tx = await program.rpc.initializeForum(
      forumBump,
      forumAuthorityBump,
      {
        accounts: {
          initializer: authority.publicKey,
          forum: forum,
          forumAuthority: forumAuthority,
          leaderboard: leaderboard,
          clock: web3.SYSVAR_CLOCK_PUBKEY,
          systemProgram: SystemProgram.programId,
        },
        instructions: [
          program.instruction.createLeaderboard({
            accounts: {
              initializer: authority.publicKey,
              leaderboard: leaderboard,
              systemProgram: SystemProgram.programId,
            },
          }),
        ],
      }
    );
    let newForum = await provider.connection.getAccountInfo(forum);
    //console.log(newForum);
    // let lb = await program.account.leaderboard.fetch(leaderboard);
    // console.log(lb);
    let lb = await provider.connection.getAccountInfo(leaderboard);
    //console.log(lb);
  });

  it("mint membership", async () => {
    await mintMembership(providerMintConfig);

    let newMember = await program.account.member.fetch(
      providerMintConfig.member
    );
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
    await submitVote(post, providerMintConfig.authority, forum, leaderboard, 1);

    // let vote = await getVoteAddress(providerMintConfig.cardMint.publicKey);
    // let updatedVote = await program.account.vote.fetch(vote);
    // console.log(updatedVote);
  });

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
      3,
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
      5,
      wallet
    );

    await submitVote(
      fristPost,
      mintConfig.authority,
      forum,
      leaderboard,
      3,
      wallet
    );

    let lb = await program.account.leaderboard.fetch(leaderboard);
    console.log(lb);
  });

  const numberArrayToString = (rawNumber: number[]) => {
    let numbers = new Uint8Array(rawNumber);
    while (numbers[numbers.length - 1] === 0) {
      numbers = numbers.slice(0, -1);
    }
    return new TextDecoder("utf-8").decode(new Uint8Array(numbers));
  };

  it("fetch all posts", async () => {
    let accounts = await fetchAllActiveEpochPosts();
    //console.log(accounts);
    let ogPost = await program.account.post.fetch(accounts[0].pubkey);
    //assert.ok(ogPost.score == 2);
    //console.log(ogPost);
  });

  const fetchAllActiveEpochPosts = async () => {
    //fetch for epoch + 1 to reflect post accounts updated this epoch
    let activeForum = await program.account.forum.fetch(forum);
    let toArrayLike = new Int32Array([activeForum.epoch + 1]).buffer;
    let toUint8 = new Uint8Array(toArrayLike);
    let byteString: string = base58(toUint8);
    let config = {
      filters: [
        {
          dataSize: program.account.post.size, //276
        },
        {
          memcmp: {
            bytes: byteString,
            offset: 272,
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

  /*

  some queries i need to write

  - fetch all posts from current epoch
  - fetch all forum members

  components on front end


  */
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
