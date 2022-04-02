import * as uma from "@uma/sdk"
import ethers from "ethers"
import {PROVIDER} from "./providers.js"
const { gasFeeCalculator, constants, utils } = uma.across
const LpFeeCalculator = uma.across.LpFeeCalculator

// amount in wei
async function AcrossReceived(asset, amount, fromChain, toChain, decimals) {
const totalRelayed = utils.toWei(10)
const provider = ethers.providers.getDefaultProvider()
const umaAddress = constants.ADDRESSES.ETH
const optionalFeeLimitPercent = 25 // this checks if fees are too high as a percentage of total amount to relay, omit to disable check
const depositFeeDetails = await gasFeeCalculator.getDepositFeesDetails(
  PROVIDER.ETHEREUM,
  totalRelayed,
  umaAddress)
console.log(depositFeeDetails)
console.log("instant percent fee",depositFeeDetails.instant.pct/1e18)
console.log("slow fee ",depositFeeDetails.slow.pct/1e18)

// pass in L1 read only provider. You should only have a single instance of the calculator.
const calculator = new LpFeeCalculator(PROVIDER.ETHEREUM)

const tokenAddress = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"// token address on L1 to transfer from l2 to l1
const bridgePoolAddress = "0x7355Efc63Ae731f584380a9838292c7046c1e433" // bridge pool address on L1 with the liquidity pool
const amount = utils.toWei(10) // amount in wei for user to send across
const timestamp = Date.now() / 1000 // timestamp in seconds of latest block on L2 chain
const percent = await calculator.getLpFeePct(tokenAddress, bridgePoolAddress, amount, timestamp)
console.log(percent.toString() / 1e18)
}
export {AcrossReceived}



