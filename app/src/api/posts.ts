import { Connection, PublicKey } from "@solana/web3.js";
import { Program } from "@project-serum/anchor";
import { Zine } from "./ZineType";
import * as BufferLayout from "@solana/buffer-layout";
import { numberArrayToString } from "../utils";

const base58 = require("base58-encode");

const publicKey = (property: string) => {
  return BufferLayout.blob(32, property);
};

const PostLayout = BufferLayout.struct([
  BufferLayout.seq(BufferLayout.u8(), 8, "discriminator"),
  publicKey("cardMint"),
  BufferLayout.seq(BufferLayout.u8(), 140, "body"),
  BufferLayout.seq(BufferLayout.u8(), 88, "link"),
  BufferLayout.u32("score"),
  BufferLayout.u32("epoch"),
]);

export const getProgramAccountsForActivePosts = async (
  epoch: number,
  connection: Connection,
  forumProgram: Program<Zine>
) => {
  //fetch for epoch + 1 to reflect post accounts updated this epoch
  //let activeForum = await program.account.forum.fetch(forum);
  let toArrayLike = new Int32Array([epoch + 1]).buffer;
  let toUint8 = new Uint8Array(toArrayLike);
  let byteString: string = base58(toUint8);
  let config = {
    filters: [
      {
        dataSize: forumProgram.account.post.size, //276
      },
      {
        memcmp: {
          bytes: byteString,
          offset: 272,
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

export const fetchAllActivePostsDecoded = async (
  epoch: number,
  connection: Connection,
  forumProgram: Program<Zine>
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
      score: decoded.score,
      epoch: decoded.epoch,
    };
  });
};
