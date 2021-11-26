import { Connection, PublicKey } from "@solana/web3.js";
import { Program } from "@project-serum/anchor";
import { Forum } from "./ForumType";
import * as BufferLayout from "@solana/buffer-layout";
import { numberArrayToString } from "../utils";
import { Post } from "../components/Forum/ActivePosts";

const base58 = require("base58-encode");

const publicKey = (property: string) => {
  return BufferLayout.blob(32, property);
};

const PostLayout = BufferLayout.struct([
  BufferLayout.seq(BufferLayout.u8(), 8, "discriminator"),
  publicKey("cardMint"),
  BufferLayout.seq(BufferLayout.u8(), 140, "body"),
  BufferLayout.seq(BufferLayout.u8(), 88, "link"),
  BufferLayout.u32("timestamp"),
  BufferLayout.blob(4, "timeBuffer"),
  BufferLayout.u32("epoch"),
  BufferLayout.u32("epochScore"),
  BufferLayout.u32("allTimeScore"),
]);

export const getProgramAccountsForActivePosts = async (
  epoch: number,
  connection: Connection,
  forumProgram: Program<Forum>
) => {
  console.log(forumProgram.account.post.size);
  let toArrayLike = new Int32Array([epoch]).buffer;
  let toUint8 = new Uint8Array(toArrayLike);
  let byteString: string = base58(toUint8);
  let config = {
    filters: [
      {
        dataSize: forumProgram.account.post.size, //288
      },
      {
        memcmp: {
          bytes: byteString,
          offset: 276,
        },
      },
    ],
  };
  let accounts = await connection.getProgramAccounts(
    forumProgram.programId,
    config
  );
  console.log(accounts.length);
  return accounts;
};

export const fetchedPostAccountToPostObject = (
  postAccount: any, //account fetched from program
  address: PublicKey
) => {
  return {
    publicKey: address,
    cardMint: postAccount.cardMint,
    body: numberArrayToString(postAccount.body),
    link: numberArrayToString(postAccount.link),
    timestamp: postAccount.timestamp.toNumber(),
    epoch: postAccount.epoch,
    epochScore: postAccount.epochScore,
    allTimeScore: postAccount.allTimeScore,
  };
};

export const fetchAllActivePostsDecoded = async (
  epoch: number,
  connection: Connection,
  forumProgram: Program<Forum>
) => {
  let accounts = await getProgramAccountsForActivePosts(
    epoch,
    connection,
    forumProgram
  );
  return accounts.map((result) => {
    let decoded = PostLayout.decode(result.account.data);
    return {
      publicKey: result.pubkey,
      cardMint: new PublicKey(decoded.cardMint),
      body: numberArrayToString(decoded.body),
      link: numberArrayToString(decoded.link),
      timestamp: decoded.timestamp,
      epoch: decoded.epoch,
      epochScore: decoded.epochScore,
      allTimeScore: decoded.allTimeScore,
    };
  });
};

/*

//local validator slots are fucked, cost me like 30 minutes gah damn
1633437988
1637337377.517

3899724.648000002
*/
