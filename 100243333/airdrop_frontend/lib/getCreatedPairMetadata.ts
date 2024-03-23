import { AptosClient, MaybeHexString } from "aptos";

interface Payload {
  aptosClient?: AptosClient;
  indeedCreatorAddress?: MaybeHexString;
  accountAddress?: MaybeHexString;
}
export const getCreatedPairMetadata = async ({
  aptosClient,
  indeedCreatorAddress,
  accountAddress,
}: Payload) => {
  if (!aptosClient || !indeedCreatorAddress || !accountAddress) {
    return;
  }
  // get poolNums
  const poolNumsResourceType = `${indeedCreatorAddress}::pair_factory::CreatorOwnPool`;
  const { data: poolNumsHandleData } = await aptosClient.getAccountResource(
    indeedCreatorAddress,
    poolNumsResourceType
  );
  const poolNumsHandle = (poolNumsHandleData as any)?.poolNums?.handle;
  if (!poolNumsHandle) return;

  const serialNum: `${number}` = await aptosClient.getTableItem(
    poolNumsHandle,
    {
      key_type: "address",
      value_type: "u64",
      key: accountAddress,
    }
  );
  if (!serialNum) return;

  const NFTMetadataHandleResourceType = `${indeedCreatorAddress}::pair_factory::NFTPairMetadata<0x3::token::TokenStore, 0x1::aptos_coin::AptosCoin>`;
  const { data: NFTMetadataHandleData } = await aptosClient.getAccountResource(
    indeedCreatorAddress,
    NFTMetadataHandleResourceType
  );
  const NFTMetadataHandle = (NFTMetadataHandleData as any)?.pools?.inner
    ?.handle;

  const poolId =
    accountAddress && serialNum && typeof serialNum === "string"
      ? {
          creator: accountAddress,
          serialNum: serialNum.toString(),
        }
      : null;

  if (!NFTMetadataHandle || !poolId) return;
  const data = await aptosClient.getTableItem(NFTMetadataHandle, {
    key_type: `${indeedCreatorAddress}::pair_factory::PoolId`,
    value_type: `${indeedCreatorAddress}::pair_factory::PoolMetadata<0x3::token::TokenStore, 0x1::aptos_coin::AptosCoin>`,
    key: poolId,
  });
  console.log("@@@ serialNum + data", {
    serialNum,
    data: data ? JSON.stringify(data) : undefined,
  });
  return {
    serialNum,
    data,
  };
};
