'use client';

import { Aptos, AptosConfig, Network, HexInput } from "@aptos-labs/ts-sdk";

export const AptosClient = new Aptos(
    new AptosConfig({
        network: Network.LOCAL,
    }),
);


