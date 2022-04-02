import { BRIDGEPOOL, DEPOSITBOX} from "./constants.js"
import ethers from "ethers"

const relayTopics =
"0xa4ca36d112520cced74325c72711f376fe4015665829d879ba21590cb8130be0";


const RELAYFILTERS = {
WETH: {
  address: BRIDGEPOOL.WETH.ADDRESS,
  topics: [relayTopics],
},
USDC: {
  address: BRIDGEPOOL.USDC.ADDRESS,
  topics: [relayTopics],
},
UMA: {
  address: BRIDGEPOOL.UMA.ADDRESS,
  topics: [relayTopics],
},
BADGER: {
  address: BRIDGEPOOL.BADGER.ADDRESS,
  topics: [relayTopics],
},
WBTC: {
  address: BRIDGEPOOL.WBTC.ADDRESS,
  topics: [relayTopics],
},
BOBA: {
  address: BRIDGEPOOL.BOBA.ADDRESS,
  topics: [relayTopics],
},
DAI: {
  address: BRIDGEPOOL.DAI.ADDRESS,
  topics: [relayTopics],
},
};

const DEPOSITFILTERS = {
    ARBITRUM: {address: DEPOSITBOX.ARBITRUM.ADDRESS,
    topics: [
      ethers.utils.id(
        "FundsDeposited(uint256,uint256,address,address,address,address,uint256,uint64,uint64,uint64)"
      ),
    ]},
    OPTIMISM: {address: DEPOSITBOX.OPTIMISM.ADDRESS,
    topics: [
      ethers.utils.id(
        "FundsDeposited(uint256,uint256,address,address,address,address,uint256,uint64,uint64,uint64)"
      ),
    ]},
    BOBA: {
    address: DEPOSITBOX.BOBA.ADDRESS,
    topics: [
      ethers.utils.id(
        "FundsDeposited(uint256,uint256,address,address,address,address,uint256,uint64,uint64,uint64)"
      ),
    ]}
}

export { RELAYFILTERS, DEPOSITFILTERS };
