'use client'
type tokenType = {
    token_standard: string;
    token_properties_mutated_v1?: any | null;
    token_data_id: string;
    table_type_v1?: string | null;
    storage_id: string;
    property_version_v1: any;
    owner_address: string;
    last_transaction_version: any;
    last_transaction_timestamp: any;
    is_soulbound_v2?: boolean | null;
    is_fungible_v2?: boolean | null;
    amount: any;
    current_token_data?: {
        collection_id: string;
        description: string;
        is_fungible_v2?: boolean | null;
        largest_property_version_v1?: any | null;
        last_transaction_timestamp: any;
        last_transaction_version: any;
        maximum?: any | null;
        supply: any;
        token_data_id: string;
        token_name: string;
        token_properties: any;
        token_standard: string;
        token_uri: string;
        decimals: any;
        current_collection?: {
            collection_id: string;
            collection_name: string;
            creator_address: string;
            current_supply: any;
            description: string;
            last_transaction_timestamp: any;
            last_transaction_version: any;
            max_supply?: any | null;
            mutable_description?: boolean | null;
            mutable_uri?: boolean | null;
            table_handle_v1?: string | null;
            token_standard: string;
            total_minted_v2?: any | null;
            uri: string;
        } | null;
    } | null;
}
import { Card, Col, Row } from 'antd';
function NFTCard(props: { token: tokenType }) {
    const { Meta } = Card;
    const { current_token_data } = props.token
    /**
  * Converts an IPFS link to an HTTPS URL using a specified gateway.
  * 
  * @param ipfsUrl The IPFS URL to convert, starting with 'ipfs://'.
  * @param gateway The IPFS gateway to use for the conversion, defaults to 'https://ipfs.io/ipfs/'.
  * @returns The HTTPS URL corresponding to the given IPFS link.
  */
    function convertIpfsToHttps(ipfsUrl: string, gateway: string = 'https://ipfs.io/ipfs/'): string {
        // Check if the URL starts with 'ipfs://'
        if (!ipfsUrl.startsWith('ipfs://')) {
            console.log(ipfsUrl)
            throw new Error('Invalid IPFS URL');
        }

        // Remove the 'ipfs://' prefix and return the full HTTPS URL
        const hash = ipfsUrl.slice(7); // Remove 'ipfs://' (7 characters)
        return `${gateway}${hash}`;
    }
    const ipfsUri = current_token_data?.current_collection?.uri;
    const httpsUri = ipfsUri ? convertIpfsToHttps(ipfsUri) : "404";
    return (
        <Card
            hoverable
            style={{ width: 240 }}
            cover={<img alt="example" src={httpsUri} />}
        >
            <Meta title={current_token_data?.token_name} description={current_token_data?.current_collection?.description} />
        </Card>
    )
}

export default NFTCard;