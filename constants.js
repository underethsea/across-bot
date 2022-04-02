
const BRIDGEPOOL = {
  WETH: {
    ADDRESS: "0x7355Efc63Ae731f584380a9838292c7046c1e433",
    L1TOKEN: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    DECIMALS: 18,
    SYMBOL: "WETH",
    GECKOID: "weth",
    HOPID: "ETH"
  },
  USDC: {
    ADDRESS: "0x256C8919CE1AB0e33974CF6AA9c71561Ef3017b6",
    L1TOKEN: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    DECIMALS: 6,
    SYMBOL: "USDC",
    GECKOID: "usd-coin",
    HOPID: "USDC"
  },
  UMA: {
    ADDRESS: "0xdfe0ec39291e3b60ACa122908f86809c9eE64E90",
    L1TOKEN: "0x04Fa0d235C4abf4BcF4787aF4CF447DE572eF828",
    DECIMALS: 18,
    SYMBOL: "UMA",
    GECKOID: "uma",
    HOPID: null

  },
  BADGER: {
    ADDRESS: "0x43298F9f91a4545dF64748e78a2c777c580573d6",
    L1TOKEN: "0x3472A5A71965499acd81997a54BBA8D852C6E53d",
    DECIMALS: 18,
    SYMBOL: "BADGER",
    GECKOID: "badger-dao",
    HOPID: null
  },
  WBTC: {
    ADDRESS: "0x02fbb64517E1c6ED69a6FAa3ABf37Db0482f1152",
    L1TOKEN: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
    DECIMALS: 8,
    SYMBOL: "wrapped-bitcoin",
    HOPID: null
  },
  BOBA: {
    ADDRESS: "0x4841572daA1f8E4Ce0f62570877c2D0CC18C9535",
    L1TOKEN: "0x42bBFa2e77757C645eeaAd1655E0911a7553Efbc",
    DECIMALS: 18,
    SYMBOL: "BOBA",
    GECKOID: "boba-network",
    HOPID: null
  },
  DAI: {
    ADDRESS: "0x43f133FE6fDFA17c417695c476447dc2a449Ba5B",
    L1TOKEN: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
    DECIMALS: 18,
    SYMBOL: "DAI",
    GECKOID: "dai",
    HOPID: "DAI"
  },
};

const DEPOSITBOX = {
  ARBITRUM: { ADDRESS: "0xd8c6dd978a3768f7ddfe3a9aad2c3fd75fa9b6fd" },
  OPTIMISM: { ADDRESS: "0x3baD7AD0728f9917d1Bf08af5782dCbD516cDd96" },
  BOBA: { ADDRESS: "0xCD43CEa89DF8fE39031C03c24BC24480e942470B" },
};

export { BRIDGEPOOL, DEPOSITBOX };
