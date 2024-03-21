import { useEffect, useState } from "react";
import {
  Account,
  GetAccountOwnedTokensFromCollectionResponse,
  MoveStructId,
} from "@aptos-labs/ts-sdk";

import { aptos, PET_COLLECTION_ID, PET_CONTRACT_ADDRESS } from "../utils";
import { LoadStatus } from "./types";

const getUserPet = async (
  address: string
): Promise<GetAccountOwnedTokensFromCollectionResponse> => {
  const result = await aptos.getAccountOwnedTokensFromCollectionAddress({
    accountAddress: address,
    collectionAddress: PET_COLLECTION_ID,
  });

  return result;
};

const mintPet = async ({
  account,
  petName,
}: {
  account: Account;
  petName: string;
}): Promise<void> => {
  const mintFunctin: MoveStructId = `${PET_CONTRACT_ADDRESS}::main::mint_pet`;
  const rawTxn = await aptos.transaction.build.simple({
    sender: account.accountAddress,
    data: {
      function: mintFunctin,
      functionArguments: [petName],
    },
  });

  const pendingTxn = await aptos.signAndSubmitTransaction({
    signer: account,
    transaction: rawTxn,
  });
  const response = await aptos.waitForTransaction({
    transactionHash: pendingTxn.hash,
  });

  console.log("=== Success: minted a pet", response);
};

const updatePetName = async ({
  account,
  petName,
}: {
  account: Account;
  petName: string;
}) => {
  const updatePetNameFunction: MoveStructId = `${PET_CONTRACT_ADDRESS}::main::update_pet_name`;
  const rawTxn = await aptos.transaction.build.simple({
    sender: account.accountAddress,
    data: {
      function: updatePetNameFunction,
      functionArguments: [petName],
    },
  });

  const pendingTxn = await aptos.signAndSubmitTransaction({
    signer: account,
    transaction: rawTxn,
  });
  const response = await aptos.waitForTransaction({
    transactionHash: pendingTxn.hash,
  });

  console.log("=== Success: updated pet name", response);
};

const getUserPetName = async (address: string) => {
  const viewPetNameFunction: MoveStructId = `${PET_CONTRACT_ADDRESS}::main::get_pet_name`;
  const petName = await aptos.view({
    payload: {
      function: viewPetNameFunction,
      functionArguments: [address],
    },
  });

  return petName[0] as string;
};

const usePet = (address: string) => {
  const [pet, setPet] = useState({
    petName: "",
    loadStatus: LoadStatus.IDLE,
  });

  const fetchPetName = async () => {
    setPet({ ...pet, loadStatus: LoadStatus.LOADING });

    getUserPetName(address)
      .then((petName) => {
        setPet({ ...pet, petName, loadStatus: LoadStatus.LOADED });
      })
      .catch((error) => {
        console.error("Failed to fetch pet name", error);
        setPet({ ...pet, loadStatus: LoadStatus.ERROR });
      });
  };

  useEffect(() => {
    if (pet.loadStatus === LoadStatus.IDLE) {
      fetchPetName();
    }
  }, [address]);

  return [pet];
};

export { usePet };
