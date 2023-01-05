<template>
  <BlockChart title="Total Liquiditions" :loading="loading">
    <!-- <div class="flex justify-end">
      <div class="mb-3">
        <select
          class="form-select appearance-none block w-full px-3 py-1.5 text-[12px] font-normal text-[#918e98] bg-[#222531] bg-clip-padding bg-no-repeat border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:bg-[#222531] focus:border-none focus:outline-none"
          aria-label="Default select example"
          @change="(value) => selectOption(value)"
        >
          <option
            :value="item.key"
            v-for="(item, index) in timeOptions"
            :key="`select-${index}`"
            :selected="item.key == btcPriceParams.timeType"
          >
            {{ item.text }}
          </option>
        </select>
      </div>
    </div> -->
    <HighChart
      id="total-liquidition"
      :options="options"
      height="500px"
      ref="highchart"
      isStockChart
    />
  </BlockChart>
</template>
<script>
import {
  TOTAL_LIQUIDITION_API,
  BTC_PRICE_API,
  LIQUIDITION_POST_API,
} from "@/services/api";
import BlockChart from "@/components/BlockChart.vue";
import HighChart from "@/components/HighChart.vue";
import moment from "moment";
import {
  arrFromRangeGenerate,
  getQuarterFromMonth,
  handlerPrice,
  roundValue,
  formatUSD,
  styleColor,
} from "@/ultis";
let highcharts = require("highcharts");
require("highcharts/highcharts-more")(highcharts);
require("highcharts/modules/accessibility")(highcharts);
require("highcharts/modules/exporting")(highcharts);
var groupingUnits = [
  [
    "minute", // unit name
    [60], // allowed multiples
  ],
  [
    "hour", // unit name
    [1], // allowed multiples
  ],
  ["day", [1]],
  ["week", [1]],
  ["month", [1]],
];

export default {
  name: "total-liquidition",
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
    loading: true,
    functionFireChart: null,
    yCategories: [],
    seriesOptions: [],
    btcPriceParams: {
      interval: "h1",
      api_key: "d667aa8e-fa6c-4cd9-aaee-c8694b338267",
    },
    totalLiquiditionParams: { symbol: "BTC", interval: 9 },
    legendX: 0,
    legendY: -50,
    verticalAlign: "top",
    timeOptions: [
      {
        text: "ALL",
        key: null,
      },
      {
        text: "1 minutes",
        key: 9,
      },
      {
        text: "5 minutes",
        key: 3,
      },
      {
        text: "15 minutes",
        key: 10,
      },
      {
        text: "30 minutes",
        key: 11,
      },
      {
        text: "1 hour",
        key: 12,
      },
      {
        text: "4 hour",
        key: 1,
      },
      {
        text: "12 hour",
        key: 4,
      },
    ],
  }),
  watch: {
    btcPriceParams: {
      handler(val) {
        this.fetchData();
      },
      deep: true,
    },
  },
  computed: {
    options() {
      return {
        chart: {
          backgroundColor: "#2e2e33",
          type: "column",
        },

        // navigator: {
        //   enabled: false,
        // },
        // scrollbar: {
        //   enabled: false,
        // },
        rangeSelector: {
          inputEnabled: false,
          enabled: true,
          selected: 7,
          height: 45,
          buttons: [
            {
              type: "minute",
              count: 1,
              text: "1h",
            },
            {
              type: "hour",
              count: 6,
              text: "6h",
            },
            {
              type: "hour",
              count: 12,
              text: "12h",
            },
            {
              type: "day",
              count: 1,
              text: "24h",
            },
            {
              type: "week",
              count: 1,
              text: "7d",
            },
            {
              type: "day",
              count: 30,
              text: "30d",
            },
            {
              type: "all",
              text: "All",
            },
          ],
          buttonTheme: {
            // styles for the buttons
            fill: "none",
            stroke: "none",
            "stroke-width": 0,
            r: 8,
            style: {
              color: "#fff",
              fontWeight: "normal",
            },
            states: {
              hover: {
                fill: "#404044",
              },
              select: {
                fill: "#404044",
                style: {
                  color: "white",
                  fontWeight: "normal",
                },
              },
              disabled: { fontWeight: "normal" },
            },
          },
          inputStyle: {
            color: "#fff",
          },
          labelStyle: {
            color: "#fff",
            fontWeight: "normal",
          },
        },
        title: {
          text: null,
          // style: {
          //   color: "transparent",
          //   fontSize: "20px",
          //   fontWeight: "bold",
          // },
          // align: "left",
        },
        xAxis: {
          title: null,
          type: "datetime",
          labels: {
            style: {
              color: "#FFFFFF",
            },
          },
          crosshair: {
            color: "#ffffff1f",
            snap: false,
            dashStyle: "longdash",
          },
        },
        yAxis: [
          {
            gridLineColor: "#ffffff1f",
            gridLineDashStyle: "longdash",
            labels: {
              style: {
                color: "#FFFFFF",
              },
              formatter: function () {
                return handlerPrice(Math.abs(this.value));
              },
            },
            title: null,
            opposite: false,
            tickAmount: 5,
            showLastLabel: true,
          },
          {
            // Secondary yAxis
            gridLineColor: "#ffffff1f",
            gridLineDashStyle: "longdash",
            title: null,
            labels: {
              formatter: function () {
                return "$ " + handlerPrice(Math.abs(this.value));
              },
              style: {
                color: "#FFFFFF",
              },
            },
            opposite: true,
            crosshair: {
              color: "#ffffff1f",
              snap: false,
              dashStyle: "longdash",
            },
            showLastLabel: true,
          },
        ],
        credits: {
          enabled: false,
        },
        legend: {
          enabled: true,
          align: "right",
          verticalAlign: this.verticalAlign,
          x: this.legendX,
          y: this.legendY,
          itemStyle: {
            color: "#fff",
            fontWeight: "normal",
          },
          itemHoverStyle: {
            color: "#fff",
            fontWeight: "bold",
          },
        },
        tooltip: {
          useHTML: true,
          backgroundColor: "#1f2937",
          followPointer: true,
          split: false,
          followTouchMove: false,
          animation: false,
          borderRadius: 5,
          borderWidth: 0,
          shadow: false,
          padding: 0,
          hideDelay: 0,
          formatter: function () {
            let list = this.point.custom;
            let sumShort = 0;
            let sumLong = 0;
            let data = list.reduce((a, b) => {
              sumShort += b.buyVolUsd;
              sumLong += b.sellVolUsd;
              return (
                a +
                `
                  <tr class="text-white">
              <td align="left">${b.exchangeName}</td>
              <td class="text-right" align="right" style="color:#e0294a">$${handlerPrice(
                roundValue(b.buyVolUsd, 1)
              )}</td>
              <td class="text-right" align="right" style="color:#2ebd85">$${handlerPrice(
                roundValue(b.sellVolUsd, 1)
              )}</td>
            </tr>
              `
              );
            }, "");
            let result = ` <div  class="text-white border border-white rounded p-2">
                        <div class="text-center">
                          ${moment(this.x).format("DD MMM, YYYY HH:mm")}
                        </div>
                        <div class="text-center mb-2">
                          BTC Price: $${handlerPrice(roundValue(this.y))}
                        </div>
                        <table class="border-collapse w-full">
                            <thead>
                              <tr class="text-white">
                                <th class="font-normal" align="left">Site</th>
                                <th class="font-normal text-right" align="right">Shorts</th>
                                <th class="font-normal text-right" align="right">Longs</th>
                              </tr>
                            </thead>
                          <tbody>
                            ${data}
                            <tr>
                              <td class="py-1" colspan="3"></td>
                            </tr>
                            <tr>
                              <td class="py-1 border-t" colspan="3"></td>
                            </tr>
                             <tr class="text-white">
                                <td align="left">Sum</td>
                              <td class="text-right" align="right" style="color:#e0294a">$${handlerPrice(
                                roundValue(sumShort, 1)
                              )}</td>
                              <td class="text-right" align="right" style="color:#2ebd85">$${handlerPrice(
                                roundValue(sumLong, 1)
                              )}</td>
                              </tr>
                        </table>
                      </div>`;

            return result;
          },
        },
        plotOptions: {
          column: {
            maxPointWidth: 20,
            stacking: "normal",
            // states: {
            //   hover: {
            //     enabled: false,
            //   },
            // },
            states: {
              inactive: {
                opacity: 1,
              },
            },
          },
        },
        series: this.seriesOptions,
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
    clearInterval(this.interval);
  },
  methods: {
    async fetchLiquidtion() {
      let result = {};

      try {
        let btc_price = await BTC_PRICE_API();
        result = btc_price.data.reduce((accumulator, currentValue) => {
          let time = moment(currentValue.timestamp);
          time = new Date(
            time.year(),
            time.month(),
            time.date(),
            time.hour(),
            0,
            0
          );
          let price;
          if (!currentValue.ohlcv_last_1_hour) {
            return accumulator;
          }
          try {
            price = JSON.parse(currentValue.ohlcv_last_1_hour);

            if (!price || !price.close) {
              return accumulator;
            }
          } catch (e) {
            return accumulator;
          }

          if (!accumulator[time]) {
            accumulator[time] = {
              date: time.toISOString(),
              createTime: time.getTime(),
              price: 0,
              buyVolUsd: 0,
              sellVolUsd: 0,
              list: [],
            };
          }
          accumulator[time].price += parseFloat(price.close);
          return accumulator;
        }, result);
      } catch (error) {
        console.log(error);
      }
      try {
        let res = await LIQUIDITION_POST_API();
        result = res.data.reduce((accumulator, currentValue) => {
          if (currentValue.exchangeName == "All") {
            return accumulator;
          }
          let time = moment(currentValue.updated_at);
          time = new Date(time.year(), time.month(), time.date(), time.hour());
          if (!accumulator[time]) {
            // accumulator[time] = {
            //   date: time.toISOString(),
            //   createTime: time.getTime(),
            //   price: 0,
            //   buyVolUsd: 0,
            //   sellVolUsd: 0,
            //   list: [],
            // };
            return accumulator;
          }
          accumulator[time].buyVolUsd += parseFloat(currentValue.shortVolUsd);
          accumulator[time].sellVolUsd += parseFloat(currentValue.longVolUsd);
          accumulator[time].list.push({
            exchangeName: currentValue.exchangeName,
            buyVolUsd: parseFloat(currentValue.shortVolUsd),
            sellVolUsd: parseFloat(currentValue.longVolUsd),
          });
          return accumulator;
        }, result);
      } catch (error) {
        console.log(error);
      }
      result = Object.values(result).sort(
        (a, b) => a.createTime - b.createTime
      );
      return result;
    },
    selectOption(event) {
      this.btcPriceParams.timeType = event.target.value;
    },
    fetchYCategories() {
      this.yCategories = arrFromRangeGenerate(
        new Date().getFullYear() - 5,
        new Date().getFullYear()
      );
    },
    async init() {
      let short = {
        name: "Shorts",
        data: [],
        yAxis: 0,
        color: "#e0294a",
        enableMouseTracking: false,
        borderWidth: 0,
        dataGrouping: {
          units: groupingUnits,
        },
      };
      let long = {
        name: "Longs",
        data: [],
        color: "#2ebd85",
        yAxis: 0,
        enableMouseTracking: false,
        borderWidth: 0,
        dataGrouping: {
          units: groupingUnits,
        },
      };
      let btc = {
        name: "BTC Price",
        data: [],
        type: "line",
        color: "#fad26b",
        yAxis: 1,
        marker: {
          enabled: false,
        },
        dataGrouping: {
          units: groupingUnits,
        },
      };
      this.seriesOptions = [short, long, btc];

      try {
        this.loading = true;
        await this.fetchData();
      } catch (error) {
        console.log("error!");
        this.seriesOptions = [short, long, btc];
      } finally {
        this.loading = false;
      }
    },
    async fetchData() {
      // let res = await TOTAL_LIQUIDITION_API(this.totalLiquiditionParams);
      let btc_price = await this.fetchLiquidtion();

      let short = {
        name: "Shorts",
        data: [],
        yAxis: 0,
        color: "#e0294a",
        enableMouseTracking: false,
        borderWidth: 0,
        dataGrouping: {
          units: groupingUnits,
        },
      };
      let long = {
        name: "Longs",
        data: [],
        color: "#2ebd85",
        yAxis: 0,
        enableMouseTracking: false,
        borderWidth: 0,
        dataGrouping: {
          units: groupingUnits,
        },
      };
      let btc = {
        name: "BTC Price",
        data: [],
        type: "line",
        color: "#fad26b",
        yAxis: 1,
        marker: {
          enabled: false,
        },
        dataGrouping: {
          units: groupingUnits,
        },
      };

      btc.data = btc_price.map((v) => {
        return { x: v.createTime, y: v.price, custom: v.list };
      });
      short.data = btc_price.map((v) => {
        return [v.createTime, -1 * v.buyVolUsd];
      });
      long.data = btc_price.map((v) => {
        return [v.createTime, v.sellVolUsd];
      });
      this.seriesOptions = [short, long, btc];
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
