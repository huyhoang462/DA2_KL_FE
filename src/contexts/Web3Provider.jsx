/* eslint-disable react-refresh/only-export-components */
import React, { useState, createContext, useCallback, useContext } from "react";
import { ethers } from "ethers";

export const Web3Context = createContext(null);

export const Web3Provider = ({ children }) => {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [address, setAddress] = useState(null);
  const [network, setNetwork] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const connectWallet = useCallback(async () => {
    if (typeof window.ethereum === "undefined") {
      setError("Vui lòng cài đặt MetaMask!");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const newProvider = new ethers.BrowserProvider(window.ethereum);
      await newProvider.send("eth_requestAccounts", []);

      const newSigner = await newProvider.getSigner();
      const newAddress = await newSigner.getAddress();
      const newNetwork = await newProvider.getNetwork();

      if (newNetwork.chainId !== 11155111n) {
        setError("Vui lòng chuyển sang mạng Sepolia!");
        setLoading(false);
        return;
      }

      setProvider(newProvider);
      setSigner(newSigner);
      setAddress(newAddress);
      setNetwork(newNetwork);
    } catch (err) {
      console.error(err);
      setError("Kết nối ví thất bại. Người dùng đã từ chối.");
    } finally {
      setLoading(false);
    }
  }, []);

  const disconnectWallet = () => {
    setProvider(null);
    setSigner(null);
    setAddress(null);
    setNetwork(null);
  };

  const value = {
    provider,
    signer,
    address,
    network,
    loading,
    error,
    connectWallet,
    disconnectWallet,
  };

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>;
};

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error("useWeb3 must be used within a Web3Provider");
  }
  return context;
};
