import dotenv from "dotenv";
dotenv.config();
import ethers from "ethers"

// let ethereumEndpoint =
//   "https://mainnet.infura.io/v3/" + process.env.ETHEREUM_KEY;
let ethereumEndpoint =
  "https://eth-mainnet.alchemyapi.io/v2/" + process.env.ETHEREUM_ALCHEMY_KEY;
let arbitrumEndpoint = "https://arb1.arbitrum.io/rpc";
arbitrumEndpoint =
  "https://arb-mainnet.g.alchemy.com/v2/" + process.env.ARBITRUM_ALCHEMY_KEY;
const optimismEndpoint = "https://mainnet.optimism.io";
const bobaEndpoint = "https://lightning-replica.boba.network";

const PROVIDER = {
  ETHEREUM: new ethers.providers.JsonRpcProvider(ethereumEndpoint),
  ARBITRUM: new ethers.providers.JsonRpcProvider(arbitrumEndpoint),
  OPTIMISM: new ethers.providers.JsonRpcProvider(optimismEndpoint),
  BOBA: new ethers.providers.JsonRpcProvider(bobaEndpoint),
};

export { PROVIDER };
