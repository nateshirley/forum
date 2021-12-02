import { Connection, PublicKey } from "@solana/web3.js";
import { Program } from "@project-serum/anchor";
import { Forum } from "./ForumType";
import * as BufferLayout from "@solana/buffer-layout";
import { numberArrayToString } from "../utils";
import { Post } from "../interfaces";

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
  BufferLayout.u32("session"),
  BufferLayout.u32("sessionScore"),
  BufferLayout.u32("allTimeScore"),
]);

export const getProgramAccountsForActivePosts = async (
  session: number,
  connection: Connection,
  forumProgram: Program<Forum>
) => {
  let toArrayLike = new Int32Array([session]).buffer;
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
    session: postAccount.session,
    sessionScore: postAccount.sessionScore,
    allTimeScore: postAccount.allTimeScore,
  };
};

export const fetchAllActivePostsDecoded = async (
  session: number,
  connection: Connection,
  forumProgram: Program<Forum>
): Promise<Post[]> => {
  let accounts = await getProgramAccountsForActivePosts(
    session,
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
      session: decoded.session,
      sessionScore: decoded.sessionScore,
      allTimeScore: decoded.allTimeScore,
    };
  });
};

export const fetchAllActivePostsSortedByScore = async (
  session: number,
  connection: Connection,
  forumProgram: Program<Forum>
) => {
  let posts = await fetchAllActivePostsDecoded(
    session,
    connection,
    forumProgram
  );
  return posts.sort((a, b) => {
    return b.sessionScore - a.sessionScore;
  });
};
export const sortByTime = (posts: Post[]) => {
  return posts.sort((a, b) => {
    return b.timestamp - a.timestamp;
  });
};

/*

//local validator slots are fucked, cost me like 30 minutes gah damn
1633437988
1637337377.517

3899724.648000002
*/
