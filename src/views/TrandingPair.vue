<template>
  <BlockChart title="BTC Performance by Trading pairs" :loading="loading">
    <HighChart
      id="btc-performance-pair"
      :options="options"
      height="180px"
      ref="highchart"
    />
  </BlockChart>
</template>
<script>
import {
  BTC_USDT_API,
  ETH_BTC_API,
  BTC_CRYPTO_API,
  BTC_PRICE_API,
} from "@/services/api";
import BlockChart from "@/components/BlockChart.vue";
import HighChart from "@/components/HighChart.vue";
import {
  arrFromRangeGenerate,
  roundValue,
  colorByPercent,
  handlerColor,
} from "@/ultis";
let highcharts = require("highcharts");
require("highcharts/highcharts-more")(highcharts);
require("highcharts/modules/accessibility")(highcharts);
require("highcharts/modules/exporting")(highcharts);
export default {
  name: "tranding-pair",
  components: {
    BlockChart,
    HighChart,
  },
  data: () => ({
    data: [],
    symbol: {},
    params: {
      currency: "USD",
      sort: "rank",
      order: "ascending",
      offset: 0,
      limit: 500,
      meta: true,
    },
    keyChange: 1,
    intervalTime: 60 * 60 * 1000,
    interval: null,
    loading: false,
    functionFireChart: null,
    yCategories: ["BTC/USD", "BTC/ETH", "BTC/Crypto"],
    categories: [
      {
        text: "24h",
        timeFunc: (last) =>
          new Date(last - 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      },
      {
        text: "7D",
        timeFunc: (last) =>
          new Date(last - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      },
      {
        text: "1M",
        timeFunc: (last) =>
          new Date(new Date(last).setMonth(new Date(last).getMonth() - 1))
            .toISOString()
            .split("T")[0],
      },
      {
        text: "3M",
        timeFunc: (last) =>
          new Date(new Date(last).setMonth(new Date(last).getMonth() - 3))
            .toISOString()
            .split("T")[0],
      },
      {
        text: "12M",
        timeFunc: (last) =>
          new Date(new Date(last).setMonth(new Date(last).getMonth() - 12))
            .toISOString()
            .split("T")[0],
      },
      {
        text: "YTD",
        timeFunc: (last) => `${new Date(last).getFullYear()}-1-1`,
        // fromStart: true,
      },
      {
        text: "3Y",
        timeFunc: (last) =>
          new Date(new Date(last).setFullYear(new Date(last).getFullYear() - 3))
            .toISOString()
            .split("T")[0],
      },
      {
        text: "5Y",
        timeFunc: (last) =>
          new Date(new Date(last).setFullYear(new Date(last).getFullYear() - 5))
            .toISOString()
            .split("T")[0],
      },
    ],
  }),
  computed: {
    options() {
      return {
        chart: {
          type: "heatmap",
          backgroundColor: "#2e2e33",
        },

        title: {
          text: null,
        },
        plotOptions: {
          heatmap: {
            borderWidth: 2,
            borderColor: "#26263b",
          },
        },
        xAxis: [
          {
            categories: this.categories.map((x) => x.text),
            min: 0,
            max: 7,
            opposite: true,
            labels: {
              style: {
                color: "#FFFFFF",
              },
            },
            lineWidth: 0,
            tickWidth: 0,
            left: 120,
            width: "96%",
          },
        ],

        yAxis: {
          categories: this.yCategories,
          min: 0,
          max: 2,
          reversed: true,
          gridLineWidth: 0,
          labels: {
            style: {
              color: "#FFFFFF",
            },
          },
          margin: 20,
          gridLineColor: "#ffffff1f",
          title: null,
        },

        colorAxis: {
          min: 0,
          minColor: "#FFFFFF",
        },

        legend: {
          enabled: false,
        },
        tooltip: {
          enabled: false,
        },
        series: [
          {
            name: "BTC Monthly Returns (USD)",
            data: this.data,
            dataLabels: {
              enabled: true,
              color: "#ffffff",
              useHTML: true,
              formatter: function () {
                return `<div class="font-medium" style="color:${
                  handlerColor(this.point.value).color
                };font-size:12px">${
                  this.point.value
                    ? roundValue(this.point.value, 1) + " %"
                    : "-"
                }</div>`;
              },
            },
          },
        ],
      };
    },
  },
  async created() {
    this.init();
    this.interval = setInterval(() => {
      this.fetchData();
    }, this.intervalTime);
  },
  beforeDestroy() {
    // clearInterval(this.interval);
  },
  methods: {
    timeRangeHandler(
      data,
      yIndex,
      result,
      keyTime,
      keyValue,
      isDateIso = false
    ) {
      let clone = [...data];
      Array.prototype.findLast = function (fn) {
        for (let i = this.length - 1; i >= 0; i--)
          if (fn(this[i], i, this)) return this[i];
        return null;
      };

      //24h
      let last = clone[clone.length - 1];

      clone.splice(-1);

      this.categories.forEach((value, index) => {
        let find = null;

        find = clone.findLast((x) => {
          let periodDate = isDateIso
            ? x[keyTime]
            : new Date(x[keyTime]).toISOString().split("T")[0];
          let time = value.timeFunc(
            isDateIso ? new Date(last[keyTime]).getTime() : last[keyTime]
          );
          return periodDate == time;
        });
        if (!find) {
          find = clone.findLast((x) => {
            let periodDate = new Date(x[keyTime]).getTime();
            let time = new Date(
              value.timeFunc(
                isDateIso ? new Date(last[keyTime]).getTime() : last[keyTime]
              )
            );

            return periodDate <= time - 2 * 24 * 60 * 60 * 1000;
          });
        }
        if (find) {
          result[yIndex][index] = {
            value: (100 * (find[keyValue] - last[keyValue])) / find[keyValue],
          };
        }
      });
      return result;
    },
    async fetchBTC_CRYPTO_Data() {
      let res = await BTC_CRYPTO_API();
      return res.data;
    },
    async fetchBTC_USDT_Data() {
      let res = await BTC_USDT_API();
      return res.data.data;
    },
    async fetchETH_BTC_API(data) {
      let res = await ETH_BTC_API();
      Object.keys(res.data).forEach((key) => {
        let keyFind = key.toLowerCase();
        if (key == "1y") {
          keyFind = "12m";
        }
        let findIndex = this.categories.findIndex((x) => {
          return x.text.toLowerCase() === keyFind;
        });
        data[1][findIndex] = { value: res.data[key] };
      });
      return data;
    },
    async init() {
      try {
        this.loading = true;
        await this.fetchData();
      } catch (error) {
        console.log("error!");
      } finally {
        this.loading = false;
      }
    },
    async fetchData() {
      // const res = await BTC_MONTHLY_RETURN_API();
      let data = {};
      this.yCategories.forEach((year, yearIndex) => {
        data[yearIndex] = {};
        for (let i = 0; i < 8; i++) {
          data[yearIndex][i] = { value: 0 };
        }
      });
      try {
        try {
          // let btc_utc = await this.fetchBTC_USDT_Data();
          // data = this.timeRangeHandler(btc_utc, 0, data, "period", "close");
          let btc_utc = await BTC_PRICE_API();
          btc_utc = btc_utc?.data[btc_utc?.data?.length - 1];

          data[0][0] = {
            value: btc_utc?.percent_change_usd_last_24_hours ?? 0,
          };
          data[0][1] = { value: btc_utc?.percent_change_last_1_week ?? 0 };
          data[0][2] = { value: btc_utc?.percent_change_last_1_month ?? 0 };
          data[0][3] = { value: btc_utc?.percent_change_last_3_months ?? 0 };
          data[0][4] = { value: btc_utc?.percent_change_last_1_year ?? 0 };

          if (btc_utc?.roi_by_year) {
            try {
              let roi_by_year = JSON.parse(btc_utc?.roi_by_year);
              let time = new Date(btc_utc?.timestamp);
              Object.keys(roi_by_year).forEach((key) => {
                if (key.includes(time.getFullYear() - 3)) {
                  data[0][6] = { value: roi_by_year[key] ?? 0 };
                }
                if (key.includes(time.getFullYear() - 5)) {
                  data[0][7] = { value: roi_by_year[key] ?? 0 };
                }
              });
            } catch (error) {
              console.log("error");
            }
          }
          console.log(
            "🚀 ~ file: TrandingPair.vue:291 ~ fetchData ~ btc_utc",
            btc_utc
          );
        } catch (error) {
          console.log(
            "🚀 ~ file: TrandingPair.vue:279 ~ fetchData ~ error",
            error
          );
        }
        try {
          data = await this.fetchETH_BTC_API(data);
        } catch (error) {
          console.log(
            "🚀 ~ file: TrandingPair.vue:285 ~ fetchData ~ error",
            error
          );
        }
        try {
          let crypto = await this.fetchBTC_CRYPTO_Data();
          data = this.timeRangeHandler(
            crypto,
            2,
            data,
            "date",
            "btcDominance",
            true
          );
        } catch (error) {
          console.log(
            "🚀 ~ file: TrandingPair.vue:300 ~ fetchData ~ error",
            error
          );
        }
      } catch (error) {
        this.yCategories.forEach((year, yearIndex) => {
          data[yearIndex] = {};
          for (let i = 0; i < 8; i++) {
            data[yearIndex][i] = { value: 0 };
          }
        });
      }
      let result = [];
      Object.keys(data).forEach((year) => {
        Object.keys(data[year]).forEach((month) => {
          result.push({
            x: parseInt(month),
            y: parseInt(year),
            color: handlerColor(data[year][month].value).bgColor,
            value: data[year][month].value,
          });
        });
      });
      this.data = result;
    },
    getStyle(value) {
      //#e85b5a
      let color = "#8dc950";
      if (value && parseFloat(value) < 0) {
        color = "#e85b5a";
      }

      return { color };
    },
  },
};
</script>
<style scoped></style>
