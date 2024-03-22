"use client";
import axios from "axios";
import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import Link from "next/link";

const REACT_APP_GATEWAY_URL = "https://gateway.netsepio.com/";

const Navbar = () => {
  const wallet = Cookies.get("taylor_wallet");

  const [hovered, setHovered] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState("");

  const logout = {
    color: hovered ? "red" : "black",
  };

  const getAptosWallet = () => {
    if ("aptos" in window) {
      return window.aptos;
    } else {
      window.open("https://petra.app/", "_blank");
    }
  };

  const connectWallet = async () => {
    const wallet = getAptosWallet();
    try {
      const response = await wallet.connect();

      const account = await wallet.account();
      console.log("account", account);

      const networkwallet = await window.aptos.network();

      // Check if the connected network is Mainnet
      if (networkwallet === "Testnet") {
        const { data } = await axios.get(
          `${REACT_APP_GATEWAY_URL}api/v1.0/flowid?walletAddress=${account.address}`
        );
        console.log(data);

        const message = data.payload.eula;
        const nonce = data.payload.flowId;
        const publicKey = account.publicKey;

        const { signature, fullMessage } = await wallet.signMessage({
          message,
          nonce,
        });
        console.log("sign", signature, "full message", fullMessage);

        const authenticationData = {
          flowId: nonce,
          signature: `0x${signature}`,
          pubKey: publicKey,
        };

        const authenticateApiUrl = `${REACT_APP_GATEWAY_URL}api/v1.0/authenticate`;

        const config = {
          url: authenticateApiUrl,
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          data: authenticationData,
        };

        try {
          const response = await axios(config);
          console.log("auth data", response.data);
          const token = await response?.data?.payload?.token;
          const userId = await response?.data?.payload?.userId;
          // localStorage.setItem("platform_token", token);
          Cookies.set("taylor_token", token, { expires: 7 });
          Cookies.set("taylor_wallet", account.address, { expires: 7 });
          Cookies.set("taylor_userid", userId, { expires: 7 });

          window.location.reload();
        } catch (error) {
          console.error(error);
        }
      } else {
        alert(`Switch to Testnet in your wallet`);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleDeleteCookie = () => {
    Cookies.remove("taylor_wallet");
    Cookies.remove("taylor_token");
    window.location.href = "/";
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const getRandomNumber = () => Math.floor(Math.random() * 1000);
        const apiUrl = `https://api.multiavatar.com/${getRandomNumber()}`;

        const response = await axios.get(apiUrl);
        const svgDataUri = `data:image/svg+xml,${encodeURIComponent(response.data)}`;
        setAvatarUrl(svgDataUri);
      } catch (error) {
        console.error('Error fetching avatar:', error.message);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      {wallet ? (
          <div className="flex gap-4">
          <Link href="/profile">{avatarUrl && <img src={avatarUrl} alt="Avatar" style={{width: 45}}/>} </Link>
          <div>
          <div className="ltext-black rounded-lg text-lg font-bold text-center">
            {wallet.slice(0, 4)}...{wallet.slice(-4)}
          </div>
          <button
            onClick={handleDeleteCookie}
            style={logout}
            className="mx-auto hover:text-red-400 text-black text-lg font-bold"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
          >
            Logout
          </button>
          </div>
          </div>
      ) : (
        <>
        <button onClick={connectWallet}>Connect wallet</button>
        </>
      )}
    </div>
  );
};

export default Navbar;
