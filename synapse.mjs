import { Bridge, Tokens, ChainId, Networks } from "@synapseprotocol/sdk";

import { ethers } from "ethers";
import { PROVIDER } from "./providers.js";

const synapseAsset = (symbol) => {
  if (symbol === "WETH") {
    return Tokens.ETH;
  }
  if (symbol === "USDC") {
    return Tokens.USDC;
  }
  if (symbol === "DAI") {
    return Tokens.DAI;
  }
};
// Initialize Bridge
const synapseBridge = (chainId) => {
  if (chainId === 10) {
    const OPTIMISM_NETWORK = Networks.OPTIMISM;

    const SYNAPSE_BRIDGE = new Bridge.SynapseBridge({
      network: OPTIMISM_NETWORK,
      provider: PROVIDER.OPTIMISM,
    });
    return SYNAPSE_BRIDGE;
  }
  if (chainId === 1) {
    const ETH_NETWORK = Networks.ETH;

    const SYNAPSE_BRIDGE = new Bridge.SynapseBridge({
      network: ETH_NETWORK,
      provider: PROVIDER.ETHEREUM,
    });
    return SYNAPSE_BRIDGE;
  }
  if (chainId === 42161) {
    const ARBITRUM_NETWORK = Networks.ARBITRUM;

    const SYNAPSE_BRIDGE = new Bridge.SynapseBridge({
      network: ARBITRUM_NETWORK,
      provider: PROVIDER.ARBITRUM,
    });
    return SYNAPSE_BRIDGE;
  }
  if (chainId === 288) {
    const BOBA_NETWORK = Networks.BOBA;

    const SYNAPSE_BRIDGE = new Bridge.SynapseBridge({
      network: BOBA_NETWORK,
      provider: PROVIDER.BOBA,
    });
    return SYNAPSE_BRIDGE;
  }
};

async function SynapseReceived(asset, amount, fromChain, toChain, decimals) {
    try{
  // get estimated output
  const SYNAPSE_BRIDGE = synapseBridge(fromChain);
  let INPUT_AMOUNT = ethers.utils.parseUnits(amount.toString(), decimals);
  const { amountToReceive } = await SYNAPSE_BRIDGE.estimateBridgeTokenOutput({
    tokenFrom: synapseAsset(asset), // token to send from the source chain, in this case USDT on Avalanche
    chainIdTo: toChain, // Chain ID of the destination chain, in this case BSC
    tokenTo: synapseAsset(asset), // Token to be received on the destination chain, in this case USDC
    amountFrom: INPUT_AMOUNT,
  });
  return ethers.utils.formatUnits(amountToReceive, 6);
}catch(error){console.log(error);return null}
}

// example
SynapseReceived("USDC", 10000, 42161, 1, 6);
