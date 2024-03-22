import React, {useEffect, useState} from "react";
import axios from "axios";
import Link from "next/link";

const truncateDescription = (
  description,
  maxLength
) => {
  const words = description.split(" ");
  const truncatedWords = words.slice(0, maxLength);
  return truncatedWords.join(" ") + (words.length > maxLength ? "..." : "");
};

const NftdataCard = ({
  metaData,
}) => {

  const [imageSrc, setImageSrc] = useState(null);
  const [deletedone, setdeletedone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newname, setNewname] = useState("");
  const [editmode, seteditmode] = useState(false);

  useEffect(() => {
    const fetchMetaData = async () => {
    const ipfsCid = metaData.current_token_data.token_uri.replace("ipfs://", "");

  setImageSrc(ipfsCid);
    }
    fetchMetaData();
  }, [metaData]);


  const editnft = async () => {
    setLoading(true);

    try {
      const mintTransaction = {
        arguments: [metaData.current_token_data.token_data_id, newname],
        function:
          "0xc789b9c13c69b0b34173512ac8cbfe8c76768a3246cda01c38d5d72f18957ad3::nft::edit_song_name",
        type: "entry_function_payload",
        type_arguments: [],
      };

      const mintResponse = await window.aptos.signAndSubmitTransaction(
        mintTransaction
      );
      console.log("Mint Card Transaction:", mintResponse);
      window.location.reload();
    } catch (error) {
      console.error("Error handling mint", error);
    } finally {
      setLoading(false);
    }
  };

  const delnft = async () => {
    setLoading(true);

    try {
      const mintTransaction = {
        arguments: [metaData.current_token_data.token_data_id],
        function:
          "0xc789b9c13c69b0b34173512ac8cbfe8c76768a3246cda01c38d5d72f18957ad3::nft::burn_nft",
        type: "entry_function_payload",
        type_arguments: [],
      };

      const mintResponse = await window.aptos.signAndSubmitTransaction(
        mintTransaction
      );
      console.log("Mint Card Transaction:", mintResponse);
      setdeletedone(true);
    } catch (error) {
      console.error("Error handling mint", error);
    } finally {
      setLoading(false);
    }
  };

  if (!metaData) {
    return (
      <div className="flex flex-col items-center justify-center w-full max-w-sm mx-auto">
        <div
          className="w-full h-72 p-5 bg-center bg-cover"
          style={{ display: "flex", alignItems: "center" }}
        >
          <div className="animate-spin rounded-full h-32 w-32 mx-auto border-t-2 border-b-2 border-green-200"></div>
        </div>
      </div>
    );
  }

  return (
    <>
    <div className="w-full rounded-2xl" style={{ backgroundColor:'#5D3587', border: '1px solid white'}}>
      <div className="w-full h-full rounded-lg p-2">
        <div>
          <div className="justify-end flex p-2">
        <Link href={`https://explorer.aptoslabs.com/txn/${metaData.last_transaction_version}/?network=testnet`} target="_blank">
        <div className="flex gap-4" style={{color:'#CAEDFF'}}>
        <div className="text-sm mt-2">View on explorer</div>
              <img src="/reviewicon.gif" alt="" className="" width="50" height="50" />
              </div>
              </Link>
              </div>
          <div className="">
              <img
                      alt="alt"
                      src={`${
                        "https://nftstorage.link/ipfs"
                      }/${imageSrc}`}
                      className="pt-2"
                    />
            <div className="w-full p-2 flex justify-between gap-4">
            
            <div className="text-xl text-white font-semibold">
                    {metaData.current_token_data.description}
                </div>

              <h3 className="leading-12 text-white">
                  <div className="text-sm">
                        {metaData.current_token_data.token_name}
                  </div>
              </h3>
            </div>

            <div className="flex justify-between p-2 text-sm font-semibold">
              <button onClick={()=>{seteditmode(true)}} style={{color: '#56A7A7'}}>Edit name</button>
              <button onClick={delnft} style={{color:'#F06292'}}>Delete NFT</button>
            </div>
          </div>
        </div>
      </div>
    </div>

{deletedone && (
  <div
    style={{ backgroundColor: "#222944E5" }}
    className="flex overflow-y-auto overflow-x-hidden fixed inset-0 z-50 justify-center items-center w-full max-h-full"
    id="popupmodal"
  >
    <div className="relative p-4 lg:w-1/3 w-full max-w-2xl max-h-full">
      <div className="relative rounded-lg shadow bg-black text-white">
        <div className="flex items-center justify-end p-4 md:p-5 rounded-t dark:border-gray-600">
          <button
            onClick={() => {window.location.reload()}}
            type="button"
            className="text-white bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
          >
            <svg
              className="w-3 h-3"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 14 14"
            >
              <path
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
              />
            </svg>
            <span className="sr-only">Close modal</span>
          </button>
        </div>

        {/* <Image src={emoji} alt="info" className="mx-auto"/> */}

        <div className="p-4 space-y-4 pb-20">
          <p className="text-3xl text-center font-bold text-red-500">
            Successfully Deleted your NFT !!
          </p>
        </div>
      </div>
    </div>
  </div>
)}

{editmode && (
  <div
    style={{ backgroundColor: "#222944E5" }}
    className="flex overflow-y-auto overflow-x-hidden fixed inset-0 z-50 justify-center items-center w-full max-h-full"
    id="popupmodal"
  >
    <div className="relative p-4 lg:w-1/3 w-full max-w-2xl max-h-full">
      <div className="relative rounded-lg shadow bg-black text-white" style={{backgroundColor:'#A278B5'}}>
        <div className="flex items-center justify-end p-4 md:p-5 rounded-t dark:border-gray-600">
          <button
            onClick={() => {seteditmode(false);setNewname("")}}
            type="button"
            className="text-white bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
          >
            <svg
              className="w-3 h-3"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 14 14"
            >
              <path
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
              />
            </svg>
            <span className="sr-only">Close modal</span>
          </button>
        </div>

        <div className="p-4 space-y-4 pb-20 justify-between items-center flex flex-col gap-4">
          {newname ? (
            <div className="text-4xl pb-4">{newname}</div>
          ):
          (
          <div className="text-4xl pb-4">{metaData.current_token_data.description}</div>
          )
        }
                    <input
                    type="text"
                    placeholder="Write new song name"
                    value={newname}
                    onChange={(e) => setNewname(e.target.value)}
                    className="p-2 rounded-lg w-full focus:outline-none text-black"
                  />
                  <button
                    onClick={editnft}
                    className="rounded-lg py-2 px-8 text-black font-semibold"
                    style={{backgroundColor:"#A4F6F9"}}
                  >
                    Change Name
                  </button>
                  </div>
      </div>
    </div>
  </div>
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
</>
  );
};

export default NftdataCard;
