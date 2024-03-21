"use client";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import Navbar from "../../../components/Navbar";
import NftdataContainer from "../../../components/NftDataContainer";
import Cookies from "js-cookie";
import axios from "axios";
const envcollectionid = "0x474d765baef6da1ebe7d4ba7b42227cdca1de8f2afca0b5c833f291dbca5c2c3";
const graphqlaptos = "https://indexer-testnet.staging.gcp.aptosdev.com/v1/graphql";

export default function Profile() {
  const [loading, setLoading] = useState(false);
  const [nftdata, setnftdata] = useState(null);
  const [wallet, setwallet] = useState("wallet");

  useEffect(() => {
    const check = () => {
      const wallet = Cookies.get("taylor_wallet");
      if(wallet)
      {
        setwallet(wallet);
      }
      else{
        setwallet(null);
      }
    }

    check();
  }, [])
  

  useEffect(() => {
    const vpnnft = async () => {
      setLoading(true);
      try {
        const wallet = Cookies.get("taylor_wallet");

        const graphqlbody = {
          query: `
          query getAccountCurrentTokens($address: String!, $where: [current_token_ownerships_v2_bool_exp!]!, $offset: Int) {
            current_token_ownerships_v2(
              where: { owner_address: { _eq: $address }, amount: { _gt: 0 }, _or: [{ table_type_v1: { _eq: "0x3::token::TokenStore" } }, { table_type_v1: { _is_null: true } }], _and: $where }
              order_by: [{ last_transaction_version: desc }, { token_data_id: desc }]
              offset: $offset
            ) {
              amount
              current_token_data {
                ...TokenDataFields
              }
              last_transaction_version
              property_version_v1
              token_properties_mutated_v1
              is_soulbound_v2
              is_fungible_v2
            }
            current_token_ownerships_v2_aggregate(where: { owner_address: { _eq: $address }, amount: { _gt: 0 } }) {
              aggregate {
                count
              }
            }
          }
      
          fragment TokenDataFields on current_token_datas_v2 {
            description
            token_uri
            token_name
            token_data_id
            current_collection {
              ...CollectionDataFields
            }
            token_properties
            token_standard
            cdn_asset_uris {
              cdn_image_uri
            }
          }
      
          fragment CollectionDataFields on current_collections_v2 {
            uri
            max_supply
            description
            collection_name
            collection_id
            creator_address
            cdn_asset_uris {
              cdn_image_uri
            }
          }
        `,
        variables: {
          address: `${wallet}`,
          offset: 0,
          where: [
            {
              current_token_data: {
                current_collection: {
                  collection_id: {
                    _eq: `${envcollectionid}`,
                  },
                },
              },
            },
          ],
        },
        operationName: "getAccountCurrentTokens",
      };


        const response = await axios.post(`${graphqlaptos}`, graphqlbody, {
          headers: {
            Accept: "application/json, text/plain, */*",
            "Content-Type": "application/json",
          },
        });

        console.log("vpn nft", response.data.data.current_token_ownerships_v2);
        setnftdata(response.data.data.current_token_ownerships_v2);
      } catch (error) {
        console.error("Error fetching nft data:", error);
      } finally {
        setLoading(false);
      }
    };

    vpnnft();
  }, []);

  return (
    <main
      className="flex min-h-screen flex-col items-center justify-between p-24"
      style={{
        backgroundImage: "url(/cover.webp)", // Path to your background image
        backgroundSize: "cover", // Adjust as needed
        backgroundPosition: "center", // Adjust as needed
      }}
    >
      <div className="z-10 max-w-6xl w-full items-center justify-between font-mono text-sm lg:flex">
        <Link
          href="/"
          className="text-white text-xl fixed left-0 top-0 flex w-full justify-center pb-6 backdrop-blur-2xl dark:border-neutral-800 dark:from-inherit lg:static lg:w-auto  lg:rounded-xl lg:p-4"
          style={{
            backgroundColor: "#56A7A7",
            boxShadow: "inset -10px -10px 60px 0 rgba(255, 255, 255, 0.4)",
          }}
        >
          Mint song name
        </Link>
        <div
          className="rounded-lg px-2 py-2 fixed bottom-0 left-0 flex h-48 w-full items-end justify-center bg-gradient-to-t from-white via-white dark:from-black dark:via-black lg:static lg:h-auto lg:w-auto lg:bg-none"
          style={{
            backgroundColor: "#F1FFAB",
            boxShadow: "inset -10px -10px 60px 0 rgba(255, 255, 255, 0.4)",
          }}
        >
          <Navbar />
        </div>
      </div>

      {!wallet ? (
        <div
          style={{ backgroundColor: "#222944E5" }}
          className="flex overflow-y-auto overflow-x-hidden fixed inset-0 z-50 justify-center items-center w-full max-h-full"
          id="popupmodal"
        >
          <div className="relative p-4 lg:w-1/3 w-full max-w-2xl max-h-full">
            <div className="relative rounded-lg shadow bg-black text-white">
              <div className="flex items-center justify-end p-4 md:p-5 rounded-t dark:border-gray-600">
              </div>

              <div className="p-4 space-y-4">
                <p className="text-2xl text-center font-bold" style={{color:'#FFB000'}}>
                Please connect your Aptos Wallet
                </p>
              </div>
              <div className="flex items-center p-4 rounded-b pb-20 pt-10">
                <button
                  type="button"
                  className="w-1/2 mx-auto text-black bg-white font-bold focus:ring-4 focus:outline-none focus:ring-blue-300 rounded-lg text-md px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                >
                  <Navbar />
                </button>
              </div>
            </div>
          </div>
        </div>
      ):(
        <NftdataContainer metaDataArray={nftdata} MyReviews={false} />
      )}

      {loading && (
        <div
          style={{ backgroundColor: "#222944E5" }}
          className="flex overflow-y-auto overflow-x-hidden fixed inset-0 z-50 justify-center items-center w-full max-h-full"
          id="popupmodal"
        >
          <div className="relative p-4 lg:w-1/5 w-full max-w-2xl max-h-full">
            <div className="relative rounded-lg shadow">
              <div className="flex justify-center gap-4">
                <img
                  className="w-50 h-40"
                  src="/loader.gif"
                  alt="Loading icon"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
