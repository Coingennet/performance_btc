<template>
  <BlockChart title="BTC Monthly Returns (USD)" :loading="loading">
    <HighChart
      id="btc-monthly-return"
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
  roundValue,
  colorByPercent,
  handlerColor,
} from "@/ultis";
let highcharts = require("highcharts");
require("highcharts/highcharts-more")(highcharts);
require("highcharts/modules/accessibility")(highcharts);
require("highcharts/modules/exporting")(highcharts);
export default {
  name: "btc-month-return",
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
    average: [],
  }),
  computed: {
    height() {
      let result = 40 * 2 + 45 * this.yCategories.length;
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
          backgroundColor: "#22262b",
          marginBottom: 50,
          marginLeft: 100,
          marginRight: 30,
          plotBorderWidth: 2,
          plotBorderColor: "#26263b",
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
            categories: [
              "Jan",
              "Feb",
              "Mar",
              "Apr",
              "May",
              "June",
              "July",
              "Aug",
              "Sep",
              "Oct",
              "Nov",
              "Dec",
            ],
            min: 0,
            max: 11,
            opposite: true,
            labels: {
              style: {
                color: "#FFFFFF",
                fontSize: "12",
              },
            },
            lineWidth: 0,
            tickWidth: 0,
          },
          {
            categories: this.average,
            min: 0,
            max: 11,
            labels: {
              style: {
                color: "#FFFFFF",
                fontWeight: "medium",
                fontSize: "12",
              },
              formatter: function () {
                return this.value ? roundValue(this.value, 1) + " %" : "-";
              },
            },
            lineWidth: 0,
            tickWidth: 0,
            title: {
              align: "low",
              textAlign: "left",
              rotation: 0,
              offset: 0,
              margin: 0,
              y: 10,
              x: -85,
              text: "Average",
              style: {
                color: "#FFFFFF",
                fontSize: "12",
              },
            },
            linkedTo: 0,
          },
        ],
        tooltip: {
          enabled: false,
        },
        yAxis: {
          categories: this.yCategories,
          min: 0,
          max: this.yCategories.length - 1,
          gridLineWidth: 0,
          labels: {
            style: {
              color: "#FFFFFF",
              fontSize: 12,
            },
            x: -50,
          },
          margin: 20,
          gridLineColor: "#ffffff1f",
          title: {
            align: "high",
            textAlign: "left",
            rotation: 0,
            offset: 0,
            margin: 0,
            y: -12,
            x: -75,
            text: "Year",
            style: {
              color: "#FFFFFF",
              fontSize: "12",
            },
          },
        },
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
      let average = Array(12).fill(0);
      this.yCategories.forEach((year, yearIndex) => {
        data[yearIndex] = {};
        for (let i = 0; i < 12; i++) {
          data[yearIndex][i] = { value: 0, date: null, percent: 0 };
        }
      });
      data = res.data.reduce((accumulator, currentValue) => {
        let time = new Date(currentValue.period);
        let year = this.yCategories.findIndex((x) => x == time.getFullYear());
        let month = time.getMonth();
        if (year == -1) {
          return accumulator;
        }
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
      Object.keys(data).forEach((year) => {
        Object.keys(data[year]).forEach((month) => {
          average[month] += data[year][month].percent;
          result.push({
            x: parseInt(month),
            y: parseInt(year),
            value: data[year][month].percent,
            color: handlerColor(data[year][month].percent).bgColor,
          });
        });
      });
      this.average = average.map((x) => x / this.yCategories.length);
      this.data = result;
    },
    async init() {
      try {
        this.loading = true;
        await this.fetchData();
      } catch (error) {
        console.log("🚀 ~ file: BTCMonthReturn.vue:276 ~ init ~ error", error);
        console.log("error!");
      } finally {
        this.loading = false;
      }
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
