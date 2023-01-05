<template>
  <BlockChart title="Overview" class="h-full">
    <div class="mt-3">
      <div>
        <div class="uppercase text-[#807f81] mb-2">year's performance</div>
        <ul class="list-disc pl-7 text-[14px] text-[#ffffff]">
          <li class="mb-2">
            <div class="mb-2 text-[#737375]">
              <span class="text-[#ffffff]">The top-performing year</span> in
              {{ max.year }} from $963 to $14,046 
            </div>
            <div class="text-[#737375]">
              Detail: with
              <span :style="getStyle(max.value)">{{ roundValue(max.value) }}%</span>
            </div>
          </li>
          <li class="mb-2">
            <div class="mb-2 text-[#737375]">
              <span class="text-[#ffffff]">The worst performing year</span> in
              {{ min.year }} from $14,046 to $3747
            </div>
            <div class="text-[#737375]">
              Detail: with
              <span :style="getStyle(min.value)">{{ roundValue(min.value) }}%</span>
            </div>
          </li>
          <li class="mb-2">
            <div class="mb-2 text-[#737375]">
              <span class="text-[#ffffff]">The average yearly growth:&nbsp;</span>
              <span :style="getStyle(average)">{{ roundValue(average) }}%</span> per year
            </div>
          </li>
        </ul>
      </div>
      <div>
        <div class="uppercase text-[#807f81] mb-2">quarter's performance</div>
        <ul class="list-disc pl-7 text-[14px] text-[#ffffff]">
          <li class="mb-2">
            <div class="mb-2 text-[#737375]">
              <span class="text-[#ffffff]">The best-performing quarter</span> in
              {{ qMax.quarter }} - {{ qMax.year }}
            </div>
            <div class="text-[#737375]">
              Detail: An average of
              <span :style="getStyle(qMax.value)">{{ roundValue(qMax.value) }}%</span> gain
            </div>
          </li>
          <li class="mb-2">
            <div class="mb-2 text-[#737375]">
              <span class="text-[#ffffff]">The worst-performing quarter</span>
              in {{ qMin.quarter }} - {{ qMin.year }} with
              <span :style="getStyle(qMin.value)">{{ roundValue(qMin.value) }}%</span> loss
            </div>
          </li>
        </ul>
      </div>
    </div>
  </BlockChart>
</template>
<script>
import BlockChart from "@/components/BlockChart.vue";
import { handlerPrice, styleColor, roundValue } from "@/ultis/number";
export default {
  components: {
    BlockChart,
  },
  name: "top-trending",
  props: {
    average: { type: [Number], default: 0 },
    min: { type: [Object], default: () => ({ year: 0, value: 0 }) },
    max: { type: [Object], default: () => ({ year: 0, value: 0 }) },
    qMin: {
      type: [Object],
      default: () => ({ quarter: 0, year: 0, value: 0 }),
    },
    qMax: {
      type: [Object],
      default: () => ({ quarter: 0, year: 0, value: 0 }),
    },
  },
  data: () => ({
    top_trendings: [],
    btc_price: 0,
    loading: false,
    params: {
      currency: "USD",
      sort: "rank",
      order: "ascending",
      offset: 0,
      limit: 500,
      meta: true,
    },
  }),
  created() {},
  methods: {
    handlerPrice(price) {
      return handlerPrice(price * this.btc_price);
    },
    getStyle(value) {
      let color = styleColor(value);
      return { color };
    },
    roundValue(value, number = 2){
      return roundValue(value, number)
    }
  },
};
</script>
