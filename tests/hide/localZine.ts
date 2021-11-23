import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import * as web3 from "@solana/web3.js";
import { PublicKey, Keypair, SystemProgram } from "@solana/web3.js";
import { Zine } from "../../target/types/zine";
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
} from "../helpers/execution";
import { numberArrayToString } from "../../app/src/utils";
import { getMemberAddress } from "../../app/src/api/addresses";
const base58 = require("base58-encode");

describe("local zine", () => {
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

    // let [membership, bump] = await getMemberAddress(
    //   providerMintConfig.cardMint.publicKey
    // );
    // let info = await program.account.member.fetch(membership);
  });

  it("make some posts", async () => {
    const newBody = "fuuuuuuuuck yeah";
    const newLink = "https://yelllow.xyz/";
    await newPost(authority.publicKey, newBody, newLink);
    let updatedPost = await program.account.post.fetch(providerMintConfig.post);
    //console.log(updatedPost);
    let updatedBody = numberArrayToString(updatedPost.body);
    assert.ok(updatedBody === newBody);

    let post = await getPostAddress(providerMintConfig.cardMint.publicKey);
    await submitVote(post, providerMintConfig.authority, forum, leaderboard, 1);

    let board = await program.account.leaderboard.fetch(leaderboard);
    console.log(board);
  });

  it("advance epoch", async () => {
    let _forumAccount = await program.account.forum.fetch(forum);
    let [artifact, artifactBump] = await getArtifactAddress(
      _forumAccount.epoch
    );

    const tx = await program.rpc.advanceEpoch(artifactBump, {
      accounts: {
        advancer: provider.wallet.publicKey,
        forum: forum,
        artifact: artifact,
        clock: web3.SYSVAR_CLOCK_PUBKEY,
        systemProgram: web3.SystemProgram.programId,
      },
    });

    let _forum = await program.account.forum.fetch(forum);
    console.log(_forum);
    console.log(program.account.artifact.size);
  });

  const getArtifactAddress = async (epoch: number) => {
    let toArrayLike = new Int32Array([epoch]).buffer;
    let epochArray = new Uint8Array(toArrayLike);
    return await PublicKey.findProgramAddress(
      [anchor.utils.bytes.utf8.encode("artifact"), epochArray], //
      program.programId
    );
  };

  //EG3W5QksBV8zfahaeraDL2r2qXe1RBVWaUUJunajumcu
  //AbQF5gxgVwgAwEKaHcZtYQ8yKAfsyixYcobokaNsf9T9
  // it("clock", async () => {
  //   let time = await provider.connection.getBlockTime(100874);
  //   console.log(time);
  // });

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

  // it("fetch all posts", async () => {
  //   let accounts = await fetchAllActiveEpochPosts();
  //   console.log(accounts);
  //   let ogPost = await program.account.post.fetch(accounts[0].pubkey);
  //   //assert.ok(ogPost.score == 2);
  //   //console.log(ogPost);
  // });

  // const fetchAllActiveEpochPosts = async () => {
  //   //fetch for epoch + 1 to reflect post accounts updated this epoch
  //   let activeForum = await program.account.forum.fetch(forum);
  //   let toArrayLike = new Int32Array([activeForum.epoch + 1]).buffer;
  //   let toUint8 = new Uint8Array(toArrayLike);
  //   let byteString: string = base58(toUint8);
  //   let config = {
  //     filters: [
  //       {
  //         dataSize: program.account.post.size, //276
  //       },
  //       {
  //         memcmp: {
  //           bytes: byteString,
  //           offset: 272,
  //         },
  //       },
  //     ],
  //   };
  //   let accounts = await provider.connection.getProgramAccounts(
  //     program.programId,
  //     config
  //   );
  //   return accounts;
  // };
});
