import { PublicKey } from "@solana/web3.js";
import * as web3 from "@solana/web3.js";
import BN from "bn.js";

export const FORUM_PROGRAM_ID = new PublicKey(
  "CcssQs9DoZFQUq2nUygcFxKVFZUPvdsux7pBE9dqa2YH"
);
export const FORUM_ENDPOINT =
  "https://lingering-lingering-mountain.solana-devnet.quiknode.pro/fbbd36836095686bd9f580212e675aaab88204c9/";
//"http://127.0.0.1:8899"
//clusterApiUrl('devnet');
export const SESSION_LENGTH = 604800;
export const FORUM_TREASURY_ADDRESS = new PublicKey(
  "GUH6vc8SJ2DtWJndjz7Y9984zAqAsFYEuLUBFX8jdopK"
);
export const YELLLOW_TREASURY_ADDRESS = new PublicKey(
  "nAFRh5zcrsiRka8hNTM4Auu6prBKvpv6zPLMefHFB8x"
);

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
export const tokenLink = (toPubkey: PublicKey) => {
  //https://explorer.solana.com/address/Fs95oxtjcUdVqo6Zg1JJZ8orq3eGF8qF8cxdKeunD7U1?cluster=devnet
  return `https://solscan.io/token/${toPubkey.toBase58()}?cluster=devnet`;
};
export const minBid = (currentBid: number) => {
  const increment_percentage = 2;
  const min_opening_bid = 100000000;
  if (currentBid > 0) {
    let increase = currentBid * (increment_percentage * 0.01);
    return roundToTwo((currentBid + increase) / web3.LAMPORTS_PER_SOL);
  } else {
    return roundToTwo(min_opening_bid / web3.LAMPORTS_PER_SOL);
  }
};
export function roundToTwo(num: number) {
  let val: any = num + "e+2";
  return +(Math.round(val) + "e-2");
}
export const establishedTextFor = (date: Date) => {
  let month = abbreviatedMonthFor(date.getMonth());
  return "est. " + month + " " + date.getDate() + ", " + date.getFullYear();
};
export const endedTextFor = (date: Date) => {
  let month = abbreviatedMonthFor(date.getMonth());
  return "ended " + month + " " + date.getDate() + ", " + date.getFullYear();
};
const abbreviatedMonthFor = (number: number) => {
  if (number === 0) {
    return "Jan";
  } else if (number === 1) {
    return "Feb";
  } else if (number === 2) {
    return "Mar";
  } else if (number === 3) {
    return "Apr";
  } else if (number === 4) {
    return "May";
  } else if (number === 5) {
    return "Jun";
  } else if (number === 6) {
    return "Jul";
  } else if (number === 7) {
    return "Aug";
  } else if (number === 8) {
    return "Sep";
  } else if (number === 9) {
    return "Oct";
  } else if (number === 10) {
    return "Nov";
  } else if (number === 11) {
    return "Dec";
  }
  return "";
};
export const toPostHref = (postLink: string) => {
  if (postLink.startsWith("http")) {
    return postLink;
  } else {
    return "http://" + postLink;
  }
};
