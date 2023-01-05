import axios from "axios";
//v2
export const BTC_MONTHLY_RETURN_API = (data) =>
  axios.post("https://pro.coingen.net/api/v3/coincap", data);
export const BTC_USDT_API = () =>
  axios.get(
    "https://api.coincap.io/v2/candles?exchange=binance&interval=d1&baseId=bitcoin&quoteId=tether&api_key=d667aa8e-fa6c-4cd9-aaee-c8694b338267&đays=1900"
  );
export const ETH_BTC_API = (data = { pair: "BTC_ETH" }) =>
  axios.post("https://pro.coingen.net/api/v3/coin-pair", data);
export const BTC_CRYPTO_API = () =>
  axios.post("https://pro.coingen.net/api/v3/cryptorank");
export const TOTAL_LIQUIDITION_API = (params) =>
  axios.get(
    "https://open-api.coinglass.com/api/pro/v1/futures/longShort_chart",
    { params }
  );
export const BTC_PRICE_API = (data) => {
  return axios.post("https://pro.coingen.net/api/v3/messari-metrics", {
    data,
  });
};
export const LIQUIDITION_POST_API = (data) => axios.post("https://pro.coingen.net/api/v3/coinglass", data);