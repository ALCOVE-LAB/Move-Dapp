import { useWallet } from "@aptos-labs/wallet-adapter-react";

import * as React from 'react';
import Button from '@mui/material/Button';


function fetchGraphQL(
    operationsDoc: string,
    operationName: string,
    variables: Record<string, any>
) {
    return fetch("https://api.devnet.aptoslabs.com/v1/graphql", {
        method: 'POST',
        body: JSON.stringify({
            query: operationsDoc,
            variables,
            operationName,
        }),
    }).then(result => result.json());
}

function operation(address) {
    return`
  query MyQuery {
    current_token_ownerships_v2(
      where: {owner_address: {_eq: "`+address+`"}}
    ) {
      is_fungible_v2
      is_soulbound_v2
      table_type_v1
      token_properties_mutated_v1
      amount
      last_transaction_timestamp
      last_transaction_version
      owner_address
      property_version_v1
      storage_id
      token_data_id
      token_standard
    }
  }
`;
}

export function fetchMyNFTQuery(address:string) {
    console.log("export function fetchMyNFTQuery(address:string) {\n");
    console.log(address);
    return fetchGraphQL(operation(address), "MyQuery", {})
}

// fetchMyNFTQuery()
//     .then(({ data, errors }) => {
//         if (errors) {
//             console.error(errors);
//         }
//         console.log(data);
//     })
//     .catch(error => {
//         console.error(error);
//     });
