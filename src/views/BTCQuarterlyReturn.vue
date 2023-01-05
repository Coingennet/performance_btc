<template>
  <BlockChart title="BTC Quarterly Returns (USD)" :loading="loading">
    <HighChart
      id="btc-quarterly-return"
      :options="options"
      :height="`${height}px`"
      :key="height"
      ref="highchart"
    />
  </BlockChart>
</template>
<script>
import { BTC_MONTHLY_RETURN_API, BTC_PRICE_API } from "@/services/api";
import BlockChart from "@/components/BlockChart.vue";
import HighChart from "@/components/HighChart.vue";
import {
  arrFromRangeGenerate,
  getQuarterFromMonth,
  roundValue,
  colorByPercent,
  handlerColor,
} from "@/ultis";
let highcharts = require("highcharts");
require("highcharts/highcharts-more")(highcharts);
require("highcharts/modules/accessibility")(highcharts);
require("highcharts/modules/exporting")(highcharts);

export default {
  name: "btc-quarterly-return",
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
    yCategories: [],
    xCategories: ["Q1", "Q2", "Q3", "Q4", "Total"],
  }),
  computed: {
    height() {
      let result = 40 * 1.5 + 45 * this.yCategories.length;
      if (result < 300) {
        return 500;
      }
      return result;
    },
    options() {
      return {
        chart: {
          type: "heatmap",
          marginTop: 40,
          marginBottom: 40,
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
            categories: ["Q1", "Q2", "Q3", "Q4", "Total"],
            min: 0,
            max: 4,
            opposite: true,
            labels: {
              style: {
                color: "#FFFFFF",
              },
            },
            lineWidth: 0,
            tickWidth: 0,
            left: 90,
            width: "95%",
          },
        ],
        tooltip:{
          enabled: false
        },
        yAxis: {
          categories: this.yCategories,
          min: 0,
          max: this.yCategories.length - 1,
          gridLineWidth: 0,
          labels: {
            style: {
              color: "#FFFFFF",
            },
          },
          margin: 20,
          gridLineColor: "#ffffff1f",
          title: {
            align: "high",
            textAlign: "left",
            rotation: 0,
            offset: 0,
            margin: 0,
            y: -13,
            x: -40,
            text: "Year",
            style: {
              color: "#FFFFFF",
            },
          },
        },

        // accessibility: {
        //   point: {
        //     descriptionFormatter: function (point) {
        //       var ix = point.index + 1,
        //         xName = getPointCategoryName(point, "x"),
        //         yName = getPointCategoryName(point, "y"),
        //         val = point.value;
        //       return ix + ". " + xName + " sales " + yName + ", " + val + ".";
        //     },
        //   },
        // },

        colorAxis: {
          min: 0,
          minColor: "#FFFFFF",
        },

        legend: {
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
    // this.fetchYCategories();
    this.init();
    this.interval = setInterval(() => {
      this.fetchData();
    }, this.intervalTime);
  },
  beforeDestroy() {
    // clearInterval(this.interval);
  },
  methods: {
    fetchYCategories(year = new Date().getFullYear(), range = 5) {
      if (range > 10) {
        range = 10;
      }
      this.yCategories = arrFromRangeGenerate(year - range, year);
    },
    async init() {
      try {
        this.loading = true;
        await this.fetchData();
      } catch (error) {
        console.log("🚀 ~ file: BTCQuarterlyReturn.vue:190 ~ init ~ error", error)
        console.log("error!");
      } finally {
        this.loading = false;
      }
    },
    async fetchData() {
      const res = await BTC_MONTHLY_RETURN_API();
      let maxYear = res.data.reduce((accumulator, currentValue) => {
        let year = new Date(currentValue.period).getFullYear();
        return year > accumulator ? year : accumulator;
      }, 0);
      let range = 6;
      if (maxYear < new Date().getFullYear()) {
        range += new Date().getFullYear() - maxYear;
        maxYear = new Date().getFullYear();
      }
      this.fetchYCategories(maxYear, range);
      let data = {};
      this.yCategories.forEach((year, yearIndex) => {
        data[yearIndex] = {};
        for (let i = 0; i < 5; i++) {
          data[yearIndex][i] = { value: 0, date: null, percent: 0 };
        }
      });
      let q_max = { quarter: 0, year: 0, value: 0 };
      let q_min = { quarter: 0, year: 0, value: 0 };

      data = res.data.reduce((accumulator, currentValue) => {
        let time = new Date(currentValue.period);
        let year = this.yCategories.findIndex((x) => x == time.getFullYear());
        if (year == -1) {
          return accumulator;
        }
        let month = getQuarterFromMonth(time.getMonth());
        if (!accumulator[year][month].date) {
          accumulator[year][month].value = parseFloat(currentValue.close);
          accumulator[year][month].date = currentValue.period;
          accumulator[year][month].percent = 0;
        } else if (
          accumulator[year][month].date &&
          currentValue.period > accumulator[year][month].date
        ) {
          accumulator[year][month].date = currentValue.period;
          accumulator[year][month].percent =
            (100 * (currentValue.close - accumulator[year][month].value)) /
            accumulator[year][month].value;

          accumulator[year][month].date = currentValue.period;
        }

        return accumulator;
      }, data);
      let result = [];
      let min = { year: 0, value: 0 };
      let max = { year: 0, value: 0 };
      let average = 0;
      data = await this.BTC_PRICE(data);
      Object.keys(data).forEach((year) => {
        Object.keys(data[year]).forEach((month) => {
          if (month != 4 && !data[year][4].alrHasValue) {
            data[year][4].percent += data[year][month].percent;
          }
          result.push({
            x: parseInt(month),
            y: parseInt(year),
            value: data[year][month].percent,
            color: handlerColor(data[year][month].percent).bgColor,
          });
          if (month < 4) {
            if (q_min.value == 0 || q_min.value > data[year][month].percent) {
              q_min.value = data[year][month].percent;
              q_min.year = this.yCategories[year];
              q_min.quarter = this.xCategories[month];
            }
            if (q_max.value == 0 || q_max.value < data[year][month].percent) {
              q_max.value = data[year][month].percent;
              q_max.year = this.yCategories[year];
              q_max.quarter = this.xCategories[month];
            }
          }
        });
        if (min.value == 0 || min.value > data[year][4].percent) {
          min.value = data[year][4].percent;
          min.year = this.yCategories[year];
        }
        if (max.value == 0 || max.value < data[year][4].percent) {
          max.value = data[year][4].percent;
          max.year = this.yCategories[year];
        }
        average += data[year][4].percent;
      });
      average = Object.keys(data).length
        ? average / Object.keys(data).length
        : 0;
      this.$emit("average", average);
      this.$emit("min", min);
      this.$emit("max", max);
      this.$emit("q_max", q_max);
      this.$emit("q_min", q_min);
      this.data = result;
    },
    async BTC_PRICE(data) {
      let btc_utc = await BTC_PRICE_API();
      btc_utc = btc_utc?.data[btc_utc?.data?.length - 1];
      if (!btc_utc) {
        return data;
      }
      let currentYear = new Date(btc_utc.timestamp).getFullYear() - 1;
      let find = this.yCategories.findIndex((x) => x == currentYear);
      if (find != -1) {
        data[find][4].percent = btc_utc.percent_change_last_1_year;
        data[find][4].alrHasValue = true;
      }
      try {
        let roi_by_year = JSON.parse(btc_utc?.roi_by_year);
        Object.keys(roi_by_year).forEach((key) => {
          let find = this.yCategories.findIndex((x) => key.includes(x));
          if (find != -1) {
            data[find][4].percent = roi_by_year[key];
            data[find][4].alrHasValue = true;
          }
        });
      } catch (error) {
        return data;
      }
      return data;
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
