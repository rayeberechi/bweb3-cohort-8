import { ethers } from "ethers";

export const formatAddress = (addr) => {
  if (!addr) return "";
  return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
};

export const formatEth = (wei) => {
  return parseFloat(ethers.formatEther(wei)).toFixed(4);
};

export const copyToClipboard = (text) => {
  navigator.clipboard.writeText(text);
};