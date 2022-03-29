const { Client, Intents } = require("discord.js");
const dotenv = require("dotenv");
const ethers = require("ethers");
const fetch = require("cross-fetch");
const Discord = require("discord.js");
const { MessageEmbed } = require("discord.js");
var Twit = require('twit')

dotenv.config();
const client = new Discord.Client({
  partials: ["CHANNEL"],
  intents: ["GUILDS", "GUILD_MESSAGES", "DIRECT_MESSAGES"],
});

const T = new Twit({
  consumer_key: process.env.CONSUMER_KEY,
  consumer_secret: process.env.CONSUMER_SECRET,
  access_token: process.env.ACCESS_TOKEN,
  access_token_secret: process.env.ACCESS_TOKEN_SECRET,
  timeout_ms: 60 * 1000
})

const { ABI } = require("./abi.js");
const { BRIDGEPOOL, DEPOSITBOX } = require("./constants.js")
const { RELAYFILTERS, DEPOSITFILTERS } = require("./filters.js")
const { PROVIDER } = require("./providers.js")



// const botTestChannelId = "932504732818362378";
const botTestChannelId = "958093554809438249";

// todo add transaction receipt for gas cost
// const getReceipt = (transactionHash,chainId) => {
// }

async function processRelay(relayEvent, poolObject) {
  const bridgePoolInterface = new ethers.utils.Interface(ABI.BRIDGEPOOL);

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
    realizedLpFeePct: decoded[2].realizedLpFeePct,
    priceRequestTime: decoded[2].priceRequestTime,
    proposerBond: decoded[2].proposerBond.toString(),
    finalFee: decoded[2].finalFee.toString(),
    chainId: decoded.depositData.chainId.toString(),
    depositId: decoded.depositData.depositId.toString(),
    l1Recipient: decoded.depositData.l1Recipient,
    l2Sender: decoded.depositData.l2Sender,
    amount: decoded.depositData.amount,
    slowRelayFeePct: decoded.depositData.slowRelayFeePct,
    instantRelayFeePct: decoded.depositData.instantRelayFeePct,
    quoteTimestamp: decoded.depositData.quoteTimestamp,
    transactionHash: relayEvent.transactionHash,
  };
  console.log("DECODED RELAY: ", relayed);
  let embed = await relayEmbed(relayed, poolObject);
  return embed;
}

async function relayEmbed(relayData, poolObject) {
  // let pool = findPool(relayData.l1Token);
  // symbol = poolObject.SYMBOL;
  let chain = chainInfo(relayData.chainId);
  let relayTime = parseFloat(relayData.priceRequestTime) - parseFloat(relayData.quoteTimestamp);
  let relayTotalFeePercentage = parseFloat(ethers.utils.formatUnits(relayData.slowRelayFeePct, 18)) + parseFloat(ethers.utils.formatUnits(relayData.instantRelayFeePct, 18)) + parseFloat(ethers.utils.formatUnits(relayData.realizedLpFeePct, 18))
  let depositAmount = parseFloat(ethers.utils.formatUnits(relayData.amount, poolObject.DECIMALS))
  let receivedAmount = depositAmount * (1 - relayTotalFeePercentage)
  // let relayFinalFee = relayData.finalFee / poolObject.DECIMALS;

  const tweet = { status: `Funds received from ${chain} to Ethereum Mainnet in ${relayTime} \n\nAmount: ${receivedAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })} \n\nhttps://etherscan.io/tx/${relayData.transactionHash}` }

  const relayEmbed = new MessageEmbed()
    .setColor("#6CF9D8")
    .setTitle(
      ":handshake:  RELAYED `" +
      decimals(depositAmount) +
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
      "\nReceived `" + decimals(receivedAmount) + "` " + poolObject.SYMBOL +
      "\nFee `" +
      decimals(relayTotalFeePercentage * 100) +
      "%`" +
      "\nDeposit `#" +
      relayData.depositId +
      "`"
    )
    .setThumbnail(chain.chainLogo)
    .addField(
      "\u200B",
      "View on [" +
      "Etherscan" +
      "](" +
      "https://etherscan.io/tx/" +
      relayData.transactionHash +
      ")"
    );

  return { relayEmbed: relayEmbed, tweet: tweet };
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
  if (amount > 999) {
    point = 0;
  } else if (amount > 0.9) {
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
  chainId = parseInt(chainId);
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
async function depositAlert(depositData) {
  let chain = chainInfo(depositData.chainId);

  let pool = findPool(depositData.l1Token);
  symbol = pool.SYMBOL;
  let amount = decimals(
    parseFloat(
      ethers.utils.formatUnits(depositData.amount, pool.DECIMALS)
    )
  )

  const tweet = { status: `Bridge initiated from ${chain} to Ethereum Mainnet. \n\nAmount: ${amount} \n\n${chain.explorerURL + depositData.transactionHash}` }

  const depositEmbed = new MessageEmbed()
    .setColor("#6CF9D8")
    .setTitle(
      ":bank:  DEPOSITED `" +
      decimals(
        parseFloat(
          ethers.utils.formatUnits(depositData.amount, pool.DECIMALS)
        )
      ) +
      "` **" +
      symbol +
      "**"
    )
    .setDescription(
      ":alarm_clock: <t:" +
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
  return {depositEmbed: depositEmbed, tweet: tweet};
}

async function processDeposit(depositEvent) {
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
  let embed = await depositAlert(deposited);
  return embed;
}

async function sendTweet(tweet) {
  T.post('statuses/update', tweet, function (err, data, response) {
    console.log(data.text)
  })
}

async function botGo() {
  client.once("ready", () => {
    console.log("Ready!");
  });

  PROVIDER.OPTIMISM.on(DEPOSITFILTERS.OPTIMISM, (depositEvent) => {
    try {
      processDeposit(depositEvent).then(result => {
        const testingChannel = client.channels.cache.get(botTestChannelId);
        testingChannel.send({ embeds: [result.depositEmbed] });
        sendTweet(result.tweet);
      })
    } catch (error) {
      console.log(error);
    }

  });
  PROVIDER.ARBITRUM.on(DEPOSITFILTERS.ARBITRUM, (depositEvent) => {
    try {
      processDeposit(depositEvent).then(result => {
        const testingChannel = client.channels.cache.get(botTestChannelId);
        testingChannel.send({ embeds: [result.depositEmbed] });
        sendTweet(result.tweet);
      })
    } catch (error) {
      console.log(error);
    }
  });
  PROVIDER.BOBA.on(DEPOSITFILTERS.BOBA, (depositEvent) => {
    try {
      processDeposit(depositEvent).then(result => {
        const testingChannel = client.channels.cache.get(botTestChannelId);
        testingChannel.send({ embeds: [result.depositEmbed] });
        sendTweet(result.tweet);
      })
    } catch (error) {
      console.log(error);
    }
  });

  PROVIDER.ETHEREUM.on(RELAYFILTERS.WETH, (relayEvent) => {
    console.log(relayEvent);
    try {
      processRelay(relayEvent, BRIDGEPOOL.WETH).then(result => {
        const testingChannel = client.channels.cache.get(botTestChannelId);
        testingChannel.send({ embeds: [result.relayEmbed] });
        sendTweet(result.tweet);
      })
    } catch (error) {
      console.log(error);
    }
  });
  PROVIDER.ETHEREUM.on(RELAYFILTERS.USDC, (relayEvent) => {
    try {
      console.log(relayEvent);
      processRelay(relayEvent, BRIDGEPOOL.USDC).then(result => {
        const testingChannel = client.channels.cache.get(botTestChannelId);
        testingChannel.send({ embeds: [result.relayEmbed] });
        sendTweet(result.tweet);
      })
    } catch (error) {
      console.log(error);
    }
  });
  PROVIDER.ETHEREUM.on(RELAYFILTERS.BADGER, (relayEvent) => {
    try {
      console.log(relayEvent);
      processRelay(relayEvent, BRIDGEPOOL.BADGER).then(result => {
        const testingChannel = client.channels.cache.get(botTestChannelId);
        testingChannel.send({ embeds: [result.relayEmbed] });
        sendTweet(result.tweet);
      })
    } catch (error) {
      console.log(error);
    }
  });
  PROVIDER.ETHEREUM.on(RELAYFILTERS.UMA, (relayEvent) => {
    try {
      console.log(relayEvent);
      processRelay(relayEvent, BRIDGEPOOL.UMA).then(result => {
        const testingChannel = client.channels.cache.get(botTestChannelId);
        testingChannel.send({ embeds: [result.relayEmbed] });
        sendTweet(result.tweet);
      })
    } catch (error) {
      console.log(error);
    }
  });
  PROVIDER.ETHEREUM.on(RELAYFILTERS.WBTC, (relayEvent) => {
    try {
      console.log(relayEvent);
      processRelay(relayEvent, BRIDGEPOOL.WBTC).then(result => {
        const testingChannel = client.channels.cache.get(botTestChannelId);
        testingChannel.send({ embeds: [result.relayEmbed] });
        sendTweet(result.tweet);
      })
    } catch (error) {
      console.log(error);
    }
  });

  PROVIDER.ETHEREUM.on(RELAYFILTERS.DAI, (relayEvent) => {
    try {
      console.log(relayEvent);
      processRelay(relayEvent, BRIDGEPOOL.DAI).then(result => {
        const testingChannel = client.channels.cache.get(botTestChannelId);
        testingChannel.send({ embeds: [result.relayEmbed] });
        sendTweet(result.tweet);
      })
    } catch (error) {
      console.log(error);
    }
  });

  client.login(process.env.BOT_KEY);
}

botGo();
