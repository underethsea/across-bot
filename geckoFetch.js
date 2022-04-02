import fetch from "node-fetch";
const GeckoPrice = async (tokenID) => {
  const url =
    "https://api.coingecko.com/api/v3/simple/price?ids=" +
    tokenID +
    "&vs_currencies=usd";

  try {
    let result = await fetch(url);
    let geckoPrice = await result.json();

    geckoPrice = parseFloat(geckoPrice[tokenID].usd);
    console.log(tokenID, " price ", geckoPrice);
    return geckoPrice;
  } catch (error) {
    console.log(error);
  }
};
export { GeckoPrice };
