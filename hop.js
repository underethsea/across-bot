
import { Hop, Chain } from '@hop-protocol/sdk'
import { Wallet, providers } from 'ethers'
import { PROVIDER } from "./providers.js"
import ethers from 'ethers'

const hop = new Hop('mainnet', PROVIDER.ETHEREUM)
function hopChain(chainId) {
  let chain = parseInt(chainId)
    if(chain === 1) {return Chain.Ethereum}
    if(chain === 137) {return Chain.Polyon}
    if(chain === 42161) {console.log("arbitrum");return Chain.Arbitrum}
    if(chain === 10) {return Chain.Optimism}
}

// asset like ETH, USDC, etc
// amount to be transfered in wei as string
// chainId's like 1, 10, 42161
async function HopReceived (asset,amount,fromChain,toChain) {
  try{
  if(asset !== null) {
    const bridge = hop.connect(PROVIDER.ETHEREUM).bridge(asset)

const {estimatedReceived} = await bridge.getSendData(amount, hopChain(fromChain), hopChain(toChain))
return estimatedReceived

  }else {return null}
}catch(error){return null;console.log(error)}

}
// testing....
// async function go (){
// let amount = '60000000000'

//  let b = await HopReceived('USDC',amount,42161,1,6)
//  console.log("amount ",parseFloat(amount) / 1e6," received ",ethers.utils.formatUnits(b,6))
// }
// go()

export {HopReceived}

