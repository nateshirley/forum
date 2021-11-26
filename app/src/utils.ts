import { PublicKey } from "@solana/web3.js";

export const FORUM_PROGRAM_ID = new PublicKey(
  "5u2hS1eFPULD9BYMxjQbSWGHajmPCcXmbGSJhGpFJ8FC"
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
export const getSyncedTime = () => {
  let time = new Date().getTime() / 1000;
  return Math.round(time - 4310210);
};
