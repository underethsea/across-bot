const { Client, Intents } = require("discord.js");
const dotenv = require("dotenv");
const ethers = require("ethers");
const fetch = require("cross-fetch");
const Discord = require("discord.js");
const { MessageEmbed } = require("discord.js");
dotenv.config();
const client = new Discord.Client({
  partials: ["CHANNEL"],
  intents: ["GUILDS", "GUILD_MESSAGES", "DIRECT_MESSAGES"],
});

const { ABI } = require("./abi.js");

// let ethereumEndpoint =
//   "https://mainnet.infura.io/v3/" + process.env.ETHEREUM_KEY;
let ethereumEndpoint = "https://eth-mainnet.alchemyapi.io/v2/" + process.env.ETHEREUM_ALCHEMY_KEY
let arbitrumEndpoint = "https://arb1.arbitrum.io/rpc";
arbitrumEndpoint = "https://arb-mainnet.g.alchemy.com/v2/" + process.env.ARBITRUM_ALCHEMY_KEY
const optimismEndpoint = "https://mainnet.optimism.io";
const bobaEndpoint = "https://lightning-replica.boba.network";

const bridgePoolInterface = new ethers.utils.Interface(ABI.BRIDGEPOOL);
// const botTestChannelId = "932504732818362378";
const botTestChannelId = "958093554809438249"
const ethereumProvider = new ethers.providers.JsonRpcProvider(ethereumEndpoint);
const arbitrumProvider = new ethers.providers.JsonRpcProvider(arbitrumEndpoint);
const optimismProvider = new ethers.providers.JsonRpcProvider(optimismEndpoint);
const bobaProvider = new ethers.providers.JsonRpcProvider(bobaEndpoint);

// todo add transaction receipt for gas cost 
// const getReceipt = (transactionHash,chainId) => {
//   try{

//   }
// }
const BRIDGEPOOL = {
  WETH: {
    ADDRESS: "0x7355Efc63Ae731f584380a9838292c7046c1e433",
    L1TOKEN: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    DECIMALS: 18,
    SYMBOL: "WETH",
  },
  USDC: {
    ADDRESS: "0x256C8919CE1AB0e33974CF6AA9c71561Ef3017b6",
    L1TOKEN: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    DECIMALS: 6,
    SYMBOL: "USDC",
  },
  UMA: {
    ADDRESS: "0xdfe0ec39291e3b60ACa122908f86809c9eE64E90",
    L1TOKEN: "0x04Fa0d235C4abf4BcF4787aF4CF447DE572eF828",
    DECIMALS: 18,
    SYMBOL: "UMA",
  },
  BADGER: {
    ADDRESS: "0x43298F9f91a4545dF64748e78a2c777c580573d6",
    L1TOKEN: "0x3472A5A71965499acd81997a54BBA8D852C6E53d",
    DECIMALS: 18,
    SYMBOL: "BADGER",
  },
  WBTC: {
    ADDRESS: "0x02fbb64517E1c6ED69a6FAa3ABf37Db0482f1152",
    L1TOKEN: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
    DECIMALS: 8,
    SYMBOL: "WBTC",
  },
  BOBA: {
    ADDRESS: "0x4841572daA1f8E4Ce0f62570877c2D0CC18C9535",
    L1TOKEN: "0x42bBFa2e77757C645eeaAd1655E0911a7553Efbc",
    DECIMALS: 18,
    SYMBOL: "BOBA",
  },
  DAI: {
    ADDRESS: "0x43f133FE6fDFA17c417695c476447dc2a449Ba5B",
    L1TOKEN: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
    DECIMALS: 18,
    SYMBOL: "DAI",
  },
};

const arbitrumDepositBoxAddress = "0xd8c6dd978a3768f7ddfe3a9aad2c3fd75fa9b6fd";
const optimismDepositBoxAddress = "0x3baD7AD0728f9917d1Bf08af5782dCbD516cDd96";
const bobaDepositBoxAddress = "0xCD43CEa89DF8fE39031C03c24BC24480e942470B";

const relayTopics =
  "0xa4ca36d112520cced74325c72711f376fe4015665829d879ba21590cb8130be0";

const relayFilter = {
  address: BRIDGEPOOL.WETH.ADDRESS,
  topics: [relayTopics],
};
const relayFilters = {
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

const arbitrumDepositFilter = {
  address: arbitrumDepositBoxAddress,
  topics: [
    ethers.utils.id(
      "FundsDeposited(uint256,uint256,address,address,address,address,uint256,uint64,uint64,uint64)"
    ),
  ],
};

const bobaDepositFilter = {
  address: bobaDepositBoxAddress,
  topics: [
    ethers.utils.id(
      "FundsDeposited(uint256,uint256,address,address,address,address,uint256,uint64,uint64,uint64)"
    ),
  ],
};

const optimismDepositFilter = {
  address: optimismDepositBoxAddress,
  topics: [
    ethers.utils.id(
      "FundsDeposited(uint256,uint256,address,address,address,address,uint256,uint64,uint64,uint64)"
    ),
  ],
};
function processRelay(relayEvent,poolObject) {
  console.log("processing relay event", relayEvent.data);
  // console.log(iface.parseTransaction({ data: depositEvent.data }));
  let decoded = bridgePoolInterface.decodeEventLog(
    "DepositRelayed",
    relayEvent.data
  );
  let relayed = {
    relayState: decoded[2].relayState,
    slowRelayer: decoded[2].slowRelayer,
    relayId: decoded[2].relayId,
    realizedLpFeePct: decoded[2].realizedLpFeePct.toString(),
    priceRequestTime: decoded[2].priceRequestTime,
    proposerBond: decoded[2].proposerBond.toString(),
    finalFee: decoded[2].finalFee.toString(),
    chainId: decoded.depositData.chainId.toString(),
    depositId: decoded.depositData.depositId.toString(),
    l1Recipient: decoded.depositData.l1Recipient,
    l2Sender: decoded.depositData.l2Sender,
    amount: decoded.depositData.amount,
    slowRelayFeePct: decoded.depositData.slowRelayFeePct.toString(),
    instantRelayFeePct: decoded.depositData.instantRelayFeePct.toString(),
    quoteTimestamp: decoded.depositData.quoteTimestamp,
    transactionHash: relayEvent.transactionHash,
  };
  console.log("DECODED RELAY: ", relayed);
  let embed = relayEmbed(relayed,poolObject);
  return embed;
}

function relayEmbed(relayData,poolObject) {
  // let pool = findPool(relayData.l1Token);
  // symbol = poolObject.SYMBOL;
  let chain = chainInfo(relayData.chainId);
  let relayTime = parseFloat(relayData.priceRequestTime) - parseFloat(relayData.quoteTimestamp)
  let relayFee = relayData.finalFee / 1e18
  const relayEmbed = new MessageEmbed()
    .setColor("#6CF9D8")
    .setTitle(
      ":handshake:  RELAYED `" +
        decimals(parseFloat(ethers.utils.formatUnits(relayData.amount,poolObject.DECIMALS)))+
        "` **" +
        poolObject.SYMBOL +
        "**"
    )
    .setDescription(
      ":watch: `" +
        relayTime +
        "` seconds" +
        // + "<t:" +
        //     depositData.quoteTimestamp +
        //     ":R>" +
        "\nFee `" +
        decimals(relayFee) +
        "`" +
        "\nDeposit `#" +
        relayData.depositId +
        "`"
    )
    .setThumbnail(chain.chainLogo)
    .addField(
      "\u200B",
      "View on [" +
        chain.explorerName +
        "](" +
        chain.explorerURL +
        relayData.transactionHash +
        ")"
    );

  return relayEmbed;
}
const findPool = (tokenAddress) => {
  console.log("find pool", tokenAddress);
  let result = Object.values(BRIDGEPOOL).find((obj) => {
    return obj.L1TOKEN == tokenAddress;
  });
  console.log(result);
  return result;
};

const decimals = (amount) => {
  let point = 18;
  if (amount > 0.9) {
    point = 2;
  } else if (amount > 0.009) {
    point = 4;
  } else if (amount > 0.0009) {
    point = 5;
  } else if (amount > 0.000009) {
    point = 7;
  } else if (amount > 0.000000009) {
    point = 11;
  }
  return amount.toFixed(point);
};
function chainInfo(chainId) {
  let chain = {};
  chainId=parseInt(chainId)
  if (chainId === 42161) {
    chain = {
      chainName: "Arbitrum",
      explorerName: "Arbiscan",
      chainLogo: "https://l2beat.com/icons/arbitrum.png",
      explorerURL: "https://arbiscan.io/tx/",
    };
  }
  if (chainId === 288) {
    chain = {
      chainName: "Boba",
      explorerName: "Boba Explorer",
      chainLogo:
        "https://images.squarespace-cdn.com/content/v1/6105293624baee78ed31e0db/1629915110970-5XLTKFW6Y5GGT19S0G3V/Boba-Bug-Neon.png",
      explorerURL: "https://blockexplorer.boba.network/tx/",
    };
  }
  if (chainId === 10) {
    chain = {
      chainName: "Optimism",
      explorerName: "Optimistic Etherscan",
      chainLogo:
        "https://assets-global.website-files.com/5f973c970bea5548ad4287ef/620426d8498e8905d65f3153_Profile-Logo.png",
      explorerURL: "https://optimistic.etherscan.io/tx/",
    };
  }
  return chain;
}
function depositAlert(depositData) {
  let chain = chainInfo(depositData.chainId);

  let pool = findPool(depositData.l1Token);
  symbol = pool.SYMBOL;
  console.log("amount",depositData.amount)
  console.log("decimals",pool.DECIMALS)
  const depositEmbed = new MessageEmbed()
    .setColor("#6CF9D8")
    .setTitle(
      ":bank:  DEPOSITED `" +
        decimals(parseFloat(ethers.utils.formatUnits(depositData.amount,pool.DECIMALS))) +
        "` **" +
        symbol +
        "**"
    )
    .setDescription(
      ":watch: <t:" +
        depositData.quoteTimestamp +
        ":R>" +
        "\nDeposit `#" +
        depositData.depositId +
        "`"
    )
    .setThumbnail(chain.chainLogo)
    .addField(
      "\u200B",
      "View on [" +
        chain.explorerName +
        "](" +
        chain.explorerURL +
        depositData.transactionHash +
        ")"
    );

  return depositEmbed;
}

function processDeposit(depositEvent) {
  console.log(depositEvent);
  let result = ethers.utils.defaultAbiCoder.decode(
    [
      "uint256",
      "uint256",
      "address",
      "address",
      "address",
      "address",
      "uint256",
      "uint64",
      "uint64",
      "uint64",
    ],
    depositEvent.data
  );

  let deposited = {
    chainId: parseFloat(result[0].toString()),
    depositId: parseFloat(result[1].toString()),
    l1Recipient: parseFloat(result[1].toString()),
    l2Sender: result[3],
    l1Token: result[4],
    l2Token: result[5],
    amount: result[6],
    slowRelayFeePct: parseFloat(result[7].toString()),
    instantRelayFeePct: parseFloat(result[8].toString()),
    quoteTimestamp: parseFloat(result[9].toString()),
    transactionHash: depositEvent.transactionHash,
  };
  console.log(deposited);
  let embed = depositAlert(deposited);
  return embed;
}

async function botGo() {
  client.once("ready", () => {
    console.log("Ready!");
  });

  optimismProvider.on(optimismDepositFilter, (depositEvent) => {
    let embed = processDeposit(depositEvent);
    const testingChannel = client.channels.cache.get(botTestChannelId);
    testingChannel.send({ embeds: [embed] });
  });
  arbitrumProvider.on(arbitrumDepositFilter, (depositEvent) => {
    let embed = processDeposit(depositEvent);
    const testingChannel = client.channels.cache.get(botTestChannelId);
    testingChannel.send({ embeds: [embed] });
  });
  bobaProvider.on(bobaDepositFilter, (depositEvent) => {
    let embed = processDeposit(depositEvent);
    const testingChannel = client.channels.cache.get(botTestChannelId);
    testingChannel.send({ embeds: [embed] });
  });

  ethereumProvider.on(relayFilters.WETH, (relayEvent) => {
    console.log(relayEvent);
    let embed = processRelay(relayEvent,BRIDGEPOOL.WETH);
    const testingChannel = client.channels.cache.get(botTestChannelId);
    testingChannel.send({ embeds: [embed] });
  });
  ethereumProvider.on(relayFilters.USDC, (relayEvent) => {
    console.log(relayEvent);
    let embed = processRelay(relayEvent,BRIDGEPOOL.USDC);
    const testingChannel = client.channels.cache.get(botTestChannelId);
    testingChannel.send({ embeds: [embed] });
  });
  ethereumProvider.on(relayFilters.BADGER, (relayEvent) => {
    console.log(relayEvent);
    let embed = processRelay(relayEvent,BRIDGEPOOL.BADGER);
    const testingChannel = client.channels.cache.get(botTestChannelId);
    testingChannel.send({ embeds: [embed] });
  });
  ethereumProvider.on(relayFilters.UMA, (relayEvent) => {
    console.log(relayEvent);
    let embed = processRelay(relayEvent,BRIDGEPOOL.UMA);
    const testingChannel = client.channels.cache.get(botTestChannelId);
    testingChannel.send({ embeds: [embed] });
  });
  ethereumProvider.on(relayFilters.WBTC, (relayEvent) => {
    console.log(relayEvent);
    let embed = processRelay(relayEvent,BRIDGEPOOL.WBTC);
    const testingChannel = client.channels.cache.get(botTestChannelId);
    testingChannel.send({ embeds: [embed] });
  });

  ethereumProvider.on(relayFilters.DAI, (relayEvent) => {
    console.log(relayEvent);
    let embed = processRelay(relayEvent,BRIDGEPOOL.DAI);
    const testingChannel = client.channels.cache.get(botTestChannelId);
    testingChannel.send({ embeds: [embed] });
  });

  client.login(process.env.BOT_KEY);
}

botGo();
