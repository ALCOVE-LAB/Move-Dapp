import { AptosAccount } from "aptos";
import { Buffer } from "node:buffer";

export function createNewAccount(): AptosAccount {
  const account = new AptosAccount();
  // todo: make request to create account on chain
  return account;
}

export function importAccount(key: string): AptosAccount {
  try {
    const nonHexKey = key.startsWith("0x") ? key.slice(2) : key;
    const encodedKey = Uint8Array.from(Buffer.from(nonHexKey, "hex"));
    const account = new AptosAccount(encodedKey, undefined);
    return account;
  } catch (error) {
    throw error;
  }
}

export type AptosNetwork =
  | "http://0.0.0.0:8080"
  | "https://fullnode.testnet.aptoslabs.com/v1";
