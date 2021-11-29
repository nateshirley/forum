import { PublicKey } from "@solana/web3.js";
import BN from "bn.js";

export const FORUM_PROGRAM_ID = new PublicKey(
  "8TfXSaFPXA8hUgzk45w4gJfsyJ6RGjEFcbCesnk8WKsD"
);
export const FORUM_ENDPOINT =
  "https://lingering-lingering-mountain.solana-devnet.quiknode.pro/fbbd36836095686bd9f580212e675aaab88204c9/";
//"http://127.0.0.1:8899"
//clusterApiUrl('devnet');
export const SESSION_LENGTH = 120; //518400
export const ARTIFACT_AUCTION_LENGTH = 120; //86400
export const toDisplayString = (
  publicKey: PublicKey,
  sliceLength: number = 4
) => {
  let b58 = publicKey.toBase58();
  return (
    b58.slice(0, sliceLength) +
    "..." +
    b58.slice(b58.length - sliceLength, b58.length)
  );
};
export const numberArrayToString = (rawNumber: number[]) => {
  let numbers = new Uint8Array(rawNumber);
  while (numbers[numbers.length - 1] === 0) {
    numbers = numbers.slice(0, -1);
  }
  return new TextDecoder("utf-8").decode(new Uint8Array(numbers));
};
export const getNow = () => {
  const time = new Date().getTime() / 1000;
  return Math.round(time);
};
export const timeSince = (date: number) => {
  const now = new Date().getTime() / 1000;
  var seconds = Math.floor(now - date);
  return stringInterval(seconds);
};
export const stringInterval = (seconds: number) => {
  var interval = seconds / 31536000;
  if (interval > 1) {
    return Math.floor(interval) + "yr";
  }
  interval = seconds / 2592000;
  if (interval > 1) {
    return Math.floor(interval) + "m";
  }
  interval = seconds / 86400;
  if (interval > 1) {
    return Math.floor(interval) + "d";
  }
  interval = seconds / 3600;
  if (interval > 1) {
    return Math.floor(interval) + "hr";
  }
  interval = seconds / 60;
  if (interval > 1) {
    return Math.floor(interval) + "m";
  }
  return "just now";
};
export const artifactAuctionTime = (lastDawn: BN | undefined) => {
  if (lastDawn) {
    const now = new Date().getTime() / 1000;
    const auction = lastDawn.toNumber() + SESSION_LENGTH;
    //auction not yet ready to start
    if (auction - now > 0) {
      return "auction starting in " + stringInterval(auction - now);
    } else {
      //auction active or needs to be started
      return "session ended " + stringInterval(now - auction) + " ago";
    }
  }
  return "";
};
