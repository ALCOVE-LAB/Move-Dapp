import { useState } from "react";

import { PET_COLLECTION_ID, aptos } from "../utils";

const getPetCollectionInfo = async () => {
  const indexerQuery = `
    query MyQuery($collectionId: String) {
      current_token_datas_v2(
        where: {collection_id: {_eq: $collectionId}}
      ) {
        token_name
        token_data_id
        description
      }
    }
  `;

  const result: {
    current_token_datas_v2: any;
  } = await aptos.queryIndexer({
    query: {
      query: indexerQuery,
      variables: { collectionId: PET_COLLECTION_ID },
    },
  });

  return result.current_token_datas_v2;
};

const usePetCollection = (id: string) => {
  const [petCollection, setPetCollection] = useState();
};
