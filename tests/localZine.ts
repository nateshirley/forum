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
  });

  it("advance epoch", async () => {
    let _forumAccount = await program.account.forum.fetch(forum);
    let [zine, zineBump] = await getZineAddress(_forumAccount.epoch);

    const tx = await program.rpc.advanceEpoch(zineBump, {
      accounts: {
        advancer: provider.wallet.publicKey,
        forum: forum,
        zine: zine,
        clock: web3.SYSVAR_CLOCK_PUBKEY,
        systemProgram: web3.SystemProgram.programId,
      },
    });

    // let _forum = await program.account.forum.fetch(forum);
    // console.log(_forum);
  });

  const getZineAddress = async (epoch: number) => {
    let toArrayLike = new Int32Array([epoch]).buffer;
    let epochArray = new Uint8Array(toArrayLike);
    console.log(epochArray);
    return await PublicKey.findProgramAddress(
      [anchor.utils.bytes.utf8.encode("zine"), epochArray], //
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
