"use client";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import Cookies from "js-cookie";
import axios from "axios";

export default function Home() {
  const [drawnCard, setDrawnCard] = useState(null);
  const [loading, setLoading] = useState(false);
  const [ques, setques] = useState(false);
  const [description, setDescription] = useState("");
  const [lyrics, setLyrics] = useState("");
  const [cardimage, setcardimage] = useState("");
  const [position, setposition] = useState("");
  const [mintdone, setmintdone] = useState(false);
  const [deletedone, setdeletedone] = useState(false);
  const [writesong, setwritesong] = useState(true);
  const [objectAddress, setObjectAddress] = useState("");
  const [newname, setnewname] = useState("");
  const [editmode, seteditmode] = useState(false);

  const wallet = Cookies.get("taylor_wallet");

  const mintreading = async () => {
    const wallet = Cookies.get("taylor_wallet");
    setLoading(true);

    try {
      const mintTransaction = {
        arguments: [description],
        function:
          "0xc789b9c13c69b0b34173512ac8cbfe8c76768a3246cda01c38d5d72f18957ad3::nft::mint_nft",
        type: "entry_function_payload",
        type_arguments: [],
      };

      const mintResponse = await window.aptos.signAndSubmitTransaction(
        mintTransaction
      );
      console.log("Mint Card Transaction:", mintResponse);
      setcardimage(mintResponse.events[2].data.nft_uri)
      setDrawnCard(mintResponse.events[2].data.song_name);
      setObjectAddress(mintResponse.events[1].data.object);
      setmintdone(true);
      setwritesong(false);
    } catch (error) {
      console.error("Error handling mint", error);
    } finally {
      setLoading(false);
    }
  };

  const editname = async () => {
    const wallet = Cookies.get("taylor_wallet");
    setLoading(true);

    try {
      const mintTransaction = {
        arguments: [objectAddress, newname],
        function:
          "0xc789b9c13c69b0b34173512ac8cbfe8c76768a3246cda01c38d5d72f18957ad3::nft::edit_song_name",
        type: "entry_function_payload",
        type_arguments: [],
      };

      const mintResponse = await window.aptos.signAndSubmitTransaction(
        mintTransaction
      );
      console.log("Mint Card Transaction:", mintResponse);
      setDrawnCard(mintResponse.events[1].data.new_name);
    } catch (error) {
      console.error("Error handling mint", error);
    } finally {
      setLoading(false);
    }
  };

  const deletenft = async () => {
    const wallet = Cookies.get("taylor_wallet");
    setLoading(true);

    try {
      const mintTransaction = {
        arguments: [objectAddress],
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
      setwritesong(true);
    } catch (error) {
      console.error("Error handling mint", error);
    } finally {
      setLoading(false);
    }
  };

  const linergradient = {
    background: 'linear-gradient(to right, #5FBDFF 10%, #FFFD8C 50%, #FFFD8C 50%, #6196A6 100%)',
    WebkitBackgroundClip: 'text',
    color: 'transparent',
  }

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
        <p
          className="text-white text-xl fixed left-0 top-0 flex w-full justify-center pb-6 backdrop-blur-2xl dark:border-neutral-800 dark:from-inherit lg:static lg:w-auto  lg:rounded-xl lg:p-4"
          style={{
            backgroundColor: "#56A7A7",
            boxShadow: "inset -10px -10px 60px 0 rgba(255, 255, 255, 0.4)",
          }}
        >
          Mint song name
        </p>
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

      <div className="text-4xl font-bold pb-20" style={linergradient}>NFT of Taylor Swift Songs</div>


      <div className="flex gap-10">
        <div>

          {/* {ques && wallet && ( */}
            <div
              className="px-10 py-10 bgcolor rounded-2xl mt-10 max-w-xl"
              style={{
                border: "1px solid #0162FF",
                boxShadow: "inset -10px -10px 60px 0 rgba(255, 255, 255, 0.4)",
              }}
            >
                  { writesong && (
                  <div>
                    <input
                    type="text"
                    placeholder="Write song name here"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="p-2 rounded-lg w-full focus:outline-none"
                  />
                  {wallet ? (<button
                    onClick={mintreading}
                    className="mt-20 bg-black rounded-lg py-2 px-8 text-white"
                  >
                    Mint NFT
                  </button>):
                  (
                    <button
                    onClick={()=>{setques(true)}}
                    className="mt-20 bg-black rounded-lg py-2 px-8 text-white"
                  >
                    Mint NFT
                  </button>
                  )}
                  </div>
              )}
              <div>
                {cardimage && !writesong && (
                  <div>
                    <h2 className="mt-4 text-white font-bold text-2xl pb-4" style={{fontStyle:'oblique'}}>{drawnCard}</h2>
                    <div className="flex gap-4 pb-8">
                      <button
                        onClick={() => {
                          setwritesong(true);
                          setDrawnCard(null);
                          setLyrics("");
                        }}
                        className="bg-black rounded-lg py-2 px-8 text-yellow-200"
                      >
                        Mint More
                      </button>

                      <button
                        onClick={()=>{seteditmode(true)}}
                        className="bg-yellow-100 rounded-lg py-2 px-6 text-black font-semibold"
                      >
                        Edit name
                      </button>

                      <button
                        onClick={deletenft}
                        className="bg-yellow-100 rounded-lg py-2 px-6 text-black font-semibold"
                      >
                        Delete NFT
                      </button>

                    </div>

                    { editmode && (
                  <div>
                    <input
                    type="text"
                    placeholder="Write new song name"
                    value={newname}
                    onChange={(e) => setnewname(e.target.value)}
                    className="p-2 rounded-lg w-full focus:outline-none"
                  />
                  <button
                    onClick={editname}
                    className="mt-20 bg-black rounded-lg py-2 px-8 text-white"
                  >
                    Change Name
                  </button>
                  </div>
              )}
                  </div>
                )}
              </div>
            </div>
          {/* )} */}
        </div>

        {cardimage && !writesong ? (
          <div>
            <div className="rounded-lg" style={{position:'relative'}}>
            <Image src="/musicnft.webp" width="400" height="400"/>
            <img
                src={`${"https://nftstorage.link/ipfs"}/${
                  cardimage.split("ipfs://")[1]
                }`}
                width="245"
                height="245"
                className="rounded-xl transform -skew-y-6"
                style={{position: 'absolute', top: 50, left: 70}}
              />
              </div>
          </div>
        ) : (
          <div className="rounded-lg">
            <Image src="/musicnft.webp" width="400" height="400"/>
          </div>
        )}
      </div>

      {ques && !wallet && (
        <div
          style={{ backgroundColor: "#222944E5" }}
          className="flex overflow-y-auto overflow-x-hidden fixed inset-0 z-50 justify-center items-center w-full max-h-full"
          id="popupmodal"
        >
          <div className="relative p-4 lg:w-1/3 w-full max-w-2xl max-h-full">
            <div className="relative rounded-lg shadow bg-black text-white">
              <div className="flex items-center justify-end p-4 md:p-5 rounded-t dark:border-gray-600">
                <button
                  onClick={() => setques(false)}
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
      )}

      {mintdone && (
        <div
          style={{ backgroundColor: "#222944E5" }}
          className="flex overflow-y-auto overflow-x-hidden fixed inset-0 z-50 justify-center items-center w-full max-h-full"
          id="popupmodal"
        >
          <div className="relative p-4 lg:w-1/3 w-full max-w-2xl max-h-full">
            <div className="relative rounded-lg shadow bg-black text-white">
              <div className="flex items-center justify-end p-4 md:p-5 rounded-t dark:border-gray-600">
                <button
                  onClick={() => setmintdone(false)}
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

              <div className="p-4 space-y-4">
                <p className="text-3xl text-center font-bold text-green-500">
                  Successfully Minted!!
                </p>
                <p className="text-sm text-center pt-4">
                  Go to your profile to view your minted NFTs
                </p>
              </div>
              <div className="flex items-center p-4 rounded-b pb-20">
                <Link href="/profile"
                  type="button"
                  className="w-1/2 mx-auto text-black bg-white font-bold focus:ring-4 focus:outline-none focus:ring-blue-300 rounded-lg text-md px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                >
                  My Profile
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

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
                  onClick={() => setdeletedone(false)}
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

                {/* <span className="text-white mt-2">Loading...</span> */}
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
